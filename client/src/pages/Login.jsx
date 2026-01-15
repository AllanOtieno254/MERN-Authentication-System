import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
// import { bottom } from '@popperjs/core'
import axios from 'axios'
import {toast} from 'react-toastify'
const Login = () => {

    const navigate= useNavigate()

    const {backendUrl,setIsLoggedIn,getUserData} = useContext(AppContent)


  const [state, setState] = useState('Sign Up')
  const [name,setName]= useState('')
  const [email,setEmail]= useState('')
  const [password,setPassword]= useState('')

  const onSubmitHandler= async(e)=>{
    try{
      e.preventDefault()

      axios.defaults.withCredentials = true;

      if(state==='Sign Up'){

        const{data}=await axios.post(backendUrl+'/api/auth/register',{
          name,
          email,
          password
        })

        if(data.success){
          setIsLoggedIn(true)
          getUserData()
          navigate('/')
        }else{
          toast.error(data.message)
        }

      }else{

        const{data}=await axios.post(backendUrl+'/api/auth/login',{
          email,
          password
        })

        if(data.success){
          setIsLoggedIn(true)
          getUserData()
          navigate('/')
        }else{
          toast.error(data.message)
        }

      }


    }catch (error) {
  toast.error(
    error.message
  )
}
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0" 
         style={{ 
           background: 'linear-gradient(135deg, #00102E, #0700CC, #87CEEC)' 
         }}>
      <img onClick={() => navigate('/')} src={assets.logo_1} alt="" 
           style={{width:'90px'}} className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />

      <div className="rounded-xl w-full sm:w-96 p-8 sm:p-10" 
           style={{width: '400px',height: '350px', backgroundColor: '#0A1A40', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </h2>
        <p className='text-center text-gray-300 mb-6'>
          {state === 'Sign Up' ? 'Create your account' : 'Login to your account'}
        </p>

        <form className='flex flex-col items-center gap-4' onSubmit={onSubmitHandler}>
          {state === 'Sign Up' && (
            <div style={{padding: '10px', margin: '0', width: '80%',marginLeft:'3%',marginTop:'3%'}} className='flex items-center w-4/5 px-4 py-2.5 rounded-full bg-[#00102E] gap-3'>
              <img src={assets.person_icon} alt="" />
              <input 
               onChange={e=> setName(e.target.value)}
               value={name}
               className='bg-transparent outline-none text-gray-100 w-full' type="text" placeholder='Full Name' required/>
            </div>
          )}

          <div style={{padding: '10px', margin: '0', width: '80%',marginLeft:'3%'}} className='flex items-center w-4/5 px-4 py-2.5 rounded-full bg-[#00102E] gap-3'>
            <img src={assets.mail_icon} alt="" />
            <input 
               onChange={e=> setEmail(e.target.value)}
               value={email}
                className='bg-transparent outline-none text-gray-100 w-full' 
                   type="email" placeholder='Email id' required/>
          </div>

          <div style={{padding: '10px', margin: '0', width: '80%',marginLeft:'3%'}} className='flex items-center w-4/5 px-4 py-2.5 rounded-full bg-[#00102E] gap-3'>
            <img src={assets.lock_icon} alt="" />
            <input
            onChange={e=> setPassword(e.target.value)}
            value={password}
            className='bg-transparent outline-none text-gray-100 w-full' 
                   type="password" placeholder='Password' required/>
          </div>

          <p onClick={() => navigate('/reset-password')} className='text-gray-400 text-sm cursor-pointer text-center w-4/5'>
            Forgot password?
          </p>

          <button className='w-4/5 py-2.5 rounded-full font-medium text-white' 
                  style={{cursor: 'pointer', marginBottom: '10px', bottom: 0, background: 'linear-gradient(to right, #0700CC, #00102E)' }}>
            {state}
          </button>
        </form>

        {state === 'Sign Up' ? (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Already have an account? {' '}
            <span onClick={() => setState('Login')} 
                  className='text-[#87CEEC] cursor-pointer underline'>
              Login here
            </span>
          </p>
        ) : (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Don’t have an account? {' '}
            <span onClick={() => setState('Sign Up')} 
                  className='text-[#87CEEC] cursor-pointer underline'>
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

export default Login
