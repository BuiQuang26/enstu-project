import React from "react";
import LoginForm from "../../components/loginForm";
import RegisterForm from "../../components/registerForm";
import "./authPage.scss";
import background from "../../assets/images/background-black.webp";

function AuthPage({ router }) {
  return (
    <div
      className="auth-container"
      style={{ backgroundImage: `url(${background})` }}
    >
      {router === "/login" && <LoginForm />}
      {router === "/register" && <RegisterForm />}
    </div>
  );
}

export default AuthPage;
