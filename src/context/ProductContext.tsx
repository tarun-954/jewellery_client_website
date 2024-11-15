import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: number) => void;
  getProductsByCategory: (category: string) => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Initial products data
const initialProducts = [
  {
    id: 1,
    name: 'Diamond Pendant Necklace',
    price: '$1,299',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80',
    category: 'necklaces'
  },
  {
    id: 2,
    name: 'Pearl String Necklace',
    price: '$899',
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80',
    category: 'necklaces'
  },
  {
    id: 3,
    name: 'Classic Diamond Ring',
    price: '$999',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80',
    category: 'rings'
  },
  {
    id: 4,
    name: 'Pearl Drop Earrings',
    price: '$499',
    image: 'https://images.unsplash.com/photo-1635767798638-3665c302e27c?auto=format&fit=crop&q=80',
    category: 'earrings'
  }
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with data from localStorage or initial products
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : initialProducts;
  });

  // Save to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    const newProduct = { ...product, id: newId };
    setProducts(prev => [...prev, newProduct]);
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProductsByCategory = (category: string) => {
    return products.filter(product => product.category === category);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, deleteProduct, getProductsByCategory }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};