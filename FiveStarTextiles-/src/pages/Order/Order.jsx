import React, { useContext, useState,useEffect } from 'react';
import myContext from '../../context/data/myContext';
import Layout from '../../components/layout/Layout';
import Loader from '../../components/loader/Loader';
import { toast } from 'react-toastify';
import { FaClock, FaTruck, FaCheck } from 'react-icons/fa';
import { FaRegCircleCheck } from "react-icons/fa6";
import { ImCancelCircle } from "react-icons/im";
import { fireDB } from '../../firebase/FirebaseConfig';
import { collection, updateDoc, doc, setDoc, getDocs, addDoc, query, where, or, orderBy, limit, startAfter, Timestamp } from 'firebase/firestore';

const Order = () => {
  const userid = JSON.parse(localStorage.getItem('user')).user.uid;
  const context = useContext(myContext);
  const { loading, order } = context;

  // Function to group orders by timestamp
  const groupOrdersByTimestamp = () => {
    if (!order) return []; // Return empty array if order is undefined or null
    
    const groupedOrders = [];
    
    // Filter orders based on the user ID
    const userOrders = order.filter(obj => obj.userid === userid);

    // Sort orders by timestamp in descending order
    userOrders.sort((a, b) => b.timestamp - a.timestamp);

    // Group orders by their timestamps
    userOrders.forEach(orderItem => {
      let foundGroup = false;

      // Check if order can be added to an existing group
      groupedOrders.forEach(group => {
        if (group.length > 0 && orderItem.timestamp - group[group.length - 1].timestamp <= 60000) {
          group.push(orderItem);
          foundGroup = true;
        }
      });

      // If no existing group is suitable, create a new group
      if (!foundGroup) {
        groupedOrders.push([orderItem]);
      }
    });

    return groupedOrders;
  };

  const groupedOrders = groupOrdersByTimestamp();

  const handlePrint = () => {
    window.print();
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case "Processing":
        return "bg-orange-500";
      case "Shipping":
        return "bg-blue-500";
      case "Delivered":
        return "bg-green-500";
      default:
        return ""; // No background color class if status doesn't match any condition
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Processing":
        return <FaClock className="inline-block mr-2" />;
      case "Shipping":
        return <FaTruck className="inline-block mr-2" />;
      case "Delivered":
        return <FaRegCircleCheck className="inline-block mr-2 text-xl" />;
      default:
        return null; // No icon if status doesn't match any condition
    }
  };
  
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [confirmCancelOrderId, setConfirmCancelOrderId] = useState(null);

  const handleCancelOrder = async (index, orderId, orderPresentStatus) => {
    if (orderPresentStatus === "Active" && !cancelledOrders.includes(orderId)) {
      setConfirmCancelOrderId(orderId);
    } else {
      toast.error("Order is already cancelled.");
    }
  };

  const confirmCancelOrder = () => {
    if (confirmCancelOrderId) {
      const orderItem = groupedOrders.flat().find(item => item.id === confirmCancelOrderId);
      if (orderItem) {
        // Update orderPresentStatus in Firestore to "Order Cancelled"
        const orderRef = doc(fireDB, "orders", confirmCancelOrderId);
        updateDoc(orderRef, { orderPresentStatus: "Order Cancelled" }).then(() => {
          toast.success("Order Cancelled Successfully.");
          setCancelledOrders([...cancelledOrders, confirmCancelOrderId]);
          setConfirmCancelOrderId(null);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }).catch(error => {
          toast.error("An error occurred while cancelling the order.");
          console.error("Error cancelling order:", error);
        });
      } else {
        toast.error("Order not found.");
      }
    }
  };

  const cancelConfirmCancelOrder = () => {
    setConfirmCancelOrderId(null);
  };
  

  return (
    <Layout>
      {loading && <Loader />}
      {groupedOrders && groupedOrders.length > 0 ? (
        <div className="max-w-4xl mx-auto py-10">
          <button onClick={handlePrint} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-3">
            Print Receipt
          </button>
          {groupedOrders.map((group, index) => (
            <div key={index} className="mb-8 border rounded-lg border-gray-500 p-5">
              <h2 className="text-2xl font-bold mb-4">Order {index + 1}</h2>
              {group.map((orderItem) => (
                <div key={orderItem.id} className="bg-white rounded-lg shadow-md mb-4">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center mb-4">
                      <h3 className="font-semibold">Payment ID: {orderItem.paymentId}</h3> {/* Display Payment ID */}
                      {orderItem.orderPresentStatus === 'Active' ? <p className={'m-auto font-semibold'}>
                        Status: <span className={`inline-block px-2 py-2 rounded ${getStatusColorClass(orderItem.status)}`}>{getStatusIcon(orderItem.status)}{orderItem.status}</span>
                      </p>:<p className={'m-auto font-semibold'}>
                        Status: <span className="inline-block px-2 py-2 rounded bg-red-600"><ImCancelCircle className="inline-block mr-2 text-xl"/>Order Cancelled</span>
                      </p>}
                    </div>
                    <div className="flex items-center mb-4">
                    <p className="font-semibold">Ordered On: {orderItem.date}</p> {/* Display Ordered On date */}
                    </div>
                    {orderItem.cartItems.map((item) => (
                      <div key={item.id} className="flex items-center mb-4">
                        <img src={item.imageUrl} alt="product-image" className="w-20 h-20 object-cover rounded mr-4" />
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-gray-600">{item.description}</p>
                          <p className="font-bold">Price: ₹{item.price}</p>
                          <p className="font-bold">Ordered Quantity: {item.quantity}</p>
                          <p className="font-bold">TotalPrice: ₹{item.totalPrice}</p>
                        </div>
                      </div>
                    ))}
                      {orderItem.status !== 'Delivered' && orderItem.orderPresentStatus !== "Order Cancelled" && (
                      <button
                        onClick={() => handleCancelOrder(index, orderItem.id, orderItem.orderPresentStatus)}
                        className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded`}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
          <h2 className="text-center text-2xl text-black">No Order Found.</h2>
      )}
      {confirmCancelOrderId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-md shadow-md">
            <p className="mb-4">Are you sure you want to cancel this order?</p>
            <div className="flex justify-end">
              <button
                onClick={confirmCancelOrder}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-2"
              >
                OK
              </button>
              <button
                onClick={cancelConfirmCancelOrder}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Order;