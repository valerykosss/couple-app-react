import { Navigate, Outlet, useLocation } from "react-router";
import { action, useTypedSelector } from "../store";
import { useDispatch } from "react-redux";

function ProtectedRoute(props: { loading: boolean }) {
  const token = useTypedSelector((state) => state.authSlice.firebaseToken);
  const dispatch = useDispatch();
  const location = useLocation();
  const isLoggingOut = useTypedSelector((state) => state.uiSlice.isLoggingOut);

  if (props.loading) return <p>Загрузка...</p>;

  if (!token && location.pathname.startsWith("/app") && !isLoggingOut) {
    dispatch(action.uiSlice.setAuthModalOpen(true));
    return <Navigate to="/" replace />;
  }

  if (!token && !location.pathname.startsWith("/app") && !isLoggingOut) {
    dispatch(action.uiSlice.setAuthModalOpen(true));
    dispatch(action.uiSlice.setLoggingOut(false));
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;