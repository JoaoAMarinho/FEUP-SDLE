import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Utils/api";
import Logo from "../logo.svg";

export default function Login() {
    const navigate = useNavigate();

    const [port, setPort] = useState(3001);

    const [inputValues, setInputValue] = useState({
        username: "",
        password: "",
    });

    const [validation, setValidation] = useState({
        username: "",
        password: "",
    });

    const onSubmit = (e) => {
        e.preventDefault();

        const isValid = checkValidation();
        if (!isValid) return;

        api.post("login/", port, {
            username: inputValues.username,
            password: inputValues.password,
        })
            .then((res) => {
                console.log("Login response:", res.data);

                const newPort = res.data.port;
                sessionStorage.setItem("port", newPort);
                setPort(newPort);

                navigate("/feed");
            })
            .catch((err) => {
                console.log("Login error:" + err);
            });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputValue({ ...inputValues, [name]: value });
    };

    const checkValidation = () => {
        const errors = { ...validation };
        let result = true;

        // username validation
        if (!inputValues.username.trim()) {
            result = false;
            errors.username = "usernameMissingError";
        } else {
            errors.username = "";
        }

        // password validation
        if (!inputValues.password.trim()) {
            result = false;
            errors.password = "passwordMissingError";
        } else {
            errors.password = "";
        }

        setValidation(errors);
        return result;
    };

    useEffect(() => {
        const port = sessionStorage.getItem("port");
        if (port) setPort(port);
    }, []);

    return (
        <div className="container d-flex justify-content-center align-items-center flex-column h-100">
            <div className="position-absolute top-0 start-0 mt-2 ms-5">
                <img
                    src={Logo}
                    alt="PiuPiu Logo"
                    style={{ width: 130, height: 130 }}
                    className="img-fluid"
                ></img>
                <p className="mt-0" style={{ color: "#1D9BF0" }}>
                    Welcome to PiuPiu
                </p>
            </div>
            <div className="row col-sm-8 col-md-5 col-12 px-4">
                <div className="col-12 mb-4">
                    <h1 className="w-100">Login</h1>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="form-group mt-3">
                        <label htmlFor="username" className="mb-1">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            className={
                                "form-control rounded-pill bg-secondary border border-0" +
                                (validation.username ? " is-invalid" : "")
                            }
                            onChange={(e) => handleChange(e)}
                            value={inputValues.username}
                        />
                        {validation.username && (
                            <div className="invalid-feedback">
                                {"Error: " + validation.username}
                            </div>
                        )}
                    </div>
                    <div className="form-group mt-3">
                        <label htmlFor="password" className="mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            className={
                                "form-control rounded-pill bg-secondary border border-0" +
                                (validation.password ? " is-invalid" : "")
                            }
                            onChange={(e) => handleChange(e)}
                            value={inputValues.password}
                        />
                        {validation.password && (
                            <div className="invalid-feedback">
                                {"Error: " + validation.password}
                            </div>
                        )}
                    </div>
                    <div className="form-group mt-5 d-flex justify-content-between">
                        <span>
                            Do not have an account yet?{" "}
                            <a href="/register">Register</a>
                        </span>
                        <button
                            type="submit"
                            className="btn btn-primary rounded-pill"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
