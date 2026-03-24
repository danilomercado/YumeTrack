import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Search from "../pages/Search/Search";
import MyList from "../pages/MyList/MyList";
import Profile from "../pages/Profile/Profile";
import Catalog from "../pages/Catalog/Catalog";
import PublicProfile from "../pages/PublicProfile/PublicProfile";
import Feed from "../pages/Feed/Feed";

const AppRouter = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/feed" element={<Feed />} />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />

        <Route
          path="/catalog"
          element={
            <ProtectedRoute>
              <Catalog />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-list"
          element={
            <ProtectedRoute>
              <MyList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="/profile/:username" element={<PublicProfile />} />
      </Routes>
    </>
  );
};

export default AppRouter;
