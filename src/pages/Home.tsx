import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Diamond, Crown, Star, Gift, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const categories = [
  {
    id: 'necklaces',
    title: 'Necklaces',
    image: 'https://manubhai.in/SocialMedia/post_artworks/DGBD00687.jpg',
    description: 'Elegant necklaces for every occasion',
  },
  {
    id: 'rings',
    title: 'Rings',
    image: 'https://i.pinimg.com/736x/ba/74/fe/ba74fe7c786f48c04adc7323151eb19a.jpg',
    description: 'Stunning rings that make a statement',
  },
  {
    id: 'earrings',
    title: 'Earrings',
    image: 'https://s.alicdn.com/@sc04/kf/Had25b49c47c147228551a231a0e7ff7dJ.png_720x720q50.png',
    description: 'Beautiful earrings for everyday wear',
  },
  {
    id: 'bracelets',
    title: 'Bracelets',
    image: 'https://i.pinimg.com/736x/13/5d/04/135d0451d1fb11cb97d4b94e604bd8d7.jpg',
    description: 'Timeless bracelets for any style',
  },
  {
    id: 'wedding',
    title: 'Wedding Collection',
    image: 'https://shaadiwish.com/blog/wp-content/uploads/2023/02/Kiara-Advani-and-Sidharth-Malhotra%E2%80%99s-Dreamy-Jaisalmer-Wedding-1.jpg',
    description: 'Special pieces for your special day',
  },
  {
    id: 'luxury',
    title: 'Luxury Collection',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80',
    description: 'Exclusive pieces for the discerning',
  },
];

const features = [
  {
    icon: Diamond,
    title: 'Premium Quality',
    description: 'Finest materials and craftsmanship',
  },
  {
    icon: Crown,
    title: 'Unique Designs',
    description: 'Handcrafted with passion',
  },
  {
    icon: Heart,
    title: 'Customer Love',
    description: 'Trusted by thousands',
  },
  {
    icon: Star,
    title: 'Expert Selection',
    description: 'Curated by jewelry experts',
  },
  {
    icon: Gift,
    title: 'Perfect Packaging',
    description: 'Beautiful gift presentation',
  },
  {
    icon: Clock,
    title: 'Timeless Pieces',
    description: 'Enduring style and quality',
  },
];

// Animation variants
const fadeInFromTop = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0, transition: { duration: 1 } },
};

const Home = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[80vh] bg-neutral-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            {/* Text Content */}
            <motion.div
              className="max-w-xl"
              variants={fadeInFromTop}
              initial="hidden"
              animate="visible"
            >
              <h1 className="text-6xl font-serif text-white mb-6">
                Experience the Brilliance of Craftsmanship
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Discover our exquisite collection of handcrafted jewelry pieces that tell your unique story.
              </p>
              {user?.isAdmin ? (
                <Link to="/admin">
                  <button className="bg-amber-800 text-white px-8 py-4 rounded-md hover:bg-amber-900 transition text-lg">
                    Go to Dashboard
                  </button>
                </Link>
              ) : (
                <Link to="/category/necklaces">
                  <button className="bg-amber-800 text-white px-8 py-4 rounded-md hover:bg-amber-900 transition text-lg">
                    Explore Collection
                  </button>
                </Link>
              )}
            </motion.div>
            {/* Hero Image */}
            <motion.div
              className="hidden md:block max-w-md"
              variants={fadeInFromTop}
              initial="hidden"
              animate="visible"
            >
              <img
               
               src="https://i.ibb.co/F671pGt/2f166e495b5091a9a45347a90c89ec74.png" 
                alt="Girl wearing jewelry"
                className="rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif text-center mb-16">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center group"
                variants={fadeInFromTop}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <feature.icon className="w-12 h-12 mx-auto text-amber-800 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-serif text-center mb-16">Our Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                variants={fadeInFromTop}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <Link to={`/category/${category.id}`} className="group">
                  <div className="relative overflow-hidden rounded-lg aspect-[4/5]">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="object-cover w-full h-full group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8">
                      <h3 className="text-white text-2xl font-serif mb-2">
                        {category.title}
                      </h3>
                      <p className="text-white/80 group-hover:opacity-100 transition-opacity">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
