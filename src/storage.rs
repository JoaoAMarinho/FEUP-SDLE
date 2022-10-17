use std::collections::HashMap;
//use std::fs;
use crate::utils;
extern crate base64;
use base64::encode;

const STORAGE_PATH: &str = "./storage";
struct Topic {
    clients: HashMap<String, usize>,
    messages: Vec<(String, String, usize)>,
    decreaser: usize,
}

pub struct Storage {
    topics: HashMap<String, Topic>,
}

impl Storage {
    pub fn new() -> Storage {
        // TODO
        // Read from file and create/build state
        
        // let paths = fs::read_dir("./storage").unwrap();

        // for path in paths {
        //     println!("Name: {}", path.unwrap().path().display())
        // }
        return Storage {
            topics: HashMap::new(),
        };
    }

    pub fn put(&mut self, topic: &str, message: &str) -> String {
        let topic_encoded: String = encode(topic);

        if !self.topics.contains_key(&topic_encoded) {
            return format!("Topic '{}' does not exist", topic);
        }

        let cur_topic = self.topics.get_mut(&topic_encoded).unwrap();

        if cur_topic.clients.len() == 0 {
            return "ACK".to_string();
        }
        
        let new_message = (
            utils::get_timestamp().to_string(),
            message.to_string(),
            cur_topic.clients.len(),
        );
        
        let content = format!("{}\n###\n{}", new_message.2, message);
        utils::create_file(&format!("{}/{}/messages/{}.txt", STORAGE_PATH, topic_encoded, new_message.0), &content).unwrap();

        cur_topic.messages.push(new_message);

        return "ACK".to_string();
    }

    pub fn get(&mut self, client_id: &str, topic: &str, index: &str) -> String {
        let topic_encoded: String = encode(topic);
        let client_id_encoded: String = encode(client_id);

        if self.topics.contains_key(&topic_encoded) {
            let mut cur_topic = self.topics.get_mut(&topic_encoded).unwrap();

            if cur_topic.clients.contains_key(&client_id_encoded) {
                
                if cur_topic.messages.is_empty() {
                    return format!(
                        "ACK;ERROR;Topic '{}' has no messages to consume",
                        topic
                    );  
                }

                let client_idx = cur_topic.clients.get_mut(&client_id_encoded).unwrap();
                let idx = &index.parse::<usize>().unwrap();
                let messages =  &mut cur_topic.messages;

                if *client_idx < *idx {
                    let message = messages[*client_idx - cur_topic.decreaser].clone();
                    
                    let mut client_count = message.2;
                    client_count-=1;
                    
                    if client_count == 0 {
                        messages.remove(*client_idx - cur_topic.decreaser);
                        utils::remove_file(&format!("{}/{}/messages/{}.txt", STORAGE_PATH, topic_encoded, message.0)).unwrap();
                        cur_topic.decreaser+=1;
                        utils::create_file(&format!("{}/{}/decreaser.txt", STORAGE_PATH, topic_encoded), &cur_topic.decreaser.to_string()).unwrap();
                    } else {
                        let content = format!("{}\n###\n{}", client_count, message.1);
                        utils::create_file(&format!("{}/{}/messages/{}.txt", STORAGE_PATH, topic_encoded, message.0), &content).unwrap();
                    }

                    
                    *client_idx = *idx;
                    utils::create_file(&format!("{}/{}/clients/{}.txt", STORAGE_PATH, topic_encoded, client_id_encoded), &client_idx.to_string()).unwrap();
                }

                if messages.is_empty() || (*idx - cur_topic.decreaser) >= messages.len() {
                    return format!(
                        "ACK;ERROR;Topic '{}' has no messages to consume",
                        topic
                    );  
                }

                return format!("ACK;MSG;{}",messages[*idx - cur_topic.decreaser].1.clone());
            }

            return format!(
                "ACK;ERROR;Client '{}' is not subscribed to topic '{}'",
                client_id, topic
            );   
        }

        return format!(
            "ACK;ERROR; Topic '{}' does not exist",
            topic
        ); 
    }

    pub fn sub(&mut self, client_id: &str, topic: &str) -> String {
        let topic_encoded: String = encode(topic);
        let client_id_encoded: String = encode(client_id);
        
        if self.topics.contains_key(&topic_encoded) {
            let cur_topic = self.topics.get_mut(&topic_encoded).unwrap();

            if cur_topic.clients.contains_key(&client_id_encoded) {
                return format!(
                    "ACK;ERROR;Client '{}' is already subscribed to topic '{}'",
                    client_id, topic
                );
            }

            let content = cur_topic.messages.len() + cur_topic.decreaser;
            cur_topic.clients.insert(
                client_id_encoded.to_string(),
                content,
            );
            
            utils::create_file(&format!("{}/{}/clients/{}.txt", STORAGE_PATH, topic_encoded, client_id_encoded), &content.to_string()).unwrap();

            return format!("ACK;{}", &content.to_string());
        }

        let mut new_topic = Topic {
            clients: HashMap::new(),
            messages: Vec::new(),
            decreaser: 0,
        };


        new_topic.clients.insert(client_id_encoded.to_string(), 0);
        self.topics.insert(topic_encoded.to_string(), new_topic);
        
        utils::create_directory(&format!("{}/{}", STORAGE_PATH, topic_encoded)).unwrap();
        utils::create_directory(&format!("{}/{}/clients", STORAGE_PATH, topic_encoded)).unwrap();
        utils::create_directory(&format!("{}/{}/messages", STORAGE_PATH, topic_encoded)).unwrap();

        utils::create_file(&format!("{}/{}/decreaser.txt", STORAGE_PATH, topic_encoded), "0").unwrap();
        utils::create_file(&format!("{}/{}/clients/{}.txt", STORAGE_PATH, topic_encoded, client_id_encoded), "0").unwrap();

        return format!("ACK;0");
    }

    pub fn unsub(&mut self, client_id: &str, topic: &str) -> String {
        let topic_encoded: String = encode(topic);
        let client_id_encoded: String = encode(client_id);

        if self.topics.contains_key(&topic_encoded) {
            let cur_topic = self.topics.get_mut(&topic_encoded).unwrap();

            if cur_topic.clients.contains_key(&client_id_encoded) {
                let idx = cur_topic.clients.remove(&client_id_encoded).unwrap();
                
                if cur_topic.clients.len() == 0 {
                    self.topics.remove(&topic_encoded);
                    utils::remove_directory(&format!("{}/{}", STORAGE_PATH, topic_encoded)).unwrap();
                    return "ACK".to_string();
                }

                utils::remove_file(&format!("{}/{}/clients/{}.txt", STORAGE_PATH, topic_encoded, client_id_encoded)).unwrap();

                let mut idx = idx-cur_topic.decreaser;
                while idx != cur_topic.messages.len() {
                    let message = cur_topic.messages[idx].clone();
                    let mut client_count = message.2;
                    client_count-=1;

                    if message.2 == 0 {
                        cur_topic.messages.remove(idx);
                        utils::remove_file(&format!("{}/{}/messages/{}.txt", STORAGE_PATH, topic_encoded, message.0)).unwrap();
                        cur_topic.decreaser += 1;
                        continue;
                    }


                    let content = format!("{}\n###\n{}", client_count, message.1);
                    utils::create_file(&format!("{}/{}/messages/{}.txt", STORAGE_PATH, topic_encoded, message.0), &content).unwrap();
                    idx+=1;
                }
                
                utils::create_file(&format!("{}/{}/decreaser.txt", STORAGE_PATH, topic_encoded), &cur_topic.decreaser.to_string()).unwrap();
                return "ACK".to_string();
            }

            return format!(
                "ACK;Client '{}' is not subscribed to topic '{}'",
                client_id, topic
            );
        }

        return format!(
            "ACK;Topic '{}' does not exist",
            topic
        );     
    }

}
