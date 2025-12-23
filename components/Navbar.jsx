"use client";

import { useEffect, useState } from "react";
import { FiMenu, FiBell, FiUser } from "react-icons/fi";
import { statisticsAPI } from "@/lib/api";

export default function Navbar({ setSidebarOpen }) {
  // ===============================
  // 🔔 STATE NOTIFIKASI (TAMBAHAN)
  // ===============================
  const [notificationCount, setNotificationCount] = useState(0);

  const hasNotifications = notificationCount > 0;

  // ===============================
  // 🔄 FETCH NOTIFIKASI (TAMBAHAN)
  // ===============================
  const fetchNotifications = async () => {
    try {
      const res = await statisticsAPI.getDashboard();

      const pendingApplications =
        res?.data?.data?.counts?.pendingApplications || 0;

      const unreadContacts =
        res?.data?.data?.counts?.unreadContacts || 0;

      setNotificationCount(pendingApplications + unreadContacts);
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    }
  };

  // ===============================
  // ⏱️ INIT + EVENT LISTENER (TAMBAHAN)
  // ===============================
  useEffect(() => {
    fetchNotifications();

    // dengarkan event dari halaman lain
    const handler = () => fetchNotifications();
    window.addEventListener("refresh-notifications", handler);

    // optional auto refresh tiap 1 menit
    const interval = setInterval(fetchNotifications, 60000);

    return () => {
      window.removeEventListener("refresh-notifications", handler);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <FiMenu size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          Dashboard Admin
        </h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* 🔔 NOTIFICATIONS */}
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
          <FiBell size={20} />

          {/* Badge angka notifikasi */}
          {hasNotifications && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900">Admin</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <FiUser size={20} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
