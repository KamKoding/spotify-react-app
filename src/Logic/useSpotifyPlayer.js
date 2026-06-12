import { useState, useEffect } from 'react'
import { getToken } from './SpotifyFetchToken'

export function useSpotifyPlayer() {
  const [player, setPlayer] = useState(null)
  const [deviceId, setDeviceId] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [playerState, setPlayerState] = useState(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = async () => {
      const token = await getToken()

      const spotifyPlayer = new window.Spotify.Player({
        name: 'See It Through Player',
        getOAuthToken: (cb) => { cb(token) },
        volume: 0.5,
      })

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id)
        setIsReady(true)
      })

      spotifyPlayer.addListener('not_ready', () => {
        setIsReady(false)
      })

      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (!state) return
        setPlayerState({
          track: state.track_window.current_track,
          position: state.position,
          duration: state.duration,
          isPaused: state.paused,
        })
      })

      spotifyPlayer.connect()
      setPlayer(spotifyPlayer)
    }
  }, [])

  return { player, deviceId, isReady, playerState }
}

export async function playTrack(deviceId, trackUri) {
  const token = await getToken()

  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [trackUri] }),
  })
}