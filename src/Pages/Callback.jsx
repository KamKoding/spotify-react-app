import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchToken } from "../Logic/SpotifyFetchToken.jsx";

const Callback = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const handleCallback = async () => {
      const token = await fetchToken();
      if (token) {
        navigate("/");
      }
    };

    handleCallback();
  }, []);

  return <div>LOADING...</div>;
};

export default Callback;