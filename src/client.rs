const BROKER_ADDRESS: &str = "tcp://localhost:5555";

pub fn get(id_arg: Option<String>, topic_arg: Option<String>) {
    if id_arg == None || topic_arg == None {
        eprintln!("Invalid format for command GET <ID> <TOPIC>");
    }

    let client_id: String = id_arg.unwrap();
    let topic: String = topic_arg.unwrap();

    println!("Get topic {} from client {}", topic, client_id);
    // TODO add current index to message request (from file)
    let msg = format!("GET;{};{}", client_id, topic);
    let response = send_request(&msg);
    println!("Received message {}", response);
}

pub fn sub(id_arg: Option<String>, topic_arg: Option<String>) {
    if id_arg == None || topic_arg == None {
        eprintln!("Invalid format for command SUB <ID> <TOPIC>");
    }

    let client_id: String = id_arg.unwrap();
    let topic: String = topic_arg.unwrap();

    let msg = format!("SUB;{};{}", client_id, topic);
    let response = send_request(&msg);
    println!("Response: {}", response);
}

// pub fn unsub(id_arg: Option<String>, topic_arg: Option<String>) {
//     if id_arg == None || topic_arg == None {
//         eprintln!("Invalid format for command UNSUB <ID> <TOPIC>");
//     }

//     let client_id: String = id_arg.unwrap();
//     let topic: String = topic_arg.unwrap();

//     println!("Client {} unsubscribed topic {}", client_id, topic);
// }

// fn get_curr_index() {
//     //sets the option to create a new file, failing if it already exists
//     let file = OpenOptions::new().write(true).open("");
//     if file.is_ok() { }
// }

// fn update_curr_index() {
//     //sets the option to create a new file, failing if it already exists
//     let file = OpenOptions::new().write(true).open("");
//     if file.is_ok() { }

// }

fn send_request(msg: &str) -> String {
    let context = zmq::Context::new();
    let requester = context.socket(zmq::REQ).unwrap();

    requester
        .connect(BROKER_ADDRESS)
        .expect("Failed connecting server to broker");

    requester.send(msg, 0).unwrap();

    let response = requester.recv_string(0).unwrap().unwrap();
    return response;
}
