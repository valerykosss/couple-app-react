import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { action } from "../store";

function useAuthCheck() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("authUser");
    // const googleAccessToken = localStorage.getItem("googleAccessToken");

    if (userData) {
      const parsedUserData = JSON.parse(userData);

      // let parsedGoogleToken = null;
      // if (googleAccessToken) {
      //   try {
      //     parsedGoogleToken = JSON.parse(googleAccessToken);
      //   } catch {
      //     parsedGoogleToken = googleAccessToken;
      //   }
      // }

      // const parsedGoogleToken = googleAccessToken && googleAccessToken !== "null" 
      // ? googleAccessToken 
      // : null;

      dispatch(action.authSlice.initUser({
        token: parsedUserData.token,
        email: parsedUserData.email,
        id: parsedUserData.id,
        calendarToken: parsedUserData.calendarToken || null,
      }));
    }

    setLoading(false);
  }, [dispatch]);

  return loading;
}

export default useAuthCheck;