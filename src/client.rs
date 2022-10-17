use crate::utils;
extern crate base64;
use base64::encode;

const BROKER_ADDRESS: &str = "tcp://localhost:5555";
const ERROR: &str = "ERROR";
const MESSAGE: &str = "MSG";
const CLIENT_PATH: &str = "./clients";

pub fn get(id_arg: Option<String>, topic_arg: Option<String>) {
    if id_arg == None || topic_arg == None {
        eprintln!("Invalid format for command GET <ID> <TOPIC>");
        return;
    }

    let client_id: String = id_arg.unwrap();
    let topic: String = topic_arg.unwrap();
    let file_path = format!("{}/{}",CLIENT_PATH, encode(&client_id));
    let idx = utils::read_file(&file_path);


    // TODO add current index to message request (read from file)
    let msg = format!("GET;{};{};{}", client_id, topic, idx);
    let mut response: String = "".to_string(); 
    if utils::timeout_request(&msg, BROKER_ADDRESS, &mut response) != 0 {
        eprintln!("Error GET message.");
        return;
    }

    let split = response.split(";");
    let res: Vec<&str> = split.collect();
    let info = &res[1..].join(";");
    if res[0] == ERROR {
        println!("Couldn't retrive message. {}", info);
    } else if res[0] == MESSAGE {
        println!("Message retrived: {}", info);
    }
}

pub fn sub(id_arg: Option<String>, topic_arg: Option<String>) {
    if id_arg == None || topic_arg == None {
        eprintln!("Invalid format for command SUB <ID> <TOPIC>");
        return;
    }

    let client_id: String = id_arg.unwrap();
    let topic: String = topic_arg.unwrap();

    let msg = format!("SUB;{};{}", client_id, topic);
    let mut response = "".to_string();
    if utils::timeout_request(&msg, BROKER_ADDRESS, &mut response) != 0 {
        eprintln!("Error SUB topic.");
        return;
    }

    let split = response.split(";");
    let res: Vec<&str> = split.collect();
    let info = &res[1..].join(";");
    if res[0] == ERROR {
        println!("Couldn't SUB topic. {}", info);
    } else {
        utils::create_directory(CLIENT_PATH);
        let file_path = format!("{}/{}",CLIENT_PATH, encode(client_id));
        utils::create_file(&file_path, info);
        println!("Success idx: {}", info);
    }
}

pub fn unsub(id_arg: Option<String>, topic_arg: Option<String>) {
    if id_arg == None || topic_arg == None {
        eprintln!("Invalid format for command SUB <ID> <TOPIC>");
        return;
    }

    let client_id: String = id_arg.unwrap();
    let topic: String = topic_arg.unwrap();

    let msg = format!("UNSUB;{};{}", client_id, topic);
    let mut response = "".to_string();
    if utils::timeout_request(&msg, BROKER_ADDRESS, &mut response) != 0 {
        eprintln!("Error UNSUB topic.");
        return;
    }
    println!("Success {}", response);
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
