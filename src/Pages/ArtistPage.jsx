import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getToken } from "../Logic/SpotifyFetchToken";
import { useSpotifyPlayer, playTrack } from "../Logic/useSpotifyPlayer";
import NowPlayingBar from "../components/NowPlayingBar";

const ArtistPage = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { deviceId, isReady, playerState } = useSpotifyPlayer();

  useEffect(() => {
    const fetchArtistData = async () => {
      const token = await getToken();

      const artistResponse = await fetch(
        `https://api.spotify.com/v1/artists/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const artistData = await artistResponse.json();
      setArtist(artistData);

      const tracksResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(`artist:${artistData.name}`)}&type=track`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const tracksData = await tracksResponse.json();
      setTopTracks(tracksData.tracks?.items || []);
    };

    fetchArtistData();
  }, [id]);

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

  if (!artist) return null;

  console.log("bannerImages:", bannerImages);

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
        <h2 className="tracks__heading">Popular Tracks</h2>
        {topTracks.map((track, index) => (
          <div
            key={track.id}
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
      </div>
      <NowPlayingBar playerState={playerState} />
    </div>
  );
};

export default ArtistPage;
