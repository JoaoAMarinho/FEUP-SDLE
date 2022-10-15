use clap::Parser;

#[derive(Parser)]
#[command(author, version, about, long_about=None)]
struct Cli {
    command: String,

    #[arg(short,long)]
    id: Option<String>,

    #[arg(short,long)]
    message: Option<String>,
}

fn main() {
    let args = Cli::parse();
    println!("Hello, world! {:?}", args.command);
}
