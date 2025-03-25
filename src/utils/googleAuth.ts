import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore"; 
import { message } from "antd";
import { action, AppDispatch } from "../store";

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
  
  provider.addScope('https://www.googleapis.com/auth/calendar');
  provider.addScope('https://www.googleapis.com/auth/calendar.events');

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const googleAccessToken = credential?.accessToken ?? null;
    
    const token = await user.getIdToken();
    
    const storedAuthData = localStorage.getItem("authUser");
    const existingUser = storedAuthData ? JSON.parse(storedAuthData) : {};

    const updatedUserData = {
      email: existingUser.email || user.email || "",
      id: existingUser.id || user.uid,
      token: existingUser.token || token,
      calendarToken: googleAccessToken, 
    };

    localStorage.setItem("authUser", JSON.stringify(updatedUserData));

    if (isRegister) {
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
    }

    if (showWelcomeMessage) {
      message.success(`Добро пожаловать, ${user.displayName || "пользователь"}!`);
    }

    dispatch(action.authSlice.initUser(updatedUserData));

    onClose();
  } catch (error: unknown) {
    message.error("Ошибка входа через Google.");
  }
};