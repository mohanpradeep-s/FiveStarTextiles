import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import myContext from '../../context/data/myContext';
import { toast } from 'react-toastify'
import { auth } from '../../firebase/FirebaseConfig';
import { fireDB } from '../../firebase/FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from "firebase/firestore";
import Loader from '../../components/loader/Loader';

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const context = useContext(myContext)
    const { loading,setLoading} = context

    const navigate = useNavigate();

    const signin = async(e) => {
        setLoading(true)
        try{
            const result = await signInWithEmailAndPassword(auth, email, password);
            const isAdmin = await validateAdminEmail(email); // Check if user is admin
            toast.success("Login Successful.")
            localStorage.setItem('user', JSON.stringify({...result, isAdmin}));
            navigate('/')
            setLoading(false)
        } catch (error) {
            toast.error("Login Failed.")
            console.log(error)
            setLoading(false)
        }
    }
    const validateAdminEmail = async (email) => {
        try {
          const adminCollectionRef = collection(fireDB, 'admin');
          const q = query(adminCollectionRef, where('email', '==', email));
          const querySnapshot = await getDocs(q);
          return !querySnapshot.empty; // If email is present in admin collection, return true
        } catch (error) {
          console.error('Error validating admin email:', error);
          return false;
        }
      };
  return (
    <div className=' flex justify-center items-center h-screen'>
        {loading && <Loader/> }
            <div className=' bg-gray-800 px-10 py-10 rounded-xl '>
                <div className="">
                    <h1 className='text-center text-white text-xl mb-4 font-bold'>Login</h1>
                </div>
                <div>
                    <input type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                        name='email'
                        className=' bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none'
                        placeholder='Email'
                    />
                </div>
                <div>
                    <input type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                        name='password'
                        className=' bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none'
                        placeholder='Password'
                    />
                </div>
                <div className=' flex justify-center mb-3'>
                    <button
                    onClick={signin}
                        className=' bg-yellow-500 w-full text-black font-bold  px-2 py-2 rounded-lg'>
                        Login
                    </button>
                </div>
                <div>
                    <h2 className='text-white'>Don't have an account? <Link className=' text-red-500 font-bold' to={'/signup'}>Signup</Link></h2>
                </div>
            </div>
        </div>
  )
}

export default Login