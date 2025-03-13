import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faBell,
    faBars,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

import logo from "../../../assets/images/logo-192x192.png";
import avatarDefault from "../../../assets/images/avatar-default.png";
import postApi from "../../../Api/postAPI";
import authApi from "../../../Api/authApi";
import Loader from "../../../components/loader/loader";

const Header = ({ user, showUpdatePasswordHandle, showUpdateEmailModal }) => {
    const [btnNoti, setBtnNoti] = useState(false);
    const [btnMenu, setBtnMenu] = useState(false);
    const [logout, setLogout] = useState(false);

    const [showSearchBox, setShowSearchBox] = useState(false);
    const [valueSearch, setValueSearch] = useState("");
    const [searchPosts, setSearchPosts] = useState([]);
    const [searchLoad, setSearchLoad] = useState(false);

    const [reRender, setReRender] = useState(false);
    const [isAuth, setIsAuth] = useState(true);
    const [page404, setPage404] = useState(false);

    //btn onclick
    const notiBtnOnclickHandle = (e) => {
        if (btnMenu) setBtnMenu(false);
        setBtnNoti(!btnNoti);
    };

    const menuBtnOnclickHandle = (e) => {
        if (btnNoti) setBtnNoti(false);
        setBtnMenu(!btnMenu);
    };

    //logout handle
    const logoutHandle = () => {
        sessionStorage.clear();
        setLogout(true);
    };

    //input search input
    const onFocusSearchHandle = (e) => {
        setShowSearchBox(true);
        e.stopPropagation();
    };

    //onChange Search Handle
    const onChangeSearchHandle = async (e) => {
        setValueSearch(e.target.value);
    };

    useEffect(() => {
        const searchDelay = setTimeout(() => {
            fetchApiSearch();
        }, 700);
        return () => {
            clearTimeout(searchDelay);
        };
    }, [valueSearch]);

    //call api search posts
    const fetchApiSearch = async () => {
        try {
            if (valueSearch) {
                setSearchLoad(true);
                const resBody = await (
                    await postApi.searchPosts({ v: valueSearch })
                ).data;
                setSearchPosts(resBody.data.title);
                setSearchLoad(false);
            } else setSearchPosts([]);
        } catch (error) {
            setSearchLoad(false);
            if (error.response) {
                if (error.response.status === 401) {
                    if (await authApi.refreshToken()) {
                        console.log("refresh access_token success");
                        setReRender(!reRender);
                    }
                }
            } else {
                console.log(error.response);
            }
        }
    };

    return (
        <div className="header">
            {logout && <Navigate to={"/login"} />}
            <div className="header-logo">
                <Link to={"/"}>
                    <img src={logo} alt="" className="img-logo" />
                </Link>
                <div>
                    <span className="title">Enstu</span>
                    <p className="description">Sinh viên kỹ thuật</p>
                </div>
            </div>
            <div className="header-search">
                <div
                    className={`bg-post-search ${
                        showSearchBox ? "" : "hidden"
                    }`}
                    onClick={() => {
                        setShowSearchBox(false);
                    }}
                ></div>
                <div className="form-search">
                    <button className="btn-search">
                        {searchLoad ? (
                            <Loader />
                        ) : (
                            <FontAwesomeIcon icon={faSearch} />
                        )}
                    </button>
                    <input
                        type="text"
                        className="search-input"
                        onFocus={onFocusSearchHandle}
                        onChange={onChangeSearchHandle}
                        value={valueSearch}
                        id="input-search-post"
                        autoComplete="off"
                    />
                </div>
                <div
                    className={`search-posts-container ${
                        showSearchBox ? "" : "hidden"
                    }`}
                    id="search-posts-container"
                >
                    <div className="posts-container">
                        <p className="posts-list-title">Tìm kiếm bài viết</p>
                        <ul className="posts-list-wrapper">
                            {searchPosts &&
                                searchPosts.map((post) => {
                                    return (
                                        <li
                                            className="posts-item"
                                            key={post.id}
                                        >
                                            <Link
                                                to={"/post/" + post.id}
                                                className="link-to-post"
                                            >
                                                <div className="post-content">
                                                    <img
                                                        src={post.user.avatar}
                                                        alt=""
                                                    />
                                                    <span className="post-title">
                                                        {post.title}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                    );
                                })}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="header-nav">
                <div className="nav-item item-user">
                    <div className="user btn-cus">
                        <Link to={`/user/${user && user.id}`}>
                            <img
                                src={
                                    user && user.avatar
                                        ? user.avatar
                                        : avatarDefault
                                }
                                alt=""
                                className="avatar"
                            />
                            {user && (
                                <span className="text-name">
                                    {user.fullName}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
                {/* <div className="separate"></div>
                <div
                    className={`nav-item ${btnNoti ? "active" : ""}`}
                    onClick={notiBtnOnclickHandle}
                >
                    <div className="icon btn">
                        <FontAwesomeIcon icon={faBell} />
                    </div>
                </div> */}
                <div className="separate"></div>
                <div className={`nav-item ${btnMenu ? "active" : ""}`}>
                    <div className="icon btn" onClick={menuBtnOnclickHandle}>
                        {!btnMenu ? (
                            <FontAwesomeIcon icon={faBars} />
                        ) : (
                            <FontAwesomeIcon icon={faXmark} />
                        )}
                    </div>
                    <ul className={`nav-dropdown ${btnMenu ? "" : "hidden"}`}>
                        <Link
                            to={`/user/${user && user.id}`}
                            className="link-to-post"
                        >
                            <li className="item">Trang cá nhân</li>
                        </Link>
                        <li className="item" onClick={showUpdateEmailModal}>
                            Đổi email
                        </li>
                        <li className="item" onClick={showUpdatePasswordHandle}>
                            Đổi mật khẩu
                        </li>
                        <Link
                            to={`/user/${user && user.id}/update`}
                            className="link-to-post"
                        >
                            <li className="item">Cập nhật thông tin</li>
                        </Link>
                        <li className="bg-sub logout" onClick={logoutHandle}>
                            Đăng xuất
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Header;
