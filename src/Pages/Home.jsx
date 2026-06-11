import React, { useState, useEffect } from 'react'
import Landing from '../components/Landing'
import Dashboard from '../components/Dashboard'

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem('access_token')
      if (token) {
        setIsLoggedIn(true)
      }
  }, [])

  return (
    <>
    {isLoggedIn ? <Dashboard /> : <Landing />}
    </>
  )
}

export default Home