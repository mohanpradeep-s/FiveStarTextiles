import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import myContext from '../../context/data/myContext';
import { toast } from 'react-toastify'
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, fireDB } from '../../firebase/FirebaseConfig';
import { Timestamp, addDoc, collection } from 'firebase/firestore';
import Loader from '../../components/loader/Loader';


const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const context = useContext(myContext);
    const { loading, setLoading } = context;

    const signup = async(e) => {

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phonePattern = /^\d{10}$/;
        const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;

        setLoading(true)
        if(!name || !email || !phone || !password) {
            setLoading(false)
            return toast.error("All fields are required.")
        }
        if(!emailPattern.test(email))
        {
            setLoading(false)
            return toast.error("Please enter valid email.")
        }
        if(!phonePattern.test(phone))
        {
            setLoading(false)
            return toast.error("Please enter valid mobile number.")
        }
        if(!passwordPattern.test(password))
        {
            setLoading(false)
            return toast.error("Password must contain at least 6 characters including uppercase, lowercase, and numbers.")
        }
        try {
            const users = await createUserWithEmailAndPassword(auth, email, password)
            const user = {
                name: name,
                uid: users.user.uid,
                email: users.user.email,
                phone: phone,
                time : Timestamp.now()
            }
            const userRef = collection(fireDB, "users")
            await addDoc(userRef, user);
            toast.success("Signup Succesfully")
            setName("");
            setEmail("");
            setPhone("");
            setPassword("");
            setLoading(false)
        } catch(error) {
            toast.error("Signup Failed");
            console.log(error);
            setLoading(false)
        }
    }
  return (
    <div className=' flex justify-center items-center h-screen'>
        {loading && <Loader/>}
            <div className=' bg-gray-800 px-10 py-10 rounded-xl '>
                <div className="">
                    <h1 className='text-center text-white text-xl mb-4 font-bold'>SignUp</h1>
                </div>
                <div>
                    <input type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                        name='name'
                        className=' bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none'
                        placeholder='Name'
                    />
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
                    <input type="number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}    
                        name='phone'
                        className=' bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none'
                        placeholder='Mobile'
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
                    onClick={signup}
                        className=' bg-red-500 w-full text-black font-bold  px-2 py-2 rounded-lg'>
                        Signup
                    </button>
                </div>
                <div>
                    <h2 className='text-white'>Already have an account? <Link className=' text-yellow-500 font-bold' to={'/login'}>Login</Link></h2>
                </div>
            </div>
        </div>
  )
}

export default Signup