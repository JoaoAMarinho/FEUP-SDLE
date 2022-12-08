import React, { useState, useEffect } from "react";

export default function Footer() {
  const [port, setPort] = useState(sessionStorage.getItem("port"));

  useEffect(() => {
    const onStorage = () => {
      setPort(sessionStorage.getItem("port"));
      // window.removeEventListener("storage", onStorage);
    };

    window.addEventListener("storage", onStorage);
  }, []);

  return (
    <>
      {port && (
        <div className="container-fluid">
          <span
            className="position-fixed start-0 bottom-0 mb-3 ms-3"
            style={{ fontWeight: "lighter" }}
          >
            Port: {port}
          </span>
        </div>
      )}
    </>
  );
}
