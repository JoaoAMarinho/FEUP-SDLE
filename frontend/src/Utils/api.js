import axios from "axios";

// const BACKEND_SERVER = `${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}/api/`;
const BACKEND_SERVER = `localhost:3001/api/`;

// Get request with authentication
export async function get(route, payload = {}) {
    const config = {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    };

    return axios.get(
        `http://${BACKEND_SERVER}${route}`,
        {
            ...payload,
        },
        config
    );
}

// Post request with authentication
export async function post(route, payload = {}) {
    const config = {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    };

    return axios.post(
        `http://${BACKEND_SERVER}${route}`,
        {
            ...payload,
        },
        config
    );
}

const api = {
    get,
    post,
};

export default api;
