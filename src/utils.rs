const DEFAULT_TIMEOUT: i64 = 2500;
const DEFAULT_RETRIES: i32 = 3;
const ACKNOWLEDGE: &str = "ACK";

pub fn timeout_request(msg: &str, address: &str, response: &mut String) -> i32{
    let mut retries = DEFAULT_RETRIES;

    let context = zmq::Context::new();
    let requester = context.socket(zmq::REQ).unwrap();

    requester
        .connect(address)
        .expect("Failed connecting to broker");

    requester.send(msg, 0).unwrap();

    while retries > 0 {
        if requester.poll(zmq::POLLIN, DEFAULT_TIMEOUT).unwrap() != 0 {
            let res = requester.recv_string(0).unwrap().unwrap();
            let split = res.split(";");
            let res: Vec<&str> = split.collect();
            if res[0] == ACKNOWLEDGE {
                if res.len() > 1 {
                    let info = &res[1..];
                    *response = info.join(";");
                }
                break;
            } else {
                println!("Invalid {} received: {}", ACKNOWLEDGE, res[0]);
            }
        }

        retries -= 1;
        requester.disconnect(address).unwrap();
        println!("No response from server.");
        if retries == 0 {
            println!("Leaving...");
            return -1;
        }

        println!("Reconnecting...");
        requester
            .connect(address)
            .expect("Failed reconnecting to broker");
        requester.send(msg, 0).unwrap();
    }

    return 0;
}
