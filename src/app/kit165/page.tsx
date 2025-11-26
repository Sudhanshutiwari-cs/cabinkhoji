"use client";

import { useState, KeyboardEvent } from "react";
import { supabase } from "../../lib/supabase";

interface Teacher {
  id: number;
  name: string;
  cabin_number: string;
  department: string;
}

type TeacherState = Teacher[] | "notfound" | null;

// Professional Icon Components
const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const UserIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LocationIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DepartmentIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const CloseIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

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

const BuildingIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [teachers, setTeachers] = useState<TeacherState>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const searchTeacher = async (): Promise<void> => {
  if (!query.trim()) return;
  
  setLoading(true);
  setTeachers(null);

  try {
    console.log('Searching for:', query); // Debug log
    
    const { data, error, status } = await supabase
      .from("teachers")
      .select("*")
      .ilike("name", `%${query}%`);

    console.log('Supabase response:', { data, error, status }); // Debug log

    if (error) {
      console.error("Supabase error:", error);
      setTeachers("notfound");
      return;
    }

    if (!data) {
      console.error("No data returned from Supabase");
      setTeachers("notfound");
      return;
    }

    setTeachers(data.length > 0 ? data : "notfound");
    
  } catch (error) {
    console.error("Unexpected error searching teacher:", error);
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

  const clearSearch = (): void => {
    setQuery("");
    setTeachers(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Professional theme classes
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
      
      {/* Header */}
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className={`rounded-lg ${themeClasses.card} p-6 transition-colors duration-300`}>
            <div className="mb-6">
              <h2 className={`text-xl font-semibold ${themeClasses.text.primary} mb-2`}>
                Kanpur Instiute of Technology Faculty Search
              </h2>
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                Search for faculty members by name to locate their cabin and department information
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <SearchIcon className={`w-4 h-4 ${themeClasses.text.muted}`} />
                </div>
                <input
                  type="text"
                  placeholder="Enter faculty name..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`w-full pl-10 pr-10 py-3 text-sm border rounded-lg focus:outline-none transition-colors duration-200 ${themeClasses.input}`}
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors duration-200 ${
                      darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
                    }`}
                  >
                    <CloseIcon className={`w-3 h-3 ${themeClasses.text.muted}`} />
                  </button>
                )}
              </div>
              <button
                onClick={searchTeacher}
                disabled={loading || !query.trim()}
                className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center ${
                  loading || !query.trim() 
                    ? themeClasses.button.disabled 
                    : themeClasses.button.primary
                }`}
              >
                {loading ? (
                  <>
                    <div className={`w-4 h-4 border-2 rounded-full animate-spin border-t-transparent ${
                      darkMode ? "border-gray-400" : "border-gray-500"
                    }`} />
                    Searching
                  </>
                ) : (
                  <>
                    <SearchIcon className="w-4 h-4" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {/* No Results */}
          {teachers === "notfound" && (
            <div className={`rounded-lg border ${themeClasses.status.error} p-6 text-center animate-fade-in`}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className={`font-medium mb-2 ${themeClasses.text.primary}`}>No Faculty Found</h3>
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                No results found for "<span className={themeClasses.text.primary}>"{query}"</span>"
              </p>
              <p className={`text-xs ${themeClasses.text.muted} mt-2`}>
                Please check the spelling or try a different name
              </p>
            </div>
          )}

          {/* Multiple Results Header */}
          {teachers && teachers !== "notfound" && teachers.length > 1 && (
            <div className={`rounded-lg ${themeClasses.status.info} p-4 animate-fade-in`}>
              <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
                Found {teachers.length} results for "{query}"
              </p>
            </div>
          )}

          {/* Teacher Cards */}
          {teachers && teachers !== "notfound" && (
            <div className="grid gap-4 animate-fade-in">
              {teachers.map((teacher, index) => (
                <div
                  key={teacher.id}
                  className={`rounded-lg ${themeClasses.card} p-6 transition-all duration-300 hover:shadow-md`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        darkMode ? "bg-blue-900/30" : "bg-blue-50"
                      }`}>
                        <UserIcon className={`w-6 h-6 ${themeClasses.text.accent}`} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-1`}>
                          {teacher.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <DepartmentIcon className={`w-4 h-4 ${themeClasses.text.muted}`} />
                            <span className={themeClasses.text.secondary}>{teacher.department}</span>
                          </div>
                          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                         
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cabin Information */}
                  <div className={`rounded-lg p-4 ${
                    darkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          darkMode ? "bg-blue-900/30" : "bg-blue-100"
                        }`}>
                          <LocationIcon className={`w-5 h-5 ${themeClasses.text.accent}`} />
                        </div>
                        <div>
                          <p className={`text-xs font-medium uppercase tracking-wide ${themeClasses.text.muted} mb-1`}>
                            Cabin Number
                          </p>
                          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
                            {teacher.cabin_number}
                          </p>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Initial State */}
          {!teachers && !loading && (
            <div className={`rounded-lg ${themeClasses.card} p-12 text-center transition-colors duration-300`}>
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}>
                <UserIcon className={`w-8 h-8 ${themeClasses.text.muted}`} />
              </div>
              <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>
                Search Faculty Directory
              </h3>
              <p className={`text-sm ${themeClasses.text.secondary} max-w-md mx-auto`}>
                Enter a faculty member's name in the search bar above to find their cabin location, 
                department, and contact information.
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className={`rounded-lg ${themeClasses.card} p-12 text-center animate-pulse`}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto"></div>
            </div>
          )}
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

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(8px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}