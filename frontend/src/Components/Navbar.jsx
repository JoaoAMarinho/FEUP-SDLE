import React from "react";
import { useLocation, Link, NavLink } from "react-router-dom";
import {
    HiOutlineHome,
    HiOutlineUser,
    HiOutlineUsers,
    HiOutlineLogout,
} from "react-icons/hi";
import Logo from "../logo.svg";
import api from "../Utils/api";

// TODO: fix navbar responsiveness
export default function NavBar() {
    const location = useLocation();

    const logout = () => {
      console.log("logout");
      api
        .post("logout/", sessionStorage.getItem("port"))
        .then((_) => {
          sessionStorage.removeItem("port");
        })
        .catch((err) => {
          console.log("Erro logout:", err);
          sessionStorage.removeItem("port");
        });
    };

    return (
      <nav
        className="navbar navbar-expand-sm"
        style={{ background: "#E3E3E3" }}
      >
        <div className="container-fluid d-flex justify-content-between">
          <img
            src={Logo}
            alt="PiuPiu Logo"
            style={{ width: 75, height: 75 }}
          ></img>
          <span
            className="start-0 bottom-0 mb-3 ms-3"
            style={{ color: "#15202B", fontSize: "2rem" }}
          >
            Port: {sessionStorage.getItem("port")}
          </span>
          <ul className="navbar-nav d-flex">
            <>
              {location.pathname === "/profile" ? (
                <li className="nav-item">
                  <Link className="nav-link" to="/feed">
                    <HiOutlineHome size={30} color="#15202B" />
                  </Link>
                </li>
              ) : (
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    <HiOutlineUser size={30} color="#15202B" />
                  </Link>
                </li>
              )}
              {location.pathname === "/users" ? (
                <li className="nav-item">
                  <Link className="nav-link" to="/feed">
                    <HiOutlineHome size={30} color="#15202B" />
                  </Link>
                </li>
              ) : (
                <li className="nav-item">
                  <Link className="nav-link" to="/users">
                    <HiOutlineUsers size={30} color="#15202B" />
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <NavLink className="nav-link" onClick={logout} to="/login">
                  <HiOutlineLogout size={30} color="#15202B" />
                </NavLink>
              </li>
            </>
          </ul>
        </div>
      </nav>
    );
}
