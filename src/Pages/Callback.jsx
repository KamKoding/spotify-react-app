import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchToken } from '../Logic/SpotifyFetchToken.jsx'

const Callback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      const token = await fetchToken()
      if (token) {
        navigate('/')
      }
    }

    handleCallback()
  }, [])

  return <></>
}

export default Callback