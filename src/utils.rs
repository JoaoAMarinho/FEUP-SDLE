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
