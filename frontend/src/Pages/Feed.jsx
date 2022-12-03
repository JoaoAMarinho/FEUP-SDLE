import React, { useState, useEffect } from "react";
import NavBar from "../Components/Navbar";
import api from "../Utils/api";

export default function Feed({ logout }) {
  const [port, setPort] = useState(3001);
  const [feed, setFeed] = useState("");
  const [post, setPost] = useState("");

  const fetchFeed = () => {
    api
      .get("feed/", port)
      .then((res) => {
        console.log("Response:", res.data);
        // TODO: get complete feed
        setFeed(res.data.feed[0].message);
      })
      .catch((err) => {
        console.log("Error fetching feed:" + err);
      });
  };

  const onSubmitPost = (e) => {
     e.preventDefault();

     api
       .post("post/", port, { message: post })
       .then((res) => {
         console.log("Post response", res.data);
       })
       .catch((err) => {
         console.log("Post error:" + err);
       });
  };

  const handleChange = (event) => {
    const { _, value } = event.target;
    setPost(value);
  };

  useEffect(() => {
    const port = sessionStorage.getItem("port");
    if (port) setPort(port);

    fetchFeed();
  }, []);

  return (
    <>
      <NavBar logout={logout} />
      <div className="container d-flex flex-column align-items-center h-100 mt-5">
        <div className="row col-sm-8 col-md-6 col-12 ">
          <form onSubmit={onSubmitPost}>
            <div className="form-group mt-3">
              <textarea
                id="post"
                name="post"
                className="form-control rounded-pill bg-secondary border border-0"
                placeholder="What's piuing?"
                onChange={(e) => handleChange(e)}
              />
            </div>
          </form>
        </div>
        <div>{/* TODO: show complete feed */}</div>
      </div>
    </>
  );
}
