import React, { useState } from "react";
import icon from "../assets/Spotify-Icon.svg";
import { getToken } from "../Logic/SpotifyFetchToken";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null)

  const handleSearch = async (e) => {
  if (e.key === "Enter") {
    const token = await getToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${searchQuery}&type=track,artist`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    setSearchResults(data)
  }
};

  return (
    <section id="dashboard">
      <input
        type="search"
        className={`search__bar dashboard__search--bar ${searchResults ? "search--active" : ""}`}
        placeholder="Search your favorite artist"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleSearch}
      />

      <div className="header__container">
        {!searchResults ? (
          <div className="header__description">
            <h2 className="header__description--text">
              Welcome back! <br />
              <span className="text__color--green">
                <img className="spotify__icon--img" src={icon} /> Spotify API
              </span>
            </h2>
          </div>
        ) : (
          <div>
            <p>Results will go here</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
