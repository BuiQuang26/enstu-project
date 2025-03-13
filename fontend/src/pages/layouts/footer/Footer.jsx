import React from "react";

import logo from "../../../assets/images/logo-192x192.png";
import logoHaui from "../../../assets/images/logo-ngang-haui.webp";

const Footer = () => {
    return (
        <div className="footer">
            <div className="grid">
                <div className="row">
                    <div className="col-6">
                        <div className="footer-list">
                            <div className="footer-item-top">
                                <img src={logo} alt="" className="logo" />
                                <div className="text-content">
                                    <span className="app-name">
                                        Enstu - Engineering students
                                    </span>
                                    <span className="app-slogan">
                                        Mạng xã hội dành cho Sinh viên Kỹ thuật
                                    </span>
                                </div>
                            </div>
                            <div className="footer-item">
                                <p className="text-content">
                                    Thực hiện dự án: BuiQuang
                                </p>
                            </div>
                            <div className="footer-item">
                                <p className="text-content">
                                    Email: quangbui010975@gmail.com
                                </p>
                            </div>
                            <div className="footer-item">
                                <p className="text-content">
                                    Điện thoại: 0262626262
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="footer-list">
                            <div className="footer-item">
                                <p className="text-content">
                                    <strong>Enstu</strong> - “mạng mang xã hội
                                    dành cho sinh viên kỹ thuật” là một nơi để
                                    cho sinh viên đam mê nghiên cứu, học tập
                                    trong các lĩnh vực kỹ thuật công nghệ có một
                                    nơi chia sẻ và tìm hiểu kiến thức.
                                </p>
                            </div>
                            <div className="footer-item">
                                <p className="text-content">
                                    <strong>Đồ án tốt nghiệp 2022</strong> -
                                    Mạng xã hội dành cho sinh viên kỹ thuật
                                </p>
                            </div>
                            <div className="footer-item">
                                <img
                                    src="https://fee.haui.edu.vn/dnn/web/haui/assets/images/logo-ngang.png"
                                    alt=""
                                    className="logo"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p className="copy-right">copyright 2022 @BuiQuang</p>
                </div>
            </div>
        </div>
    );
};

export default Footer;
