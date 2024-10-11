import React, { useContext, useEffect, useState } from 'react';
import myContext from '../../context/data/myContext';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/modal/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { deleteFromCart, updateQuantity } from '../../redux/CartSlice';
import { toast } from 'react-toastify';
import { fireDB } from '../../firebase/FirebaseConfig';
import { addDoc, collection, getDoc, doc, updateDoc,Timestamp } from 'firebase/firestore';
import { FaMinusCircle } from 'react-icons/fa';
import { FaPlusCircle } from 'react-icons/fa';

const Cart = () => {
  const context = useContext(myContext);
  const { mode } = context;
  const [orderedQuantities, setOrderedQuantities] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('');

  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart);

  const deleteCart = (item) => {
    dispatch(deleteFromCart(item));
    toast.success('Item deleted from cart');
  };

  const increaseQuantity = (item) => {
    setOrderedQuantities((prevQuantities) => ({
      ...prevQuantities,
      [item.id]: (prevQuantities[item.id] || 0) + 1,
    }));
    dispatch(updateQuantity({ id: item.id, quantity: (orderedQuantities[item.id] || 0) + 1 }));
  };

  const decreaseQuantity = (item) => {
    if (orderedQuantities[item.id] && orderedQuantities[item.id] > 1) {
      setOrderedQuantities((prevQuantities) => ({
        ...prevQuantities,
        [item.id]: prevQuantities[item.id] - 1,
      }));
      dispatch(updateQuantity({ id: item.id, quantity: orderedQuantities[item.id] - 1 }));
    }
  };

  const calculateTotalAmount = () => {
    let total = 0;
    cartItems.forEach((item) => {
      total += item.price * (orderedQuantities[item.id] || 1);
    });
    return total;
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    setTotalAmount(calculateTotalAmount());
    console.log(orderedQuantities);
  }, [cartItems, orderedQuantities]);

  const shipping = cartItems.length * 100;
  const grandTotal = shipping + totalAmount;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const buyNow = async () => {
    // validation
    if (name === '' || address === '' || pincode === '' || phoneNumber === '') {
      return toast.error('All fields are required', {
        position: 'top-center',
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    }

    const productRef = collection(fireDB, 'products');

    try {
      await Promise.all(
        cartItems.map(async (cartItem) => {
          const { id } = cartItem;
          const docRef = doc(productRef, id);
          const docSnapshot = await getDoc(docRef);
          const currentStock = docSnapshot.data().quantity;
          const update = await updateDoc(docRef, { quantity: currentStock - (orderedQuantities[cartItem.id] || 1) });
          console.log(update)
        })
      );
    } catch (error) {
      console.error('Error updating stock quantity:', error);
      toast.error('Failed to place order: Insufficient stock', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
      return;
    }

    if (paymentMethod === 'online_payment') {
      // Handle online payment logic here (e.g., integrate with Razorpay)
      //toast.success('Online payment successful');
      // You can integrate with Razorpay or any other payment gateway here
      const addressInfo = {
      name,
      address,
      pincode,
      phoneNumber,
      date: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
    };

    var options = {
      key: 'rzp_test_BmlckCOiyfMM1r',
      key_secret: 'aq1LLd9A5xc0FWi9Hn0Mr4pM',
      amount: parseInt(grandTotal * 100),
      currency: 'INR',
      order_receipt: 'order_rcptid_' + name,
      name: 'FiveStarTextiles',
      description: 'for testing purpose',
      handler: function (response) {
        toast.success('Payment Successful');

        const paymentId = response.razorpay_payment_id;
        // store in firebase

        const orderItems = cartItems.map(item => {
          return {
            id: item.id,
            title: item.title,
            imageUrl: item.imageUrl,
            description: item.description,
            category: item.category,
            price: item.price,
            quantity: orderedQuantities[item.id] || 1,
            totalPrice: item.price * (orderedQuantities[item.id] || 1)
          };
        });
      
        const totalOrderPrice = orderItems.reduce((total, item) => total + item.totalPrice, 0);


        const orderInfo = {
          cartItems: orderItems,
          addressInfo,
          date: new Date().toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }),
          time: Timestamp.now(),
          email: JSON.parse(localStorage.getItem('user')).user.email,
          userid: JSON.parse(localStorage.getItem('user')).user.uid,
          totalOrderPrice,
          paymentMode: 'online_payment',
          paymentId,
          status: 'Order Placed',
          orderPresentStatus: 'Active',
        };

        try {
          const result = addDoc(collection(fireDB, 'orders'), orderInfo);
        } catch (error) {
          console.log(error);
        }
      },

      theme: {
        color: '#3399cc',
      },
    };
    var pay = new window.Razorpay(options);
    pay.open();
    console.log(pay);
    } 

    else if (paymentMethod === 'cash_on_delivery') 
    {
      // Store payment mode and order details in Firebase or perform any other required action
      const orderInfo = {
        cartItems: cartItems.map(item => ({
            id: item.id,
            title: item.title,
            imageUrl: item.imageUrl,
            description: item.description,
            category: item.category,
            price: item.price,
            quantity: orderedQuantities[item.id] || 1,
            totalPrice: item.price * (orderedQuantities[item.id] || 1)
        })),
        addressInfo: {
          name,
          address,
          pincode,
          phoneNumber,
          date: new Date().toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }),
        },
        date: new Date().toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        time: Timestamp.now(),
        email: JSON.parse(localStorage.getItem('user')).user.email,
        userid: JSON.parse(localStorage.getItem('user')).user.uid,
        totalOrderPrice: grandTotal,
        paymentMode: 'cash_on_delivery',
        paymentId: '-----',
        status: 'Processing',
        orderPresentStatus: 'Active',
      };

      // Store the order details in Firebase or perform any other required action
      try {
        const result = await addDoc(collection(fireDB, 'orders'), orderInfo);
        console.log(result);
        toast.success('Order placed successfully (Cash on Delivery)');
      } catch (error) {
        console.error('Error adding document: ', error);
        toast.error('Failed to place order');
      }
    }
  };

  return (
    <Layout>
      <div
        className="min-h-screen bg-gray-100 pt-5 mb-auto"
        style={{ backgroundColor: mode === 'dark' ? '#282c34' : '', color: mode === 'dark' ? 'white' : '' }}
      >
        <h1 className="mb-10 text-center text-2xl font-bold">Cart Items</h1>
        <div className="mx-auto max-w-5xl justify-center px-6 md:flex md:space-x-6 xl:px-0 ">
          <div className="rounded-lg md:w-2/3 ">
            {cartItems.map((item, index) => {
              const { title, price, description, imageUrl, quantity } = item;
              return (
                <div
                  className="justify-between mb-6 rounded-lg border  drop-shadow-xl bg-white p-6  sm:flex  sm:justify-start"
                  style={{ backgroundColor: mode === 'dark' ? 'rgb(32 33 34)' : '', color: mode === 'dark' ? 'white' : '' }}
                  key={item.id}
                >
                  <img src={item.imageUrl} alt="product-image" className="w-full rounded-lg sm:w-40" />
                  <div className="sm:ml-4 sm:flex sm:w-full sm:justify-between">
                    <div className="mt-5 sm:mt-0">
                      <h2 className="text-lg font-bold text-gray-900" style={{ color: mode === 'dark' ? 'white' : '' }}>
                        {item.title}
                      </h2>
                      <h2 className="text-sm  text-gray-900" style={{ color: mode === 'dark' ? 'white' : '' }}>
                        {item.description}
                      </h2>
                      <h1 className="mt-1 text-xl font-bold text-black" style={{ color: mode === 'dark' ? 'white' : '' }}>
                        ₹{item.price}
                      </h1>
                      <div className="mt-3">
                        <div className="flex">
                          <h1 className="title-font text-lg font-medium text-gray-900 mb-3" style={{ color: mode === 'dark' ? 'white' : '' }}>
                            Quantity :
                          </h1>
                          <span className="flex justify-center text-base">
                            <FaMinusCircle className="ml-3 mr-3 text-2xl cursor-pointer" onClick={() => decreaseQuantity(item)} />
                            {orderedQuantities[item.id] || 1}
                            <FaPlusCircle className="ml-3 text-2xl cursor-pointer" onClick={() => increaseQuantity(item)} />
                          </span>
                        </div>
                        <h1 className="title-font text-lg font-medium text-gray-900 mb-3" style={{ color: mode === 'dark' ? 'white' : '' }}>
                          Price : {item.price * (orderedQuantities[item.id] || 1)}
                        </h1>
                      </div>
                    </div>
                    <div
                      onClick={() => deleteCart(item)}
                      className="mt-4 flex justify-between sm:space-y-6 sm:mt-0 sm:block sm:space-x-6"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="mt-6 h-full rounded-lg border bg-white p-6 shadow-md md:mt-0 md:w-1/3"
            style={{ backgroundColor: mode === 'dark' ? 'rgb(32 33 34)' : '', color: mode === 'dark' ? 'white' : '' }}
          >
            <div className="mb-2 flex justify-between">
              <p className="text-gray-700" style={{ color: mode === 'dark' ? 'white' : '' }}>
                Subtotal
              </p>
              <p className="text-gray-700" style={{ color: mode === 'dark' ? 'white' : '' }}>
                ₹{totalAmount}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-700" style={{ color: mode === 'dark' ? 'white' : '' }}>
                Shipping
              </p>
              <p className="text-gray-700" style={{ color: mode === 'dark' ? 'white' : '' }}>
                ₹{shipping}
              </p>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between mb-3">
              <p className="text-lg font-bold" style={{ color: mode === 'dark' ? 'white' : '' }}>
                Total
              </p>
              <div className>
                <p className="mb-1 text-lg font-bold" style={{ color: mode === 'dark' ? 'white' : '' }}>
                  ₹{grandTotal}
                </p>
              </div>
            </div>
            <div className="flex flex-col space-y-2 mb-6">
              <label className="inline-flex items-center">
                <input type="radio" className="form-radio" name="paymentMethod" value="cash_on_delivery" onChange={(e) => setPaymentMethod(e.target.value)} />
                <span className="ml-2">Cash on Delivery</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" className="form-radio" name="paymentMethod" value="online_payment" onChange={(e) => setPaymentMethod(e.target.value)} />
                <span className="ml-2">Online Payment</span>
              </label>
            </div>
            <Modal
              name={name}
              address={address}
              pincode={pincode}
              phoneNumber={phoneNumber}
              paymentMethod={paymentMethod}
              setName={setName}
              setAddress={setAddress}
              setPincode={setPincode}
              setPhoneNumber={setPhoneNumber}
              setPaymentMethod={setPaymentMethod}
              buyNow={buyNow}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
