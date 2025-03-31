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
  //const redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI;

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
    const username = user.displayName;
    const firebaseToken = await user.getIdToken();
    const refreshToken = user.refreshToken;

    if (!accessToken) {
      throw new Error("Не удалось получить access token");
    }

    // Запрос на обновление accessToken для получения expires_in
    // const tokenData = await refreshAccessToken(refreshToken);
    //console.log("Отправляем refresh-токен:", refreshToken); 

    if (accessToken) {
      const updatedUserData = {
        username: username || "Никнейм неопределен",
        email: user.email!,
        id: user.uid,
        firebaseToken: firebaseToken,
        accessToken: accessToken,
        refreshToken: refreshToken,
        tokenExpiresIn: null,
      };

      localStorage.setItem("authUser", JSON.stringify(updatedUserData));

      if (isRegister) {
        await createUser(updatedUserData);
      } else {
        await updateUser(updatedUserData.id, updatedUserData);
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


export async function connectGoogleCalendar(dispatch: AppDispatch) {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  
  provider.addScope('https://www.googleapis.com/auth/calendar');
  provider.addScope('https://www.googleapis.com/auth/calendar.events');

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    const accessToken = credential?.accessToken;
    const refreshToken = user.refreshToken;

    if (!accessToken || !refreshToken) {
      throw new Error("Не удалось получить токены");
    }

    // Получаем текущие данные пользователя
    const authUser = localStorage.getItem("authUser");
    if (!authUser) {
      throw new Error("Пользователь не авторизован");
    }

    const currentUserData = JSON.parse(authUser);

    const updatedUserData = {
      ...currentUserData,
      accessToken,
      refreshToken
    };

    localStorage.setItem("authUser", JSON.stringify(updatedUserData));
    const updatedAuthUser = localStorage.getItem("authUser");
    
    // console.log("func connectGoogleCalendar, updatedAuthUser", updatedAuthUser);

    await updateUser(currentUserData.id, { 
      accessToken, 
      refreshToken 
    });

    dispatch(action.authSlice.updateUserTokens({ accessToken, refreshToken }));

    
    return { success: true };
  } catch (error) {
    console.error("Ошибка подключения Google Calendar:", error);
    throw error;
  }
}