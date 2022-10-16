use std::thread;
use std::time::Duration;

const BROKER_ADDRESS: &str = "tcp://localhost:5555";

pub fn put(topic_arg: Option<String>, message_arg: Option<String>) {
    if topic_arg == None || message_arg == None {
        eprintln!("Invalid format for command PUT <TOPIC> <MESSAGE>");

    }
    let topic: String = topic_arg.unwrap();
    let message: String = message_arg.unwrap();

    println!("Put message {} of topic {}", message, topic); 
    send_put_message(topic, message);
}

fn send_put_message(topic: String, message: String){
    let context = zmq::Context::new();
    let requester = context.socket(zmq::REQ).unwrap(); // 👈 é um REQ né?????
    requester.connect(BROKER_ADDRESS)
             .expect("Failed connecting server to broker");

    let msg = format!("PUT;{};{}", topic, message);
    requester.send(&msg, 0).unwrap();
    //let message = requester.recv_msg(0).unwrap();

    //isto é sem loop agora 🤔
    // ok acho que já percebi a ceand o router e dealer não vai ser preciso 😔, pq l.19
    // let req = responder.recv_string(0).unwrap().unwrap();
    // println!("Received request: {}", req);
    // thread::sleep(Duration::from_millis(1000));
    // responder.send("World", 0).unwrap();
    
}