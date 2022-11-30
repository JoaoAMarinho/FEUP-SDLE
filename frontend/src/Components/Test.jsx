import React, { useState, useEffect } from 'react';
import api from "../Utils/api";

export default function Test(){
    const [port, setPort] = useState(3001);
    
    const handleClick = () => {
        console.log("register")
        api.post("register/", port).then((res) => {
            console.log("response", res.data);
            const newPort = res.data.port;
            sessionStorage.setItem("port", newPort);
            setPort(newPort);
        })
        .catch((err) => {
            console.log("Error:" + err);
        });
    };

    const handleClick2 = () => {
        console.log("login")
        api.post("login/", port).then((res) => {
            console.log("response", res.data)
            const newPort = res.data.port;
            sessionStorage.setItem("port", newPort);
            setPort(newPort);
        })
        .catch((err) => {
            console.log("Error:" + err);
        });
    };
    
    useEffect(() => {
        const port = sessionStorage.getItem("port")
        if (port) {
            setPort(port);
        }
    }, [])

    return(
        <>
            <button onClick={handleClick}>
                Register
            </button>
            <button onClick={handleClick2}>
                Login
            </button>
            <div>
                {"Port: " + port}
            </div>
        </>
    )
}