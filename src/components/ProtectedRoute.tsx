import { Navigate, Outlet } from "react-router";
import { action, useTypedSelector } from "../store";
import { useDispatch } from "react-redux";

function ProtectedRoute(props: { loading: boolean }) {
  const token = useTypedSelector((state) => state.authSlice.token);
  const dispatch = useDispatch();

  if (props.loading) return <p>Загрузка...</p>;

  if (!token) {
    dispatch(action.uiSlice.setAuthModalOpen(true));
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;