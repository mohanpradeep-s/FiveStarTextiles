import React,{useEffect} from 'react'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Home from './pages/home/Home';
import Order from './pages/Order/Order';
import Cart from './pages/cart/Cart';
import Dashboard from './pages/admin/dashboard/Dashboard';
import NoPage from './pages/nopage/NoPage';
import MyState from "./context/data/myState";
import Login from './pages/registration/Login'
import Signup from './pages/registration/Signup';
import ProductInfo from './pages/productInfo/ProductInfo';
import AddProduct from './pages/admin/pages/AddProduct';
import UpdateProduct from './pages/admin/pages/UpdateProduct';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AllProducts from './pages/allproducts/AllProducts';
import { getAuth } from "firebase/auth";
import { doc, getDoc, collection, query, where } from "firebase/firestore";
import { fireDB } from "./firebase/FirebaseConfig";

const App = () => {
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
    <MyState>
      <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/order" element={
          <ProtectedRoute>
            <Order/>
          </ProtectedRoute>
        } />
        <Route path="/cart" element={<Cart/>} />
        <Route path="/dashboard" element={
          <ProtectedRouteAdmin>
            <Dashboard/>
          </ProtectedRouteAdmin>
        } />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/productinfo/:id" element={<ProductInfo />} />
        <Route path="/addproduct" element={
          <ProtectedRouteAdmin>
            <AddProduct/>
          </ProtectedRouteAdmin>
        } />
        <Route path="/updateproduct" element={
          <ProtectedRouteAdmin>
            <UpdateProduct/>
          </ProtectedRouteAdmin>
        } />
        <Route path="/*" element={<AllProducts/>} />
      </Routes>
      <ToastContainer position='bottom-center' theme='colored'/>
    </Router>
    </MyState>
  )
}

export default App


// admin

const ProtectedRouteAdmin = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const auth = getAuth();
  const isAdmin = user && user.isAdmin;

  const validateAdminEmail = async (email) => {
    try {
      const adminCollectionRef = collection(fireDB, 'admin');
      const q = query(adminCollectionRef, where('email', '==', email));
      const querySnapshot = await getDoc(q);
      return querySnapshot.exists();
    } catch (error) {
      console.error('Error validating admin email:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userEmail = user.user.email;
        const adminEmailExists = await validateAdminEmail(userEmail);
        if (adminEmailExists) {
          user.isAdmin = true;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
    };

    fetchUserData();
  }, [user]);

  if (isAdmin) {
    return children;
  } else {
    return <Navigate to={'/login'}/>
  }
};

// user

export const ProtectedRoute = ({children}) => {
  const user = localStorage.getItem('user')
  if(user) {
    return children
  }
  else{
    return <Navigate to={'/login'}/>
  }
}