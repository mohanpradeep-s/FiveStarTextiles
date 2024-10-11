import React, { useState,useEffect } from 'react'
import MyContext from './myContext';
import { fireDB } from '../../firebase/FirebaseConfig';
import { Timestamp, addDoc, collection, onSnapshot, orderBy, query, setDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';

function MyState(props) {
    const [mode, setMode] = useState('light');

    const toggleMode = () => {
        if (mode === 'light') {
            setMode('dark');
            document.body.style.backgroundColor = 'rgb(17, 24, 39)';
        }
        else {
            setMode('light');
            document.body.style.backgroundColor = 'white';

        }
    }
    const [loading, setLoading] = useState(false);

    const [products, setProducts] = useState({
      title: null,
      price: null,
      imageUrl: null,
      category: null,
      description: null,
      time: Timestamp.now(),
      date: new Date().toLocaleString(
        "en-US",
        {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }
      )
  
    })
  
    // ********************** Add Product Section  **********************
    const addProduct = async () => {
      setLoading(true)
      if (products.title == null || products.price == null || products.imageUrl == null || products.quantity == null || products.category == null || products.description == null) {
        return toast.error('Please fill all fields')
      }
      const productRef = collection(fireDB, "products")
      try {
        await addDoc(productRef, products)
        toast.success("Product Added successfully")
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000);
        getProductData();
        closeModal()
        setLoading(false)
      } catch (error) {
        console.log(error)
        setLoading(false)
      }
      setProducts("")
    }
  
    const [product, setProduct] = useState([]);
  
    // ****** get product
    const getProductData = async () => {
      setLoading(true)
      try {
        const q = query(
          collection(fireDB, "products"),
          orderBy("time"),
          // limit(5)
        );
        const data = onSnapshot(q, (QuerySnapshot) => {
          let productsArray = [];
          QuerySnapshot.forEach((doc) => {
            productsArray.push({ ...doc.data(), id: doc.id });
          });
          setProduct(productsArray)
          setLoading(false);
        });
        return () => data;
      } catch (error) {
        console.log(error)
        setLoading(false)
      }
    }

    const edithandle = (item) => {
      //console.log('edit product:',item)
      setProducts(item)
    }

    // update product
  const updateProduct = async (item) => {
    try {
      setTimeout(() => {
        setLoading(true)
      }, 3000);
      await setDoc(doc(fireDB, "products", products.id), products);
      toast.success("Product Updated successfully")
      getProductData();
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000);
      setLoading(false)
    } catch (error) {
      setLoading(false)
      //console.log(error)
    }
    setProducts("")
  }

  // delete product

  const deleteProduct = async (item) => {
    setLoading(true)
    try {
      await deleteDoc(doc(fireDB, "products", item.id));
      toast.success('Product Deleted successfully')
      getProductData()
      setLoading(false)
    } catch (error) {
      //console.log(error)
      setLoading(false)
    }
    setProducts("")
  }

  const [order, setOrder] = useState([]);

  const getOrderData = async () => {
    setLoading(true)
    try {
      const result = await getDocs(collection(fireDB, "orders"))
      const ordersArray = [];
      result.forEach((doc) => {
        ordersArray.push({id: doc.id, ...doc.data()});
        setLoading(false)
      });
      setOrder(ordersArray);
     // console.log(ordersArray)
      setLoading(false);
    } catch (error) {
      //console.log(error)
      setLoading(false)
    }
  }

  const [user, setUser] = useState([]);

  const getUserData = async () => {
    setLoading(true)
    try {
      const result = await getDocs(collection(fireDB, "users"))
      const usersArray = [];
      result.forEach((doc) => {
        usersArray.push(doc.data());
        setLoading(false)
      });
      setUser(usersArray);
      //console.log(usersArray)
      setLoading(false);
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }




  useEffect(() => {
    getProductData();
    getOrderData();
    getUserData();
  }, []);

  const [searchkey, setSearchkey] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterPrice, setFilterPrice] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([]);

  return (
    <MyContext.Provider value={{mode, toggleMode, loading, setLoading, products, setProducts, addProduct, product, setProduct, edithandle, updateProduct, deleteProduct, order, user, searchkey, setSearchkey,filterType,setFilterType,filterPrice,setFilterPrice,filteredProducts,setFilteredProducts}}>
       {props.children}
    </MyContext.Provider>
  )
}

export default MyState