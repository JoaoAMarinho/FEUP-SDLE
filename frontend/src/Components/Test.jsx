import React, { useState, useEffect } from "react";
import api from "../Utils/api";

export default function Test() {
    const [port, setPort] = useState(3001);
    const [feed, setFeed] = useState("");

    const handleRegister = () => {
        console.log("register");
        api.post("register/", port, { username: "test", password: "test" })
            .then((res) => {
                console.log("response", res.data);
            })
            .catch((err) => {
                console.log("Error:" + err);
            });
    };

    const handleLogin = () => {
        console.log("login");
        api.post("login/", port, { username: "test", password: "test" })
            .then((res) => {
                console.log("response", res.data);
                const newPort = res.data.port;
                sessionStorage.setItem("port", newPort);
                setPort(newPort);
            })
            .catch((err) => {
                console.log("Error:" + err);
            });
    };

    const handleFeed = () => {
        console.log("feed");
        api.get("feed/", port)
            .then((res) => {
                console.log("response", res.data);
                setFeed(res.data.feed);
                // const newPort = res.data.port;
                // sessionStorage.setItem("port", newPort);
                // setPort(newPort);
            })
            .catch((err) => {
                console.log("Error:" + err);
            });
    };

    useEffect(() => {
        const port = sessionStorage.getItem("port");
        if (port) {
            setPort(port);
        }
    }, []);

    return (
        <>
            <button onClick={handleRegister}>Register</button>
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleFeed}>Feed</button>
            <div>{"Port: " + port}</div>
            <div>{"Feed: " + feed}</div>
        </>
    );
}
