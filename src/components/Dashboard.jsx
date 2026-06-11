import React, { useState } from "react";
import icon from "../assets/Spotify-Icon.svg";
import { getToken } from "../Logic/SpotifyFetchToken";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      const token = await getToken();

      try {
        // Fetch 3 batches of artists at once
        const [batch1, batch2, batch3] = await Promise.all([
          fetch(
            `https://api.spotify.com/v1/search?q=${searchQuery}&type=artist&offset=0`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
          fetch(
            `https://api.spotify.com/v1/search?q=${searchQuery}&type=artist&offset=5`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
          fetch(
            `https://api.spotify.com/v1/search?q=${searchQuery}&type=artist&offset=10`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ]);

        const data1 = await batch1.json();
        const data2 = await batch2.json();
        const data3 = await batch3.json();

        // Combine all artists
        const combinedArtists = [
          ...data1.artists.items,
          ...data2.artists.items,
          ...data3.artists.items,
        ];

        setSearchResults({
          ...data1,
          artists: {
            ...data1.artists,
            items: combinedArtists,
          },
        });
        setOffset(10);
      } catch (error) {
        console.error("Search error:", error);
      }
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

      <div
        className="header__container"
        style={searchResults ? { paddingTop: "100px" } : {}}
      >
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
          <div className="search__results--container">
            {console.log("searchResults:", searchResults)}
            {searchResults.artists?.items?.map((artist) => (
              <div key={artist.id} className="results__artist--card">
                {artist.images?.[0] && (
                  <img
                    src={artist.images[0].url}
                    alt={artist.name}
                    className="results__artist--image"
                  />
                )}
                <p>{artist.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
