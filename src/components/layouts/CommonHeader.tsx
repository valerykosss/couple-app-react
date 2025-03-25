import { Button, Layout, message, Modal } from "antd";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { getAuth, signOut } from "firebase/auth";
import { action, useTypedSelector } from "../../store";
import AuthFormLogin from "../AuthFormLogin";
import AuthFormRegister from "../AuthFormRegister";
import { useState } from "react";
import { Link } from "react-router";

const { Header } = Layout;

export default function CommonHeader() {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [formKey, setFormKey] = useState(0);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useTypedSelector((state) => state.authSlice.token);
  const isAuthModalOpen = useTypedSelector((state) => state.uiSlice.isAuthModalOpen);

  const toggleForm = () => {
    setIsLoginForm((prev) => !prev);
    setFormKey((prev) => prev + 1);
  };

  const handleCloseForm = () => {
    dispatch(action.uiSlice.setAuthModalOpen(false));
    setFormKey((prev) => prev + 1);
  };

  const handleLogin = () => {
    dispatch(action.uiSlice.setAuthModalOpen(true)); 
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      dispatch(action.uiSlice.setLoggingOut(true));
      
      await signOut(auth);
  
      localStorage.removeItem("authUser");
      // localStorage.removeItem("googleAccessToken");
      dispatch(action.authSlice.removeUser());
      dispatch(action.uiSlice.setAuthModalOpen(false));
  
      //тут не убирать!
      navigate("/", { replace: true });
      message.success("Вы успешно вышли из системы!");
    } catch (error) {
      message.error(`Ошибка при выходе: ${error}!`);
    }
  };

  return (
    <>
      <Header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/">Главная</Link>

        <div>
          {token && (
            <Link to="/app" style={{ marginRight: "10px" }}>
              Личный кабинет
            </Link>
          )}
          <Button onClick={token ? handleLogout : handleLogin}>
            {token ? "Выйти" : "Войти"}
          </Button>
        </div>
      </Header>

      <Modal
        style={{ textAlign: "center" }}
        title={isLoginForm ? "Авторизация" : "Регистрация"}
        open={isAuthModalOpen}
        onCancel={handleCloseForm}
        footer={null}
      >
        {isLoginForm ? (
          <AuthFormLogin onClose={handleCloseForm} key={formKey} toggleForm={toggleForm} />
        ) : (
          <AuthFormRegister onClose={handleCloseForm} key={formKey} toggleForm={toggleForm} />
        )}
      </Modal>
    </>
  );
}