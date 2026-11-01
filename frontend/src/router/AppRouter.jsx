import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import ServerWakingBanner from "../components/ServerWakingBanner/ServerWakingBanner";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary";

const Home = lazy(() => import("../pages/Home/Home"));
const Login = lazy(() => import("../pages/Login/Login"));
const Register = lazy(() => import("../pages/Register/Register"));
const Search = lazy(() => import("../pages/Search/Search"));
const MyList = lazy(() => import("../pages/MyList/MyList"));
const Profile = lazy(() => import("../pages/Profile/Profile"));
const Catalog = lazy(() => import("../pages/Catalog/Catalog"));
const PublicProfile = lazy(
  () => import("../pages/PublicProfile/PublicProfile"),
);
const Feed = lazy(() => import("../pages/Feed/Feed"));
const ReviewDetail = lazy(() => import("../pages/ReviewDetail/ReviewDetail"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

const PageFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center px-4">
    <div className="w-full max-w-md animate-pulse rounded-lg bg-panel p-6">
      <div className="mb-3 h-4 w-36 rounded bg-white/10" />
      <div className="h-3 w-24 rounded bg-white/10" />
    </div>
  </div>
);

const AppRouter = () => {
  return (
    <>
      <Navbar />
      <ServerWakingBanner />

      <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/reviews/:id" element={<ReviewDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/catalog" element={<Catalog />} />

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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

export default AppRouter;
