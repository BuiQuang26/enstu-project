import React, { useState } from "react";
import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import authApi from "../../Api/authApi";

import Loader from "../loader/loader";
import logo from "../../assets/images/logo-192x192.png";
import axiosClient from "../../Api/axiosClient";
import axios from "axios";

const LoginForm = () => {
    document.title = "Login | Enstu";

    //input value
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [OTP, setOTP] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newConfirmPassword, setNewConfirmNewPassword] = useState("");

    const [isData, setIsData] = useState(false);
    const [isUpdatePasswordData, setIsUpdatePasswordData] = useState(false);
    const [isLoaderLogin, setIsLoaderLogin] = useState(false);
    const [isLoaderSendOTP, setIsLoaderSendOTP] = useState(false);
    const [isLoaderUpdatePassword, setIsLoaderUpdatePassword] = useState(false);

    //state show
    const [isLoginFormShow, setIsLoginFormShow] = useState(true);
    const [isSendOTPFormShow, setIsSendOTPFormShow] = useState(true);

    //check
    const [loginError, setLoginError] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [isFocusInputUsername, setIsFocusInputUsername] = useState(false);
    const [isFocusInputPassword, setIsFocusInputPassword] = useState(false);
    const [isEmailSendOtp, setIsEmailSendOtp] = useState(true);
    const [emailSendOtpMessage, setEmailSendOtpMessage] = useState("");
    const [isOTP, setIsOTP] = useState(true);
    const [otpErrorMessage, SetOtpErrorMessage] = useState("");
    const [isNewPassword, setIsNewPassword] = useState(true);
    const [newPasswordErrorMessage, setNewPasswordErrorMessage] = useState("");

    const [emailOTP, setEmailOTP] = useState("");

    //handle input data
    const usernameHandle = (e) => {
        setUsername(e.target.value.trim());
    };

    const passwordHandle = (e) => {
        setPassword(e.target.value.trim());
    };

    const OTPHandle = (e) => {
        setOTP(e.target.value.trim());
    };

    const newPasswordHandle = (e) => {
        setNewPassword(e.target.value.trim());
    };

    const NewConfirmPasswordHandle = (e) => {
        setNewConfirmNewPassword(e.target.value.trim());
    };

    //input email send otp onchange handle
    const inputSendOtpHandle = (e) => {
        setEmailOTP(e.target.value.trim());
    };

    //handle submit form
    //handle business login
    const loginHandle = async (e) => {
        if (isData) {
            setIsLoaderLogin(true);
            try {
                let data = { username, password };
                const response = await authApi.login(data);
                const body = response.data;
                const tokens = body.data;
                sessionStorage.setItem("access_token", tokens.access_token);
                sessionStorage.setItem("refresh_token", tokens.refresh_token);
                setIsLogin(true);
                setIsLoaderLogin(false);
            } catch (error) {
                setIsLoaderLogin(false);
                if (error.response) {
                    if (error.response.status === 400) {
                        setLoginError(true);
                    } else alert("Internal server error");
                } else alert("can't connect to server");
            }
        }
    };

    const sendOtpHandle = async (e) => {
        if (isEmailSendOtp && emailOTP) {
            setIsLoaderSendOTP(true);
            try {
                await authApi.sendOTP(emailOTP);
                setIsLoaderSendOTP(false);
                //switch to update pass form
                setIsSendOTPFormShow(false);
            } catch (error) {
                setIsLoaderSendOTP(false);
                if (error.response) {
                    if (error.response.status === 404) {
                        setIsEmailSendOtp(false);
                        setEmailSendOtpMessage(
                            "Email chưa được đăng ký tài khoản"
                        );
                    } else alert("Internal server error");
                } else alert("can't connect to server");
            }
        }
    };

    const forgotPasswordHandle = async () => {
        if (isUpdatePasswordData) {
            setIsLoaderUpdatePassword(true);
            try {
                await authApi.forgotPassword({
                    otp: OTP,
                    email: emailOTP,
                    newPassword: newPassword,
                });
                alert("Cập nhật mật khẩu thàng công");
                setIsLoaderUpdatePassword(false);
                setIsSendOTPFormShow(true);
                setIsLoginFormShow(true);
            } catch (error) {
                setIsLoaderUpdatePassword(false);
                if (error.response) {
                    if (error.response.status === 400) {
                        if (error.response.data.status_code === 4006) {
                            SetOtpErrorMessage("OTP không đúng");
                            setIsOTP(false);
                        } else if (error.response.data.status_code === 4011) {
                            SetOtpErrorMessage("OTP đã hết hạn");
                            setIsOTP(false);
                        }
                    } else alert("Internal server error");
                } else alert("can't connect to server");
            }
        }
    };

    //onclick button handle switch form
    const onClickSwitchToSendOTPForm = (e) => {
        setIsLoginFormShow(false);
    };

    const onClickBackToLoginForm = (e) => {
        setIsLoginFormShow(true);
        setEmailOTP("");
    };

    const onClickBackToSendOTPForm = (e) => {
        setIsSendOTPFormShow(true);
        setOTP("");
        setNewPassword("");
        setNewConfirmNewPassword("");
    };

    //on focus
    const onFocus = (e) => {
        setLoginError(false);
        switch (e.target.name) {
            case "username":
                setIsFocusInputUsername(true);
                break;
            case "password":
                setIsFocusInputPassword(true);
                break;
            case "emailSendOTP":
                setIsEmailSendOtp(true);
                break;
            case "otp":
                setIsOTP(true);
                break;
            case "newPassword":
                setIsNewPassword(true);
                break;
        }
    };

    //onblur
    const onBlur = (e) => {
        switch (e.target.name) {
            case "username":
                setIsFocusInputUsername(false);
                break;
            case "password":
                setIsFocusInputPassword(false);
                break;
            case "emailSendOTP":
                if (checkEmail(emailOTP)) {
                    setIsEmailSendOtp(false);
                    setEmailSendOtpMessage("Email không hợp lệ");
                }
                break;
            case "otp":
                break;
            case "newPassword":
                if (checkMinLengthPassword(newPassword, 6)) {
                    setIsNewPassword(false);
                    setNewPasswordErrorMessage("Mật khẩu tối thiểu 6 ký tự");
                }
                break;
        }
    };

    //useEffect: check data input change
    useEffect(() => {
        if (username && password) setIsData(true);
        else setIsData(false);
    }, [username, password]);

    useEffect(() => {
        if (
            OTP &&
            newPassword &&
            newConfirmPassword &&
            newPassword === newConfirmPassword &&
            isNewPassword
        ) {
            setIsUpdatePasswordData(true);
        } else setIsUpdatePasswordData(false);
    }, [newPassword, newConfirmPassword, OTP]);

    //check data invalid
    const checkEmail = function (value) {
        var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return regex.test(value) ? undefined : "Email không hợp lệ";
    };
    const checkMinLengthPassword = function (value, num) {
        return value.length >= num
            ? undefined
            : `Mật khẩu tối thiểu có ${num} ký tự`;
    };

    return (
        <div className="login-form-container">
            {isLogin && <Navigate to="/" />}
            <div className="header">
                <img src={logo} className="logo" />
                <h2 className="title">Đăng nhập vào Enstu</h2>
            </div>
            <div className={`content ${isLoginFormShow ? "" : "hidden"}`}>
                <p
                    className={`login-error-title ${
                        loginError ? "" : "hidden"
                    }`}
                >
                    Tên đăng nhập hoặc mật khẩu không đúng
                </p>
                <div className="form-input">
                    <p className="input-title">Tên đăng nhập</p>
                    <div
                        className={`input-wrap ${
                            isFocusInputUsername ? "border-solid" : ""
                        }`}
                    >
                        <input
                            type="text"
                            placeholder="Email..."
                            name="username"
                            onChange={usernameHandle}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            value={username}
                        />
                    </div>
                </div>
                <div className="form-input">
                    <p className="input-title">Mật khẩu</p>
                    <div
                        className={`input-wrap ${
                            isFocusInputPassword ? "border-solid" : ""
                        }`}
                    >
                        <input
                            type="password"
                            placeholder="Password..."
                            name="password"
                            onChange={passwordHandle}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            value={password}
                            autoComplete="off"
                        />
                    </div>
                </div>
                <button
                    className={`btn btn-submit ${isData ? "" : "btn-disable"}`}
                    onClick={loginHandle}
                >
                    {isLoaderLogin ? <Loader /> : "Đăng nhập"}
                </button>
                <p
                    className="get-password auth-btn-link"
                    onClick={onClickSwitchToSendOTPForm}
                >
                    *Quên mật khẩu
                </p>
            </div>
            <div className={`content ${!isLoginFormShow ? "" : "hidden"}`}>
                <div className={isSendOTPFormShow ? "" : "hidden"}>
                    <div className="form-input">
                        <p className="input-title">
                            Nhập email đăng ký tài khoản
                        </p>
                        <p
                            className={`text-error ${
                                isEmailSendOtp ? "hidden" : ""
                            }`}
                        >
                            {emailSendOtpMessage}
                        </p>
                        <div
                            className={`input-wrap ${
                                isEmailSendOtp ? "border-solid" : "invalid"
                            }`}
                        >
                            <input
                                type="text"
                                placeholder="Email..."
                                name="emailSendOTP"
                                onChange={inputSendOtpHandle}
                                onBlur={onBlur}
                                onFocus={onFocus}
                                value={emailOTP}
                            />
                        </div>
                    </div>
                    <button
                        className={`btn btn-submit ${
                            emailOTP ? "" : "btn-disable"
                        }`}
                        onClick={sendOtpHandle}
                    >
                        {isLoaderSendOTP ? <Loader /> : "Tiếp tục"}
                    </button>
                    <button
                        className={`btn btn-submit`}
                        onClick={onClickBackToLoginForm}
                    >
                        {" "}
                        Quay lại
                    </button>
                </div>
                <div className={!isSendOTPFormShow ? "" : "hidden"}>
                    <div className="form-input">
                        <p className="input-title">Nhập OTP</p>
                        <p className={`text-error ${isOTP ? "hidden" : ""}`}>
                            {otpErrorMessage}
                        </p>
                        <div
                            className={`input-wrap ${
                                isOTP ? "border-solid" : "invalid"
                            }`}
                        >
                            <input
                                type="text"
                                placeholder="OTP..."
                                name="otp"
                                onChange={OTPHandle}
                                onFocus={onFocus}
                                value={OTP}
                            />
                        </div>
                    </div>
                    <div className="form-input">
                        <p className="input-title">Mật khẩu mới</p>
                        <p
                            className={`text-error ${
                                isNewPassword ? "hidden" : ""
                            }`}
                        >
                            {newPasswordErrorMessage}
                        </p>
                        <div
                            className={`input-wrap ${
                                isNewPassword ? "border-solid" : "invalid"
                            }`}
                        >
                            <input
                                type="password"
                                placeholder="new password"
                                name="newPassword"
                                onChange={newPasswordHandle}
                                onFocus={onFocus}
                                onBlur={onBlur}
                                value={newPassword}
                            />
                        </div>
                    </div>
                    <div className="form-input">
                        <p className="input-title">Nhập lại mật khẩu mới</p>
                        <div className="input-wrap border-solid">
                            <input
                                type="password"
                                placeholder="confirm new password"
                                onChange={NewConfirmPasswordHandle}
                                value={newConfirmPassword}
                            />
                        </div>
                    </div>
                    <button
                        className={`btn btn-submit ${
                            isUpdatePasswordData ? "" : "btn-disable"
                        }`}
                        onClick={forgotPasswordHandle}
                    >
                        {isLoaderUpdatePassword ? (
                            <Loader />
                        ) : (
                            "Cập nhật mật khẩu mới"
                        )}
                    </button>
                    <button
                        className={`btn btn-submit`}
                        onClick={onClickBackToSendOTPForm}
                    >
                        {" "}
                        Quay lại
                    </button>
                </div>
            </div>
            <div className="form-login-footer">
                <p>
                    Bạn chưa có tài khoản?{" "}
                    <Link to="/register" className="auth-btn-link">
                        Đăng ký
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
