use crate::utils::request_reply;

const BROKER_ADDRESS: &str = "tcp://localhost:5555";

pub fn put(topic_arg: Option<String>, message_arg: Option<String>) {
    if topic_arg == None || message_arg == None {
        eprintln!("Invalid format for command PUT <TOPIC> <MESSAGE>");
        return;
    }
    let topic: String = topic_arg.unwrap();
    let message: String = message_arg.unwrap();

    let msg = format!("PUT;{};{}", topic, message);
    request_reply(&msg, BROKER_ADDRESS);
}
