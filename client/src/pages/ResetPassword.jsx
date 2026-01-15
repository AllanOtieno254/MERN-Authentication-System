import React, { useState, useContext, useRef } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContent)
  axios.defaults.withCredentials = true

  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [isEmailSent, setIsEmailSent] = useState(false)
  const [otp, setOtp] = useState(0)
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false)

  const inputRefs = useRef([])

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('')
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char
      }
    })
  }

  const onSubmitEmail = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(
        backendUrl + '/api/auth/send-reset-otp',
        { email }
      )

      data.success
        ? toast.success(data.message)
        : toast.error(data.message)

      data.success && setIsEmailSent(true)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onSubmitOtp = async (e) => {
    e.preventDefault()
    const otpArray = inputRefs.current.map((e) => e.value)
    setOtp(otpArray.join(''))
    setIsOtpSubmitted(true)
  }

  const onSubmitNewPassword = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(
        backendUrl + '/api/auth/reset-password',
        { email, otp, newPassword }
      )

      data.success
        ? toast.success(data.message)
        : toast.error(data.message)

      data.success && navigate('/login')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen px-6 sm:px-0"
      style={{
        background: 'linear-gradient(135deg, #00102E, #0700CC, #87CEEC)',
      }}
    >
      <img
        onClick={() => navigate('/')}
        src={assets.logo_1}
        alt="Logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      {!isEmailSent && (
        <form
          onSubmit={onSubmitEmail}
          className="bg-slate-900 p-6 rounded-lg shadow-lg w-80 sm:w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password
          </h1>

          <p className="text-center mb-6 text-indigo-300">
            Please enter your registered email address.
          </p>

          <div className="flex flex-col items-center gap-4">
            <div
              className="flex items-center gap-3 px-4 rounded-full bg-[#333A5C]"
              style={{ height: '45px', width: '90%' }}
            >
              <img src={assets.mail_icon} alt="email icon" className="w-4 h-4" />
              <input
                type="email"
                placeholder="Enter your email address"
                className="bg-transparent outline-none text-white w-full h-full text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="rounded-full font-medium text-white"
              style={{
                height: '45px',
                width: '90%',
                cursor: 'pointer',
                background: 'linear-gradient(to right, #0700CC, #00102E)',
                marginBottom: '20px',
              }}
            >
              Send Reset Link
            </button>
          </div>
        </form>
      )}

      {!isOtpSubmitted && isEmailSent && (
        <form
          onSubmit={onSubmitOtp}
          className="bg-slate-900 rounded-lg shadow-lg w-96 text-sm px-8 pt-8 pb-10"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password OTP
          </h1>

          <p className="text-center mb-6 text-indigo-300">
            Please enter the 6-digit OTP code sent to your email address.
          </p>

          <div
            className="flex justify-center gap-2 mb-10"
            onPaste={handlePaste}
          >
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  ref={(e) => (inputRefs.current[index] = e)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  type="text"
                  maxLength="1"
                  className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ))}
          </div>

          <div
            style={{ padding: '40px' }}
            className="flex justify-center mt-4 mb-4"
          >
            <button
              type="submit"
              style={{ padding: '5px' }}
              className="
                w-2/3
                py-2.5
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
              Submit
            </button>
          </div>
        </form>
      )}

      {isOtpSubmitted && isEmailSent && (
        <form
          onSubmit={onSubmitNewPassword}
          className="bg-slate-900 p-6 rounded-lg shadow-lg w-80 sm:w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            New Password
          </h1>

          <p className="text-center mb-6 text-indigo-300">
            Please enter your new password.
          </p>

          <div className="flex flex-col items-center gap-4">
            <div
              className="flex items-center gap-3 px-4 rounded-full bg-[#333A5C]"
              style={{ height: '45px', width: '90%' }}
            >
              <img src={assets.lock_icon} alt="email icon" className="w-4 h-4" />
              <input
                type="password"
                placeholder="Enter your new password"
                className="bg-transparent outline-none text-white w-full h-full text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="rounded-full font-medium text-white"
              style={{
                height: '45px',
                width: '90%',
                cursor: 'pointer',
                background: 'linear-gradient(to right, #0700CC, #00102E)',
                marginBottom: '20px',
              }}
            >
              Send Reset Link
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ResetPassword
