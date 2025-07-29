import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
  description: string;
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
    price: '₹1,299',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80',
    category: 'necklaces',
    description: 'Elegant diamond pendant necklace featuring a stunning solitaire diamond set in 18k white gold. Perfect for special occasions.'
  },
  {
    id: 2,
    name: 'Pearl String Necklace',
    price: '₹899',
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80',
    category: 'necklaces',
    description: 'Classic pearl string necklace with perfectly matched cultured pearls. A timeless piece for any collection.'
  },
  {
    id: 3,
    name: 'Classic Diamond Ring',
    price: '₹999',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80',
    category: 'rings',
    description: 'Beautiful diamond ring featuring a round brilliant cut diamond in a classic setting. Ideal for engagements.'
  },
  {
    id: 4,
    name: 'Pearl Drop Earrings',
    price: '₹499',
    image: 'https://images.unsplash.com/photo-1635767798638-3665c302e27c?auto=format&fit=crop&q=80',
    category: 'earrings',
    description: 'Elegant pearl drop earrings with diamond accents. Perfect for both formal events and everyday wear.'
  }
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with data from localStorage or initial products
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('products');
    let loaded = savedProducts ? JSON.parse(savedProducts) : initialProducts;
    // Migrate price to number if needed
    loaded = loaded.map((p: any) => ({
      ...p,
      price: typeof p.price === 'string' ? Number(p.price.replace(/[^\d.]/g, '')) : p.price
    }));
    return loaded;
  });

  // Save to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    const newProduct = { ...product, id: newId, price: Number(product.price) };
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