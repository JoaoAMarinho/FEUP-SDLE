# Assignment 1 - Reliable Pub/Sub Service

SDLE First Assignment of group T&lt;m&gt;&lt;n&gt;G&lt;p&gt;&lt;q&gt;.

Group members:

1. André Pereira (up201905650@fe.up.pt)
2. Beatriz Aguiar (up201906230@fe.up.pt)
3. João Marinho (up201905952@fe.up.pt)
4. Margarida Vieira (up201907907@fe.up.pt)

## Instalation

This project was built using [Rust](https://www.rust-lang.org/). Please use the following commands to install Rust in macOS, Linux, or another Unix-like OS:

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
[full documentation here](https://www.rust-lang.org/tools/install)


## Compilation

In order to compile the source code, please run the following command from the `root` folder:
```
cargo build
```

## Execution

### Subscriber/Publisher

In order to start the subscriber/publisher please run the following command from the `root` folder:
```
cargo run <command> [-i <id>] [-t <topic>] [-m <message>] -- 
```


Where:
- `<command>` is either GET, PUT, SUB or UNSUB.
- `<id>` is the client's ID.
- `<topic>` is the topic's name.
- `<message>` is the message sent on the PUT operation.

### Subscriber/Publisher

In order to start the broker please run the following command from the `root` folder:
```
cargo run broker --
```
