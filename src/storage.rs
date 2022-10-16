use std::collections::HashMap;
use std::fs::File;

pub struct Storage {
    topics: HashMap<&str, Topic>
}

struct Topic {
    clients: HashMap<&str, i32>,
    messages: Vec<(data: &str, n_clients: i32)>,
    decreaser: u32,
}

impl Storage {
    pub fn new() -> Storage {
        // TODO
        // Read from file and create/build state

        return Storage {
            topics: "topic".to_string()
        };
    }
}

pub fn start_storage(context: &zmq::Context, storage: Storage) {
    let worker = context.socket(zmq::REP).unwrap();
    worker
        .bind("inproc://storage")
        .expect("failed to connect storage");

    loop {
        let message = worker
            .recv_string(0)
            .expect("worker failed receiving")
            .unwrap();

        println!("{}", message.as_str());
        worker.send("info", 0).unwrap();
    }
}
