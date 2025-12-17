"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiHome, FiFileText, FiBriefcase, FiMail, FiMessageSquare, FiBarChart2, FiSettings, FiX, FiLogOut, FiUser } from "react-icons/fi";
import { removeAuthToken } from "@/lib/auth";

const menuItems = [
  { href: "/dashboard", icon: FiHome, label: "Dashboard" },
  { href: "/dashboard/news", icon: FiFileText, label: "Berita" },
  { href: "/dashboard/jobs", icon: FiBriefcase, label: "Lowongan Kerja" },
  { href: "/dashboard/applications", icon: FiUser, label: "Lamaran" },
  { href: "/dashboard/contact", icon: FiMail, label: "Pesan Kontak" },
  { href: "/dashboard/testimonials", icon: FiMessageSquare, label: "Testimoni" },
  { href: "/dashboard/statistics", icon: FiBarChart2, label: "Statistik" },
  { href: "/dashboard/settings", icon: FiSettings, label: "Pengaturan" },
];

// helper untuk menentukan apakah menu aktif
function checkActive(pathname, href) {
  if (href === "/dashboard") {
    // Dashboard hanya aktif kalau persis sama
    return pathname === "/dashboard";
  }
  // selain dashboard, boleh aktif kalau persis sama atau prefix cocok
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeAuthToken();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 lg:hidden ${isOpen ? "bg-opacity-50" : "bg-opacity-0 pointer-events-none"}`} onClick={() => setIsOpen(false)} />

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">Souci Admin</h1>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = checkActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
