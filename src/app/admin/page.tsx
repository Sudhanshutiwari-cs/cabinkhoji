"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

interface Teacher {
  id: number;
  name: string;
  cabin_number: string;
  department: string;
  created_at?: string;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });
  const [loginError, setLoginError] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    cabin_number: "",
    department: ""
  });
  
  // Add Students state
  const [activeTab, setActiveTab] = useState<"teachers" | "students">("teachers");
  const [file, setFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Get admin credentials from environment variables
  const getAdminCredentials = () => {
    // For client-side, we can use NEXT_PUBLIC_ prefix
    const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    // Fallback to defaults if env vars are not set (for development)
   return {
  username: adminUsername,
  password: adminPassword
};

  };

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const { username: adminUsername, password: adminPassword } = getAdminCredentials();

    if (loginData.username === adminUsername && loginData.password === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuthenticated", "true");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuthenticated");
    setLoginData({ username: "", password: "" });
  };

  // Check if user is already authenticated
  useEffect(() => {
    const authenticated = sessionStorage.getItem("adminAuthenticated");
    if (authenticated === "true") {
      setIsAuthenticated(true);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch all teachers (only when authenticated)
  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .order("name");

      if (error) {
        throw error;
      }

      setTeachers(data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      alert("Error fetching teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeachers();
    }
  }, [isAuthenticated]);

  // Handle login input changes
  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      cabin_number: "",
      department: ""
    });
    setEditingTeacher(null);
  };

  // Add new teacher
  const addTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("teachers")
        .insert([formData])
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setTeachers(prev => [...prev, data[0]]);
        resetForm();
        alert("Teacher added successfully!");
      }
    } catch (error) {
      console.error("Error adding teacher:", error);
      alert("Error adding teacher");
    } finally {
      setSaving(false);
    }
  };

  // Update teacher
  const updateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("teachers")
        .update(formData)
        .eq("id", editingTeacher.id)
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setTeachers(prev => 
          prev.map(teacher => 
            teacher.id === editingTeacher.id ? data[0] : teacher
          )
        );
        resetForm();
        alert("Teacher updated successfully!");
      }
    } catch (error) {
      console.error("Error updating teacher:", error);
      alert("Error updating teacher");
    } finally {
      setSaving(false);
    }
  };

  // Delete teacher
  const deleteTeacher = async (id: number) => {
    if (!confirm("Are you sure you want to delete this teacher?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("teachers")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      setTeachers(prev => prev.filter(teacher => teacher.id !== id));
      alert("Teacher deleted successfully!");
    } catch (error) {
      console.error("Error deleting teacher:", error);
      alert("Error deleting teacher");
    }
  };

  // Start editing a teacher
  const startEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      cabin_number: teacher.cabin_number,
      department: teacher.department
    });
  };

  // Bulk upload students
  const uploadStudents = async () => {
    if (!file) return alert("Please upload a JSON file");
    setUploadLoading(true);
    setLogs([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/bulk-create-users", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setLogs(data.logs || []);
      
      if (res.ok) {
        alert("Students uploaded successfully!");
        setFile(null);
      } else {
        alert("Error uploading students: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading students");
    } finally {
      setUploadLoading(false);
    }
  };

  // Filter teachers based on search
  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.cabin_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Common departments
  const departments = [
    "Electrical and Electronics",
    "Electronics and Communication",
    "HRM Office",
    "Library",
    "Mechanical Engineering",
    "Registrar Office",
    "Technology Department",
    "Training and Placement",
    "Computer Application",
    "Biotechnology",
    "Business Administration",
    "Applied Science and Humanities",
    "Admission Cell",
    "Computer Science",
    "Administration",
    "Physics Department",
    "Mathematics Department",
    "Microbiology Department",
    "Chemistry Department",
    "Psychology Department",
    "PCRC",
    "SDC",
  ];

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your credentials to access the admin panel
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={loginData.username}
                  onChange={handleLoginInputChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={loginData.password}
                  onChange={handleLoginInputChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            {loginError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {loginError}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div>
          </form>
          {/* Removed default credentials hint for security */}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Logout */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="mt-2 text-gray-600">Manage teachers and students</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("teachers")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "teachers"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Teacher Management
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "students"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Bulk Add Students
            </button>
          </nav>
        </div>

        {/* Teachers Tab */}
        {activeTab === "teachers" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
                </h2>

                <form onSubmit={editingTeacher ? updateTeacher : addTeacher}>
                  <div className="space-y-4">
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter teacher's full name"
                      />
                    </div>

                    {/* Cabin Number Field */}
                    <div>
                      <label htmlFor="cabin_number" className="block text-sm font-medium text-gray-700 mb-1">
                        Cabin Number *
                      </label>
                      <input
                        type="text"
                        id="cabin_number"
                        name="cabin_number"
                        required
                        value={formData.cabin_number}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., A101, B205"
                      />
                    </div>

                    {/* Department Field */}
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                        Department *
                      </label>
                      <select
                        id="department"
                        name="department"
                        required
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {saving ? "Saving..." : editingTeacher ? "Update Teacher" : "Add Teacher"}
                      </button>

                      {editingTeacher && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Stats Card */}
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{teachers.length}</div>
                    <div className="text-sm text-gray-600">Total Teachers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {new Set(teachers.map(t => t.department)).size}
                    </div>
                    <div className="text-sm text-gray-600">Departments</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Teacher List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Search and Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Teachers ({filteredTeachers.length})
                    </h2>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search teachers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teacher Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cabin Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTeachers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            {searchTerm ? "No teachers found matching your search." : "No teachers added yet."}
                          </td>
                        </tr>
                      ) : (
                        filteredTeachers.map((teacher) => (
                          <tr key={teacher.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-mono">{teacher.cabin_number}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {teacher.department}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => startEdit(teacher)}
                                className="text-blue-600 hover:text-blue-900 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteTeacher(teacher.id)}
                                className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="max-w-4xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Bulk Add Students
              </h2>
              <p className="text-gray-600 mb-6">
                Upload a JSON file to bulk create student accounts with Supabase Auth and Profiles.
              </p>

              <div className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload JSON File
                  </label>
                  <input
                    type="file"
                    accept="application/json"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    JSON file should contain an array of student objects with email, password, and profile data.
                  </p>
                </div>

                {/* Upload Button */}
                <button
                  onClick={uploadStudents}
                  disabled={uploadLoading || !file}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadLoading ? "Uploading..." : "Upload & Create Students"}
                </button>

                {/* Logs */}
                {logs.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Upload Logs:</h3>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                      <pre className="text-green-400 whitespace-pre-wrap overflow-auto max-h-96">
                        {logs.join("\n")}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">JSON Format Example:</h4>
                  <pre className="text-xs text-blue-700 bg-blue-100 p-3 rounded overflow-auto">
{`[
  {
    "email": "student1@college.edu",
    "password": "securepassword123",
    "user_metadata": {
      "full_name": "John Doe",
      "roll_number": "2023001"
    }
  },
  {
    "email": "student2@college.edu", 
    "password": "securepassword456",
    "user_metadata": {
      "full_name": "Jane Smith",
      "roll_number": "2023002"
    }
  }
]`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}