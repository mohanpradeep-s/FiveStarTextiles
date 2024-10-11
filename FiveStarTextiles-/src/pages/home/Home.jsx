import React, { useContext } from 'react'
import Layout from '../../components/layout/Layout'
import myContext from '../../context/data/myContext'
import HeroSection from '../../components/heroSection/HeroSection'
import Filter from '../../components/filter/Filter'
import ProductCard from '../../components/productCard/ProductCard'
import { useDispatch , useSelector} from 'react-redux'
import { Link } from 'react-router-dom'

const Home = () => {
  /*const dispatch = useDispatch();
  const cartItem = useSelector((state)=> state.cart)

  console.log(cartItem)

  const addCart = () => {
    dispatch(addToCart("shirt"));
  }

  const deleteCart = () => {
    dispatch(deleteFromCart("shirt"));
  }*/
  return (
    <Layout>
      <HeroSection/>
      <Filter/>
      <ProductCard/>
      <div className='flex justify-center -mt-10 mb-4'>
        <Link to={'/allproducts'}>
          <button className='bg-gray-300 px-5 rounded-xl h-10'>See more</button>
        </Link>
      </div>
    </Layout>
  )
}

export default Home