import React, { useState, useEffect } from "react";
import api from "../Utils/api";

export default function Test() {
    const [port, setPort] = useState(3001);
    const [feed, setFeed] = useState("");
    const [users, setUsers] = useState([])

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

    const handleLogout = () => {
        console.log("logout");
        sessionStorage.setItem("port", 3001);
        setPort(3001);
        // api.post("logout/", port)
        //     .then((res) => {
        //         console.log("logged out " + port)
        //         sessionStorage.setItem("port", 3001);
        //         setPort(3001);
        //     })
        //     .catch((err) => {
        //         console.log("Erro logout:" + err)
        //     })
    }

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

    const handleListUsers = () => {
        console.log("list users");
        api.get("users/", port)
            .then((res) => {
                console.log("response", res.data);
                setUsers(res.data.users);
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
            <button onClick={handleLogout}>Logout</button>
            <button onClick={handleFeed}>Feed</button>
            <button onClick={handleListUsers}>Users</button>
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
            <div>{"Users: "+ users}</div>
        </>
    );
}
