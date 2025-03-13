import React, { useState, useEffect, useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import homeApi from "../../Api/homeApi";
import logo from "../../assets/images/logo-192x192.png";
import avatarDefault from "../../assets/images/avatar-default.png";
import authApi from "../../Api/authApi";
import userApi from "../../Api/userApi";

const UpdatePage = () => {
    const [reRender, setReRender] = useState(false);
    const [isAuth, setIsAuth] = useState(true);
    const [page404, setPage404] = useState(false);

    const [universities, setUniversities] = useState([]);
    const [user, setUser] = useState();
    const [uniAbbreviation, setUniAbbreviation] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [gender, setGender] = useState();
    const [shortDescYourSelf, setShortDescYourSelf] = useState("");

    const btnShowModal = useRef();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    //get university
    const getUniversities = async () => {
        try {
            const resBody = await (await homeApi.getUniverSities()).data;
            setUniversities(resBody.data);
        } catch (error) {
            console.log(error.response);
        }
    };

    //get user info
    const getUserInfo = async () => {
        try {
            const resBody = await (await homeApi.getUserInfo()).data;
            setUser(resBody.data);
            setFirstName(resBody.data.firstName);
            setLastName(resBody.data.lastName);
            setUniAbbreviation(resBody.data.universityAbbreviation);
            setGender(resBody.data.gender);
            setAddress(resBody.data.address);
            setShortDescYourSelf(resBody.data.shortDescYourSelf);
        } catch (error) {
            console.log(error);
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

    const firstNameHandle = (e) => {
        setFirstName(e.target.value);
    };

    const lastNameHandle = (e) => {
        setLastName(e.target.value);
    };

    const addressHandle = (e) => {
        setAddress(e.target.value);
    };

    const universityHandle = (e) => {
        setUniAbbreviation(e.target.value);
    };

    const genderHandle = (e) => {
        setGender(e.target.value);
    };

    useEffect(() => {
        getUniversities();
        getUserInfo();
        return () => {};
    }, [reRender]);

    const updateHandle = async () => {
        try {
            const resBody = await userApi.updateInfo({
                universityAbbreviation: uniAbbreviation,
                firstName,
                lastName,
                address,
                gender,
                shortDescYourSelf,
            });

            console.log(resBody.data);
            alert("Cập nhật thành công");
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

    const [newAvatar, setNewAvatar] = useState();
    const [urlNewAvatar, setUrlNewAvatar] = useState();
    const btnHideModal = useRef();
    const handleNewAvatar = (e) => {
        setNewAvatar(e.target.files[0]);
        URL.revokeObjectURL(urlNewAvatar);
        setUrlNewAvatar(URL.createObjectURL(e.target.files[0]));
    };

    const updateAvatarHandle = async () => {
        try {
            if (newAvatar) {
                const formData = new FormData();
                formData.append("avatar", newAvatar);
                const resBody = await userApi.updateAvatar(formData);
                console.log(resBody.data);
                setReRender(!reRender);
                btnHideModal.current.click();
            }
        } catch (error) {
            console.log(error);
            alert(error.response && error.response.data.message);
        }
    };

    return (
        <div className="update-page">
            {!isAuth && <Navigate to={"/login"} />}
            {page404 && <Navigate to={"/404"} />}
            <div className="grid update-page-container">
                <div className="grid__column-2 update-page-left">
                    <div className="top">
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
                </div>
                <div className="form-update-wrapper">
                    <div className="row g-3 form-update">
                        <div className="form-update-top">
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
                                <div
                                    className="filler"
                                    onClick={() => {
                                        btnShowModal.current.click();
                                    }}
                                >
                                    <i className="bi bi-camera-fill"></i>
                                </div>
                            </div>
                            <div className="text-content">
                                <span className="username">{`${lastName} ${firstName}`}</span>
                                <span className="email">
                                    {user && user.email}
                                </span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="inputEmail4" className="form-label">
                                Firt name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="inputEmail4"
                                value={firstName}
                                onChange={firstNameHandle}
                            />
                        </div>
                        <div className="col-md-4">
                            <label
                                htmlFor="inputPassword4"
                                className="form-label"
                            >
                                Last name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="inputPassword4"
                                value={lastName}
                                onChange={lastNameHandle}
                            />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="inputState" className="form-label">
                                Giới tính
                            </label>
                            <select
                                id="inputState"
                                className="form-select"
                                value={gender}
                                defaultValue={0}
                                onChange={genderHandle}
                            >
                                <option value={0}>Nam</option>
                                <option value={1}>nữ</option>
                                <option value={2}>khác</option>
                            </select>
                        </div>
                        <div className="col-md-8">
                            <label htmlFor="inputState" className="form-label">
                                University
                            </label>
                            <select
                                id="inputState"
                                className="form-select"
                                value={uniAbbreviation}
                                onChange={universityHandle}
                            >
                                {universities.length > 0 &&
                                    universities.map((uni) => {
                                        return (
                                            <option
                                                value={uni.abbreviation}
                                                key={uni.id}
                                            >
                                                {uni.name}
                                            </option>
                                        );
                                    })}
                                <option value={""} defaultChecked>
                                    không
                                </option>{" "}
                            </select>
                        </div>

                        <div className="col-12">
                            <label
                                htmlFor="inputAddress"
                                className="form-label"
                            >
                                Address
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="inputAddress"
                                onChange={addressHandle}
                                value={address ? address : ""}
                            />
                        </div>
                        <div className="col-12">
                            <textarea
                                type="text"
                                className="form-control"
                                placeholder="Giới thiệu ngắn về bản thân ..."
                                onChange={(e) => {
                                    setShortDescYourSelf(e.target.value);
                                }}
                                value={shortDescYourSelf}
                            />
                        </div>
                        <div className="col-12 mt-5 ">
                            <button
                                className="btn btn-dark float-end fs-4"
                                onClick={updateHandle}
                            >
                                Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <button
                type="button"
                className="btn btn-primary hidden"
                data-bs-toggle="modal"
                data-bs-target="#exampleModal"
                ref={btnShowModal}
            ></button>

            <div
                className="modal fade"
                id="exampleModal"
                tabIndex="-1"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-form-update-avatar">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5
                                className="modal-title fs-3"
                                id="exampleModalLabel"
                            >
                                Cập nhật avatar
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body fs-4">
                            <form>
                                <div className="mb-3">
                                    <p>Chọn ảnh : {"file ảnh < 2MB"}</p>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="recipient-name"
                                        accept="image/*"
                                        onChange={handleNewAvatar}
                                    />
                                    <div className="preview-avatar">
                                        <img
                                            src={
                                                urlNewAvatar
                                                    ? urlNewAvatar
                                                    : avatarDefault
                                            }
                                            alt=""
                                            className="new-avatar"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                                ref={btnHideModal}
                            >
                                Đóng
                            </button>
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={updateAvatarHandle}
                            >
                                Lưu avatar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdatePage;
