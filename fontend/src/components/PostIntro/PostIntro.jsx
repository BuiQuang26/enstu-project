import React, { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import remarkGfm from "remark-gfm";
import avatarDefault from "../../assets/images/avatar-default.png";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Link, useNavigate } from "react-router-dom";

const PostIntro = ({ post, moreOption, showModal, owner, test, boxShadow }) => {
    const user = post.user;
    const navOptionRef = useRef();
    const [moreOptionShow, setMoreOptionShow] = useState(false);

    const navigate = useNavigate();

    const onClickMoreOptionHandle = () => {
        if (moreOptionShow) {
            navOptionRef.current.classList.add("hidden");
            setMoreOptionShow(false);
        } else {
            navOptionRef.current.classList.remove("hidden");
            setMoreOptionShow(true);
        }
    };

    return (
        <div className={`post-intro-wrapper ${boxShadow ? "boxShadow-1" : ""}`}>
            <div className="left">
                <div className="post-intro-top">
                    <Link
                        to={"/user/" + user.id}
                        className="post-intro-top-user-wrapper"
                    >
                        <div className="avatar">
                            <img
                                src={
                                    user && user.avatar
                                        ? user.avatar
                                        : avatarDefault
                                }
                                alt=""
                                className="img-avatar"
                            />
                        </div>
                        <div className="username">{user && user.fullName}</div>
                    </Link>
                </div>
                <div className="post-intro-body">
                    <Link to={"/post/" + post.id} className="link-to-post">
                        <h1 className="title">{post && post.title}</h1>
                        <span className="tag">{post && post.tag.tagName}</span>
                    </Link>
                    <ReactMarkdown
                        className="content"
                        children={
                            post && post.content.substring(0, 126) + " ..."
                        }
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
                                        children={String(children).replace(
                                            /\n$/,
                                            ""
                                        )}
                                        style={darcula}
                                        language={match[1]}
                                        PreTag="div"
                                        {...props}
                                    />
                                ) : (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    />
                </div>
                <p className="time">
                    {post.createAt.substring(0, "yyyy-MM-dd".length)}
                </p>
            </div>
            <div className="right img-wrapper">
                {post && post.imagesList[0] && (
                    <Link className="link-to-post" to={"/post/" + post.id}>
                        <img
                            src={post.imagesList[0].image}
                            className="img-preview"
                        />
                    </Link>
                )}
            </div>
            <div className="more-option-container">
                {moreOption && owner ? (
                    <>
                        <i
                            class={`${
                                moreOptionShow
                                    ? "bi bi-x "
                                    : "bi bi-three-dots-vertical"
                            } btn-post-more-option btn-icon`}
                            onClick={onClickMoreOptionHandle}
                        ></i>
                        <ul
                            className="nav-option-list hidden"
                            ref={navOptionRef}
                        >
                            <li
                                className="nav-option-item"
                                onClick={() => {
                                    showModal(post.id, post.title);
                                }}
                            >
                                Xóa
                            </li>
                            <li
                                className="nav-option-item"
                                onClick={() => {
                                    navigate(`/post/${post.id}/update`);
                                }}
                            >
                                Chỉnh sửa
                            </li>
                        </ul>
                    </>
                ) : undefined}
            </div>
        </div>
    );
};

export default PostIntro;
