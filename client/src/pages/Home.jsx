import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import Header from '../components/Header/Header'

function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* 🔹 WATERMARK BACKGROUND */}
      <div
        className="
          absolute
          inset-0
          bg-[url('/knh_logo.png')]
          bg-no-repeat
          bg-center
          bg-contain
          opacity-10
          pointer-events-none
        "
      />

      {/* 🔹 FOREGROUND CONTENT */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <Navbar />
        <Header />
      </div>

    </div>
  )
}

export default Home
