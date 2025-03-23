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

      dispatch(action.authSlice.initUser({
        token: parsedUserData.token,
        email: parsedUserData.email,
        id: parsedUserData.id,
      }));
    }

    setLoading(false);
  }, [dispatch]);

  return loading;
}

export default useAuthCheck;