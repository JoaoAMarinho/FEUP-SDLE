use clap::Parser;

#[derive(Parser)]
#[command(author, version, about, long_about=None)]
#[command(group(
    ArgGroup::new("vers")
        .required(true)
        .args(["set_ver", "major", "minor", "patch"]),
struct Cli {
    #[arg(short, long)]
    command: String,
    id: Optional<String>,
}

fn main() {
    let args = Cli::parse();
    println!("Hello, world! {:?}", args.pattern.unwrap());
}
