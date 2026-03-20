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

const AppRouter = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
      </Routes>
    </>
  );
};

export default AppRouter;
