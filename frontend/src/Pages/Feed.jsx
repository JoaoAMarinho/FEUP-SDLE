import React, { useState, useEffect } from "react";
import NavBar from "../Components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../Utils/api";
import { IoMdSend } from "react-icons/io";
import { AiFillDelete } from "react-icons/ai";

export default function Feed() {
    const navigate = useNavigate();
    const [port, setPort] = useState(sessionStorage.getItem("port"));
    const [feed, setFeed] = useState([]);
    const [post, setPost] = useState("");

    const fetchFeed = () => {
        api.get("feed/", port)
            .then((res) => {
                console.log(res.data)
                console.log("Feed response:", res.data.feed);
                setFeed(res.data.feed ? res.data.feed : []);
            })
            .catch((err) => {
                if (err.code === "ERR_NETWORK"){
                    sessionStorage.removeItem("port");
                    navigate("/login");
                }
                console.log("Error fetching feed:", err);
            });
    };

    const getTimeDiference = (currDate, date) => {
        const secondDiff = (currDate - date) / 1000;
        const minuteDiff = secondDiff / 60;
        const hourDiff = minuteDiff / 60;
        const dayDiff = hourDiff / 24;
        const monthDiff = dayDiff / 30;
        const yearDiff = monthDiff / 12;

        if (yearDiff >= 1) {
            return Math.floor(yearDiff) + " years ago";
        }
        if (monthDiff >= 1) {
            return Math.floor(monthDiff) + " months ago";
        }
        if (dayDiff >= 1) {
            return Math.floor(dayDiff) + " days ago";
        }
        if (hourDiff >= 1) {
            return Math.floor(hourDiff) + " hours ago";
        }
        if (minuteDiff >= 1) {
            return Math.floor(minuteDiff) + " minutes ago";
        }
        if (secondDiff >= 1) {
            return Math.floor(secondDiff) + " seconds ago";
        }
        return "Just now";
    };

    const handleDeletion = () => {
        setPost("");
    };

    const handlePost = (e) => {
        if (post.length > 200) {
            e.preventDefault();
            return;
        }

        api.post("post/", port, { message: post })
            .then((res) => {
                console.log("Post response", res.data);
                setPost("");
                fetchFeed();
            })
            .catch((err) => {
                console.log("Post error:", err);
            });
    };

    useEffect(() => {
        const port = sessionStorage.getItem("port");
        if (port) setPort(port);
        else navigate("/login");

        fetchFeed();
    }, [port]);

    return (
        <>
            <NavBar />
            <div className="container d-flex flex-column align-items-center mt-5">
                <div className="row col-sm-7 col-lg-5 col-10">
                    <div>
                        <div className="form-group mt-3 position-relative">
                            <textarea
                                id="post"
                                name="post"
                                rows={4}
                                className="form-control rounded bg-secondary border-0 text-white px-3"
                                placeholder="What's piuing?"
                                value={post}
                                onChange={(e) => setPost(e.target.value)}
                            />
                            <div className="position-absolute d-flex end-0 bottom-0 justify-content-center align-items-center me-2 mb-1">
                                <span
                                    className=""
                                    style={{
                                        color:
                                            post.length > 200
                                                ? "red"
                                                : "#15202B",
                                    }}
                                >
                                    {post.length}
                                </span>
                                <span
                                    className="me-2"
                                    style={{ color: "#15202B" }}
                                >
                                    /200
                                </span>
                                <AiFillDelete
                                    className="me-2"
                                    style={{
                                        color: "#15202B",
                                        cursor: "pointer",
                                    }}
                                    onClick={handleDeletion}
                                />
                                <IoMdSend
                                    style={{
                                        color: "#15202B",
                                        cursor: "pointer",
                                    }}
                                    onClick={handlePost}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row col-sm-7 col-lg-5 col-10 justify-content-center my-5">
                    <hr
                        style={{ height: "3px", backgroundColor: "white" }}
                        className="border border-0"
                    />
                    {feed.map((post) => {
                        const date = Date.now();

                        return (
                            <div
                                className="row"
                                key={
                                    "id " + post.username + post.date.toString()
                                }
                            >
                                <div className="card bg-transparent text-white mt-3">
                                    <div className="card-body">
                                        <div className="d-flex flex-direction-row align-items-center">
                                            <h5
                                                className="card-title me-2"
                                                style={{ fontWeight: 700 }}
                                            >
                                                {post.username}
                                            </h5>
                                            <small className="card-subtitle text-muted">
                                                {getTimeDiference(
                                                    date,
                                                    post.date
                                                )}
                                            </small>
                                        </div>
                                        <p className="card-text mt-2">
                                            {post.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
