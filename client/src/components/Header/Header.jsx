import React from 'react'
import { assets } from '../../assets/assets'
import { useContext } from 'react'
import { AppContent } from '../../context/AppContext'


const Header = () => {

  const { userData } = useContext(AppContent)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 gap-6">

      {/* Header Image */}
      <img
        src={assets.header_img}
        alt="Header Image"
        className="w-36 h-36 rounded-full"
      />

      {/* Greeting */}
      <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium">
        Hey {userData ? userData.name : 'KNH Staff'}!
        <img
          className="w-8 h-8"
          src={assets.hand_wave}
          alt="Hand Wave"
        />
      </h1>

      {/* Main Title */}
      <h2 className="text-3xl sm:text-5xl font-semibold max-w-3xl">
        Welcome to Kenyatta National Hospital Digital World
      </h2>

      {/* Description */}
      <p className="max-w-md text-gray-600">
        Let’s get started on your digital journey at KNH — we’ll have you up and running in no time.
      </p>

      {/* CTA Button */}
      <button style={{color:'white', padding:'20px 40px', 
                    borderRadius:'9999px', fontSize:'1.25rem', 
                    fontWeight:'700', backgroundColor:'#0700CC', 
                    transition:'all 0.3s ease-in-out', cursor:'pointer'}}>Get Started
      </button>
    </div>
  )
}

export default Header
