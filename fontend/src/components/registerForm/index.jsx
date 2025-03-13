import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong } from "@fortawesome/free-solid-svg-icons";
import authApi from "../../Api/authApi";
import Loader from "../loader/loader";
import logo from "../../assets/images/logo-192x192.png";

const RegisterForm = () => {
    document.title = "Register | Enstu";

    const [showRegisterForm, setShowRegisterForm] = useState(true);
    const [isRegister, setIsRegister] = useState(false);

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [OTP, setOTP] = useState("");

    //0 : invalid , 1: onFocus , 2 : true , 3 : empty
    const [isEmail, setIsEmail] = useState(1);
    const [isFirstName, setIsFirstName] = useState(1);
    const [isLastName, setIsLastName] = useState(1);
    const [isPassword, setIsPassword] = useState(1);
    const [isConfirmPassword, setIsConfirmPassword] = useState(1);

    const [emailMessage, setEmailMessage] = useState("");
    const [firstNameMessage, setFirstNameMessage] = useState("");
    const [lastNameMessage, setLastNameMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [confirmPasswordMessage, setConfirmPasswordMessage] = useState("");
    const [isOTP, setIsOTP] = useState(1);
    const [OTPMessage, setOTPMessage] = useState("");
    const [load, setLoad] = useState(false);

    //begin : handle register data---------------------------------------------------------------------------

    // function invalid check
    const checkRequired = function (value) {
        return value.trim() ? undefined : true;
    };

    const checkEmail = function (value) {
        var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return regex.test(value) ? undefined : "Email không hợp lệ";
    };

    const checkMinLengthPassword = function (value, num) {
        return value.length >= num
            ? undefined
            : `Mật khẩu tối thiểu có ${num} ký tự`;
    };

    const checkConfirmPassword = function (value, valueConfirm) {
        return value === valueConfirm
            ? undefined
            : "Nhập lại mật khẩu không chính xác";
    };

    //on change
    const emailHandle = (e) => {
        setEmail(e.target.value.trim());
    };

    const firstNameHandle = (e) => {
        setFirstName(e.target.value.trim());
    };

    const LastNameHandle = (e) => {
        setLastName(e.target.value.trim());
    };

    const passwordHandle = (e) => {
        setPassword(e.target.value.trim());
    };

    const confirmPasswordHandle = (e) => {
        setConfirmPassword(e.target.value.trim());
    };

    //handle otp
    const OTPHandle = (e) => {
        setOTP(e.target.value.trim());
    };

    //confirm password change
    useEffect(() => {
        if (isConfirmPassword !== 3) {
            if (checkConfirmPassword(confirmPassword, password)) {
                setIsConfirmPassword(0);
                setConfirmPasswordMessage("Nhập lại mật khẩu không chính xác");
            } else {
                setIsConfirmPassword(2);
                setConfirmPasswordMessage("");
            }
        }
    }, [confirmPassword]);

    //onblur
    const onBlurHandle = (e) => {
        switch (e.target.name) {
            case "email":
                if (checkRequired(e.target.value.trim())) {
                    setIsEmail(0);
                    setEmailMessage("Bạn chưa nhập email");
                } else if (checkEmail(e.target.value.trim())) {
                    setIsEmail(0);
                    setEmailMessage("Email không hợp lệ");
                } else {
                    setIsEmail(2);
                    setEmailMessage("");
                }
                break;

            case "firstName":
                if (checkRequired(e.target.value.trim())) {
                    setIsFirstName(0);
                    setFirstNameMessage("Bạn chưa nhập tên");
                } else {
                    setIsFirstName(2);
                    setFirstNameMessage("");
                }
                break;

            case "lastName":
                if (checkRequired(e.target.value.trim())) {
                    setIsLastName(0);
                    setLastNameMessage("Bạn chưa nhập họ");
                } else {
                    setIsLastName(2);
                    setLastNameMessage();
                }
                break;

            case "password":
                if (checkRequired(e.target.value.trim())) {
                    setIsPassword(0);
                    setPasswordMessage("Bạn chưa nhập password");
                } else if (checkMinLengthPassword(e.target.value.trim(), 6)) {
                    setIsPassword(0);
                    setPasswordMessage(
                        checkMinLengthPassword(e.target.value, 6)
                    );
                } else {
                    setIsPassword(2);
                    setPasswordMessage("");
                }
                setIsConfirmPassword(0);
                break;

            case "confirmPassword":
                if (checkConfirmPassword(e.target.value.trim(), password)) {
                    setIsConfirmPassword(0);
                    setConfirmPasswordMessage(
                        "Nhập lại mật khẩu không chính xác"
                    );
                } else {
                    setIsConfirmPassword(2);
                    setConfirmPasswordMessage("");
                }
                break;
        }
    };

    //check onFocus
    const onFocusHandle = (e) => {
        switch (e.target.name) {
            case "email":
                setIsEmail(1);
                break;
            case "firstName":
                setIsFirstName(1);
                break;
            case "lastName":
                setIsLastName(1);
                break;
            case "password":
                setIsPassword(1);
                setConfirmPassword("");
                setIsConfirmPassword(3);
                break;
            case "confirmPassword":
                setIsConfirmPassword(1);
                break;
            case "OTP":
                setIsOTP(1);
                break;
            default:
                break;
        }
    };

    let isRegisterData =
        email && password && confirmPassword && firstName && lastName;

    //end : handle register data--------------------------------------------------------------------------------------------------

    //post api send otp to email
    const SendOTPHandle = async () => {
        if (
            isEmail === 2 &&
            isConfirmPassword === 2 &&
            isPassword === 2 &&
            isFirstName === 2 &&
            isLastName === 2
        ) {
            try {
                setLoad(true);
                const response = await authApi.verifyEmailRegister(email);
                console.log(response.data);

                setShowRegisterForm(false);
                setLoad(false);
            } catch (error) {
                setLoad(false);
                //response error
                if (error.response) {
                    const data = error.response.data;
                    if (
                        error.response.status === 400 &&
                        data.status_code === 411
                    ) {
                        setIsEmail(0);
                        setEmailMessage("Email đã được sử dụng");
                    }
                    if (error.response.status === 400 && data.status === 412) {
                        setIsEmail(0);
                        setEmailMessage("Không gửi được otp đến email nay");
                    }
                } else if (error.request) {
                    alert("Can't connect to server !");
                }
            }
        }
    };

    //post api register
    const registerHandle = async (e) => {
        const data = {
            otp: OTP,
            email,
            password,
            firstName,
            lastName,
        };
        try {
            const response = await authApi.register(data);
            console.log(response.data);
            alert("Đăng ký tài khoản thành công");
            setIsRegister(true);
        } catch (error) {
            const status = error.response.status;
            const status_code = error.response.data.status_code;
            if (status === 400) {
                if (status_code === 4011) {
                    setIsOTP(0);
                    setOTPMessage("OTP đã hết hạn");
                } else if (status_code === 4006) {
                    setIsOTP(0);
                    setOTPMessage("OTP Không đúng");
                } else {
                    alert("Đăng ký không thành công");
                }
            } else {
                alert("Đăng ký không thành công");
            }
        }
    };

    return (
        <div className="register-form-container">
            {isRegister && <Navigate to={"/login"} />}
            <div className="header">
                <img src={logo} className="logo" />
                <h2 className="title">Đăng ký tài khoản</h2>
            </div>
            <div className={`content ${!showRegisterForm ? "hidden" : ""}`}>
                <div className="form-input">
                    <p className="input-title">Đăng ký với email</p>
                    <p className={`text-error ${isEmail ? "hidden" : ""}`}>
                        {emailMessage}
                    </p>
                    <div className={`input-wrap ${isEmail ? "" : "invalid"}`}>
                        <input
                            type="text"
                            placeholder="Email..."
                            name="email"
                            onChange={emailHandle}
                            value={email}
                            onBlur={onBlurHandle}
                            onFocus={onFocusHandle}
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="form-input">
                    <p className="input-title">Tên</p>
                    <p className={`text-error ${isFirstName ? "hidden" : ""}`}>
                        {firstNameMessage}
                    </p>
                    <div
                        className={`input-wrap ${isFirstName ? "" : "invalid"}`}
                    >
                        <input
                            type="text"
                            placeholder="First name"
                            name="firstName"
                            onChange={firstNameHandle}
                            onBlur={onBlurHandle}
                            value={firstName}
                            onFocus={onFocusHandle}
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="form-input">
                    <p className="input-title">Họ</p>
                    <p className={`text-error ${isLastName ? "hidden" : ""}`}>
                        {lastNameMessage}
                    </p>
                    <div
                        className={`input-wrap ${isLastName ? "" : "invalid"}`}
                    >
                        <input
                            type="text"
                            placeholder="Last name"
                            name="lastName"
                            onChange={LastNameHandle}
                            onBlur={onBlurHandle}
                            onFocus={onFocusHandle}
                            value={lastName}
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="form-input">
                    <p className="input-title">Mật khẩu</p>
                    <p className={`text-error ${isPassword ? "hidden" : ""}`}>
                        {passwordMessage}
                    </p>
                    <div
                        className={`input-wrap ${isPassword ? "" : "invalid"}`}
                    >
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            onChange={passwordHandle}
                            onBlur={onBlurHandle}
                            onFocus={onFocusHandle}
                            value={password}
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="form-input">
                    <p className="input-title">Nhập lại mật khẩu</p>
                    <p
                        className={`text-error ${
                            isConfirmPassword ? "hidden" : ""
                        }`}
                    >
                        {confirmPasswordMessage}
                    </p>
                    <div
                        className={`input-wrap ${
                            isConfirmPassword ? "" : "invalid"
                        }`}
                    >
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            onChange={confirmPasswordHandle}
                            onBlur={onBlurHandle}
                            onFocus={onFocusHandle}
                            value={confirmPassword}
                            autoComplete="off"
                        />
                    </div>
                </div>
                <button
                    className={`btn btn-submit ${
                        isRegisterData ? "" : "btn-disable"
                    }`}
                    onClick={SendOTPHandle}
                >
                    {load ? <Loader /> : "Đăng ký"}
                </button>
            </div>

            <div className={`content ${showRegisterForm ? "hidden" : ""}`}>
                <div className="form-input">
                    <p className="input-title">Nhập mã OTP</p>
                    <p className={`text-error ${isOTP ? "hidden" : ""}`}>
                        {OTPMessage}
                    </p>
                    <div className={`input-wrap ${isOTP ? "" : "invalid"}`}>
                        <input
                            type="text"
                            placeholder="Nhập OTP"
                            name="OTP"
                            onChange={OTPHandle}
                            onFocus={onFocusHandle}
                            value={OTP}
                            autoComplete="off"
                        />
                        <button
                            className="btn btn-send-otp"
                            onClick={SendOTPHandle}
                        >
                            {load ? <Loader /> : "Gửi lại"}
                        </button>
                    </div>
                </div>
                <button
                    className={`btn btn-submit ${OTP ? "" : "btn-disable"}`}
                    onClick={registerHandle}
                >
                    Tiếp tục
                </button>
                <button
                    className="btn btn-submit"
                    onClick={() => {
                        setShowRegisterForm(true);
                    }}
                >
                    <FontAwesomeIcon icon={faLeftLong} />
                </button>
            </div>

            <div className="register-form-footer">
                <p>
                    Bạn đã có tài khoản?{" "}
                    <Link to="/login" className="auth-btn-link">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;
