import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { action } from "../store";

function useAuthCheck() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("authUser");

    if (userData) {
      const parsedUserData = JSON.parse(userData);

      dispatch(
        action.authSlice.initUser({
          firebaseToken: parsedUserData.firebaseToken,
          email: parsedUserData.email,
          id: parsedUserData.id,
          accessToken: parsedUserData.accessToken || null,
          refreshToken: parsedUserData.refreshToken || null,
          tokenExpiresIn: parsedUserData.tokenExpiresIn || null,
        })
      );
    }

    setLoading(false);
  }, [dispatch]);

  return loading;
}

export default useAuthCheck;
