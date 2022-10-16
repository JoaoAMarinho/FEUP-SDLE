use std::fs::File;
use std::fs::OpenOptions;

fn main() {
    let context = zmq::Context::new();
    let requester = context.socket(zmq::REQ).unwrap();
    requester
        .connect("tcp://localhost:5559")
        .expect("failed to connect requester");
    for request_nbr in 0..10 {
        requester.send("Hello", 0).unwrap();
        let message = requester.recv_msg(0).unwrap();
        println!(
            "Received reply {} {}",
            request_nbr,
            message.as_str().unwrap()
        );
    }
}

pub fn get(id_arg: Option<String>, topic_arg: Option<String>) {
    if id_arg == None || topic_arg == None {
        eprintln!("Invalid format for command GET <ID> <TOPIC>");
    }

    let client_id: String = id_arg.unwrap();
    let topic: String = topic_arg.unwrap();

    println!("Get topic {} from client {}", topic, client_id);
}

pub fn sub(id_arg: Option<String>, topic_arg: Option<String>) {
    if id_arg == None || topic_arg == None {
        eprintln!("Invalid format for command SUB <ID> <TOPIC>");
    }

    let client_id: String = id_arg.unwrap();
    let topic: String = topic_arg.unwrap();

    println!("Client {} subscribed topic {}", client_id, topic);
}

pub fn unsub(id_arg: Option<String>, topic_arg: Option<String>) {
    if id_arg == None || topic_arg == None {
        eprintln!("Invalid format for command UNSUB <ID> <TOPIC>");
    }

    let client_id: String = id_arg.unwrap();
    let topic: String = topic_arg.unwrap();

    println!("Client {} unsubscribed topic {}", client_id, topic);
}

fn get_curr_index() {
    //sets the option to create a new file, failing if it already exists
    let file = OpenOptions::new().write(true).open("");
    if file.is_ok() { }
}

fn update_curr_index() {
    //sets the option to create a new file, failing if it already exists
    let file = OpenOptions::new().write(true).open("");
    if file.is_ok() { }

}