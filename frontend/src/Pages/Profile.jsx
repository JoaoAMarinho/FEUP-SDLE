import React, { useState, useEffect } from "react";
import NavBar from "../Components/Navbar";
import api from "../Utils/api";

export default function Users() {
  const [port, setPort] = useState(3001);
  const [user, setUser] = useState({
    username: "margaridajcv",
    following: 0,
    followers: 0,
    timeline: [],
    posts: [
        {
          username: "margaridajcv",
          message: "Oi pipa",
          date: Date.now(),
        },
        {
          username: "margaridajcv",
          message: "Portugal ganhou",
          date: new Date(2022, 11, 1, 3, 24, 0),
        },
        {
          username: "margaridajcv",
          message: "Beleza",
          date: new Date(2022, 11, 2, 3, 24, 0),
        },
        {
          username: "margaridajcv",
          message:
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec qu",
          date: Date.now(),
        }],
  });


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

  const fetchProfile = () => {
    api
      .get("profile/", port)
      .then((res) => {
        console.log("Response:", res.data);
        setUser(res.data);
      })
      .catch((err) => {
        console.log("Error fetching feed:" + err);
      });
  };

  useEffect(() => {
    const port = sessionStorage.getItem("port");
    if (port) setPort(port);

    fetchProfile();
  }, [user]);

  return (
    <>
      <NavBar />
      <div className="container d-flex flex-column align-items-center mt-5">
        <div className="row col-sm-7 col-lg-5 col-10">
          <div>
            <div
              className="rounded mt-3 pt-3 pb-3"
              style={{ background: "#E3E3E3" }}
            >
              <h5
                className="card-title me-3 ms-3"
                style={{ fontWeight: 700, color: "#15202B" }}
              >
                {user.username}
              </h5>
              <div className="d-flex justify-content-between mt-1 ms-3 me-3">
                <small className="card-subtitle text-muted">
                  joined may 2016
                </small>
                <div>
                  <small className="card-subtitle text-muted me-2">
                    <b>{user.followers}</b> followers
                  </small>
                  <small className="card-subtitle text-muted">
                    <b>{user.following}</b> following
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row col-sm-7 col-lg-5 col-10 justify-content-center my-5">
            <hr style={{height: "3px", backgroundColor: "white"}} className="border border-0" />
          {user.posts.map((post) => {
            const date = Date.now();
            return (
              <div
                className="row"
                key={"id " + post.username + post.date.toString()}
              >
                <div className="card bg-dark text-white mt-3">
                  <div className="card-body">
                    <div className="d-flex flex-direction-row align-items-center">
                      <h5
                        className="card-title me-2"
                        style={{ fontWeight: 700 }}
                      >
                        {post.username}
                      </h5>
                      <small className="card-subtitle text-muted">
                        {getTimeDiference(date, post.date)}
                      </small>
                    </div>
                    <p className="card-text mt-2">{post.message}</p>
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
