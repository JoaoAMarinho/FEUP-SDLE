import React, { useState, useEffect } from "react";
import UserCard from "../Components/UserCard";
import NavBar from "../Components/Navbar";
import api from "../Utils/api";

export default function Users() {
    const port = sessionStorage.getItem("port");
    const [users, setUsers] = useState([]);
    const [changes, setChanges] = useState(false);

    const fetchUsers = () => {
        console.log("Fetching users...");

        api.get("users/", port)
            .then((res) => {
                console.log("Users fetched. Response:", res.data);
                setUsers(res.data);
            })
            .catch((err) => {
                console.log("Error fetching users:", err);
            });
    };

    const follow = (username) => {
        console.log(`Following ${username}...`);

        api.post("follow/", port, { username })
            .then((res) => {
                console.log("Response:", res.data);
                setChanges(!changes);
            })
            .catch((err) => {
                console.log("Error following user:", err);
            });
    };

    const unfollow = (username) => {
        console.log(`Unfollowing ${username}...`);

        api.post("unfollow/", port, { username })
            .then((res) => {
                console.log("Response:", res.data);
                setChanges(!changes);
            })
            .catch((err) => {
                console.log("Error unfollowing user:", err);
            });
    };

    const handleClick = (user) => {
        if (user.following) {
            unfollow(user.username);
            return;
        }

        follow(user.username);
    };

    useEffect(() => {
        fetchUsers();
    }, [changes]);

    return (
        <>
            <NavBar />
            <div className="container mt-5">
                <div className="row">
                    {users.map((user) => {
                        return (
                            <UserCard user={user} handleClick={handleClick } />
                        );
                    })}
                </div>
            </div>
        </>
    );
}
