import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Link, Navigate, useNavigate } from "react-router-dom";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";

import postApi from "../../Api/postAPI";
import authApi from "../../Api/authApi";
import logo from "../../assets/images/logo-192x192.png";
import avatarDefault from "../../assets/images/avatar-default.png";
import Footer from "../layouts/footer/Footer";

const PostPage = () => {
    const { post_id } = useParams();
    const [reRender, setReRender] = useState(false);
    const [reRenderComments, setReRenderComments] = useState(false);
    const [isAuth, setIsAuth] = useState(true);
    let navigate = useNavigate();

    const [user, setUser] = useState();
    const [post, setPost] = useState();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [likedPost, setLikedPost] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [accessUser, setAccessUser] = useState();

    const handleBack = () => {
        navigate(-1);
    };

    //get id user curren
    const currenUser = sessionStorage.getItem("enstu_access_user");

    //call api get post by id
    const getPostByID = async () => {
        try {
            const postBody = (await postApi.getPostById(post_id)).data;
            setPost(postBody.data);
            setUser(postBody.data.user);
            setLikeCount(postBody.data.likes_count);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    alert("Phiên làm việc hết hạn, ok đề tiếp tục !!!");
                    if (await authApi.refreshToken()) {
                        console.log("refresh access_token success");
                        setReRender(!reRender);
                    } else {
                        setIsAuth(false);
                    }
                } else if (error.response.status === 403) {
                    setIsAuth(false);
                } else if (error.response.status === 404) {
                    navigate("/not-found");
                } else {
                    navigate("/gate-way-error");
                }
            } else {
                navigate("/gate-way-error");
            }
        }
    };

    const getComments = async () => {
        try {
            const commentsBody = (
                await postApi.getCommentsByPost(post_id, {
                    page_number: 0,
                    page_size: 10,
                })
            ).data;
            setComments(commentsBody.data.content);
        } catch (error) {
            if (error.response) {
                console.log(error.response.data);
            } else console.log(error);
        }
    };

    //add new comment
    const newCommentInputHandle = (e) => {
        setNewComment(e.target.value);
    };

    const postNewComment = async () => {
        try {
            await postApi.postNewComment(post_id, {
                textContent: newComment,
            });
            setNewComment("");
            setReRenderComments(!reRenderComments);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    alert("Phiên làm việc hết hạn, ok đề tiếp tục !!!");
                    if (await authApi.refreshToken()) {
                        console.log("refresh access_token success");
                        setReRender(!reRender);
                    } else {
                        setIsAuth(false);
                    }
                } else if (error.response.status === 403) {
                    alert("Truy cập bị chặn bị chặn");
                    setIsAuth(false);
                } else {
                    navigate("/api-gateway-error");
                }
            } else {
                navigate("/api-gateway-error");
            }
        }
    };

    useEffect(() => {
        getPostByID();
        checkLikedPost();
        setAccessUser(sessionStorage.getItem("enstu_access_user"));
        //scroll top
        document.scrollingElement.scrollTop = 0;
    }, [reRender]);

    useEffect(() => {
        getComments();
    }, [reRenderComments]);

    //convert time
    const convertTimeStamp7 = (timeString) => {
        const hours = parseInt(timeString.substring(0, 2));
        return `${(hours + 7) % 24}` + timeString.substring(2);
    };

    //like post handle
    const likePostHandle = async () => {
        setLikedPost(true);
        setLikeCount(likeCount + 1);
        try {
            await postApi.likePost(post_id);
        } catch (error) {
            if (error.response) {
                console.log(error.response.data);
            }
        }
    };

    //unlike post handle
    const unlikePostHandle = async () => {
        setLikedPost(false);
        setLikeCount(likeCount - 1);
        try {
            await postApi.unlikePost(post_id);
        } catch (error) {
            if (error.response) {
                console.log(error.response.data);
            }
        }
    };

    //check liked
    const checkLikedPost = async () => {
        try {
            await postApi.checkLiked(post_id);
            setLikedPost(true);
        } catch (error) {
            if (error.response) {
                console.log(error.response.data);
            }
        }
    };

    //delete comment handle
    const deleteCommentHandle = async (e) => {
        try {
            const resBody = await (
                await postApi.deleteComment(e.target.dataset.comment_id)
            ).data;
            console.log(resBody);
            setReRenderComments(!reRenderComments);
        } catch (error) {
            console.log(error.response.data);
        }
    };

    return (
        <div className="post-page">
            {!isAuth && <Navigate to={"/login"} />}
            <div className="post-page-header-wrapper">
                <div className="grid post-page-header">
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
                    {user && currenUser == user.id ? (
                        <div className="main-top-container">
                            <Link
                                className="btn-lg btn-icon"
                                to={`/post/${post && post.id}/update`}
                            >
                                <i class="bi bi-pencil-square ml-4"></i>
                                Chỉnh sửa bài viết
                            </Link>
                        </div>
                    ) : (
                        ""
                    )}
                </div>
            </div>
            <div className="post-page-main">
                <div className="grid post-container">
                    <div className="grid__column-8 post-content">
                        <h1 className="title">{post && post.title}</h1>
                        <div className="user">
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
                            <div className="user-text">
                                <Link
                                    to={`/user/${user && user.id}`}
                                    className="link-to-post"
                                >
                                    <span className="name">
                                        {user && user.fullName}
                                    </span>
                                </Link>
                                <span className="time">
                                    {`Ngày xuất bản: ${
                                        post && post.createAt.substring(0, 10)
                                    }`}
                                </span>
                            </div>
                        </div>
                        <div className="content">
                            <ReactMarkdown
                                children={post && post.content}
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({
                                        node,
                                        inline,
                                        className,
                                        children,
                                        ...props
                                    }) {
                                        const match = /language-(\w+)/.exec(
                                            className || ""
                                        );
                                        return !inline && match ? (
                                            <SyntaxHighlighter
                                                children={String(
                                                    children
                                                ).replace(/\n$/, "")}
                                                style={darcula}
                                                language={match[1]}
                                                PreTag="div"
                                                {...props}
                                            />
                                        ) : (
                                            <code
                                                className={className}
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            />
                            {post &&
                                post.imagesList.map((img) => {
                                    return (
                                        <img
                                            src={img.image}
                                            alt=""
                                            className="post-img"
                                        />
                                    );
                                })}
                        </div>
                        <div className="footer-container">
                            <p className="tag">{post && post.tagName}</p>
                        </div>
                    </div>
                    <div className="grid__column-4 post-page-main-right">
                        <div className="comment-container">
                            <div className="top">
                                <div
                                    className={`like-box ${
                                        post ? "" : "hidden"
                                    }`}
                                >
                                    <i
                                        className={`bi bi-heart ${
                                            likedPost ? "hidden" : ""
                                        }`}
                                        title="Yêu thích"
                                        onClick={likePostHandle}
                                    ></i>

                                    <i
                                        className={`bi bi-heart-fill ${
                                            likedPost ? "" : "hidden"
                                        }`}
                                        title="Bỏ thích"
                                        onClick={unlikePostHandle}
                                    ></i>
                                    <span className="like-count">
                                        {likeCount}
                                    </span>
                                </div>
                                <p className="title">Thảo luận</p>
                                <div className="comment-form-input-wrapper">
                                    <textarea
                                        type="text"
                                        className="comment-form-input"
                                        autoComplete="off"
                                        placeholder="Viết bình luận của bạn ..."
                                        onChange={newCommentInputHandle}
                                        value={newComment}
                                    />
                                    <button
                                        className={`btn-cus btn-comment-submit ${
                                            newComment ? "active" : ""
                                        }`}
                                        onClick={postNewComment}
                                    >
                                        Gửi
                                    </button>
                                </div>
                            </div>
                            <div className="list-comment-container">
                                <ul className="comment-list">
                                    {comments &&
                                        comments.map((comment) => {
                                            return (
                                                <li
                                                    className="comment-item"
                                                    key={comment.id}
                                                >
                                                    <Link
                                                        to={`/user/${comment.user.id}`}
                                                        className="link-to-post"
                                                    >
                                                        <img
                                                            src={
                                                                comment.user
                                                                    .avatar
                                                                    ? comment
                                                                          .user
                                                                          .avatar
                                                                    : avatarDefault
                                                            }
                                                            className="img-avatar"
                                                        />
                                                    </Link>
                                                    <div className="text-content-wrapper">
                                                        <div className="text-content">
                                                            <span className="username">
                                                                {
                                                                    comment.user
                                                                        .fullName
                                                                }
                                                            </span>
                                                            <span className="comment-text">
                                                                {
                                                                    comment.textContent
                                                                }
                                                            </span>
                                                            <span className="time">
                                                                {`${comment.createAt.substring(
                                                                    0,
                                                                    10
                                                                )} ${convertTimeStamp7(
                                                                    comment.createAt.substring(
                                                                        11,
                                                                        19
                                                                    )
                                                                )}`}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="more-option">
                                                                {comment.user
                                                                    .id ==
                                                                accessUser ? (
                                                                    <>
                                                                        <i className="bi bi-three-dots-vertical btn-more-option"></i>
                                                                        <ul className="nav-option-list">
                                                                            <li
                                                                                className="nav-option-item"
                                                                                data-comment_id={
                                                                                    comment.id
                                                                                }
                                                                                onClick={
                                                                                    deleteCommentHandle
                                                                                }
                                                                            >
                                                                                Xóa
                                                                            </li>
                                                                        </ul>
                                                                    </>
                                                                ) : undefined}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PostPage;
