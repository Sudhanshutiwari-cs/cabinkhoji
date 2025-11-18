// app/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

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

export default function Home() {
  const [darkMode, setDarkMode] = useState<boolean>(false);

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
        {/* Institute Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* KIT Section */}
          <div className={`rounded-lg ${themeClasses.card} p-6 border-l-4 border-blue-600 transition-colors duration-300`}>
            <h1 className={`text-2xl font-bold ${themeClasses.text.primary} mb-4`}>
              KANPUR INSTITUTE OF TECHNOLOGY
            </h1>
            <p className={`text-sm ${themeClasses.text.muted} mb-2`}>ACCE APPROVED | AKTU AFFILIATED</p>
            
            <div className={`rounded-lg p-4 ${
              darkMode ? "bg-gray-700/50" : "bg-gray-50"
            } transition-colors duration-300`}>
              <h2 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>
                Kanpur Institute of Technology
              </h2>
              <p className={`${themeClasses.text.secondary} mb-2`}>AKTU Code : 165</p>
              <p className={`text-sm ${themeClasses.text.muted} mt-3`}>
                Use <span className={`font-mono font-bold ${themeClasses.text.accent}`}>KIT168</span> as institute code to join college on mobile app.
              </p>
            </div>
          </div>

          {/* KITP Section */}
          <div className={`rounded-lg ${themeClasses.card} p-6 border-l-4 border-green-600 transition-colors duration-300`}>
            <h1 className={`text-2xl font-bold ${themeClasses.text.primary} mb-4`}>
              KANPUR INSTITUTE OF TECHNOLOGY AND PHARMACY
            </h1>
            <p className={`text-sm ${themeClasses.text.muted} mb-2`}>APPROVED | AKTU & BTE AFFILIATED</p>
            
            <div className={`rounded-lg p-4 ${
              darkMode ? "bg-gray-700/50" : "bg-gray-50"
            } transition-colors duration-300`}>
              <h2 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>
                Kanpur Institute of Technology And Pharmacy
              </h2>
              <p className={`${themeClasses.text.secondary} mb-2`}>AKTU Code : 550 & BTE Code : 3380</p>
              <p className={`text-sm ${themeClasses.text.muted} mt-3`}>
                Use <span className={`font-mono font-bold ${darkMode ? "text-green-400" : "text-green-600"}`}>KIT360</span> as institute code to join college on mobile app.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Feature Cards */}
          <div className={`rounded-lg ${themeClasses.card} p-6 transition-colors duration-300`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              darkMode ? "bg-blue-900/30" : "bg-blue-50"
            } mb-4`}>
              <svg className={`w-6 h-6 ${themeClasses.text.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>Easy Location</h3>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              Quickly find faculty cabins and office locations across campus.
            </p>
          </div>

          <div className={`rounded-lg ${themeClasses.card} p-6 transition-colors duration-300`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              darkMode ? "bg-green-900/30" : "bg-green-50"
            } mb-4`}>
              <svg className={`w-6 h-6 ${darkMode ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>Verified Data</h3>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              Accurate and up-to-date information verified by administration.
            </p>
          </div>

          <div className={`rounded-lg ${themeClasses.card} p-6 transition-colors duration-300`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              darkMode ? "bg-purple-900/30" : "bg-purple-50"
            } mb-4`}>
              <svg className={`w-6 h-6 ${darkMode ? "text-purple-400" : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>Quick Search</h3>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              Fast and intuitive search functionality for all faculty members.
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
                Institutional Staff Management
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}