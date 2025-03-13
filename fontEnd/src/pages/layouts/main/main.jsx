import { Toast } from "bootstrap";
import React, { useEffect, useState } from "react";
import PostIntro from "../../../components/PostIntro/PostIntro";
import SideBarLeft from "../../../components/sideBar/SideBarLeft";

const Main = ({
    setTagSelect,
    tagSelect,
    tags,
    posts,
    lastPage,
    loadPosts,
}) => {
    const currentUserId = sessionStorage.getItem("enstu_access_user");
    return (
        <main className="main">
            <div className="grid__column-3 sidebar-left-wrapper">
                <SideBarLeft setTagSelect={setTagSelect} tagList={tags} />
            </div>
            <div className="grid__column-8 main-post-wrapper">
                <div className="post-list">
                    {posts &&
                        posts.map((post) => {
                            return (
                                <PostIntro
                                    post={post}
                                    moreOption={false}
                                    key={post.id}
                                    boxShadow={true}
                                    owner={currentUserId == post.user.id}
                                />
                            );
                        })}
                    {!lastPage && posts.length > 0 ? (
                        <button
                            className="btn-cus btn-link btn-more-posts"
                            onClick={loadPosts}
                        >
                            Xem thêm
                        </button>
                    ) : undefined}
                </div>
            </div>
        </main>
    );
};

export default Main;
