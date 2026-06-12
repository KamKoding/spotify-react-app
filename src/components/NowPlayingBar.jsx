import React, { useState, useEffect } from 'react'

const NowPlayingBar = ({ playerState }) => {
  const [position, setPosition] = useState(0)

  useEffect(() => {
    if (!playerState) return
    setPosition(playerState.position)
  }, [playerState])

  useEffect(() => {
    if (!playerState || playerState.isPaused) return

    const interval = setInterval(() => {
      setPosition((prev) => prev + 1000)
    }, 1000)

    return () => clearInterval(interval)
  }, [playerState])

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!playerState || !playerState.track) return null

  const { track, duration } = playerState
  const progressPercent = (position / duration) * 100

  return (
    <div className="now-playing__bar">
      <img 
        src={track.album.images[0]?.url} 
        alt={track.name}
        className="now-playing__image"
      />
      <div className="now-playing__info">
        <p className="now-playing__track-name">{track.name}</p>
        <p className="now-playing__artist-name">{track.artists.map(a => a.name).join(', ')}</p>
      </div>
      <div className="now-playing__progress-container">
        <span className="now-playing__time">{formatTime(position)}</span>
        <div className="now-playing__progress-bar">
          <div 
            className="now-playing__progress-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <span className="now-playing__time">{formatTime(duration)}</span>
      </div>
    </div>
  )
}

export default NowPlayingBar