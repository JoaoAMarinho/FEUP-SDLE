import React from "react";
import PropTypes from "prop-types";

MessageBox.propTypes = {
    messages: PropTypes.array.isRequired,
};

export default function MessageBox(props) {
    const messages = props.messages;

    const buildMessages = () => {
        const messageAlerts = [];

        for (const [i, m] of messages.entries()) {
            messageAlerts.push(
                <div
                    key={i}
                    className={`alert alert-dismissible alert-${
                        m.status ? "success" : "danger"
                    }`}
                    role="alert"
                >
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                        aria-label="Close"
                    ></button>
                    <strong>{m.message}</strong>
                </div>
            );
        }

        return messageAlerts;
    };

    return (
        <div className="messageBoxContainer mt-3 w-100">{buildMessages()}</div>
    );
}
