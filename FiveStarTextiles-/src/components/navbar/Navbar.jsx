import React, { Fragment, useContext, useState, useEffect, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Link, useNavigate } from 'react-router-dom'
import { BsFillCloudSunFill } from 'react-icons/bs'
import { FiSun } from 'react-icons/fi'
import myContext from '../../context/data/myContext'
import { RxCross2 } from 'react-icons/rx'
import Login from '../../pages/registration/Login'
import Signup from '../../pages/registration/Signup'
import { auth } from '../../firebase/FirebaseConfig'
import { fireDB } from '../../firebase/FirebaseConfig'
import { collection, getDocs, getDoc , doc, setDoc, query, where } from "firebase/firestore"; 
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import md5 from 'md5'; // Import the md5 library

const Navbar = () => {

  const context = useContext(myContext)
  const { toggleMode, mode } = context
  const [open, setOpen] = useState(false);

  const [userData, setUserData] = useState(null);
  const [editingData, setEditingData] = useState(null); // Store edited data

  const navigate = useNavigate();

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')));
  }, []);

  const logout = () => {
    localStorage.clear('user');
    toast.success("Logout Successful")
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  }

  useEffect(() => {
    const fetchUserDocument = async (email) => {
      try {
        const usersCollectionRef = collection(fireDB, 'users');
        const q = query(usersCollectionRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          // Assuming there's only one document for each email
          const docSnap = querySnapshot.docs[0];
          const userData = docSnap.data();
          setUserData(userData.name);
        } else {
          console.log('No document found for email:', email);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };

    if (user) {
      fetchUserDocument(user.user.email);
    }
  }, [user]);


  const cartItems = useSelector((state) => state.cart)

  const toggleDialog = () => {
    setOpen(true);
    
  };

  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingData({ ...editingData, [name]: value });
  };

  // Function to save changes to user details
  const saveChanges = async () => {
    try {
      // Update user details in Firestore
      const userDocRef = doc(fireDB, 'users', userData.id); // Assuming 'id' is the document ID
      await updateDoc(userDocRef, editingData);
      toast.success("User details updated successfully");
      // Update userData with edited data
      setUserData(editingData);
    } catch (error) {
      console.error('Error updating user details:', error);
      toast.error("Failed to update user details");
    }
  };
  
  return (
    <div className="bg-white sticky top-0 z-50  ">
      {/* Mobile menu */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl" style={{ backgroundColor: mode === 'dark' ? 'rgb(40, 44, 52)' : '', color: mode === 'dark' ? 'white' : '', }}>
                <div className="flex px-4 pb-2 pt-28">
                  <button
                    type="button"
                    className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <RxCross2 />
                  </button>
                </div>
                <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                  
                  {user?.isAdmin ? "" : <Link to={'/'} className="text-sm font-medium text-gray-900" style={{ color: mode === 'dark' ? 'white' : '', }}>
                    Home
                  </Link>}
                  {user?.isAdmin ? "" : <div className='flow-root'><Link to={'/allproducts'} className="text-sm font-medium text-gray-900 " style={{ color: mode === 'dark' ? 'white' : '', }}>
                    All Products
                  </Link></div>}
                  {user ? <div className="flow-root">
                    {user.isAdmin ? "" : <Link to={'/order'} style={{ color: mode === 'dark' ? 'white' : '', }} className="-m-2 block p-2 font-medium text-gray-900">
                      Order
                    </Link>}
                  </div> : " "}

                  <div className='flow-root'>
                    {user?.isAdmin && (<Link to={'/dashboard'} className="-m-2 block p-2 font-medium text-gray-900" style={{ color: mode === 'dark' ? 'white' : '', }}>
                      Admin
                    </Link>)}
                  </div>

                  

                  {user ? <div onClick={logout}
                  className="flow-root">
                    <a className="-m-2 block p-2 font-medium text-gray-900 cursor-pointer" style={{ color: mode === 'dark' ? 'white' : '', }}>
                      Logout
                    </a>
                  </div> : " "}
                  
                  {userData && user ? <h1 className="title-font text-lg font-medium text-red-500 p-2 bg-gray-300 rounded-lg" style={{ color: mode === 'dark' ? 'white' : '' }}>
                    Hi, {userData}
                  </h1>:" "}

                  {!user ? <div className="flow-root"> <Link to={'/login'} className="text-sm font-medium text-gray-700 cursor-pointer  " style={{ color: mode === 'dark' ? 'white' : '', }}>
                    Login
                  </Link>
                  </div>: " "}

                  {user && !user?.isAdmin ? <div className='flow-root'><Link to={'/cart'} className="group -m-2 flex items-center p-2" style={{ color: mode === 'dark' ? 'white' : '', }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 hover:text-red-700">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>

                    <span className="ml-2 text-sm font-medium text-gray-700 group-" style={{ color: mode === 'dark' ? 'white' : '', }}>{cartItems.length}</span>
                    <span className="sr-only">items in cart, view bag</span>
                  </Link></div> : " "}
                </div>

                <div className="border-t border-gray-200 px-4 py-6">
                  <a href="#" className="-m-2 flex items-center p-2">
                    <img
                      src="img/indiaflag.png"
                      alt=""
                      className="block h-auto w-5 flex-shrink-0"
                    />
                    <span className="sr-only">, change currency</span>
                  </a>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      <header className="relative bg-white">
        

        <nav aria-label="Top" className="bg-gray-100 px-4 sm:px-6 lg:px-8 shadow-xl " style={{ backgroundColor: mode === 'dark' ? '#282c34' : '', color: mode === 'dark' ? 'white' : '', }}>
          <div className="">
            <div className="flex h-16 items-center">
              <button
                type="button"
                className="rounded-md bg-white p-2 text-gray-400 lg:hidden"
                onClick={() => setOpen(true)} style={{ backgroundColor: mode === 'dark' ? 'rgb(80 82 87)' : '', color: mode === 'dark' ? 'white' : '', }}
              >
                <span className="sr-only">Open menu</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>

              </button>

              {/* Logo */}
              <div className="ml-4 flex lg:ml-0">
                <Link to={'/'} className='flex'>
                  <div className="flex ">
                    <h1 className=' text-2xl font-bold text-black  px-2 py-1 rounded' style={{ color: mode === 'dark' ? 'white' : '', }}>FiveStarTextiles</h1>
                  </div>
                </Link>
              </div>

              <div className="ml-auto flex items-center">
                <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                  
                {user?.isAdmin ? "" : <Link to={'/'} className="text-sm font-medium text-gray-700 hover:text-red-700" style={{ color: mode === 'dark' ? 'white' : '', }}>
                    Home
                  </Link>}
                  {user?.isAdmin ? "" : <Link to={'/allproducts'} className="text-sm font-medium text-gray-700 hover:text-red-700 " style={{ color: mode === 'dark' ? 'white' : '', }}>
                    Products
                  </Link>}
                  {user && !user?.isAdmin ? <Link to={'/order'} className="text-sm font-medium text-gray-700 hover:text-red-700" style={{ color: mode === 'dark' ? 'white' : '', }}>
                    Order
                  </Link> : " "}
                  {user?.isAdmin && (<Link to={'/dashboard'} className="text-sm font-medium text-gray-700 hover:text-red-700" style={{ color: mode === 'dark' ? 'white' : '', }}>
                      Admin
                    </Link>)}
                  {user ? <a onClick={logout} className="text-sm font-medium text-gray-700 hover:text-red-700 cursor-pointer  " style={{ color: mode === 'dark' ? 'white' : '', }}>
                    Logout
                  </a>: " "}

                  {userData && user ? <h1 className="title-font text-lg font-medium text-red-500 p-2 bg-gray-300 rounded-lg cursor-pointer" onClick={toggleDialog} style={{ color: mode === 'dark' ? 'red' : '' }}>
                    Hi, {userData}
                  </h1>:" "}

                  {!user ? <Link to={'/login'} className="text-sm font-medium text-gray-700 hover:text-red-700 cursor-pointer  " style={{ color: mode === 'dark' ? 'white' : '', }}>
                    Login
                  </Link>: " "}
                  
                </div>

                

                {/* Search */}
                <div className="flex lg:ml-6">
                  <button className='hover:text-red-700' onClick={toggleMode}>
                    {/* <MdDarkMode size={35} style={{ color: mode === 'dark' ? 'white' : '' }} /> */}
                    {/* {mode === 'light' ?
                      (<FiSun className='' size={30} />
                      ) : 'dark' ?
                        (<BsFillCloudSunFill size={30} />
                        ) : ''} */}
                  </button>
                </div>

                {/* Cart */}
                {user && !user?.isAdmin ? <div className="ml-4 flow-root lg:ml-6">
                  <Link to={'/cart'} className="group -m-2 flex items-center p-2" style={{ color: mode === 'dark' ? 'white' : '', }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 hover:text-red-700">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>

                    <span className="ml-2 text-sm font-medium text-gray-700 group-" style={{ color: mode === 'dark' ? 'white' : '', }}>{cartItems.length}</span>
                    <span className="sr-only">items in cart, view bag</span>
                  </Link>
                </div> : " "}
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  )
}

export default Navbar
