import React from "react";
import icon from "../assets/Spotify-Icon.svg";
import { loginWithSpotify } from "../Logic/SpotifyFetchToken";

const Landing = () => {
  return (
    <section id="landing">
      <div className="header__container">
        <div className="header__description">
          <h2 className="header__description--text">
            Sign in to generate a one time use token for easy access to{" "} <br />
            <span className="text__color--green">
              <img className="spotify__icon--img" src={icon} /> Spotify API
            </span>
          </h2>
        </div>
        <button onClick={loginWithSpotify} className="spotify__login--button">
          Login with spotify!
        </button>
      </div>
    </section>
  );
};

export default Landing;
