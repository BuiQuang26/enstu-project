import React from "react";
import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Navigate } from "react-router-dom";
import authApi from "../../Api/authApi";
import homeApi from "../../Api/homeApi";
import postApi from "../../Api/postAPI";
import userApi from "../../Api/userApi";
import Header from "../layouts/header/header";
import Main from "../layouts/main/main";
import Loader from "../../components/loader/loader";
import Footer from "../layouts/footer/Footer";

const HomePage = () => {
    document.title = "Enstu";

    const [reRender, setReRender] = useState(false);
    const [tagSelect, setTagSelect] = useState("");
    const [page404, setPage404] = useState(false);
    const [isAuth, setIsAuth] = useState(true);
    const [apiGateWay, setApiGateWay] = useState(true);

    const [user, setUser] = useState();
    const [posts, setPosts] = useState([]);
    const [tags, setTags] = useState([]);
    const [pageNo, setPageNo] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [lastPage, setLastPage] = useState(false);

    //update password
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isUpdatePasswordValue, setIsUpdatePasswordValue] = useState(false);

    const btnShowModelUpdatePassword = useRef();
    const closeUpdatePasswordForm = useRef();
    const showUpdatePasswordHandle = () => {
        btnShowModelUpdatePassword.current.click();
    };

    const onchangeUpdatePasswordHandle = (e) => {
        switch (e.target.name) {
            case "oldPassword":
                setOldPassword(e.target.value);
                break;
            case "newPassword":
                setNewPassword(e.target.value);
                break;
            case "confirmNewPassword":
                setConfirmNewPassword(e.target.value);
                break;
        }
    };

    useEffect(() => {
        if (
            oldPassword &&
            newPassword &&
            confirmNewPassword &&
            newPassword === confirmNewPassword &&
            newPassword.length >= 6
        ) {
            setIsUpdatePasswordValue(true);
        } else {
            setIsUpdatePasswordValue(false);
        }
    }, [oldPassword, newPassword, confirmNewPassword]);

    const updatePasswordHandle = async () => {
        if (isUpdatePasswordValue) {
            try {
                const resBody = (
                    await userApi.updatePassword({ oldPassword, newPassword })
                ).data;
                alert("Đổi mật khẩu thành công");
                console.log(resBody);
                closeUpdatePasswordForm.current.click();
            } catch (error) {
                if (error.response) {
                    alert(error.response.data.message);
                } else {
                    alert(error);
                }
            }
        }
    };

    //update email
    const btnShowModelUpdateEmail = useRef();
    const btnCloseUpdateEmailModal = useRef();
    const [newEmail, setNewEmail] = useState("");
    const [isEmail, setIsEmail] = useState(false);
    const [otpUpdateEmail, setOtpUpdateEmail] = useState("");
    const [isUpdateEmailLoad, setIsUpdateEmailLoad] = useState(false);
    const [isCheckEmailLoad, setIsCheckEmailLoad] = useState(false);
    const showUpdateEmailModal = () => {
        btnShowModelUpdateEmail.current.click();
    };

    const checkEmail = function (value) {
        var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return regex.test(value) ? undefined : "Email không hợp lệ";
    };

    const verifierEmailHandle = async () => {
        setIsCheckEmailLoad(true);
        if (newEmail) {
            if (checkEmail(newEmail)) {
                setIsCheckEmailLoad(false);
                alert("Email không hợp lệ");
                return;
            }
            try {
                const res = await (
                    await authApi.verifyEmailRegister(newEmail)
                ).data;
                setIsCheckEmailLoad(false);
                setIsEmail(true);
                alert("Đã gửi OTP đến email: " + newEmail);
            } catch (error) {
                setIsCheckEmailLoad(false);
                if (error.response) {
                    if (error.response.data.status_code === 411) {
                        alert("Email đã được sử dụng");
                    }
                }
                alert("Xác thực email không thành công");
            }
        }
    };

    const updateEmailHandle = async () => {
        setIsUpdateEmailLoad(true);
        if (!isEmail) {
            setIsUpdateEmailLoad(false);
            alert("Email chưa được xác thực");
            return;
        }
        if (newEmail && otpUpdateEmail) {
            try {
                const res = await (
                    await authApi.updateEmail({
                        email: newEmail,
                        otp: otpUpdateEmail,
                    })
                ).data;
                setIsUpdateEmailLoad(false);
                console.log(res);
                alert("update email success");
                btnCloseUpdateEmailModal.current.click();
            } catch (error) {
                setIsUpdateEmailLoad(false);
                if (error.response) {
                    alert(error.response.data.message);
                }
                alert("update email failed");
            }
        }
    };

    //call api get info user
    const fetchApiHandle = async () => {
        try {
            const userInfoBody = await (await homeApi.getUserInfo()).data;
            const tagsBody = await (
                await homeApi.getTag({ page_number: 0, page_size: 10 })
            ).data;
            sessionStorage.setItem("enstu_access_user", userInfoBody.data.id);
            setUser(userInfoBody.data);
            setTags(tagsBody.data.content);
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
                    setApiGateWay(false);
                }
            } else {
                setApiGateWay(false);
            }
        }
    };

    const loadPosts = () => {
        fetchApiGetPost(pageNo, lastPage);
    };

    //call api get post
    const fetchApiGetPost = async (pageNo, lastPage) => {
        {
            try {
                if (!lastPage) {
                    let postsBody = null;
                    if (tagSelect) {
                        postsBody = await (
                            await postApi.getPostsByTag(tagSelect, {
                                page_number: pageNo,
                                page_size: pageSize,
                            })
                        ).data;
                    } else {
                        postsBody = await (
                            await postApi.getPosts({
                                page_number: pageNo,
                                page_size: pageSize,
                            })
                        ).data;
                    }
                    setPageNo(postsBody.data.number + 1);
                    setLastPage(postsBody.data.last);
                    setPosts((prevPosts) => {
                        return [
                            ...new Set([
                                ...prevPosts,
                                ...postsBody.data.content,
                            ]),
                        ];
                    });
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
                        setApiGateWay(false);
                    }
                } else {
                    setApiGateWay(false);
                }
            }
        }
    };

    //rerender when change reRender
    useEffect(() => {
        fetchApiHandle();

        return () => {
            setUser(null);
            setIsAuth(true);
            setTagSelect("");
        };
    }, [reRender]);

    useEffect(() => {
        setPosts([]);
        setLastPage(false);
        setPageNo(0);
        fetchApiGetPost(0, false);
        document.scrollingElement.scrollTop = 0;
    }, [reRender, tagSelect]);

    return (
        <>
            {!isAuth && <Navigate to={"/login"} />}
            {page404 && <Navigate to={"/404"} />}
            {!apiGateWay && <Navigate to={"/gate-way-error"} />}
            <div className="home-header sticky">
                <div className="grid home-container">
                    <Header
                        user={user}
                        showUpdatePasswordHandle={showUpdatePasswordHandle}
                        showUpdateEmailModal={showUpdateEmailModal}
                    />
                </div>
            </div>
            <div className="home-main">
                <div className="grid home-container">
                    <Main
                        tags={tags}
                        posts={posts}
                        setTagSelect={setTagSelect}
                        tagSelect={tagSelect}
                        loadPosts={loadPosts}
                        lastPage={lastPage}
                    />
                </div>
            </div>
            <Footer />
            <button
                type="button"
                className="hidden"
                data-bs-toggle="modal"
                data-bs-target="#updatePasswordModal"
                ref={btnShowModelUpdatePassword}
            ></button>
            <div
                className="modal fade"
                id="updatePasswordModal"
                tabIndex="-1"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-update">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title" id="exampleModalLabel">
                                Đổi mật khẩu
                            </h3>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                ref={closeUpdatePasswordForm}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="mb-3">
                                    <label className="col-form-label">
                                        Nhập mật khẩu cũ:
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        autoComplete="off"
                                        onChange={onchangeUpdatePasswordHandle}
                                        name="oldPassword"
                                        value={oldPassword}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="col-form-label">
                                        Nhập mật khẩu mới:
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        autoComplete="off"
                                        onChange={onchangeUpdatePasswordHandle}
                                        name="newPassword"
                                        value={newPassword}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="col-form-label">
                                        Nhập lại mật khẩu mới:
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="recipient-name"
                                        autoComplete="off"
                                        onChange={onchangeUpdatePasswordHandle}
                                        name="confirmNewPassword"
                                        value={confirmNewPassword}
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className={`btn btn-dark ${
                                    isUpdatePasswordValue ? "" : "btn-disable"
                                }`}
                                onClick={updatePasswordHandle}
                            >
                                Đổi mật khẩu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <button
                type="button"
                className="hidden"
                data-bs-toggle="modal"
                data-bs-target="#updateEmailModal"
                ref={btnShowModelUpdateEmail}
            ></button>
            <div
                className="modal fade"
                id="updateEmailModal"
                tabIndex="-1"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-update">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title" id="exampleModalLabel">
                                Đổi email
                            </h3>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                ref={btnCloseUpdateEmailModal}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="mb-3">
                                    <label className="col-form-label">
                                        Nhập email mới:
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control col-7"
                                        autoComplete="off"
                                        onChange={(e) => {
                                            setNewEmail(e.target.value);
                                            setIsEmail(false);
                                        }}
                                        value={newEmail}
                                    />
                                    <button
                                        type="button"
                                        className={`btn btn-dark mt-3 fs-5 btn-check-email ${
                                            newEmail ? "" : "btn-disable"
                                        }`}
                                        onClick={verifierEmailHandle}
                                    >
                                        {isCheckEmailLoad ? (
                                            <Loader />
                                        ) : (
                                            "Kiểm tra email"
                                        )}
                                    </button>
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        autoComplete="off"
                                        placeholder="Nhập mã OTP"
                                        onChange={(e) => {
                                            setOtpUpdateEmail(e.target.value);
                                        }}
                                        value={otpUpdateEmail}
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ height: "32px" }}
                                data-bs-dismiss="modal"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className={`btn btn-dark btn-update-email ${
                                    newEmail && otpUpdateEmail
                                        ? ""
                                        : "btn-disable"
                                }`}
                                onClick={updateEmailHandle}
                            >
                                {isUpdateEmailLoad ? (
                                    <Loader />
                                ) : (
                                    "Cập nhật email mới"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HomePage;
