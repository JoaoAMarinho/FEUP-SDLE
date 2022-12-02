import React, { useState, useEffect } from "react";
import api from "../Utils/api";

export default function Test() {
    const [port, setPort] = useState(3001);
    const [feed, setFeed] = useState("");

    const [postText, setPostText] = useState("");

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
            })
            .catch((err) => {
                console.log("Error:" + err);
            });
    };

    const handlePostInputChange = (e) => {
        const { name, value } = e.target;
        setPostText(value);
    }

    const handlePost = (e) => {
        e.preventDefault()
        console.log("post", postText);
        api.post("post/", port, { message: postText } )
            .then((res) => {
                console.log("response", res.data)
            })
            .catch((err) => {
                console.log("Error:" + err);
            });
    }

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
            <form onSubmit={handlePost}>
                <input 
                    type="text" 
                    name="postText" 
                    onChange={(e) => handlePostInputChange(e)}
                    value={postText}></input>
                <button type="submit">Post</button>
            </form>
            <div>{"Port: " + port}</div>
            <div>{"Feed: " + feed}</div>
        </>
    );
}
