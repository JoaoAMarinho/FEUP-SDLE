use std::collections::HashMap;
use std::fs::File;
use std::sync::Mutex;
use std::thread;
use std::time;
use std::time::Duration;
use threadpool::ThreadPool;

fn worker_routine(context: &zmq::Context) {
    let receiver = context.socket(zmq::REP).unwrap();
    receiver
        .connect("inproc://workers")
        .expect("failed to connect worker");

    let storage = context.socket(zmq::REQ).unwrap();
    storage
        .connect("inproc://storage")
        .expect("failed to connect worker");

    let msg = receiver
        .recv_string(0)
        .expect("worker failed receiving")
        .unwrap();
    // TODO
    // Parse msg
    // Ask for info
    println!("Thread received, {}", msg.as_str());
    storage.send("Hello", 0).unwrap();
    // Receive info and do more stuff
    let msg = storage
        .recv_string(0)
        .expect("failed receiving storage msg")
        .unwrap();
    // Send msg to requester aka receiver
    receiver.send(msg.as_str(), 0).unwrap();
}

fn storage(context: &zmq::Context) {
    let receiver = context.socket(zmq::REP).unwrap();
    receiver
        .bind("inproc://storage")
        .expect("failed to connect storage");

    loop {
        let message = receiver
            .recv_string(0)
            .expect("worker failed receiving")
            .unwrap();

        println!("{}", message.as_str());
        receiver.send("info", 0).unwrap();
    }
}

pub fn start() {
    // TODO
    // Read from file and create/build state
    // Pass on to the storage, borrowing the object

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
    thread::spawn(move || storage(&ctx));

    for _ in 0..4 {
        let ctx = context.clone();
        thread::spawn(move || worker_routine(&ctx));
    }
    zmq::proxy(&requesters, &workers).expect("failed proxying");
}

fn get(client_id: String, topic: String) {
    println!("[GET] Get topic {} from client {}", topic, client_id);
}

fn put(topic: String, message: String) {
    println!("[PUT] Put message {} in topic {}", message, topic);

    let message = format!("PUT {} {}", topic, message);
}

fn sub(client_id: String, topic: String) {
    println!("[SUB] Client {} subscribed topic {}", client_id, topic);

    let message = format!("SUB {} {}", client_id, topic);
}

fn unsub(client_id: String, topic: String) {
    println!("[UNSUB] Client {} unsubscribed topic {}", client_id, topic);

    let message = format!("UNSUB {} {}", client_id, topic);
}

fn ack(operation: String) {}

fn send_ack() {}
