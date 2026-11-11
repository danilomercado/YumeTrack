import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import ServerWakingBanner from "../components/ServerWakingBanner/ServerWakingBanner";
import PetalField from "../components/PetalField/PetalField";
import Footer from "../components/Footer/Footer";
import ChatDock from "../components/ChatDock/ChatDock";
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
const ForgotPassword = lazy(
  () => import("../pages/ForgotPassword/ForgotPassword"),
);
const ResetPassword = lazy(
  () => import("../pages/ResetPassword/ResetPassword"),
);
const SecuritySettings = lazy(
  () => import("../pages/SecuritySettings/SecuritySettings"),
);
const Lists = lazy(() => import("../pages/Lists/Lists"));
const ListDetail = lazy(() => import("../pages/ListDetail/ListDetail"));
const AdminReports = lazy(() => import("../pages/AdminReports/AdminReports"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

const PageFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center px-4">
    <span
      role="status"
      aria-label="Cargando"
      className="ink-pulse kanji select-none text-7xl text-accent"
    >
      夢
    </span>
  </div>
);

const AppRouter = () => {
  const location = useLocation();

  return (
    <>
      <PetalField />
      <Navbar />
      <ServerWakingBanner />

      <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
          <div key={location.pathname} className="page-enter">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/l/:token" element={<ListDetail />} />
              <Route
                path="/lists"
                element={
                  <ProtectedRoute>
                    <Lists />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute>
                    <AdminReports />
                  </ProtectedRoute>
                }
              />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/settings/security"
                element={
                  <ProtectedRoute>
                    <SecuritySettings />
                  </ProtectedRoute>
                }
              />
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
          </div>
        </Suspense>
      </ErrorBoundary>

      <Footer />
      <ChatDock />
    </>
  );
};

export default AppRouter;
