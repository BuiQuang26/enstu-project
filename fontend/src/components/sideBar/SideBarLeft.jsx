import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const SideBarLeft = ({ setTagSelect, tagList }) => {
    const [tagClick, setTagClick] = useState("");

    const onclickItemTagHandle = (e) => {
        setTagSelect(e.target.textContent);
        setTagClick(e.target.textContent);
    };

    const removeTagSelectHandle = () => {
        setTagClick("");
        setTagSelect("");
    };

    return (
        <div className="sidebar-content">
            <div className="sidebar-container">
                <div className="sidebar-item">
                    <Link className="btn btn-add-post" to={"/new-post"}>
                        <FontAwesomeIcon icon={faPlus} className="icon" />
                        Thêm bài viết
                    </Link>
                </div>
            </div>
            <div className="sidebar-container">
                <ul className="sidebar-list">
                    {/* <li className="sidebar-item">
                        <input type="checkbox" /> Bài viết yêu thích
                    </li> */}
                </ul>
            </div>
            <div className="sidebar-container">
                <span className="sidebar-title"># Chủ đề nổi bật</span>
                <ul className="sidebar-list grid__row">
                    {tagList.map((tag) => {
                        return (
                            <li
                                className="sidebar-item-tag"
                                key={tag.id}
                                onClick={onclickItemTagHandle}
                            >
                                {tag.tagName}
                            </li>
                        );
                    })}
                    {tagClick && (
                        <li className="sidebar-item-tag tag-click">
                            {tagClick}{" "}
                            <i
                                className="bi bi-x icon-close"
                                onClick={removeTagSelectHandle}
                            ></i>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default SideBarLeft;
