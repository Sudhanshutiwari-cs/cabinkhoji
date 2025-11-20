// app/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Professional Icon Components
const SunIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

// Feature Icons
const SearchIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PassIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const LocationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function Home() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const router = useRouter();

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      const isDark = saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      setDarkMode(isDark);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
      
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // Handle option clicks
  const handleFindCabin = () => {
    router.push('/kit165');
  };

  const handleGetGatepass = () => {
    router.push('/service/role');
  };

  const handleBothOptions = () => {
    router.push('/both');
  };

  // Professional theme classes - exactly like in the provided code
  const themeClasses = {
    background: darkMode 
      ? "bg-gray-900" 
      : "bg-gray-50",
    header: darkMode
      ? "bg-gray-800 border-b border-gray-700"
      : "bg-white border-b border-gray-200",
    card: darkMode 
      ? "bg-gray-800 border border-gray-700" 
      : "bg-white border border-gray-200",
    input: darkMode 
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
    button: {
      primary: darkMode 
        ? "bg-blue-600 hover:bg-blue-700 text-white border border-blue-700" 
        : "bg-blue-600 hover:bg-blue-700 text-white border border-blue-700",
      secondary: darkMode
        ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300",
      disabled: darkMode 
        ? "bg-gray-800 text-gray-500 border-gray-700" 
        : "bg-gray-100 text-gray-400 border-gray-300"
    },
    text: {
      primary: darkMode ? "text-white" : "text-gray-900",
      secondary: darkMode ? "text-gray-300" : "text-gray-600",
      muted: darkMode ? "text-gray-400" : "text-gray-500",
      accent: darkMode ? "text-blue-400" : "text-blue-600"
    },
    status: {
      success: darkMode ? "bg-green-900/20 text-green-400 border-green-800" : "bg-green-50 text-green-700 border-green-200",
      error: darkMode ? "bg-red-900/20 text-red-400 border-red-800" : "bg-red-50 text-red-700 border-red-200",
      info: darkMode ? "bg-blue-900/20 text-blue-400 border-blue-800" : "bg-blue-50 text-blue-700 border-blue-200"
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} transition-colors duration-300`}>
      {/* Navigation */}
      <header className={`${themeClasses.header} sticky top-0 z-50 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                darkMode ? "" : ""
              }`}>
                <img 
                  src="/Logo_main.png" 
                  alt="Logo" 
                  className="w-18 h-18 object-contain"
                />
              </div>
              <div>
                <h1 className={`text-lg font-semibold ${themeClasses.text.primary}`}>Cabin Khojo</h1>
                <p className={`text-xs ${themeClasses.text.muted}`}>Staff Locator System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  darkMode 
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-600 text-yellow-400" 
                    : "bg-white border-gray-300 hover:bg-gray-50 text-gray-600"
                }`}
              >
                {darkMode ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold ${themeClasses.text.primary} mb-4`}>
            Welcome to Cabin Khojo
          </h1>
          <p className={`text-xl ${themeClasses.text.secondary} max-w-2xl mx-auto`}>
            Your comprehensive staff management and campus navigation solution
          </p>
        </div>

        {/* Three Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Option 1: Find the Cabin */}
          <div 
            onClick={handleFindCabin}
            className={`rounded-lg ${themeClasses.card} p-8 border-l-4 border-blue-600 transition-colors duration-300 cursor-pointer hover:shadow-lg transform hover:-translate-y-2 transition-all duration-200 text-center`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
              darkMode ? "bg-blue-900/30" : "bg-blue-50"
            }`}>
              <LocationIcon className={`w-8 h-8 ${themeClasses.text.accent}`} />
            </div>
            <h2 className={`text-2xl font-bold ${themeClasses.text.primary} mb-4`}>
              Find the Cabin
            </h2>
            <p className={`${themeClasses.text.secondary} mb-6`}>
              Locate faculty cabins and office locations across campus with our interactive map and search system.
            </p>
            <div className={`inline-flex items-center ${themeClasses.text.accent} font-semibold`}>
              Get Directions
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Option 2: Get Your Gatepass */}
          <div 
            onClick={handleGetGatepass}
            className={`rounded-lg ${themeClasses.card} p-8 border-l-4 border-green-600 transition-colors duration-300 cursor-pointer hover:shadow-lg transform hover:-translate-y-2 transition-all duration-200 text-center`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
              darkMode ? "bg-green-900/30" : "bg-green-50"
            }`}>
              <PassIcon className={`w-8 h-8 ${darkMode ? "text-green-400" : "text-green-600"}`} />
            </div>
            <h2 className={`text-2xl font-bold ${themeClasses.text.primary} mb-4`}>
              Get Your Gatepass
            </h2>
            <p className={`${themeClasses.text.secondary} mb-6`}>
              Generate and manage your gate passes for campus access with our streamlined digital process.
            </p>
            <div className={`inline-flex items-center ${darkMode ? "text-green-400" : "text-green-600"} font-semibold`}>
              Generate Pass
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Option 3: Both Options */}
          <div 
            onClick={handleBothOptions}
            className={`rounded-lg ${themeClasses.card} p-8 border-l-4 border-purple-600 transition-colors duration-300 cursor-pointer hover:shadow-lg transform hover:-translate-y-2 transition-all duration-200 text-center`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
              darkMode ? "bg-purple-900/30" : "bg-purple-50"
            }`}>
              <SearchIcon className={`w-8 h-8 ${darkMode ? "text-purple-400" : "text-purple-600"}`} />
            </div>
            <h2 className={`text-2xl font-bold ${themeClasses.text.primary} mb-4`}>
              Both Services
            </h2>
            <p className={`${themeClasses.text.secondary} mb-6`}>
              Access both cabin location services and gatepass management in one comprehensive dashboard.
            </p>
            <div className={`inline-flex items-center ${darkMode ? "text-purple-400" : "text-purple-600"} font-semibold`}>
              Access All
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Feature Cards */}
          <div className={`rounded-lg ${themeClasses.card} p-6 transition-colors duration-300`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              darkMode ? "bg-blue-900/30" : "bg-blue-50"
            } mb-4`}>
              <LocationIcon className={`w-6 h-6 ${themeClasses.text.accent}`} />
            </div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>Easy Location</h3>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              Quickly find faculty cabins and office locations across campus with detailed directions.
            </p>
          </div>

          <div className={`rounded-lg ${themeClasses.card} p-6 transition-colors duration-300`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              darkMode ? "bg-green-900/30" : "bg-green-50"
            } mb-4`}>
              <PassIcon className={`w-6 h-6 ${darkMode ? "text-green-400" : "text-green-600"}`} />
            </div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>Digital Gatepass</h3>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              Generate and manage gate passes digitally with instant verification and approval.
            </p>
          </div>

          <div className={`rounded-lg ${themeClasses.card} p-6 transition-colors duration-300`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              darkMode ? "bg-purple-900/30" : "bg-purple-50"
            } mb-4`}>
              <SearchIcon className={`w-6 h-6 ${darkMode ? "text-purple-400" : "text-purple-600"}`} />
            </div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>Quick Access</h3>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              Fast and intuitive access to all campus services through a unified platform.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t ${
        darkMode ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"
      } transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-sm ${themeClasses.text.muted}`}>
                © 2025 Cabin Khojo
              </p>
            </div>
            <div>
              <p className={`text-sm ${themeClasses.text.muted}`}>
                Institutional Staff Management & Gatepass System
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}