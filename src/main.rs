use clap::Parser;
mod server;
mod broker;

#[derive(Parser)]
#[command(author, version, about, long_about=None)]
struct Cli {
    command: String,

    #[arg(short,long)]
    id: Option<String>,

    #[arg(short,long)]
    topic: Option<String>,

    #[arg(short,long)]
    message: Option<String>,
}

fn main() {
    let args = Cli::parse();

    match args.command.as_str() {
        // client
        //"get" => client::get(args.id, args.topic), 
        //"sub" => client::sub(),
        //"unsub" => client::unsub(),
        // server
        "put" => server::put(args.topic, args.message), 
        // broker
        "broker" => broker::start(),
        _ => println!("Unknown command, '{}'!", args.command)
    }
}
