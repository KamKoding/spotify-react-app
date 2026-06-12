import React, { useState, useEffect, useRef } from "react";

const NowPlayingBar = ({ playerState, player }) => {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef(null);

  useEffect(() => {
    if (!playerState || isDragging) return;
    setPosition(playerState.position);
  }, [playerState, isDragging]);

  useEffect(() => {
    if (!playerState || playerState.isPaused || isDragging) return;

    const interval = setInterval(() => {
      setPosition((prev) => prev + 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [playerState, isDragging]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const calculatePositionFromEvent = (e) => {
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    return Math.floor(percent * playerState.duration);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const newPosition = calculatePositionFromEvent(e);
    setPosition(newPosition);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newPosition = calculatePositionFromEvent(e);
      setPosition(newPosition);
    };

    const handleMouseUp = (e) => {
      const newPosition = calculatePositionFromEvent(e);
      setPosition(newPosition);
      player.seek(newPosition);
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, playerState, player]);

  if (!playerState || !playerState.track) return null;

  const { track, duration } = playerState;
  const progressPercent = (position / duration) * 100;

  return (
    <div className="now-playing__bar">
      <img
        src={track.album.images[0]?.url}
        alt={track.name}
        className="now-playing__image"
      />
      <div className="now-playing__info">
        <p className="now-playing__track-name">{track.name}</p>
        <p className="now-playing__artist-name">
          {track.artists.map((a) => a.name).join(", ")}
        </p>
      </div>

      <button
        className="now-playing__play-btn"
        onClick={() => player.togglePlay()}
      >
        {playerState.isPaused ? "▶" : "⏸"}
      </button>

      <div className="now-playing__progress-container">
        <span className="now-playing__time">{formatTime(position)}</span>
        <div
          className="now-playing__progress-bar"
          ref={progressBarRef}
          onMouseDown={handleMouseDown}
        >
          <div
            className="now-playing__progress-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <span className="now-playing__time">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default NowPlayingBar;
