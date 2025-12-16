"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { setAuthToken, isAuthenticated, getAuthToken } from "@/lib/auth";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function LoginPage() {
  const router = useRouter();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email harus diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email tidak valid";
    }
    if (!formData.password) {
      newErrors.password = "Password harus diisi";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      
      // Debug: Log response untuk melihat format yang diterima
      console.log("Login response:", response);
      console.log("Response data:", response.data);
      
      // Support berbagai format response
      const responseData = response?.data || response;
      const success = responseData?.success !== false; // Default true jika tidak ada field success
      
      // Cari token di berbagai lokasi yang mungkin
      const token = responseData?.token || 
                   responseData?.data?.token || 
                   responseData?.access_token ||
                   responseData?.authToken;
      
      console.log("Token found:", token ? "Yes" : "No");
      
      // Jika ada token, anggap login berhasil
      if (token) {
        setAuthToken(token);
        console.log("Token saved, redirecting to dashboard...");
        
        // Verify token is saved
        const savedToken = getAuthToken();
        console.log("Token verification:", savedToken ? "Saved successfully" : "Failed to save");
        
        // Redirect to dashboard after successful login
        // Using window.location.href to ensure proper navigation and state refresh
        try {
          window.location.href = "/dashboard";
        } catch (err) {
          console.error("Redirect error:", err);
          // Fallback to router
          router.replace("/dashboard");
        }
      } else if (success && responseData?.message) {
        // Jika success tapi tidak ada token, mungkin format berbeda
        setErrorMessage("Login berhasil tetapi token tidak ditemukan. Format response: " + JSON.stringify(responseData));
        console.error("Token not found in response:", responseData);
      } else {
        setErrorMessage(
          responseData?.message || 
          responseData?.error || 
          "Login gagal. Silakan coba lagi."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
      
      // Handle different error types
      if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
        setErrorMessage(
          "Tidak dapat terhubung ke server. Pastikan server API berjalan di http://localhost:3000"
        );
      } else if (error.response?.status === 404) {
        setErrorMessage(
          "Endpoint tidak ditemukan (404). Pastikan server API berjalan dan route /api/auth/login ada."
        );
      } else if (error.response?.status === 500) {
        setErrorMessage(
          `Server error: ${error.response?.data?.message || "Terjadi kesalahan di server. Cek console server untuk detail."}`
        );
      } else if (error.message?.includes("timeout")) {
        setErrorMessage("Request timeout. Server mungkin tidak merespons.");
      } else if (error.response) {
        setErrorMessage(
          error.response?.data?.message || "Login gagal. Silakan coba lagi."
        );
      } else {
        setErrorMessage(
          error.message || "Login gagal. Silakan coba lagi."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PT Souci Indoprima
          </h1>
          <h2 className="text-xl text-gray-600">Admin Dashboard</h2>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <h3 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            Login
          </h3>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="admin@souci.com"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              placeholder="••••••••"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              Login
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          © 2024 PT Souci Indoprima. All rights reserved.
        </p>
      </div>
    </div>
  );
}
