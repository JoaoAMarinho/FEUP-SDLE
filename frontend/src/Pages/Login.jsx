import React, { useState, useEffect } from "react";
import api from "../Utils/api";

export default function Login() {
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

        api.post("login/", port, { username: inputValues.username, password: inputValues.password })
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
        if (port) {
            setPort(port);
        }
    }, []);

    return (
        <div className="container d-flex justify-content-center align-items-center flex-column h-100">
            <div className="row col-sm-8 col-md-6 col-12 ">
                <div className="col-12 mb-2">
                    <h3 className="w-100 text-center">Login</h3>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="form-group my-2">
                        <label htmlFor="username" className="mb-1">
                            username
                        </label>
                        <input
                            id="username"
                            name="username"
                            className={
                                "form-control" +
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
                    <div className="form-group my-2">
                        <label htmlFor="password" className="mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            className={
                                "form-control" +
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
                    <div className="form-group mt-4 d-flex justify-content-center">
                        <button
                            type="submit"
                            className="btn btn-secondary px-4"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}