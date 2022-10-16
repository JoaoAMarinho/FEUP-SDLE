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
    let msg = format!("PUT;{};{}", topic, message);
    send_message(&msg);
}

fn send_message(msg: &str){
    let context = zmq::Context::new();
    let requester = context.socket(zmq::REQ).unwrap();
    requester.connect(BROKER_ADDRESS)
             .expect("Failed connecting server to broker");

    requester.send(msg, 0).unwrap();

    let message = requester.recv_msg(0).unwrap();
    println!("{}", message.as_str().unwrap());
}
