use std::io::Write;
use std::fs::File;
use std::fs;
use std::io::BufReader;
use std::io::prelude::*;
use std::time::Duration;
use std::time::{SystemTime, UNIX_EPOCH};


pub fn request_reply(msg: &str, broker_address: &str) {
    let context = zmq::Context::new();
    let requester = context.socket(zmq::REQ).unwrap();

    requester
        .connect(broker_address)
        .expect("Failed connecting server to broker");

    requester.send(msg, 0).unwrap();

    let response = requester.recv_string(0).unwrap().unwrap();
    println!("Response: {}", &response);
}

pub fn create_directory(path: &str) -> std::io::Result<()> {
    fs::create_dir(path)?;
    Ok(())
}

pub fn create_file(path: &str, content: &str) -> std::io::Result<()> {
    let mut file = std::fs::File::create(path)?;
    file.write_all(content.as_bytes())?;
    Ok(())
}

pub fn read_file(path: &str) -> String {
    let file = File::open(path).expect("[READ] File does not exist.");
    let mut buf_reader = BufReader::new(file);

    let mut contents = String::new();
    buf_reader.read_to_string(&mut contents).unwrap();

    return contents;
}

pub fn get_timestamp() -> u64 {
    let start = SystemTime::now();
    start.duration_since(UNIX_EPOCH).unwrap().as_secs()
}