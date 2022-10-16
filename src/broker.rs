use std::thread;
use crate::storage::Storage;
use crate::storage::start_storage;

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


    loop{ 
        let msg = receiver
            .recv_string(0)
            .expect("worker failed receiving")
            .unwrap();

        println!("Thread received, {}", msg.as_str());

        let split = msg.split(";");
        let vec: Vec<&str> = split.collect();

        let response = match vec[0] {
            "PUT" => put(&storage, vec[1], vec[2]),
            "SUB" => sub(&storage, vec[1], vec[2]),
            _ => "Unknown request".to_string(),
        };
        
        println!("{}",response);
        receiver.send(&response, 0).unwrap();
    }
}

fn get(client_id: String, topic: String) {
    println!("[GET] Get topic {} from client {}", topic, client_id);
}

fn put(storage: &zmq::Socket, topic: &str, message: &str) -> String {
    let message = format!("PUT;{};{}", topic, message);
    storage.send(&message, 0).unwrap();
    return "oi".to_string();
}

fn sub(storage: &zmq::Socket, client_id: &str, topic: &str) -> String  {
    println!("[SUB] Client {} subscribed topic {}", client_id, topic);
    let message = format!("SUB;{};{}", client_id, topic);
    storage.send(&message, 0).unwrap();
    return "oi".to_string();
}

fn unsub(client_id: String, topic: String) {
    println!("[UNSUB] Client {} unsubscribed topic {}", client_id, topic);

    let message = format!("UNSUB {} {}", client_id, topic);
}

fn ack(operation: String) {}

fn send_ack() {}
