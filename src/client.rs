use crate::utils::request_reply;

const BROKER_ADDRESS: &str = "tcp://localhost:5555";

pub fn get(id_arg: Option<String>, topic_arg: Option<String>) {
    if id_arg == None || topic_arg == None {
        eprintln!("Invalid format for command GET <ID> <TOPIC>");
        return;
    }

    let client_id: String = id_arg.unwrap();
    let topic: String = topic_arg.unwrap();

    // TODO add current index to message request (read from file)
    let msg = format!("GET;{};{}", client_id, topic);
    request_reply(&msg, BROKER_ADDRESS);
}

pub fn sub(id_arg: Option<String>, topic_arg: Option<String>) {
    if id_arg == None || topic_arg == None {
        eprintln!("Invalid format for command SUB <ID> <TOPIC>");
        return;
    }

    let client_id: String = id_arg.unwrap();
    let topic: String = topic_arg.unwrap();

    let msg = format!("SUB;{};{}", client_id, topic);
    request_reply(&msg, BROKER_ADDRESS);
    //TODO create file according to msg
}

pub fn unsub(id_arg: Option<String>, topic_arg: Option<String>) {
    if id_arg == None || topic_arg == None {
        eprintln!("Invalid format for command SUB <ID> <TOPIC>");
        return;
    }

    let client_id: String = id_arg.unwrap();
    let topic: String = topic_arg.unwrap();

    let msg = format!("UNSUB;{};{}", client_id, topic);
    request_reply(&msg, BROKER_ADDRESS);
    //TODO delete file according to msg
}

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
