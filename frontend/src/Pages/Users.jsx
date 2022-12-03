import React, { useState, useEffect } from "react";
import NavBar from "../Components/Navbar";
import api from "../Utils/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [port, setPort] = useState(sessionStorage.getItem("port"));

  const fetchUsers = () => {
    console.log("Fetching users...");

    api
      .get("users/", port)
      .then((res) => {
        console.log("Users fetched. Response:", res.data);
        setUsers(res.data);
      })
      .catch((err) => {
        console.log("Error fetching users:", err);
      });
  };

  const follow = (user) => {
    console.log(`Following ${user}...`);

    api
      .post("follow/", port, { username: user.username })
      .then((res) => {
        console.log("Response:", res.data);
      })
      .catch((err) => {
        console.log("Error following user:", err);
      });
  };

  const unfollow = (user) => {
    console.log(`Unfollowing ${user}...`);

    api
      .post("unfollow/", port, { username: user.username })
      .then((res) => {
        console.log("Response:", res.data);
      })
      .catch((err) => {
        console.log("Error unfollowing user:", err);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <NavBar />
      <button onClick={fetchUsers}> Refresh Users </button>
      <div className="container mt-5">
        <ul className="list-group bg-transparent border-0">
          {users.map((user) => {
            return (
              <li
                key={`id_${user.username}`}
                className="list-group-item d-flex justify-content-between"
              >
                <span>{user.username}</span>
                {user.following ? (
                  <button
                    className="btn btn-primary rounded-pill px-sm-5 px-3 py-2 ms-2 ms-sm-0"
                    style={{
                      backgroundColor: "#1D9BF0",
                      fontWeight: 500,
                      fontSize: "1.1rem",
                    }}
                    onClick={() => unfollow(user)}
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    className="btn btn-primary rounded-pill px-sm-5 px-3 py-2 ms-2 ms-sm-0"
                    style={{
                      backgroundColor: "#1D9BF0",
                      fontWeight: 500,
                      fontSize: "1.1rem",
                    }}
                    onClick={() => follow(user)}
                  >
                    Follow
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
