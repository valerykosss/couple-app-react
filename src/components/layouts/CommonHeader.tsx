import { Button, Layout, message, Modal } from "antd";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, signOut } from "firebase/auth";
import { action, useTypedSelector } from "../../store";
import AuthFormLogin from "../AuthFormLogin";
import AuthFormRegister from "../AuthFormRegister";
import { useState } from "react";

const { Header } = Layout;

export default function CommonHeader() {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [formKey, setFormKey] = useState(0);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useTypedSelector((state) => state.authSlice.token);
  const isAuthModalOpen = useTypedSelector((state) => state.uiSlice.isAuthModalOpen);
  const isLoggingOut = useTypedSelector((state) => state.uiSlice.isLoggingOut);

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
    console.log("Logging out...");
    const auth = getAuth();
    try {
      dispatch(action.uiSlice.setLoggingOut(true));
      console.log("isLoggingOut set to true");
  
      await signOut(auth);
      dispatch(action.authSlice.removeUser());
      dispatch(action.uiSlice.setAuthModalOpen(false));
      console.log("isAuthModalOpen set to false");
  
      navigate("/", { replace: true, state: undefined });
      message.success("Вы успешно вышли из системы!");
  
      //ОТКЛАДЫВАЕМ СБРОС isLoggingOut
      setTimeout(() => {
        dispatch(action.uiSlice.setLoggingOut(false));
        console.log("isLoggingOut set to false");
      }, 100); //задержка чтобы navigate успел отработать
    } catch (error) {
      message.error(`Ошибка при выходе: ${error}!`);
      dispatch(action.uiSlice.setLoggingOut(false));
    }
  };

  return (
    <>
      <Header>
        <div />
        <Button onClick={token ? handleLogout : handleLogin}>
          {token ? "Выйти" : "Войти"}
        </Button>
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
          <AuthFormRegister key={formKey} toggleForm={toggleForm} />
        )}
      </Modal>
    </>
  );
}