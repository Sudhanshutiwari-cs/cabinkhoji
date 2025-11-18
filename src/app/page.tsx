"use client";

import { useState, KeyboardEvent } from "react";
import { supabase } from "../lib/supabase";

interface Teacher {
  id: number;
  name: string;
  cabin_number: string;
  department: string;
}

type TeacherState = Teacher[] | "notfound" | null;

// SVG Icon Components
const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const UserIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MapPinIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BuildingIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const Loader2Icon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m8-10h-4M6 12H2m15.364-7.364l-2.828 2.828M7.464 17.536l-2.828 2.828m12.728 0l-2.828-2.828M7.464 6.464L4.636 3.636" />
  </svg>
);

const SunIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [teachers, setTeachers] = useState<TeacherState>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const searchTeacher = async (): Promise<void> => {
    if (!query.trim()) return;
    
    setLoading(true);
    setTeachers(null);

    try {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .ilike("name", `%${query}%`);

      if (error) {
        console.error("Error searching teacher:", error);
        return;
      }

      setTeachers(data?.length > 0 ? data : "notfound");
    } catch (error) {
      console.error("Error searching teacher:", error);
      setTeachers("notfound");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      searchTeacher();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Theme classes based on dark mode state
  const themeClasses = {
    background: darkMode 
      ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" 
      : "bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50",
    card: darkMode 
      ? "bg-slate-800/60 backdrop-blur-xl border-slate-700/50" 
      : "bg-white/80 backdrop-blur-xl border-slate-200/60",
    cardHover: darkMode 
      ? "hover:border-slate-500/50" 
      : "hover:border-slate-300/80",
    input: darkMode 
      ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400" 
      : "bg-white/80 border-slate-300/80 text-slate-900 placeholder-slate-500",
    text: {
      primary: darkMode ? "text-white" : "text-slate-900",
      secondary: darkMode ? "text-slate-300" : "text-slate-600",
      muted: darkMode ? "text-slate-400" : "text-slate-500",
    },
    button: {
      gradient: darkMode 
        ? "from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500" 
        : "from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400",
      text: "text-white"
    },
    icon: {
      background: darkMode 
        ? "bg-slate-800 border-slate-700" 
        : "bg-white border-slate-200",
      user: darkMode 
        ? "bg-white/20 border-white/30" 
        : "bg-slate-100/80 border-slate-300/50",
      department: darkMode 
        ? "bg-white/20 text-white/90" 
        : "bg-slate-200/80 text-slate-700",
      cabin: darkMode 
        ? "bg-blue-500/20 border-blue-500/30 text-blue-400" 
        : "bg-blue-100 border-blue-200 text-blue-600"
    },
    result: {
      notfound: darkMode 
        ? "from-red-500/10 to-pink-500/10 border-red-500/20" 
        : "from-red-100 to-pink-100 border-red-200/50",
      teacher: darkMode 
        ? "from-slate-800/80 to-slate-900/80 border-slate-700/50" 
        : "from-white/90 to-slate-50/90 border-slate-200/70",
      cabinCard: darkMode 
        ? "bg-slate-700/50 border-slate-600/50" 
        : "bg-white/90 border-slate-300/70"
    },
    footer: darkMode 
      ? "bg-slate-800/40 border-slate-700/30" 
      : "bg-white/60 border-slate-200/40"
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} flex flex-col items-center p-4 sm:p-8 relative overflow-hidden transition-colors duration-300`}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-32 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse ${
          darkMode ? "bg-purple-500" : "bg-purple-300"
        }`}></div>
        <div className={`absolute -bottom-40 -left-32 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse ${
          darkMode ? "bg-blue-500" : "bg-blue-300"
        }`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse ${
          darkMode ? "bg-cyan-500" : "bg-cyan-300"
        }`} style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleDarkMode}
        className={`absolute top-6 right-6 z-20 p-3 rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
          darkMode 
            ? "bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/60" 
            : "bg-white/80 border-slate-300/60 hover:bg-white"
        }`}
      >
        {darkMode ? (
          <SunIcon className="w-6 h-6 text-yellow-400" />
        ) : (
          <MoonIcon className="w-6 h-6 text-slate-700" />
        )}
      </button>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 mt-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className={`absolute inset-0 rounded-3xl blur opacity-75 ${
                darkMode ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-gradient-to-r from-blue-400 to-purple-500"
              }`}></div>
              <div className={`relative p-4 rounded-3xl border shadow-2xl ${
                themeClasses.icon.background
              }`}>
                <UserIcon className={`w-10 h-10 ${darkMode ? "text-white" : "text-slate-700"}`} />
              </div>
            </div>
            <h1 className={`text-5xl sm:text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent`}>
              Cabin Khojo
            </h1>
          </div>
          <p className={`${themeClasses.text.secondary} text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed`}>
            Find teachers' cabin numbers and departments
          </p>
        </div>

        {/* Search Section */}
        <div className={`${themeClasses.card} backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-12 border relative overflow-hidden transition-colors duration-300`}>
          <div className={`absolute inset-0 bg-gradient-to-br opacity-10 ${
            darkMode ? "from-blue-500/10 to-purple-500/10" : "from-blue-400/10 to-purple-400/10"
          }`}></div>
          <div className="relative">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <SearchIcon className={`w-6 h-6 ${themeClasses.text.muted}`} />
                </div>
                <input
                  type="text"
                  placeholder="Enter teacher's full name or last name..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`w-full pl-14 pr-6 py-5 text-lg border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                    themeClasses.input
                  }`}
                />
              </div>
              <button
                onClick={searchTeacher}
                disabled={loading || !query.trim()}
                className={`px-10 py-5 bg-gradient-to-r ${themeClasses.button.gradient} ${themeClasses.button.text} font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 flex items-center justify-center gap-3 min-w-[180px] group relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                {loading ? (
                  <>
                    <Loader2Icon className="w-6 h-6" />
                    Searching...
                  </>
                ) : (
                  <>
                    <SearchIcon className="w-6 h-6" />
                    Find Teacher
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {teachers === "notfound" && (
            <div className={`bg-gradient-to-br ${themeClasses.result.notfound} backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border animate-fade-in`}>
              <h3 className={`text-3xl font-bold ${themeClasses.text.primary} mb-4`}>Teacher Not Found</h3>
              <p className={`${themeClasses.text.secondary} text-xl mb-6`}>
                No teacher found matching "<span className={themeClasses.text.primary}>{query}</span>"
              </p>
              <p className={themeClasses.text.muted}>
                Please check the spelling or try searching with a different name
              </p>
            </div>
          )}

          {teachers && teachers !== "notfound" && (
            <div className="animate-fade-in">
              {/* Multiple Teachers Found */}
              {teachers.length > 1 && (
                <div className="mb-6 text-center">
                  <h3 className={`text-2xl font-bold ${themeClasses.text.primary} mb-2`}>
                    Found {teachers.length} teachers with the name "{query}"
                  </h3>
                  <p className={themeClasses.text.muted}>Showing all matching results:</p>
                </div>
              )}
              
              <div className={`grid gap-6 ${teachers.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
                {teachers.map((teacher) => (
                  <div 
                    key={teacher.id}
                    className={`bg-gradient-to-br ${themeClasses.result.teacher} backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border transition-colors duration-300`}
                  >
                    {/* Teacher Information */}
                    <div className="p-8 sm:p-10">
                      <div className="flex flex-col items-center text-center mb-8">
                        <div className={`p-4 rounded-2xl backdrop-blur-sm border mb-6 ${
                          themeClasses.icon.user
                        }`}>
                          <UserIcon className={`w-16 h-16 ${themeClasses.text.primary}`} />
                        </div>
                        <h2 className={`text-3xl sm:text-4xl font-bold ${themeClasses.text.primary} mb-2`}>{teacher.name}</h2>
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
                          themeClasses.icon.department
                        }`}>
                          <BuildingIcon className="w-4 h-4 mr-2" />
                          {teacher.department}
                        </div>
                      </div>

                      {/* Cabin Number Card */}
                      <div className="group relative max-w-md mx-auto">
                        <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300`}></div>
                        <div className={`relative ${themeClasses.result.cabinCard} backdrop-blur-sm rounded-2xl p-8 border ${themeClasses.cardHover} transition-all duration-300`}>
                          <div className="flex flex-col items-center gap-4">
                            <div className={`p-4 rounded-xl border ${
                              themeClasses.icon.cabin
                            }`}>
                              <MapPinIcon className="w-12 h-12" />
                            </div>
                            <div className="text-center">
                              <p className={`${themeClasses.text.muted} text-sm font-medium uppercase tracking-wider mb-2`}>Cabin Number</p>
                              <p className={`text-5xl font-bold ${themeClasses.text.primary}`}>{teacher.cabin_number}</p>
                              <p className={`${themeClasses.text.muted} text-sm mt-3`}>Main Building</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!teachers && !loading && (
            <div className="text-center py-16">
              <div className={`inline-flex items-center justify-center p-8 bg-gradient-to-br rounded-3xl shadow-2xl border mb-6 ${
                darkMode ? "from-slate-800 to-slate-900 border-slate-700/50" : "from-white to-slate-100 border-slate-200/50"
              }`}>
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20`}></div>
                  <UserIcon className={`w-20 h-20 ${themeClasses.text.muted} relative`} />
                </div>
              </div>
              <h3 className={`text-2xl font-bold ${themeClasses.text.primary} mb-4`}>Search for a Teacher</h3>
              <p className={`${themeClasses.text.secondary} text-lg max-w-md mx-auto`}>
                Enter a teacher's name to find their cabin number and department
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className={`${themeClasses.footer} backdrop-blur-xl rounded-2xl p-6 transition-colors duration-300`}>
            <p className={themeClasses.text.muted}>
              <span className={themeClasses.text.primary}>Cabin Khojo</span> • 
              Find cabin numbers quickly
            </p>
          </div>
        </footer>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  );
}