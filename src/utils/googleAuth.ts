import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore"; 
import { message } from "antd";
import { action, AppDispatch } from "../store";

export default async function handleGoogleAuth(isRegister: boolean, dispatch: AppDispatch, navigate: Function, onClose: Function) {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  console.log("Инициализация аутентификации через Google"); // Логируем начало аутентификации

  try {
    console.log("Попытка входа через Google..."); // Логируем попытку входа через Google
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Аутентификация успешна, пользователь:", user.email); // Логируем успешную аутентификацию пользователя
    const token = await user.getIdToken();
    console.log("Токен получен:", token); // Логируем полученный токен

    const userData = {
      token,
      email: user.email || "",
      id: user.uid,
    };
    localStorage.setItem("authUser", JSON.stringify(userData));


    if (isRegister) {
      console.log("Регистрируем пользователя в базе данных..."); // Логируем начало регистрации
      const db = getFirestore();
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email || "",
          username: user.displayName || "Пользователь",
          partnerId: null,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
      console.log("Пользователь зарегистрирован в базе данных"); // Логируем успешную регистрацию
    }

    message.success(`Добро пожаловать, ${user.displayName || "пользователь"}!`);
    
    dispatch(
      action.authSlice.initUser({
        email: user.email || "",
        id: user.uid,
        token: token,
      })
    );

    console.log("Пользователь успешно авторизован и данные сохранены в Redux"); // Логируем успешную авторизацию
    onClose();
  } catch (error: unknown) {
    console.error("Ошибка входа через Google:", error); // Логируем ошибку
    message.error("Ошибка входа через Google.");
  }
};