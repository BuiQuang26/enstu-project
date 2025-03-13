import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";
import postApi from "../../Api/postAPI";
import { Toast } from "bootstrap";

import Loader from "../../components/loader/loader";
import logo from "../../assets/images/logo-192x192.png";
import ToastCustom from "../../components/Toast/Toast";
import authApi from "../../Api/authApi";
import homeApi from "../../Api/homeApi";
import { faL } from "@fortawesome/free-solid-svg-icons";

const PostEditor = () => {
    const { post_id } = useParams();

    if (post_id) document.title = "post update";
    else document.title = "new post";

    document.scrollingElement.scrollTop = 0;

    //data input
    const [textContent, setTextContent] = useState("");
    const [title, setTitle] = useState("");
    const [tag, setTag] = useState("");
    const [isDataPost, SetIsDataPost] = useState(false);
    const [isLoadUpPost, setIsLoadUpPost] = useState(false);
    const [isUpPost, setIsUpPost] = useState(false);

    const [focusInputHashtag, setFocusInputHashtag] = useState(false);
    const [autoFocusTextarea, setAutoFocusTextarea] = useState(false);
    const [hoverTextStyle, setHoverTextStyle] = useState(false);
    const [imageInput, setImageInput] = useState();
    const [imageList, setImageList] = useState([]);
    const [tagList, setTagList] = useState([]);

    const [isAuth, setIsAuth] = useState(true);

    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    //toast state ----------------------------------------------
    const [toastErrorRef, setToastErrorRef] = useState();
    const [toastError, setToastError] = useState();
    const [toastInfoRef, setToastInfoRef] = useState();
    const [toastInfo, setToastInfo] = useState();
    const [toastSuccessRef, setToastSuccessRef] = useState();
    const [toastSuccess, setToastSuccess] = useState();
    const [toastWarningRef, setToastWarningRef] = useState();
    const [toastWarning, setToastWarning] = useState();
    const [toastSuccessMessage, setToastSuccessMessage] = useState("");
    const [toastInfoMessage, setToastInfoMessage] = useState("");
    const [toastWarningMessage, setToastWarningMessage] = useState("");
    const [toastErrorMessage, setToastErrorMessage] = useState("");
    //end -------------------------------------------------------------

    //useEffect set new Toast
    useEffect(() => {
        if (toastErrorRef) setToastError(new Toast(toastErrorRef.current));
        if (toastInfoRef) setToastInfo(new Toast(toastInfoRef.current));
        if (toastSuccessRef)
            setToastSuccess(new Toast(toastSuccessRef.current));
        if (toastWarningRef)
            setToastWarning(new Toast(toastWarningRef.current));
    }, [toastErrorRef, toastInfoRef, toastSuccessRef, toastWarningRef]);

    //useEffect start component
    useEffect(() => {
        getTag();
        getPost();
    }, []);

    const getPost = async () => {
        if (post_id) {
            try {
                const postBody = (await postApi.getPostById(post_id)).data;
                setTitle(postBody.data.title);
                setTag(postBody.data.tagName);
                setTextContent(postBody.data.content);
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 401) {
                        alert("Phiên làm việc hết hạn, ok đề tiếp tục !!!");
                        navigate("/");
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
        }
    };

    //tag input handle
    const getTag = async () => {
        try {
            const response = await homeApi.getTag({
                page_number: 0,
                page_size: 10,
            });
            setTagList(response.data.data.content);
        } catch (error) {
            console.log({ getTag: error });
            //todo
        }
    };

    const tagItemOnclickHandle = (e) => {
        setTag(e.target.textContent);
    };

    useEffect(() => {
        if (tag) setFocusInputHashtag(false);
    }, [tag]);

    //handle input change
    const textContentHandle = (e) => {
        setTextContent(e.target.value);
    };

    const titleHandle = (e) => {
        setTitle(e.target.value);
    };

    const tagHandle = (e) => {
        setTag(e.target.value);
    };

    //input image handle
    const inputImages = useRef(null);

    const inputImagesHandle = (e) => {
        inputImages.current.click();
    };

    const inputImageHandle = (e) => {
        const image = e.target.files[0];
        setImageInput(image);
        e.target.value = "";
    };

    useEffect(() => {
        if (imageInput) {
            imageInput.objectURL = URL.createObjectURL(imageInput);
            imageList.push(imageInput);
            setImageInput(imageList);
            setImageInput(null);
        }
    }, [imageInput]);

    //delete img post
    const deleteImageHandle = (e) => {
        const imgUrl = e.target.dataset.img;
        const newImageList = imageList.filter((img) => {
            return img.objectURL !== imgUrl;
        });
        setImageList(newImageList);
        URL.revokeObjectURL(imgUrl);
    };

    //handle data post
    useEffect(() => {
        if (title && tag && textContent) SetIsDataPost(true);
        else SetIsDataPost(false);
    }, [title, tag, textContent]);

    //upload post
    const uploadPostHandle = async (e) => {
        if (!isDataPost) {
            return;
        }
        setIsLoadUpPost(true);
        const dataContent = {
            title: title,
            content: textContent,
            tagName: tag,
        };
        if (imageList.length > 0) {
            const formData = new FormData();
            let jsonContent = JSON.stringify(dataContent);
            formData.append("content", jsonContent);
            imageList.forEach((image) => {
                formData.append("images", image);
            });
            try {
                await postApi.upPostWithImages(formData);
                setIsUpPost(true);
                setIsLoadUpPost(false);
            } catch (error) {
                setIsUpPost(false);
                setIsLoadUpPost(false);
                if (error.response) {
                    if (error.response.status === 401) {
                        alert("Phiên làm việc hết hạn, ok để tiếp tục");
                        if (await authApi.refreshToken()) {
                            console.log("refresh access_token success");
                        } else {
                            alert("Truy cập bị chặn");
                            setIsAuth(false);
                        }
                    } else if (error.response.status === 403) {
                        alert("Truy cập bị chặn");
                        setIsAuth(false);
                    } else {
                        alert("System error !!!");
                    }
                } else alert("Can't connect to server");
            }
            return;
        }
        try {
            await postApi.upPostNoImages(dataContent);
            setIsUpPost(true);
            setIsLoadUpPost(false);
            setToastSuccessMessage("Xuất bản thành công");
            toastSuccess.show();
            alert("Xuất bản thành công");
        } catch (error) {
            setIsUpPost(false);
            setIsLoadUpPost(false);
            if (error.response) {
                if (error.response.status === 401) {
                    alert("Phiên làm việc hết hạn, ok để tiếp tục");
                    if (await authApi.refreshToken()) {
                        console.log("refresh access_token success");
                    } else {
                        alert("Truy cập bị chặn");
                        setIsAuth(false);
                    }
                } else if (error.response.status === 403) {
                    alert("Truy cập bị chặn");
                    setIsAuth(false);
                } else {
                    alert("System error !!!");
                }
            } else alert("Can't connect to server");
        }
    };

    //update post handle
    const updatePostHandle = async () => {
        if (!isDataPost) {
            return;
        }
        setIsLoadUpPost(true);
        try {
            const resBody = await postApi.updatePost(post_id, {
                title,
                content: textContent,
                tagName: tag,
            });
            alert("Chỉnh sửa bài viết thành công");
            setIsLoadUpPost(false);
            handleBack();
        } catch (error) {
            setIsLoadUpPost(false);
            alert("Đã xảy ra lỗi !!!");
            handleBack();
        }
    };

    //on focus
    const onFocusInputHashTagHandle = (e) => {
        setFocusInputHashtag(true);
    };

    const onBlurHandle = (e) => {
        switch (e.target.name) {
            case "textContentInput":
                setAutoFocusTextarea(false);
        }
    };

    //onMouse move
    const onMouseMoveTextStyle = (e) => {
        setHoverTextStyle(true);
    };

    const onMouseMoveOutTextStyle = (e) => {
        setHoverTextStyle(false);
    };

    return (
        <div className="post-editor">
            {!isAuth && <Navigate to={"/login"} />}
            {isUpPost && <Navigate to={"/"} />}
            <div className="post-editor-header-wrapper">
                <div className="grid post-editor-header">
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
                    <div className="right">
                        {post_id ? (
                            <button
                                className={`btn-cus btn-primary-custom btn-lg btn-w-156-h-36 ${
                                    isDataPost ? "" : "btn-disable"
                                }`}
                                onClick={updatePostHandle}
                            >
                                {isLoadUpPost ? <Loader /> : "Lưu lại"}
                            </button>
                        ) : (
                            <button
                                className={`btn-cus btn-primary-custom btn-lg btn-w-156-h-36 ${
                                    isDataPost ? "" : "btn-disable"
                                }`}
                                onClick={uploadPostHandle}
                            >
                                {isLoadUpPost ? <Loader /> : "Xuất bản"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="grid post-editor-main">
                <input
                    type="text"
                    className="input-post-title"
                    placeholder="Tiêu đề"
                    onChange={titleHandle}
                    value={title}
                />
                <div
                    className="form-input-tag"
                    name="form-input-tag"
                    onBlur={onBlurHandle}
                >
                    <span className="hashtag-icon"># </span>
                    <input
                        type="text"
                        className="input-post-hashtag"
                        placeholder="chủ đề"
                        onChange={tagHandle}
                        onFocus={onFocusInputHashTagHandle}
                        name="inputHashtag"
                        value={tag}
                        autoComplete="off"
                    />
                    <ul
                        className={`tag-list ${
                            focusInputHashtag ? "" : "hidden"
                        }`}
                    >
                        {tagList.map((tag) => {
                            return (
                                <li
                                    className="tag-item"
                                    onClick={tagItemOnclickHandle}
                                    key={tag.id}
                                >
                                    {tag.tagName}
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="form-input-nav-editor">
                    <ul className="nav-editor">
                        <li
                            className="nav-editor-item"
                            onMouseOver={onMouseMoveTextStyle}
                            onMouseOut={onMouseMoveOutTextStyle}
                            onClick={() => {
                                setHoverTextStyle(false);
                            }}
                        >
                            <i className="bi bi-fonts"></i>
                            <ul
                                className={`sub-nav-editor ${
                                    hoverTextStyle ? "" : "hidden"
                                }`}
                            >
                                <li
                                    className="sub-editor-item h1"
                                    onClick={() => {
                                        setTextContent(
                                            `${textContent}${
                                                textContent
                                                    ? "\n# Text"
                                                    : "# Text"
                                            }`
                                        );
                                    }}
                                >
                                    H1
                                </li>
                                <li
                                    className="sub-editor-item h2"
                                    onClick={() => {
                                        setTextContent(
                                            `${textContent}${
                                                textContent
                                                    ? "\n## Text"
                                                    : "## Text"
                                            }`
                                        );
                                    }}
                                >
                                    H2
                                </li>
                                <li
                                    className="sub-editor-item h3"
                                    onClick={() => {
                                        setTextContent(
                                            `${textContent}${
                                                textContent
                                                    ? "\n### Text"
                                                    : "### Text"
                                            }`
                                        );
                                    }}
                                >
                                    H3
                                </li>
                                <li
                                    className="sub-editor-item h4"
                                    onClick={() => {
                                        setTextContent(
                                            `${textContent}${
                                                textContent
                                                    ? "\n#### Text"
                                                    : "#### Text"
                                            }`
                                        );
                                    }}
                                >
                                    H4
                                </li>
                            </ul>
                        </li>
                        <li
                            className="nav-editor-item"
                            onClick={() => {
                                setTextContent(
                                    `${textContent}${
                                        textContent ? " **Text**" : "**Text**"
                                    }`
                                );
                            }}
                        >
                            <i className="bi bi-type-bold"></i>
                        </li>
                        <li
                            className="nav-editor-item"
                            onClick={() => {
                                setTextContent(
                                    `${textContent}${
                                        textContent ? " *Text*" : "*Text*"
                                    }`
                                );
                            }}
                        >
                            <i className="bi bi-type-italic"></i>
                        </li>
                        <li
                            className="nav-editor-item"
                            onClick={() => {
                                setTextContent(
                                    `${textContent}${
                                        textContent ? " ~~Text~~" : "~~Text~~"
                                    }`
                                );
                            }}
                        >
                            <i className="bi bi-type-strikethrough"></i>
                        </li>
                        <li
                            className="nav-editor-item"
                            onClick={() => {
                                setTextContent(
                                    `${textContent}${
                                        textContent ? "\n* Text" : "* Text"
                                    }`
                                );
                            }}
                        >
                            <i className="bi bi-list-ul"></i>
                        </li>
                        <li
                            className="nav-editor-item"
                            onClick={() => {
                                setTextContent(
                                    `${textContent}${
                                        textContent ? "\n1. Text" : "1. Text"
                                    }`
                                );
                            }}
                        >
                            <i className="bi bi-list-ol"></i>
                        </li>
                        <li
                            className="nav-editor-item"
                            onClick={() => {
                                setTextContent(
                                    `${textContent}${
                                        textContent ? "\n\n> Text" : "> Text"
                                    }`
                                );
                            }}
                        >
                            <i className="bi bi-blockquote-left"></i>
                        </li>
                        <li
                            className="nav-editor-item"
                            onClick={() => {
                                setTextContent(
                                    `${textContent}${
                                        textContent ? " `text`" : "`text`"
                                    }`
                                );
                            }}
                        >
                            <i className="bi bi-code"></i>
                        </li>
                        <li
                            className="nav-editor-item"
                            onClick={() => {
                                setTextContent(
                                    `${textContent}${
                                        textContent
                                            ? "\n```html \n<div>element</div>\n```"
                                            : "```html \n<div>element</div>\n```"
                                    }`
                                );
                            }}
                        >
                            <i className="bi bi-code-slash"></i>
                        </li>
                        <li
                            className="nav-editor-item"
                            onClick={() => {
                                setTextContent(
                                    `${textContent}${"[google](http://www.google.com)"}`
                                );
                            }}
                        >
                            <i className="bi bi-link"></i>
                        </li>
                        {!post_id && (
                            <li
                                className="nav-editor-item"
                                onClick={inputImagesHandle}
                            >
                                <i className="bi bi-card-image"></i>
                            </li>
                        )}
                        <input
                            type="file"
                            name="images"
                            className="hidden"
                            ref={inputImages}
                            accept="image/*"
                            onChange={inputImageHandle}
                        />
                    </ul>
                </div>
                <div className="post-edit-content">
                    <div className="grid__column-6 editor-form-input-wrapper">
                        <textarea
                            type="text"
                            className="editor-form-input"
                            name="textContentInput"
                            placeholder="Nội dụng việt tại đây"
                            onChange={textContentHandle}
                            value={textContent}
                            autoFocus={autoFocusTextarea}
                            onBlur={onBlurHandle}
                        ></textarea>
                    </div>
                    <div className="grid__column-6 text-editor-preview">
                        <ReactMarkdown
                            children={textContent}
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

                        {imageList &&
                            imageList.map((image, index) => {
                                return (
                                    <div className="img-preview" key={index}>
                                        <img src={image.objectURL} />
                                        <div className="box-linear"></div>
                                        <button className="btn-bg-none btn-icon btn-xl btn-delete-img-post">
                                            <i
                                                className="bi bi-x-circle"
                                                data-img={image.objectURL}
                                                onClick={deleteImageHandle}
                                            ></i>
                                        </button>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
            <div className="toast-box">
                <ToastCustom
                    type={"error"}
                    message={toastErrorMessage}
                    setRef={setToastErrorRef}
                />
                <ToastCustom
                    type={"info"}
                    message={toastInfoMessage}
                    setRef={setToastInfoRef}
                />
                <ToastCustom
                    type={"warning"}
                    message={toastWarningMessage}
                    setRef={setToastWarningRef}
                />
                <ToastCustom
                    type={"success"}
                    message={toastSuccessMessage}
                    setRef={setToastSuccessRef}
                />
            </div>
        </div>
    );
};

export default PostEditor;
