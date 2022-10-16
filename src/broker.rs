use crate::storage::start_storage;
use crate::storage::Storage;
use std::thread;

pub fn start() {
    let storage: Storage = Storage::new();

    let context = zmq::Context::new();
    let requesters = context.socket(zmq::ROUTER).unwrap();
    let workers = context.socket(zmq::DEALER).unwrap();

    requesters
        .bind("tcp://*:5555")
        .expect("failed to bind requester router");
    workers
        .bind("inproc://workers")
        .expect("failed to bind worker dealer");

    let ctx = context.clone();
    thread::spawn(move || start_storage(&ctx, storage));

    for _ in 0..4 {
        let ctx = context.clone();
        thread::spawn(move || worker_routine(&ctx));
    }
    zmq::proxy(&requesters, &workers).expect("failed proxying");
}

fn worker_routine(context: &zmq::Context) {
    let receiver = context.socket(zmq::REP).unwrap();
    receiver
        .connect("inproc://workers")
        .expect("failed to connect worker");

    let storage = context.socket(zmq::REQ).unwrap();
    storage
        .connect("inproc://storage")
        .expect("failed to connect worker");

    loop {
        let msg = receiver
            .recv_string(0)
            .expect("worker failed receiving")
            .unwrap();

        let split = msg.split(";");
        let vec: Vec<&str> = split.collect();

        let response = match vec[0] {
            "PUT" => put(&storage, vec[1], vec[2]),
            "SUB" => sub(&storage, vec[1], vec[2]),
            "GET" => get(&storage, vec[1], vec[2]),
            "UNSUB" => unsub(&storage, vec[1], vec[2]),
            _ => "Unknown request".to_string(),
        };

        println!("Sent '{}' as a response", response);
        receiver.send(&response, 0).unwrap();
    }
}

fn put(storage: &zmq::Socket, topic: &str, message: &str) -> String {
    println!("[PUT] Message '{}' in topic '{}'", message, topic);
    let message = format!("PUT;{};{}", topic, message);
    storage.send(&message, 0).unwrap();

    return storage.recv_string(0).unwrap().unwrap();
}

fn get(storage: &zmq::Socket, client_id: &str, topic: &str) -> String {
    println!("[GET] Get message from topic '{}' to client '{}'", topic, client_id);
    let message = format!("GET;{};{}", client_id, topic);
    storage.send(&message, 0).unwrap();
    
    return storage.recv_string(0).unwrap().unwrap();
}

fn sub(storage: &zmq::Socket, client_id: &str, topic: &str) -> String {
    println!("[SUB] Client '{}' to topic '{}'", client_id, topic);
    let message = format!("SUB;{};{}", client_id, topic);
    storage.send(&message, 0).unwrap();

    return storage.recv_string(0).unwrap().unwrap();
}


fn unsub(storage: &zmq::Socket, client_id: &str, topic: &str) -> String {
    println!("[UNSUB] Client {} unsubscribed topic {}", client_id, topic);
    let message = format!("UNSUB;{};{}", client_id, topic);
    storage.send(&message, 0).unwrap();

    return storage.recv_string(0).unwrap().unwrap();
}

// fn ack(operation: String) {}

// fn send_ack() {}
