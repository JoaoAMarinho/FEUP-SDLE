use std::collections::HashMap;
use std::sync::Mutex;
use std::fs::File;
use std::time;
use std::thread;
use threadpool::ThreadPool;
use std::time::Duration;



fn worker_routine(context: &zmq::Context) {
    let receiver = context.socket(zmq::REP).unwrap();
    receiver
        .connect("inproc://workers")
        .expect("failed to connect worker");

    let receive_knowledge = context.socket(zmq::REQ).unwrap();
        receive_knowledge
            .connect("inproc://getKnowledge")
            .expect("failed to connect worker");
    loop {
        let msg = receiver
            .recv_string(0)
            .expect("worker failed receiving")
            .unwrap();
        println!("Thread received, {}", msg.as_str());
        thread::sleep(Duration::from_millis(1000));
        receive_knowledge.send("Hello", 0).unwrap();
        println!("Thread send, Hello");
        let msg = receive_knowledge.recv_string(0).expect("ok").unwrap();
        receiver.send(msg.as_str(), 0).unwrap();
    }
}

fn knowledge_worker(context: &zmq::Context, x: String) {
    println!("I have knowledge, {}", x);
    let receiver = context.socket(zmq::REP).unwrap();
    receiver
        .bind("inproc://getKnowledge")
        .expect("failed to connect worker");
    loop {
        println!("Want Message");
        let message = receiver
            .recv_string(0)
            .expect("worker failed receiving")
            .unwrap();
        println!("{}", message.as_str());
        receiver.send(&x, 0).unwrap();
    }
}

pub fn start() {
    let context = zmq::Context::new();
    let client = context.socket(zmq::REP).unwrap();
    let server = context.socket(zmq::REP).unwrap();
    let pool = ThreadPool::new(4);

    client
        .bind("tcp://*:5559")
        .expect("failed binding client");
    server
        .bind("tcp://*:5560")
        .expect("failed binding server");

    loop {
        println!("loop");
        let mut items = [
            client.as_poll_item(zmq::POLLIN),
            server.as_poll_item(zmq::POLLIN),
        ];
        zmq::poll(&mut items, -1).unwrap();

        if items[0].is_readable() {
            let message = client.recv_msg(0).unwrap();
            println!("client {}",message.as_str().unwrap());
            pool.execute(|| get("test".to_string(),"test".to_string()) );
            // server.send(message, 0).unwrap()
            
        }
        if items[1].is_readable() {
            let message = server.recv_msg(0).unwrap();
            println!("server {}",message.as_str().unwrap());
            pool.execute(|| get("test".to_string(),"test".to_string()) );
            // client.send(message, 0).unwrap();
            println!("finished");

        }
    }
}

pub fn start_test() {
    let context = zmq::Context::new();
    let clients = context.socket(zmq::ROUTER).unwrap();
    let workers = context.socket(zmq::DEALER).unwrap();

    clients
        .bind("tcp://*:5555")
        .expect("failed to bind client router");
    workers
        .bind("inproc://workers")
        .expect("failed to bind worker dealer");

    let ctx = context.clone();
    thread::spawn(move || knowledge_worker(&ctx, x));

    for _ in 0..4 {
        let ctx = context.clone();
        thread::spawn(move || worker_routine(&ctx));
    }
    zmq::proxy(&clients, &workers).expect("failed proxying");
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
