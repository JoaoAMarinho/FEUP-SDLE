use std::collections::HashMap;

struct Topic {
    clients: HashMap<String, usize>,
    messages: Vec<(String, usize)>,
    decreaser: usize,
}

pub struct Storage {
    topics: HashMap<String, Topic>,
}

impl Storage {
    pub fn new() -> Storage {
        // TODO
        // Read from file and create/build state

        return Storage {
            topics: HashMap::new(),
        };
    }

    fn put(&mut self, topic: &str, message: &str) -> String {
        if !self.topics.contains_key(topic) {
            return format!("Topic '{}' does not exist", topic);
        }

        let cur_topic = self.topics.get_mut(topic).unwrap();
        
        let new_message = (
            message.to_string(),
            cur_topic.clients.len(),
        );
        cur_topic.messages.push(new_message);

        return "ACK".to_string();
    }

    fn get(&mut self, client_id: &str, topic: &str, index: &str) -> String {
        if self.topics.contains_key(topic) {
            let cur_topic = self.topics.get_mut(topic).unwrap();

            if cur_topic.clients.contains_key(client_id) {
                
                if cur_topic.messages.is_empty() {
                    return format!(
                        "Topic '{}' has no messages to consume",
                        topic
                    );  
                }

                let idx = index.parse::<usize>().unwrap();
                return cur_topic.messages[idx - cur_topic.decreaser].0.clone();
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

    fn sub(&mut self, client_id: &str, topic: &str) -> String {
        if self.topics.contains_key(topic) {
            let cur_topic = self.topics.get_mut(topic).unwrap();

            if cur_topic.clients.contains_key(client_id) {
                return format!(
                    "Client '{}' is already subscribed to topic '{}'",
                    client_id, topic
                );
            }

            cur_topic.clients.insert(
                client_id.to_string(),
                cur_topic.messages.len() + cur_topic.decreaser,
            );

            return "ACK".to_string();
        }

        let mut new_topic = Topic {
            clients: HashMap::new(),
            messages: Vec::new(),
            decreaser: 0,
        };

        new_topic.clients.insert(client_id.to_string(), 0);
        self.topics.insert(topic.to_string(), new_topic);

        return "ACK".to_string();
    }

    fn unsub(&mut self, client_id: &str, topic: &str) -> String {
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

pub fn start_storage(context: &zmq::Context, mut storage: Storage) {
    let worker = context.socket(zmq::REP).unwrap();
    worker
        .bind("inproc://storage")
        .expect("failed to connect storage");

    loop {
        let message = worker
            .recv_string(0)
            .expect("worker failed receiving")
            .unwrap();

        let split = message.split(";");
        let vec: Vec<&str> = split.collect();

        let response = match vec[0] {
            "PUT" => storage.put(vec[1], vec[2]),
            "SUB" => storage.sub(vec[1], vec[2]),
            "GET" => storage.get(vec[1], vec[2], "0"),
            "UNSUB" => storage.unsub(vec[1], vec[2]),
            _ => "Unknown request".to_string(),
        };

        worker.send(&response, 0).unwrap();
    }
}
