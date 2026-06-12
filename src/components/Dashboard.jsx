import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import icon from "../assets/Spotify-Icon.svg";
import { getToken } from "../Logic/SpotifyFetchToken";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [offset, setOffset] = useState(0);
  const isLoadingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      const token = await getToken();

      try {
        const [batch1, batch2, batch3, batch4] = await Promise.all([
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
          fetch(
            `https://api.spotify.com/v1/search?q=${searchQuery}&type=artist&offset=15`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ]);

        const data1 = await batch1.json();
        const data2 = await batch2.json();
        const data3 = await batch3.json();
        const data4 = await batch4.json();

        const combinedArtists = [
          ...data1.artists.items,
          ...data2.artists.items,
          ...data3.artists.items,
          ...data4.artists.items,
        ];

        setSearchResults({
          ...data1,
          artists: {
            ...data1.artists,
            items: combinedArtists,
          },
        });
        setOffset(15);
      } catch (error) {
        console.error("Search error:", error);
      }
    }
  };

  const loadMoreResults = async () => {
    if (isLoadingRef.current || !searchResults) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    const token = await getToken();
    const newOffset = offset + 5;

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${searchQuery}&type=artist&offset=${newOffset}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    // Stop if there's nothing new
    if (!data.artists.items || data.artists.items.length === 0) {
      setIsLoading(false);
      isLoadingRef.current = false;
      return;
    }

    setSearchResults({
      ...searchResults,
      artists: {
        ...searchResults.artists,
        items: [...searchResults.artists.items, ...data.artists.items],
      },
    });

    setOffset(newOffset);
    setIsLoading(false);
    isLoadingRef.current = false;
  };

    useEffect(() => {
      if (!searchResults) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMoreResults();
          }
        },
        { threshold: 0.1 },
      );

      if (observerRef.current) {
        observer.observe(observerRef.current);
      }

      return () => observer.disconnect();
    }, [searchResults]);

  useEffect(() => {
    if (!searchResults || isLoading) return;

    const isScrollable = document.body.scrollHeight > window.innerHeight;

    if (!isScrollable) {
      loadMoreResults();
    }
  }, [searchResults]);

  return (
    <section
      id="dashboard"
      className={searchResults ? "dashboard--results" : ""}
    >
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
            {searchResults.artists?.items?.map((artist) => (
              <div
                key={artist.id}
                className="results__artist--card"
                onClick={() => navigate(`/artist/${artist.id}`)}
              >
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
            <div ref={observerRef} style={{ height: "1px" }}></div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
