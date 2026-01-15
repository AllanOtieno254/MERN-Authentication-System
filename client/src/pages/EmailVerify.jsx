import React, { useRef, useEffect, useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'

const EmailVerify = () => {
  const navigate = useNavigate()

  const { backendUrl, isLoggedIn, userData, getUserData } =
    useContext(AppContent)

  const inputsRef = useRef([])

  // ✅ FIX 1: move axios.defaults into useEffect
  useEffect(() => {
    axios.defaults.withCredentials = true
  }, [])

  // redirect if already verified
  useEffect(() => {
    if (isLoggedIn && userData && userData.isAccountVerified) {
      navigate('/')
    }
  }, [isLoggedIn, userData, navigate])

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text').slice(0, 6)
    pasteData.split('').forEach((char, index) => {
      if (inputsRef.current[index]) {
        inputsRef.current[index].value = char
      }
    })
  }

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault()

      const otpArray = inputsRef.current.map((el) => el.value)
      const otp = otpArray.join('')

      const { data } = await axios.post(
        backendUrl + '/api/auth/verify-account',
        { otp }
      )

      if (data.success) {
        toast.success(data.message)
        getUserData()
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4"
      style={{
        background: 'linear-gradient(135deg, #00102E, #0700CC, #87CEEC)',
      }}
    >
      <img
        onClick={() => navigate('/')}
        src={assets.logo_1}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-24 sm:w-28 cursor-pointer"
      />

      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 rounded-lg shadow-lg w-96 text-sm px-8 pt-8 pb-10"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>

        <p className="text-center mb-6 text-indigo-300">
          Please enter the 6-digit OTP code sent to your email address.
        </p>

        {/* OTP Inputs */}
        <div
          className="flex justify-center gap-2 mb-10"
          onPaste={handlePaste}
        >
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength="1"
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
        </div>

        {/* Verify Email Button */}
        <div style={{ padding: '40px' }} className="flex justify-center mt-4 mb-4">
          <button
            type="submit"
            style={{ padding: '5px' }}
            className="
              w-2/3
              py-3
              rounded-md
              font-semibold
              text-white
              bg-blue-700
              hover:bg-blue-800
              cursor-pointer
              transition
              duration-200
              focus:outline-none
              focus:ring-2
              focus:ring-blue-400
            "
          >
            Verify Email
          </button>
        </div>
      </form>
    </div>
  )
}

export default EmailVerify
