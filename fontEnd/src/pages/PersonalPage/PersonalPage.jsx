import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import logo from "../../assets/images/logo-192x192.png";
import avatarDefault from "../../assets/images/avatar-default.png";
import homeApi from "../../Api/homeApi";
import userApi from "../../Api/userApi";
import postApi from "../../Api/postAPI";
import authApi from "../../Api/authApi";
import PostIntro from "../../components/PostIntro/PostIntro";
import Header from "../layouts/header/header";
import Footer from "../layouts/footer/Footer";

const PersonalPage = () => {
    const { userID } = useParams();
    const userIdCurrent = sessionStorage.getItem("enstu_access_user");

    const [user, setUser] = useState();
    const [posts, SetPosts] = useState();
    const [postsOwner, setPostsOwner] = useState(false);

    const [reRender, setReRender] = useState(false);
    const [isAuth, setIsAuth] = useState(true);
    const [page404, setPage404] = useState(false);

    const btnModalShow = useRef();
    const btnModalHide = useRef();
    const postTitleRef = useRef();
    const [postIdDelete, setPostIdDelete] = useState();

    const myPostsRef = useRef();
    const likedPostRef = useRef();
    const [postsTarget, setPostsTarget] = useState("MYPOSTS");

    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    const postsHandle = (e) => {
        if (e.target === myPostsRef.current) {
            myPostsRef.current.classList.add("active");
            likedPostRef.current.classList.remove("active");
            setPostsTarget("MYPOSTS");
        } else {
            myPostsRef.current.classList.remove("active");
            likedPostRef.current.classList.add("active");
            setPostsTarget("LIKEDPOSTS");
        }
    };

    const deletePostHandle = async () => {
        try {
            const resBody = await (await postApi.deletePost(postIdDelete)).data;
            console.log(resBody);
            setReRender(!reRender);
        } catch (error) {
            console.log(error.response);
        }
        btnModalHide.current.click();
    };

    const showModal = (postId, postTitle) => {
        setPostIdDelete(postId);
        btnModalShow.current.click();
        postTitleRef.current.innerText = postTitle;
    };

    //fetch api user info
    const getUserById = async () => {
        try {
            const body = await (await userApi.getUserById(userID)).data;
            setUser(body.data);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    if (await authApi.refreshToken()) {
                        console.log("refresh access_token success");
                        setReRender(!reRender);
                    } else {
                        setIsAuth(false);
                    }
                } else if (error.response.status === 403) {
                    setIsAuth(false);
                } else if (error.response.status === 404) {
                    setPage404(true);
                } else {
                    alert("System error !!!");
                }
            } else {
                alert("Can't connect to server !!!");
            }
        }
    };

    //get posts
    const getPosts = async () => {
        try {
            let body;
            switch (postsTarget) {
                case "MYPOSTS":
                    body = await (await postApi.getPostUserById(userID)).data;
                    SetPosts(body.data.posts);
                    setPostsOwner(body.data.owner);
                    break;
                case "LIKEDPOSTS":
                    body = await (await postApi.getLikedPosts()).data;
                    SetPosts(body.data);
                    break;
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    if (await authApi.refreshToken()) {
                        console.log("refresh access_token success");
                        setReRender(!reRender);
                    } else {
                        setIsAuth(false);
                    }
                } else if (error.response.status === 403) {
                    setIsAuth(false);
                } else if (error.response.status === 404) {
                    setPage404(true);
                } else {
                    alert("System error !!!");
                }
            } else {
                alert("Can't connect to server !!!");
            }
        }
    };

    useEffect(() => {
        getUserById();
        getPosts();
    }, [reRender, postsTarget]);

    useEffect(() => {
        document.scrollingElement.scrollTop = 0;
    }, []);

    return (
        <div className="user-page">
            <div className="user-page-header-wrapper">
                <div className="grid user-page-header">
                    <div className="left">
                        <div className="logo">
                            <img src={logo} alt="" className="img-logo" />
                        </div>
                        <a
                            className="btn-cus btn-lg btn-icon"
                            onClick={handleBack}
                        >
                            <i className="bi bi-chevron-left"></i>
                            Quay lại
                        </a>
                    </div>
                    {postsOwner && (
                        <div className="main-top-container">
                            <Link
                                className="btn-lg btn-icon"
                                to={`/user/${user && user.id}/update`}
                            >
                                <i class="bi bi-pencil-square"></i>
                                Chỉnh sửa thông tin
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <div className="grid user-page-main-container">
                {!isAuth && <Navigate to={"/login"} />}
                {page404 && <Navigate to={"/404"} />}
                <div className="main">
                    <div className="main-top">
                        <div className="main-top-left">
                            <div className="avatar-wrapper">
                                <img
                                    src={
                                        user && user.avatar
                                            ? user.avatar
                                            : avatarDefault
                                    }
                                    alt=""
                                    className="avatar"
                                />
                            </div>
                        </div>
                        <div className="user-info">
                            <h3 className="user-fullName">
                                {user && user.fullName}
                            </h3>
                            <ul className="list-info list-st-none">
                                <li className="item-info">
                                    {user && user.address ? (
                                        <>
                                            <i class="bi bi-geo-alt-fill icon-address"></i>
                                            <span>{user.address}</span>
                                        </>
                                    ) : (
                                        ""
                                    )}
                                </li>
                                <li className="item-info">
                                    {user && user.email ? (
                                        <>
                                            <i class="bi bi-envelope"></i>
                                            <span>{user.email}</span>
                                        </>
                                    ) : (
                                        ""
                                    )}
                                </li>
                                <li className="item-info">
                                    {user && user.university ? (
                                        <>
                                            <i class="bi bi-journal-bookmark"></i>
                                            <span>{user.university.name}</span>
                                        </>
                                    ) : (
                                        ""
                                    )}
                                </li>
                                <li className="item-info">
                                    {user && (
                                        <>
                                            <i class="bi bi-gender-ambiguous"></i>
                                            <span>{`Giới tính: ${
                                                user.gender === 0
                                                    ? "nam"
                                                    : user.gender === 1
                                                    ? "nữ"
                                                    : "khác"
                                            }`}</span>
                                        </>
                                    )}
                                </li>
                            </ul>
                            <p className="short-Desc-YourSelf">
                                {user && user.shortDescYourSelf}
                            </p>
                        </div>
                    </div>
                    <div className="main-container">
                        <nav class="navbar navbar-expand-lg navbar-light bg-light nav-user-page">
                            <div class="container-fluid">
                                <div
                                    class="collapse navbar-collapse"
                                    id="navbarNavDropdown"
                                >
                                    <ul class="navbar-nav">
                                        <li class="nav-item">
                                            <a
                                                class="nav-link active"
                                                ref={myPostsRef}
                                                onClick={postsHandle}
                                            >
                                                Bài Viết
                                            </a>
                                        </li>

                                        {postsOwner && (
                                            <li class="nav-item">
                                                <a
                                                    class="nav-link"
                                                    ref={likedPostRef}
                                                    onClick={postsHandle}
                                                >
                                                    Bài viết yêu thích
                                                </a>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </nav>
                        <ul className="post-list">
                            {posts && posts.length > 0 ? (
                                posts.map((post) => {
                                    return (
                                        <PostIntro
                                            post={post}
                                            key={post.id}
                                            moreOption={true}
                                            showModal={showModal}
                                            boxShadow={false}
                                            owner={
                                                userIdCurrent == post.user.id
                                            }
                                        />
                                    );
                                })
                            ) : (
                                <p className="message">chưa có bài viết nào</p>
                            )}
                        </ul>
                    </div>
                </div>
                <button
                    type="button"
                    className="btn btn-primary hidden"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                    ref={btnModalShow}
                ></button>
                <div
                    className="modal fade"
                    id="exampleModal"
                    tabindex="-1"
                    aria-labelledby="exampleModalLabel"
                    aria-hidden="true"
                >
                    <div className="modal-dialog ">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5
                                    className="modal-title"
                                    id="exampleModalLabel"
                                >
                                    Xoá bài viết
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Bài viết:{" "}
                                    <strong ref={postTitleRef}>
                                        đi về đâu
                                    </strong>
                                </p>
                                <p>Bạn chắc chắn muốn xóa bài viết này?</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                    ref={btnModalHide}
                                >
                                    đóng
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={deletePostHandle}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PersonalPage;
