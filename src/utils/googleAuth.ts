import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore"; 
import { message } from "antd";
import { action, AppDispatch } from "../store";

export default async function handleGoogleAuth(isRegister: boolean, dispatch: AppDispatch, navigate: Function, onClose: Function) {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  
  provider.addScope('https://www.googleapis.com/auth/calendar');
  provider.addScope('https://www.googleapis.com/auth/calendar.events');


  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const googleAccessToken = credential?.accessToken; // Токен для Google API
    
    const token = await user.getIdToken(); // Firebase ID token
    
    const userData = {
      token,
      googleAccessToken,
      email: user.email || "",
      id: user.uid,
    };
    localStorage.setItem("authUser", JSON.stringify(userData));

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

    message.success(`Добро пожаловать, ${user.displayName || "пользователь"}!`);
    
    dispatch(
      action.authSlice.initUser({
        email: user.email || "",
        id: user.uid,
        token: token,
      })
    );
    localStorage.setItem("googleAccessToken", googleAccessToken || "");


    onClose();
    
    //console.log("Google Access Token:", googleAccessToken);
  } catch (error: unknown) {
    //console.error("Ошибка входа через Google:", error);
    message.error("Ошибка входа через Google.");
  }
};