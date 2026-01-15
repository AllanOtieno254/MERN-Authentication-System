import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets.js';
import './Navbar.css';
import { AppContent } from '../../context/AppContext.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';

function Navbar() {
  const navigate = useNavigate();
  const { userData, backendUrl,setUserData,setIsLoggedIn } = useContext(AppContent);

  const sendVerificationOtp= async()=>{
    try{
        axios.defaults.withCredentials = true;
        const{data}= await axios.post(backendUrl+'/api/auth/send-verify-otp')
        if(data.success){
            navigate('/email-verify')
            toast.success('Verification OTP sent to your email')
        }else{
            toast.error(data.message)
        }
    }catch(error){
        toast.error(error.message)
    }
  }

  const logout= async()=>{
    try{
        axios.defaults.withCredentials = true;

        const{data}= await axios.post(backendUrl+'/api/auth/logout')
        data.success && setIsLoggedIn(false)
        data.success && setUserData(false)
        navigate('/')
    }catch(error){
        toast.error(error.message)
    }
  }

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo_1} alt="KNH Logo" className="logo" />
      </Link>

      {userData ? (
        <div className="relative group">
          {/* Avatar */}
          <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white cursor-pointer">
            {userData.name[0].toUpperCase()}
          </div>

          {/* Dropdown */}
            <ul
              className="absolute top-full right-0 mt-3 hidden group-hover:block 
                        bg-gray-100 text-lg rounded-lg shadow-lg 
                        min-w-[200px] z-20 py-2"
            >
              {!userData.isAccountVerified && (
                <li onClick={sendVerificationOtp} className="py-3 px-5 hover:bg-gray-500 text-black font-semibold cursor-pointer">
                  Verify Email
                </li>
              )}

              <li
                onClick={logout}
                className="py-3 px-5 hover:bg-gray-500 text-black font-semibold cursor-pointer"
              >
                Logout
              </li>
            </ul>

        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="login-btn"
        >
          Login
          <img src={assets.arrow_icon} alt="Arrow Icon" />
        </button>
      )}
    </div>
  );
}

export default Navbar;
