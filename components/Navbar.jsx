"use client";

import { useEffect, useRef, useState } from "react";
import { FiMenu, FiBell, FiUser, FiMail, FiFileText } from "react-icons/fi";
import { statisticsAPI, contactAPI, applicationsAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Navbar({ setSidebarOpen }) {
  const router = useRouter();
  const dropdownRef = useRef(null);

  const [notificationCount, setNotificationCount] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [open, setOpen] = useState(false);

  const hasNotifications = notificationCount > 0;

  // ===============================
  // FETCH NOTIFICATIONS
  // ===============================
  const fetchNotifications = async () => {
    try {
      // reset agar tidak pakai data lama
      setContacts([]);
      setApplications([]);

      const stats = await statisticsAPI.getDashboard();

      const pendingApplicationsCount =
        stats?.data?.data?.counts?.pendingApplications || 0;
      const unreadContactsCount =
        stats?.data?.data?.counts?.unreadContacts || 0;

      setNotificationCount(
        pendingApplicationsCount + unreadContactsCount
      );

      // dropdown content
      const [contactsRes, appsRes] = await Promise.all([
        contactAPI.getAll({ status: "new", limit: 3 }),
        applicationsAPI.getAll({ status: "pending", limit: 3 }),
      ]);

      setContacts(contactsRes?.data?.data || []);
      setApplications(appsRes?.data?.data || []);
    } catch (err) {
      console.error("Notifikasi error:", err);
    }
  };

  // ===============================
  // INIT & EVENTS
  // ===============================
  useEffect(() => {
    fetchNotifications();

    const handler = () => fetchNotifications();
    window.addEventListener("refresh-notifications", handler);

    const interval = setInterval(fetchNotifications, 60000);

    return () => {
      window.removeEventListener("refresh-notifications", handler);
      clearInterval(interval);
    };
  }, []);

  // ===============================
  // CLICK OUTSIDE CLOSE
  // ===============================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===============================
  // FILTER PENDING APPLICATIONS
  // ===============================
  const pendingApplications = applications.filter(
    (a) => a.status === "pending"
  );

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen((p) => !p)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <FiMenu size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          Dashboard Admin
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {/* 🔔 NOTIFICATION BUTTON */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <FiBell size={20} />
          {hasNotifications && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>

        {/* 🔽 DROPDOWN */}
        {open && (
          <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
            <div className="px-4 py-3 border-b font-semibold text-gray-900">
              Notifikasi
            </div>
 
            {/* Contacts */}
            {contacts.map((c) => (
              <button
                key={`contact-${c.id}`}
                onClick={() => {
                  router.push("/dashboard/contact");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3"
              >
                <FiMail className="text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Pesan baru dari {c.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {c.subject}
                  </p>
                </div>
              </button>
            ))}

            {/* Applications */}
            {pendingApplications.map((a) => (
              <button
                key={`app-${a.id}`}
                onClick={() => {
                  router.push("/dashboard/applications");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3"
              >
                <FiFileText className="text-green-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Lamaran baru: {a.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {a.job_title}
                  </p>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                    pending
                  </span>
                </div>
              </button>
            ))}

            {/* EMPTY STATE */}
            {!contacts.length && !pendingApplications.length && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                Tidak ada notifikasi terbaru
              </div>
            )}
          </div>
        )}

        {/* User */}
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
