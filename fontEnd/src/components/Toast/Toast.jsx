import { Toast } from "bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter } from "react-router-dom";

const ToastCustom = ({ type, message, setRef }) => {
    const toastElement = useRef();
    const [icon, setIcon] = useState();

    useEffect(() => {
        setRef(toastElement);
        setIconHandle();
    }, []);

    const setIconHandle = () => {
        switch (type) {
            case "error":
                setIcon(<i className="bi bi-dash-circle"></i>);
                break;
            case "info":
                setIcon(<i className="bi bi-info-circle-fill"></i>);
                break;
            case "success":
                setIcon(<i className="bi bi-check-circle-fill"></i>);
                break;
            case "warning":
                setIcon(<i className="bi bi-check-circle-fill"></i>);
                break;
        }
    };

    return (
        <div>
            <div
                id="liveToast"
                className={`toast toast-${type}`}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                data-animation="true"
                ref={toastElement}
            >
                <div className="toast-header">
                    <strong className="me-auto">
                        {icon}
                        {" Thông báo"}
                    </strong>
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="toast"
                        aria-label="Close"
                    ></button>
                </div>
                <div className="toast-body">{message}</div>
            </div>
        </div>
    );
};

export default ToastCustom;
