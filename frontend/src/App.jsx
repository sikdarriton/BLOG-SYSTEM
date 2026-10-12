
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AdminPosts from "./components/AdminPosts";
import EditPost from "./pages/EditPost";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AccountSettings from "./components/AccountSettings";
import Auth from "./pages/Auth";
import UserManagement from "./pages/UserManagement";
import EditUser from "./pages/EditUser";
import CreatePost from "./pages/CreatePost";
import PostDetails from "./pages/PostDetails";

function App() {


  return (
    <>

      <BrowserRouter>
        <br />

        <Routes>

          <Route path="/" element={<Auth />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/admin/posts/create" element={<CreatePost />} />
            <Route
              path="/admin/posts"
              element={<AdminPosts />}
            />
            <Route path="/admin/posts/:id/edit" element={<EditPost />} />



            <Route
              path="/settings"
              element={<AccountSettings />}
            />

            <Route
              path="/users"
              element={<UserManagement />}
            />

            <Route path="/users/:id/edit" element={<EditUser />} />

            <Route path="/posts/:slug"  element={<PostDetails />}  />

          </Route>


        </Routes>

      </BrowserRouter>
    </>
  );
}

export default App;