import React from 'react'
import {useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import OAuth from '../components/OAuth'
import {ReactComponent as ArrowRightIcon} from '../assets/svg/keyboardArrowRightIcon.svg'
import VisibilityIcon from '../assets/svg/visibilityIcon.svg'

function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const {email, password} = formData
  const navigate = useNavigate()

  const onChange = (e) => {
    setFormData((prevState)=>({
      ...prevState,
      [e.target.id]: e.target.value,
    }
  ))
  }

  const onSubmit = async (e) =>{
    e.preventDefault()
    try{
      const auth = getAuth()
      const userCredential = await signInWithEmailAndPassword( auth, email, password)
      if(userCredential.user){
        navigate('/profile')    
      }      
    }
    catch(error){
      toast.error("Bad user Credentials")
    }
  }

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Wellcome Back!
          </p>
        </header>
        <form onSubmit={onSubmit}>
          <input
          type="email" 
          className="emailInput"
          id="email"
          placeholder='Email'
          onChange={onChange}
          value={email}
        />
        <div className="passwordInputDiv">
          <input
            type={showPassword ? "text" : "password"}
            className="passwordInput"
            id="password"
            placeholder='Password'
            onChange={onChange}
            value={password}
            />
            <img
              className="showPassword" 
              alt="show Password"
              src={VisibilityIcon} 
              onClick={() => setShowPassword((prevState)=> !prevState)}
              />        
          </div>

          <Link to='/forgot-password' className="forgotPasswordLink">Forgot Password?</Link>

          <div className="signInBar">
            <p className="signInText">
              Sign In
            </p>
            <button className="signInButton"><ArrowRightIcon fill='#ffffff' width='34px'/></button>
          </div>
        </form>
        <OAuth />
        <Link to='/sign-up' className="registerLink">Sign Up instead</Link>
      </div>
    </>
  )
}

export default SignIn