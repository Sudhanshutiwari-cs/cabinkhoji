// app/role-selection/page.tsx
'use client';

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

// Role Icons
const StudentIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const HODIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const GuardIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function RoleSelection() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
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

  // Handle role selection
  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    
    // Redirect based on selected role
    switch(role) {
      case 'student':
        router.push('/student-dashboard');
        break;
      case 'hod':
        router.push('/hod-dashboard');
        break;
      case 'guard':
        router.push('/guard-dashboard');
        break;
      default:
        break;
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

  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'Find faculty cabins, generate gate passes, and access campus services',
      icon: StudentIcon,
      color: 'blue',
      features: ['Find Faculty Cabins', 'Generate Gate Pass', 'View Campus Map']
    },
    {
      id: 'hod',
      title: 'HOD / Faculty',
      description: 'Manage department, approve requests, and access administrative features',
      icon: HODIcon,
      color: 'green',
      features: ['Manage Department', 'Approve Requests', 'Faculty Dashboard']
    },
    {
      id: 'guard',
      title: 'Security Guard',
      description: 'Verify gate passes, monitor campus access, and manage security logs',
      icon: GuardIcon,
      color: 'orange',
      features: ['Verify Gate Pass', 'Monitor Access', 'Security Logs']
    }
  ];

  const getColorClasses = (color: string, isDark: boolean) => {
    const colors = {
      blue: {
        border: 'border-blue-600',
        bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50',
        text: isDark ? 'text-blue-400' : 'text-blue-600',
        hover: isDark ? 'hover:bg-blue-800/40' : 'hover:bg-blue-100'
      },
      green: {
        border: 'border-green-600',
        bg: isDark ? 'bg-green-900/30' : 'bg-green-50',
        text: isDark ? 'text-green-400' : 'text-green-600',
        hover: isDark ? 'hover:bg-green-800/40' : 'hover:bg-green-100'
      },
      orange: {
        border: 'border-orange-600',
        bg: isDark ? 'bg-orange-900/30' : 'bg-orange-50',
        text: isDark ? 'text-orange-400' : 'text-orange-600',
        hover: isDark ? 'hover:bg-orange-800/40' : 'hover:bg-orange-100'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
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
                <p className={`text-xs ${themeClasses.text.muted}`}>Role Selection</p>
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
            Select Your Role
          </h1>
          <p className={`text-xl ${themeClasses.text.secondary} max-w-2xl mx-auto`}>
            Choose your role to access the appropriate features and services
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {roles.map((role) => {
            const colorClasses = getColorClasses(role.color, darkMode);
            const IconComponent = role.icon;
            
            return (
              <div 
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`rounded-lg ${themeClasses.card} p-8 border-l-4 ${colorClasses.border} transition-colors duration-300 cursor-pointer hover:shadow-lg transform hover:-translate-y-2 transition-all duration-200`}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${colorClasses.bg} ${colorClasses.hover}`}>
                  <IconComponent className={`w-10 h-10 ${colorClasses.text}`} />
                </div>
                
                <h2 className={`text-2xl font-bold ${themeClasses.text.primary} mb-4 text-center`}>
                  {role.title}
                </h2>
                
                <p className={`${themeClasses.text.secondary} mb-6 text-center`}>
                  {role.description}
                </p>

                {/* Features List */}
                <div className="space-y-2 mb-6">
                  {role.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${colorClasses.bg}`}></div>
                      <span className={`text-sm ${themeClasses.text.secondary}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={`text-center ${colorClasses.text} font-semibold flex items-center justify-center`}>
                  Select Role
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Feature Cards */}
          <div className={`rounded-lg ${themeClasses.card} p-6 transition-colors duration-300`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              darkMode ? "bg-blue-900/30" : "bg-blue-50"
            } mb-4`}>
              <StudentIcon className={`w-6 h-6 ${themeClasses.text.accent}`} />
            </div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>Student Access</h3>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              Find faculty locations and manage your campus access requirements.
            </p>
          </div>

          <div className={`rounded-lg ${themeClasses.card} p-6 transition-colors duration-300`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              darkMode ? "bg-green-900/30" : "bg-green-50"
            } mb-4`}>
              <HODIcon className={`w-6 h-6 ${darkMode ? "text-green-400" : "text-green-600"}`} />
            </div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>Faculty Tools</h3>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              Administrative features for department management and approvals.
            </p>
          </div>

          <div className={`rounded-lg ${themeClasses.card} p-6 transition-colors duration-300`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              darkMode ? "bg-orange-900/30" : "bg-orange-50"
            } mb-4`}>
              <GuardIcon className={`w-6 h-6 ${darkMode ? "text-orange-400" : "text-orange-600"}`} />
            </div>
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>Security Portal</h3>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              Campus security management and gate pass verification system.
            </p>
          </div>
        </div>

        {/* Help Section */}
        <div className={`rounded-lg ${themeClasses.card} p-6 text-center transition-colors duration-300`}>
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>
            Need Help Selecting Your Role?
          </h3>
          <p className={`text-sm ${themeClasses.text.secondary} mb-4`}>
            Contact your department administrator or campus IT support for assistance.
          </p>
          <button className={`px-4 py-2 rounded-lg ${themeClasses.button.secondary} text-sm transition-colors duration-200`}>
            Contact Support
          </button>
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
                Multi-role Access System
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}