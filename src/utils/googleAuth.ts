import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { message } from "antd";
import { action, AppDispatch } from "../store";
import { createUser, updateUser } from "../api/firebase/firebase";
import { refreshAccessToken } from "../api/googleAuth/refreshAccessToken";

type GoogleAuthParams = {
  isRegister: boolean;
  dispatch: AppDispatch;
  navigate: Function;
  onClose: Function;
  showWelcomeMessage: boolean;
};

export default async function handleGoogleAuth({
  isRegister,
  dispatch,
  navigate,
  onClose,
  showWelcomeMessage,
}: GoogleAuthParams) {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI;

  provider.addScope('https://www.googleapis.com/auth/calendar');
  provider.addScope('https://www.googleapis.com/auth/calendar.events');
  // provider.setCustomParameters({
  //   prompt: 'consent',
  //   access_type: 'offline',
  // });

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    const accessToken = credential?.accessToken ?? undefined;
    const firebaseToken = await user.getIdToken();
    const refreshToken = user.refreshToken;

    // Запрос на обновление accessToken для получения expires_in
    // const tokenData = await refreshAccessToken(refreshToken);
    console.log("Отправляем refresh-токен:", refreshToken); 

    if (accessToken) {
      const updatedUserData = {
        email: user.email || "",
        id: user.uid,
        firebaseToken: firebaseToken,
        accessToken: accessToken,
        refreshToken: refreshToken,
        tokenExpiresIn: null,
      };

      // Сохраняем информацию в localStorage
      localStorage.setItem("authUser", JSON.stringify(updatedUserData));

      if (isRegister) {
        await createUser(updatedUserData);
        console.log("Создаём пользователя в Firestore:", updatedUserData);
      } else {
        await updateUser(updatedUserData.id, updatedUserData);
        console.log("Обновляем пользователя:", updatedUserData);
      }

      if (showWelcomeMessage) {
        message.success(`Добро пожаловать, ${user.displayName || "пользователь"}!`);
      }

      dispatch(action.authSlice.initUser(updatedUserData));
      onClose();
    } else {
      message.error("Не удалось обновить токен доступа.");
    }
  } catch (error: unknown) {
    message.error("Ошибка входа через Google.");
  }
};