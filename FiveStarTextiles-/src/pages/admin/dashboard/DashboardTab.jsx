import React, { useContext, useEffect, useState } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Layout from '../../../components/layout/Layout';
import myContext from '../../../context/data/myContext';
import { MdOutlineProductionQuantityLimits } from 'react-icons/md';
import { FaUser, FaCartPlus } from 'react-icons/fa';
import { AiFillShopping, AiFillPlusCircle, AiFillDelete,AiOutlineEye } from 'react-icons/ai';
import { Link, Navigate } from 'react-router-dom';
import { TbReport } from "react-icons/tb";
import { fireDB } from '../../../firebase/FirebaseConfig';
import { collection, updateDoc, doc, setDoc, getDocs, addDoc, query, where, or, orderBy, limit, startAfter, Timestamp } from 'firebase/firestore';
import Loader from '../../../components/loader/Loader';
import { TbReportSearch } from "react-icons/tb";
import Pagination from '@mui/material/Pagination';
import { toast } from 'react-toastify';


const DashboardTab = () => {
    const context = useContext(myContext)
    const { mode, product, edithandle, deleteProduct, user } = context
    let [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusModel, setStatusModel] = useState(false);
    const [selectedOrderItems, setSelectedOrderItems] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const [buttonclick, setButtonClick] = useState(false);

    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [addingAdmin, setAddingAdmin] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const adminCollection = collection(fireDB, 'admin');
            const snapshot = await getDocs(adminCollection);
            const adminEmails = snapshot.docs.map(doc => doc.data().email);
            setAdmins(adminEmails);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admins:', error);
            setLoading(false);
        }
    };

    const addAdmin = async () => {
        if (!newAdminEmail) return; // Don't add empty emails

        try {
            setAddingAdmin(true);
            const adminRef = collection(fireDB, 'admin');
            await addDoc(adminRef, { email: newAdminEmail });
            setAdmins(prevAdmins => [...prevAdmins, newAdminEmail]);
            setNewAdminEmail('');
            setAddingAdmin(false);
            console.log('Admin added successfully.');
        } catch (error) {
            console.error('Error adding admin:', error);
            setAddingAdmin(false);
        }
    }

    function closeModal() {
        setIsOpen(false);
        setIsModalOpen(false);
        setStatusModel(false);
    }

    function openModal(items) {
        setSelectedOrderItems(items);
        setIsModalOpen(true);
        setIsOpen(true);
        setStatusModel(true);
    }

    const openDialog = () => {
        setIsOpen(true);
    };

    // Function to close the dialog
    const closeDialog = () => {
        setIsOpen(false);
    };
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
          const querySnapshot = await getDocs(collection(fireDB, 'orders'));
          const orders = querySnapshot.docs.map(doc => ({
            id: doc.id, // Document ID
            ...doc.data() // Other order details
          }));
          setOrders(orders);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching orders:', error);
          setLoading(false);
        }
      };
      
      // Call fetchOrders when component mounts
      useEffect(() => {
        fetchOrders();
      }, []);

    const [orderStatuses, setOrderStatuses] = useState([]);
const [selectedStatusIndex, setSelectedStatusIndex] = useState(null);
const [selectedOrderId, setSelectedOrderId] = useState(null);
const [showDialog, setShowDialog] = useState(false);
const [newstatus, setNewStatus] = useState(null);

// Function to load order statuses from Firestore
useEffect(() => {
  // Fetch order statuses from Firestore
  const fetchOrderStatuses = async () => {
    try {
      const statusSnapshot = await getDocs(collection(fireDB, 'orders'));
      const statuses = statusSnapshot.docs.map(doc => doc.data().status); // Extract status values
      setOrderStatuses(statuses);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order statuses:', error);
      setLoading(false);
    }
  };

  fetchOrderStatuses(); // Call the function to fetch order statuses
}, []); // Run this effect only once when component mounts

// Function to handle status change
const handleStatusChange = async (index, newStatus, singleOrderId) => {
  setSelectedStatusIndex(index);
  setSelectedOrderId(singleOrderId);
  setNewStatus(newStatus);
  setShowDialog(true);
};

const updateStatusAndCloseDialog = async () => {
  try {
    console.log("Selected order ID: ",selectedOrderId);
    if (selectedOrderId) {
      // Update status in React state
      const updatedStatuses = [...orderStatuses];
      updatedStatuses[selectedStatusIndex] = newstatus;
      setOrderStatuses(updatedStatuses);

      const orderRef = doc(fireDB, "orders", selectedOrderId);

      // Update status in Firestore
      console.log('Updating status to:', newstatus);
      //await updateDoc(collection(fireDB,"orders"),selectedOrderId, { status: newstatus });
      await updateDoc(orderRef, { status: newstatus });
      toast.success("Status updated Successfully.");

      // Close dialog
      setShowDialog(false);
    } else {
      console.error('Selected order ID is null.');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
  }
};

if (loading) {
  return <div>Loading...</div>;
}
    

    const add = () => {
        window.location.href = '/addproduct'
    }

    const [reportType, setReportType] = useState('Products');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);

    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
    };

    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
    };

    const handleReportTypeChange = (event) => {
        setReportType(event.target.value);
    };

    const handleGenerateReport = () => {
        if (startDate && endDate) {
            const startTimestamp = Timestamp.fromDate(new Date(startDate));
            const endTimestamp = Timestamp.fromDate(new Date(endDate));
    
            let collectionName = '';
            if (reportType === 'Products') {
                collectionName = 'products';
            } else if (reportType === 'Orders') {
                collectionName = 'orders';
            }
    
            const q = query(
                collection(fireDB, collectionName),
                where('time', '>=', startTimestamp),
                where('time', '<=', endTimestamp)
            ); 
    
            getDocs(q)
                .then(querySnapshot => {
                    const fetchedProducts = [];
                    querySnapshot.forEach(doc => {
                        fetchedProducts.push({ id: doc.id, ...doc.data() });
                    });
                    //console.log('Fetched products:', fetchedProducts);
                    setProducts(fetchedProducts);
                    setTotalProducts(fetchedProducts.length);
                })
                .catch(error => {
                    console.error('Error fetching products: ', error);
                })
        } else {
            console.error('Please select both start and end dates');
        }
    };
    

    return (
        <>
            <div className="container mx-auto">
                <div className="tab container mx-auto ">
                    <Tabs defaultIndex={0} className=" " >
                        <TabList className="md:flex md:space-x-8 bg-  grid grid-cols-2 text-center gap-4   md:justify-center mb-10 mt-10">
                            <Tab>
                                <button type="button" className="font-medium border-b-2 hover:shadow-blue-700 border-blue-500 text-blue-500 rounded-lg text-xl shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]  px-5 py-1.5 text-center bg-[#605d5d12] ">
                                    <div className="flex gap-2 items-center">
                                        <MdOutlineProductionQuantityLimits />Products
                                    </div> 
                                </button>
                            </Tab>
                            <Tab>
                                <button type="button" className="font-medium border-b-2 border-red-500 bg-[#605d5d12] text-red-500  hover:shadow-pink-700  rounded-lg text-xl shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]    px-5 py-1.5 text-center ">
                                    <div className="flex gap-2 items-center">
                                        <AiFillShopping /> Orders
                                    </div>
                                </button>
                            </Tab>
                            <Tab>
                                <button type="button" className="font-medium border-b-2 border-green-500 bg-[#605d5d12] text-green-500 rounded-lg text-xl  hover:shadow-green-700 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]   px-5 py-1.5 text-center ">
                                    <div className="flex gap-2 items-center">
                                        <FaUser /> Users
                                    </div>
                                </button>
                            </Tab>
                            <Tab>
                                <button type="button" className="font-medium border-b-2 border-cyan-400 bg-[#605d5d12] text-cyan-400 rounded-lg text-xl  hover:shadow-cyan-600 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]   px-5 py-1.5 text-center ">
                                    <div className="flex gap-2 items-center">
                                        <FaUser /> Admins
                                    </div>
                                </button>
                            </Tab>
                            <Tab>
                                <button type="button" className="font-medium border-b-2 border-violet-500 bg-[#605d5d12] text-violet-500 rounded-lg text-xl  hover:shadow-violet-700 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]   px-5 py-1.5 text-center ">
                                    <div className="flex gap-2 items-center">
                                        <TbReport /> Reports
                                    </div>
                                </button>
                            </Tab>
                        </TabList>
                        {/* product  */}
                        <TabPanel>
                            <div className='  px-4 md:px-0 mb-16'>
                                <h1 className=' text-center mb-5 text-3xl font-semibold underline' style={{ color: mode === 'dark' ? 'white' : '' }}>Product Details</h1>
                                <div className=" flex justify-end">
                                    <button
                                    onClick={add}
                                        type="button"
                                        className="focus:outline-none text-white bg-red-600 shadow-[inset_0_0_10px_rgba(0,0,0,0.6)] border hover:bg-red-700 outline-0 font-medium rounded-lg text-sm px-5 py-2.5 mb-2" style={{ backgroundColor: mode === 'dark' ? 'rgb(46 49 55)' : '', color: mode === 'dark' ? 'white' : '', }} > 
                                        <div className="flex gap-2 items-center">
                                            Add Product <FaCartPlus size={20} />
                                        </div></button>
                                </div>
                                <div className="relative overflow-x-auto ">
                                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400  ">
                                        <thead className="text-xs border border-gray-600 text-black uppercase bg-gray-200 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]" style={{ backgroundColor: mode === 'dark' ? 'rgb(46 49 55)' : '', color: mode === 'dark' ? 'white' : '', }} >
                                            <tr>
                                                <th scope="col" className="px-6 py-3">
                                                    S.No
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Image
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Title
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Price
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Category
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Date
                                                </th>
                                               <th scope="col" className="px-6 py-3">
                                                    Stock Quantity
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        {product.map((item,index) => {
                                            const {title,price,imageUrl, category,date,quantity} = item;
                                            return (
                                                <tbody className=''>
                                            <tr className="bg-gray-50 border-b  dark:border-gray-700" style={{ backgroundColor: mode === 'dark' ? 'rgb(46 49 55)' : '', color: mode === 'dark' ? 'white' : '', }} >
                                                <td className="px-6 py-4 text-black " style={{ color: mode === 'dark' ? 'white' : '' }}>
                                                    {index + 1}.
                                                </td>
                                                <th scope="row" className="px-6 py-4 font-medium text-black whitespace-nowrap">
                                                    <img className='w-16' src={imageUrl} alt="img" />
                                                </th>
                                                <td className="px-6 py-4 text-black " style={{ color: mode === 'dark' ? 'white' : '' }}>
                                                    {title}
                                                </td>
                                                <td className="px-6 py-4 text-black " style={{ color: mode === 'dark' ? 'white' : '' }}>
                                                    ₹{price}
                                                </td>
                                                <td className="px-6 py-4 text-black " style={{ color: mode === 'dark' ? 'white' : '' }}>
                                                    {category}
                                                </td>
                                                <td className="px-6 py-4 text-black " style={{ color: mode === 'dark' ? 'white' : '' }}>
                                                    {date}
                                                </td>
                                                <td className="px-6 py-4 text-center text-black " style={{ color: mode === 'dark' ? 'white' : '' }}>
                                                    {quantity}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className=" flex gap-2">
                                                        <div className=" flex gap-2 cursor-pointer text-black " style={{ color: mode === 'dark' ? 'white' : '' }}>
                                                            <div onClick={() => {deleteProduct(item)}}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                </svg>
                                                            </div>
                                                            <div  >
                                                            <Link to={'/updateproduct'} onClick={()=>edithandle(item)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                                </svg>
                                                            </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>

                                        </tbody>
                                        )
                                        })}
                                    </table>

                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel>
    <div className="relative overflow-x-auto mb-16">
        <h1 className='text-center mb-5 text-3xl font-semibold underline' style={{ color: mode === 'dark' ? 'white' : '' }}>Order Details</h1>
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-black uppercase bg-gray-200" style={{ backgroundColor: mode === 'dark' ? 'rgb(46 49 55)' : '', color: mode === 'dark' ? 'white' : '' }}>
                <tr>
                    <th scope="col" className="px-6 py-3">
                        Order No.
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Payment Mode
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Payment ID
                    </th>
                    <th scope="col" className="px-6 py-3">
                        User Details
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Date
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Total Price
                    </th>
                    <th scope="col" className="px-6 py-3">
                        View Products
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Order Status
                   </th>
                    <th scope="col" className="px-6 py-3">
                        Order Present Status
                   </th>
                </tr>
            </thead>
            <tbody>
                {orders.map((singleOrder, index) => (
                    <tr key={index} className="bg-gray-50 border-b  dark:border-gray-700" style={{ backgroundColor: mode === 'dark' ? 'rgb(46 49 55)' : '', color: mode === 'dark' ? 'white' : '' }}>
                        <td className="px-6 py-4 text-black">{index + 1}.</td>
                        <td className="px-6 py-4 text-black">{singleOrder.paymentMode}</td>
                        <td className="px-6 py-4 text-black">{singleOrder.paymentId}</td>
                        <td className="px-6 py-4 text-black">
                            {singleOrder.addressInfo.name}<br />
                            {singleOrder.addressInfo.address}<br />
                            {singleOrder.addressInfo.pincode}<br />
                            {singleOrder.addressInfo.phoneNumber}<br />
                            {singleOrder.email}
                        </td>
                        {singleOrder.paymentMode === 'online_payment' ? <td className="px-6 py-4 text-black">{singleOrder.date}</td> : <td className="px-6 py-4 text-black">{singleOrder.addressInfo.date}</td>}
                        {singleOrder.paymentMode === 'online_payment' ? <td className="px-6 py-4 text-black">₹{singleOrder.totalOrderPrice}</td> : <td className="px-6 py-4 text-black">₹{singleOrder.totalOrderPrice}</td>}
                        <td className="px-6 py-4 text-black">
                            <button className="focus:outline-none" onClick={() => openModal(singleOrder.cartItems)}>
                                <AiOutlineEye className='text-xl'/>
                            </button>
                        </td>
                        <td className="px-6 py-4 text-black">
  {/* Dropdown to select order status */}
  <select
    value={singleOrder.status}
    onChange={(e) => handleStatusChange(index, e.target.value, singleOrder.id)}
    className={`block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline ${singleOrder.orderPresentStatus === 'Order Cancelled' ? 'disabled:cursor-not-allowed' : ''}`}
    disabled={singleOrder.orderPresentStatus === 'Order Cancelled' || singleOrder.status === 'Delivered'}
  >
    <option value="Order Placed">Select Status</option>
    <option value="Processing">Processing</option>
    <option value="Shipping">Shipping</option>
    <option value="Delivered">Delivered</option>
  </select>
</td>
                    {singleOrder.status === 'Delivered' ? <td className="px-6 py-4 text-black">
                        <div className='w-3 h-3 text-green-600'>Order Delivered</div>
                    </td> : <td className="px-6 py-4 text-black">
                    {singleOrder.orderPresentStatus === 'Active' ? (
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                    <span>Active</span>
                </div>
            ) : (
                <span style={{ color: 'red' }}>Order Cancelled</span>
            )}
        </td>}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
</TabPanel>
{showDialog && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
    <div className="bg-white p-4 rounded shadow-lg">
      <p className="mb-4">Are you sure you want to change the status?</p>
      <div className="flex justify-end">
        <button
          onClick={() => setShowDialog(false)} // Close dialog on cancel
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 mr-2 rounded"
        >
          Cancel
        </button>
        {orders && orders[selectedStatusIndex] && ( // Check if order and selected order exist
          <button
            onClick={() => updateStatusAndCloseDialog()} // Update status and close dialog on ok
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded"
          >
            Ok
          </button>
        )}
      </div>
    </div>
  </div>
)}
            {confirmDialogOpen && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg">
                        <h1 className='font-bold text-2xl ml-24 mb-10 underline text-red-500'>Update Order Status</h1>
                        <p className="text-lg mb-10">Are you sure you want to change the order status to "{selectedOption}"?</p>
                        <div className="flex justify-end">
                            <button onClick={() => handleConfirmDialog(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-4">CANCEL</button>
                            <button onClick={() => handleConfirmDialog(true, singleOrder.id)} className="bg-blue-500 text-white px-4 py-2 rounded-md">OK</button>
                        </div>
                    </div>
                </div>
            )}
                        <TabPanel>
                            {/* <User addressInfo={addressInfo} setAddressInfo={setAddressInfo} setLoading={setLoading} /> */}
                            <div className="relative overflow-x-auto mb-10">
                                <h1 className=' text-center mb-5 text-3xl font-semibold underline' style={{ color: mode === 'dark' ? 'white' : '' }}>User Details</h1>
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-black uppercase bg-gray-200 " style={{ backgroundColor: mode === 'dark' ? 'rgb(46 49 55)' : '', color: mode === 'dark' ? 'white' : '', }} >
                                        <tr>
                                            <th scope="col" className="px-6 py-3">
                                                S.No
                                            </th>

                                            <th scope="col" className="px-6 py-3">
                                                Name
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Phone Number
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Email
                                            </th>
                                        </tr>
                                    </thead>
                                    {user.map((item,index) => {
                                        const {name,uid,email,phone} = item;
                                        return (
                                            <tbody>
                                      
                                                <tr className="bg-gray-50 border-b  dark:border-gray-700" style={{ backgroundColor: mode === 'dark' ? 'rgb(46 49 55)' : '', color: mode === 'dark' ? 'white' : '', }} >
                                                    <td className="px-6 py-4 text-black " style={{ color: mode === 'dark' ? 'white' : '' }}>
                                                        {index + 1}.
                                                    </td>
                                                    <td className="px-6 py-4 text-black " style={{ color: mode === 'dark' ? 'white' : '' }}>
                                                        {name}
                                                    </td>
                                                    <td className="px-6 py-4 text-black " style={{ color: mode === 'dark' ? 'white' : '' }}>
                                                        {phone}
                                                    </td>
                                                    <td className="px-6 py-4 text-black " style={{ color: mode === 'dark' ? 'white' : '' }}>
                                                        {email}
                                                    </td>

                                                </tr>
                                    </tbody>
                                        )
                                    })}
                                </table>
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <div className="relative overflow-x-auto mb-16">
                                <h1 className="text-center mb-5 text-3xl font-semibold underline">Admin Details</h1>
                                <div className=" flex justify-end">
                                    <button
                                    onClick={openDialog}
                                        type="button"
                                        className="focus:outline-none text-white bg-cyan-600 shadow-[inset_0_0_10px_rgba(0,0,0,0.6)] border hover:bg-cyan-700 outline-0 font-medium rounded-lg text-sm px-5 py-2.5 mb-2" style={{ backgroundColor: mode === 'dark' ? 'rgb(46 49 55)' : '', color: mode === 'dark' ? 'white' : '', }} > <div className="flex gap-2 items-center">
                                            Add Admin <FaCartPlus size={20} />
                                        </div></button>
                                </div>
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs border border-gray-600 text-black uppercase bg-gray-200 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]" style={{ backgroundColor: mode === 'dark' ? 'rgb(46 49 55)' : '', color: mode === 'dark' ? 'white' : '' }}>
                                        <tr>
                                            <th scope="col" className="px-6 py-3">
                                                S.No
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Email
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admins.map((admin, index) => (
                                            <tr key={index} className="bg-gray-50 border-b  dark:border-gray-700" style={{ backgroundColor: mode === 'dark' ? 'rgb(46 49 55)' : '', color: mode === 'dark' ? 'white' : '' }}>
                                                <td className="px-6 py-4 text-black">{index + 1}.</td>
                                                <td className="px-6 py-4 text-black">{admin}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {isOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white dark:bg-gray-800">
                                <div className="flex justify-between items-center border-b border-gray-300 p-4">
                                    <h2 className="text-lg font-semibold">Add Admin</h2>
                                    <button onClick={closeDialog} type="button" className="focus:outline-none text-gray-500 dark:text-gray-300">
                                        <span className="sr-only">Close</span>
                                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-4">
                                    <div className="mb-4">
                                        <label htmlFor="email" className="block text-lg font-medium text-gray-700 dark:text-gray-300">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={newAdminEmail}
                                            onChange={(e) => setNewAdminEmail(e.target.value)}
                                            className="p-3 mt-3 font-bold focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                            placeholder="Enter admin email"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={addAdmin}
                                            disabled={!newAdminEmail || addingAdmin}
                                            className={`${addingAdmin ? 'cursor-not-allowed' : 'cursor-pointer'} inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-cyan-500 border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
                                        >
                                            {addingAdmin ? 'Adding...' : 'Add Admin'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </TabPanel>
        <TabPanel>
        <div className="relative overflow-x-auto mb-16">
        <h1 className="text-center mb-5 text-3xl font-semibold underline">Product/Order Reports</h1>
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center justify-center mb-4 space-x-4">
            <div className="flex-1">
                    <select
                        value={reportType}
                        onChange={handleReportTypeChange}
                        className="border border-black rounded px-3 py-2 focus:outline-none focus:border-blue-500 w-full"
                    >
                        <option value="Products">Products</option>
                        <option value="Orders">Orders</option>
                    </select>
                </div>
                <div className="flex-1">
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={handleStartDateChange}
                        className="border border-black rounded px-3 py-2 focus:outline-none focus:border-blue-500 w-full"
                    />
                </div>
                <div className="flex-1">
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={handleEndDateChange}
                        className="border border-black rounded px-3 py-2 focus:outline-none focus:border-blue-500 w-full"
                    />
                </div>
                <button
                    onClick={handleGenerateReport}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
                >
                    Generate Report
                </button>
            </div>
            {reportType === 'Products' && (<div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-200 p-4 rounded-lg text-center">
                            <p className="text-xl font-bold text-blue-500">Total Products</p>
                            <p className="text-3xl font-bold text-red-500">{totalProducts}</p>
                        </div>
                        {/* Add more grid items for other report details */}
            </div>)}
            {reportType === 'Orders' && (<div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-200 p-4 rounded-lg text-center">
                            <p className="text-xl font-bold text-blue-500">Total Orders</p>
                            <p className="text-3xl font-bold text-red-500">{totalProducts}</p>
                        </div>
                        {/* Add more grid items for other report details */}
            </div>)}
            </div>
            <h2 className="text-xl font-bold mb-4 text-center">Reports</h2>
            <div className="relative overflow-x-auto">
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs border border-gray-600 text-black uppercase bg-gray-200 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]" style={{ backgroundColor: mode === 'dark' ? 'rgb(46 49 55)' : '', color: mode === 'dark' ? 'white' : '' }}>
            {reportType === 'Products' && (<tr>
                <th scope="col" className="px-6 py-3">
                    S.No
                </th>
                <th scope="col" className="px-6 py-3">
                    ID
                </th>
                <th scope="col" className="px-6 py-3">
                    Image
                </th>
                <th scope="col" className="px-6 py-3">
                    Title
                </th>
                <th scope="col" className="px-6 py-3">
                    Price
                </th>
                <th scope="col" className="px-6 py-3">
                    Category
                </th>
                <th scope="col" className="px-6 py-3">
                    Date
                </th>
                <th scope="col" className="px-6 py-3">
                    Present Stock Quantity
                </th>
                {/* Add more headers if needed */}
            </tr>)}
            {reportType === 'Orders' && (
                            <tr>
                                <th scope="col" className="px-6 py-3">Order No</th>
                                <th scope="col" className="px-6 py-3">Payment Mode</th>
                                <th scope="col" className="px-6 py-3">Payment ID</th>
                                <th scope="col" className="px-6 py-3">User Details</th>
                                <th scope="col" className="px-6 py-3">View Products</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                            </tr>
                        )}
        </thead>
        <tbody>
        {products.map((product, index) => (
                <tr key={index} className="bg-gray-50 border-b dark:border-gray-700" style={{ backgroundColor: mode === 'dark' ? 'rgb(46 49 55)' : '', color: mode === 'dark' ? 'white' : '' }}>
                    {reportType === 'Products' && (
                                    <>
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4">{product.id}</td>
                                        <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
                                            <img className="w-16" src={product.imageUrl} alt="img" />
                                        </th>
                                        <td className="px-6 py-4">{product.title}</td>
                                        <td className="px-6 py-4">{product.price}</td>
                                        <td className="px-6 py-4">{product.category}</td>
                                        <td className="px-6 py-4">{product.date}</td>
                                        <td className="px-6 py-4">{product.quantity}</td>
                                    </>
                                )}
                                {reportType === 'Orders' && (
                                    <>
                                        <td className="px-6 py-4">{index+1}</td>
                                        <td className="px-6 py-4">{product.paymentMode}</td>
                                        <td className="px-6 py-4">{product.paymentId ? product.paymentId : '------'}</td>
                                        <td className="px-6 py-4">
                                            {product.addressInfo ? (
                                                <>
                                                    <div>{product.addressInfo.name}</div>
                                                    <div>{product.addressInfo.address}</div>
                                                    <div>{product.addressInfo.pincode}</div>
                                                    <div>{product.addressInfo.phoneNumber}</div>
                                                    <div>{product.email}</div>
                                                </>
                                            ) : null}
                                        </td>
                                        <td className="px-6 py-4 text-black">
                                         <button className="focus:outline-none" onClick={() => openModal(product.cartItems)}>
                                           <AiOutlineEye className='text-xl'/>
                                         </button>
                                        </td>
                                        <td className="px-6 py-4">{product.date}</td>
                                    </>
                                )}
                            </tr>
            ))}
        </tbody>
        </table>
        </div>
        </div>
        </TabPanel>
        {isModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4">Ordered Products</h2>
                        <div className="overflow-y-auto max-h-96">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-black uppercase bg-gray-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            Title
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Price
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Quantity
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Unit Price
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Category
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrderItems.map((item, index) => (
                                        <tr key={index} className="bg-gray-50 border-b dark:border-gray-700">
                                            <td className="px-6 py-4 text-black">{item.title}</td>
                                            <td className="px-6 py-4 text-black">₹{item.price}</td>
                                            <td className="px-6 py-4 text-black">{item.quantity}</td>
                                            <td className="px-6 py-4 text-black">₹{item.totalPrice}</td>
                                            <td className="px-6 py-4 text-black">{item.category}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none" onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
    </Tabs>
    </div>
   </div>
        </>
    )
}

export default DashboardTab