import React from "react";
import icon from "../assets/Spotify-Icon.svg";

const Nav = () => {
  return (
    <nav>
      <div className="logo__img--wrapper">
        <a href="#" className="logo__img--link">
          <img src={icon} className="logo__img--icon" />
        </a>
      </div>
      <ul className="nav__link--list">
        <li className="nav__link">
            <a className="nav__link--anchor">
                About
            </a>
        </li>
        <li className="nav__link">
            <a className="nav__link--anchor">
                Contact
            </a>
        </li>
        <li className="nav__link">
            <a className="nav__link--anchor">
                Charts
            </a>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
