import React from "react";
import PropTypes from "prop-types";
import { useLocation, Link, NavLink } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineLogout,
} from "react-icons/hi";
import Logo from "../logo.svg";

export default function NavBar({ logout }) {
  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-light">
      <div className="container-fluid">
        <img
          src={Logo}
          alt="PiuPiu Logo"
          style={{ width: 75, height: 75 }}
        ></img>
        <div className="collapse navbar-collapse" id="navbarColor01">
          <ul className="navbar-nav me-auto d-flex w-100 justify-content-end">
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
          </ul>
        </div>
      </div>
    </nav>
  );
}

NavBar.propTypes = {
  logout: PropTypes.func,
};
