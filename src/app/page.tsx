"use client";

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Search, MapPin, Users, Building, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// --- Interfaces ---
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

// --- Components ---

const Navbar = () => (
  <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200 overflow-hidden">
  <img 
    src="/Logo_main.png" 
    alt="Logo" 
    className="w-full h-full object-cover"
  />
</div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
            Cabin Khojo
          </span>
        </div>

      </div>
    </div>
  </nav>
);

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, color }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-100 transition-all cursor-pointer group"
  >
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
   <Link href="/acode" className="mt-4 flex items-center text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
  Access now <ChevronRight className="w-4 h-4 ml-1" />
</Link>
  </motion.div>
);

const BackgroundBlobs = () => (
  <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob" />
    <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" style={{ animationDelay: '2s' }} />
    <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000" style={{ animationDelay: '4s' }} />
  </div>
);

// --- Main Page Component ---

export default function Home() {
  const [searchTerm, setSearchTerm] = useState<string>('');

  return (
    <div className="min-h-screen bg-slate-50 relative selection:bg-blue-100 selection:text-blue-700 overflow-hidden">
      <BackgroundBlobs />
      <Navbar />

      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">

        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center max-w-4xl w-full mb-20"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold tracking-wide shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Staff Locator System V2.0
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
            Find Faculty & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Navigate Campus
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            The easiest way to locate cabins, departments, and faculty members within the Kanpur Institute of Technology.
          </motion.p>

          {/* Search Bar Component */}
          <motion.div variants={itemVariants} className="flex justify-center">
  <button 
    onClick={() => window.location.href = '/acode'}
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-blue-200 hover:shadow-xl flex items-center gap-2 text-sm"
  >
    Get Started
    <ArrowRight className="w-4 h-4" />
  </button>
</motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 mb-20 w-full"
        >
          <FeatureCard
            icon={Users}
            title="Faculty Directory"
            description="Browse the complete list of professors and staff sorted by department."
            color="bg-emerald-500"
          />
          <FeatureCard
            icon={MapPin}
            title="Campus Navigation"
            description="Get turn-by-turn directions to any cabin, lab, or lecture hall."
            color="bg-blue-500"
          />
          <FeatureCard
            icon={Building}
            title="Institute Portal"
            description="Secure admin access for staff management and cabin allocation."
            color="bg-indigo-500"
          />
        </motion.div>

        {/* Footer Info */}
        <div className="text-center border-t border-gray-200 pt-8 w-full">
          <p className="text-gray-400 text-sm">© 2025 Cabin Khojo. Made with ❤️</p>
        </div>
      </main>
    </div>
  );
}