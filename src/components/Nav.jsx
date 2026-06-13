import React from "react";
import icon from "../assets/Spotify-Icon.svg";
import { Link } from "react-router-dom";

const Nav = () => {
  return (
    <nav>
      <div className="logo__img--wrapper">
        <Link to='/' className="logo__img--link">
          <img src={icon} className="logo__img--icon" />
        </Link>
      </div>
      <ul className="nav__link--list">
        <li className="nav__link">
            <a className="nav__link--anchor" href="/">
                About
            </a>
        </li>
        <li className="nav__link">
            <a className="nav__link--anchor" href="/">
                Contact
            </a>
        </li>
        <li className="nav__link">
            <a className="nav__link--anchor" href="/">
                Charts
            </a>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
