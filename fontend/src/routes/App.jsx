import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "../pages/authPage";
import HomePage from "../pages/home/HomePage";
import PersonalPage from "../pages/PersonalPage/PersonalPage";
import PostEditor from "../pages/postEditor/PostEditor";
import PostPage from "../pages/PostPage/PostPage";
import UpdatePage from "../pages/updatePage/UpdatePage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/*" element={<HomePage />} />
                <Route path="login" element={<AuthPage router="/login" />} />
                <Route
                    path="register"
                    element={<AuthPage router="/register" />}
                />
                <Route path="new-post" element={<PostEditor />} />
                <Route path="post/:post_id" element={<PostPage />} />
                <Route path="post/:post_id/update" element={<PostEditor />} />
                <Route path="user/:userID" element={<PersonalPage />} />
                <Route path="user/:userId/update" element={<UpdatePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
