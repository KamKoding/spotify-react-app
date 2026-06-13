import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getToken } from "../Logic/SpotifyFetchToken";
import { useSpotifyPlayer, playTrack } from "../Logic/useSpotifyPlayer";
import NowPlayingBar from "../components/NowPlayingBar";

const SORT_FIELDS = {
  name: (a, b) => a.name.localeCompare(b.name),
  album: (a, b) => (a.album?.name || "").localeCompare(b.album?.name || ""),
  duration: (a, b) => a.duration_ms - b.duration_ms,
};

const ArtistPage = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [albumsOffset, setAlbumsOffset] = useState(0);
  const [albumsTotal, setAlbumsTotal] = useState(0);
  const [sortConfig, setSortConfig] = useState({ field: null, direction: "asc" });
  const { player, deviceId, isReady, playerState } = useSpotifyPlayer();

  const fetchAlbumTracks = async (token, albums) => {
    const allTracks = [];

    for (const album of albums) {
      const res = await fetch(
        `https://api.spotify.com/v1/albums/${album.id}/tracks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      (data.items || []).forEach((track) => {
        allTracks.push({
          ...track,
          album: {
            name: album.name,
            images: album.images,
          },
        });
      });
    }

    return allTracks;
  };

  useEffect(() => {
    const fetchArtistData = async () => {
      const token = await getToken();

      const artistResponse = await fetch(
        `https://api.spotify.com/v1/artists/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const artistData = await artistResponse.json();
      setArtist(artistData);

      const albumsResponse = await fetch(
        `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const albumsData = await albumsResponse.json();
      setAlbumsTotal(albumsData.total || 0);
      setAlbumsOffset(albumsData.items?.length || 0);

      const tracks = await fetchAlbumTracks(token, albumsData.items);
      setTopTracks(tracks);
    };

    fetchArtistData();
  }, [id]);

  const loadMoreTracks = async () => {
    const token = await getToken();

    const albumsResponse = await fetch(
      `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&offset=${albumsOffset}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const albumsData = await albumsResponse.json();

    const newTracks = await fetchAlbumTracks(token, albumsData.items);

    setTopTracks((prev) => [...prev, ...newTracks]);
    setAlbumsOffset((prev) => prev + albumsData.items.length);
  };

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedTracks = useMemo(() => {
    if (!sortConfig.field) return topTracks;
    const compareFn = SORT_FIELDS[sortConfig.field];
    const sorted = [...topTracks].sort(compareFn);
    return sortConfig.direction === "desc" ? sorted.reverse() : sorted;
  }, [topTracks, sortConfig]);

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const bannerImages = [
    artist?.images?.[0]?.url,
    ...topTracks.map((track) => track.album?.images?.[0]?.url),
  ].filter(Boolean);

  useEffect(() => {
    if (bannerImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % bannerImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const SortButton = ({ field, label }) => {
    const isActive = sortConfig.field === field;
    return (
      <button
        className={`sort__btn ${isActive ? "sort__btn--active" : ""}`}
        onClick={() => handleSort(field)}
      >
        {label}
        <span className="sort__arrow">
          {isActive ? (sortConfig.direction === "asc" ? " ↑" : " ↓") : " ↕"}
        </span>
      </button>
    );
  };

  if (!artist) return null;

  return (
    <div className="artist__page">
      <div className="artist__banner">
        {bannerImages.map((img, index) => (
          <div
            key={index}
            className="artist__banner--image"
            style={{
              backgroundImage: `url(${img})`,
              opacity: index === currentImageIndex ? 1 : 0,
            }}
          />
        ))}
        <div className="artist__banner--overlay">
          <h1 className="artist__name">{artist.name}</h1>
        </div>
      </div>

      <div className="artist__tracks">
        <div className="tracks__header">
          <h2 className="tracks__heading">Tracks</h2>
          <div className="sort__controls">
            <span className="sort__label">Sort by</span>
            <SortButton field="name" label="Title" />
            <SortButton field="album" label="Album" />
            <SortButton field="duration" label="Duration" />
          </div>
        </div>

        {sortedTracks.map((track, index) => (
          <div
            key={`${track.id}-${index}`}
            className="track__row"
            onClick={() => isReady && playTrack(deviceId, track.uri)}
          >
            <span className="track__number">{index + 1}</span>
            <img
              src={track.album?.images?.[2]?.url}
              alt={track.name}
              className="track__image"
            />
            <div className="track__info">
              <p className="track__name">{track.name}</p>
              <p className="track__album">{track.album?.name}</p>
            </div>
            <span className="track__duration">
              {formatDuration(track.duration_ms)}
            </span>
          </div>
        ))}

        {albumsOffset < albumsTotal && (
          <button className="load-more__btn" onClick={loadMoreTracks}>
            Load More
          </button>
        )}
      </div>

      <NowPlayingBar playerState={playerState} player={player} />
    </div>
  );
};

export default ArtistPage;
