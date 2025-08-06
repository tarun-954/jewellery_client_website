import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Order {
  _id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  createOrder: (orderData: {
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    totalAmount: number;
    paymentMethod: string;
  }) => Promise<Order | null>;
  fetchUserOrders: () => Promise<void>;
  fetchAllOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: string, trackingNumber?: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createOrder = async (orderData: {
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    totalAmount: number;
    paymentMethod: string;
  }): Promise<Order | null> => {
    if (!user) {
      toast.error('You must be logged in to place an order');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const requestBody = {
        userId: user.id,
        ...orderData,
      };
      
      console.log('Sending order request:', requestBody);
      
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to create order');
      }

      const data = await response.json();
      toast.success('Order placed successfully!');
      return data.order;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping fetchUserOrders');
      return;
    }

    console.log('Fetching orders for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/orders/user/${user.id}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to fetch orders');
      }
      
      const data = await response.json();
      console.log('Orders fetched successfully:', data);
      setOrders(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      console.error('Error fetching user orders:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchAllOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, trackingNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const data = await response.json();
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? data.order : order
        )
      );
      toast.success('Order status updated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Remove automatic fetching - let components handle it manually
  // useEffect(() => {
  //   console.log('OrderContext useEffect triggered, user:', user);
  //   if (user) {
  //     if (user.isAdmin) {
  //       console.log('Fetching all orders for admin');
  //       fetchAllOrders();
  //     } else {
  //       console.log('Fetching user orders for regular user');
  //       fetchUserOrders();
  //     }
  //   } else {
  //     console.log('No user, clearing orders');
  //     setOrders([]);
  //   }
  // }, [user, fetchUserOrders, fetchAllOrders]);

  const value: OrderContextType = {
    orders,
    loading,
    error,
    createOrder,
    fetchUserOrders,
    fetchAllOrders,
    updateOrderStatus,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}; 