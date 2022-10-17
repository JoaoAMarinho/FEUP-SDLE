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
        let message_encoded: String = encode(message);

        if !self.topics.contains_key(&topic_encoded) {
            return format!("Topic '{}' does not exist", topic);
        }

        let cur_topic = self.topics.get_mut(&topic_encoded).unwrap();
        
        let timestamp = utils::get_timestamp();
        let new_message = (
            timestamp,
            message.to_string(),
            cur_topic.clients.len(),
        );
        cur_topic.messages.push(new_message);
        
        let content = format!("{}\n###\n{}", new_message.1, message);
        utils::create_file(&format!("{}/{}/messages/{}.txt", STORAGE_PATH, topic_encoded, timestamp), &content).unwrap();

        return "ACK".to_string();
    }

    pub fn get(&mut self, client_id: &str, topic: &str, index: &str) -> String {
        let topic_encoded: String = encode(topic);
        let client_id_encoded: String = encode(client_id);

        if self.topics.contains_key(&topic_encoded) {
            let cur_topic = self.topics.get_mut(topic).unwrap();

            if cur_topic.clients.contains_key(&client_id_encoded) {
                
                if cur_topic.messages.is_empty() {
                    return format!(
                        "Topic '{}' has no messages to consume",
                        topic
                    );  
                }

                // TODO
                // If index < indice do cliente: atualizar o numero de gajos que podem ler, atualizar esse valor (no file e em mem)
                let mut client_idx = cur_topic.clients.get_mut(&client_id_encoded).unwrap();

                // Read message
                // Update value of number of readers
                // If number of readers == 0: remove
                let idx = index.parse::<usize>().unwrap();
                return cur_topic.messages[idx - cur_topic.decreaser].1.clone();
            }

            return format!(
                "Client '{}' is not subscribed to topic '{}'",
                client_id, topic
            );   
        }

        return format!(
            "Topic '{}' does not exist",
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
                    "Client '{}' is already subscribed to topic '{}'",
                    client_id, topic
                );
            }

            let content = cur_topic.messages.len() + cur_topic.decreaser;
            cur_topic.clients.insert(
                client_id_encoded.to_string(),
                content,
            );
            
            utils::create_file(&format!("{}/{}/clients/{}.txt", STORAGE_PATH, topic_encoded, client_id_encoded), &content.to_string()).unwrap();

            return "ACK".to_string();
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

        return "ACK".to_string();
    }

    pub fn unsub(&mut self, client_id: &str, topic: &str) -> String {
        if self.topics.contains_key(topic) {
            let cur_topic = self.topics.get_mut(topic).unwrap();

            if cur_topic.clients.contains_key(client_id) {
                let idx = cur_topic.clients.remove(client_id).unwrap();
                println!("{}", idx);
                //in this topic all messages from client_idx - decrease factor
                // will decrease the nr of clients to read

                return "ACK".to_string();
            }

            return format!(
                "Client '{}' is not subscribed to topic '{}'",
                client_id, topic
            );
        }

        return format!(
            "Topic '{}' does not exist",
            topic
        );     
    }

}
