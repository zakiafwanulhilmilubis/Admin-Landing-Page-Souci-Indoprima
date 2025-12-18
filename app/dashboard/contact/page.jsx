"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { contactAPI } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import {
  FiMail,
  FiPhone,
  FiUser,
  FiMessageSquare,
  FiSearch,
  FiCheck,
} from "react-icons/fi";
import Button from "@/components/Button";
import Modal from "@/components/Modal";

export default function ContactPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactAPI.getAll({ limit: 100 });
      setContacts(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);

    // Mark as read if new
    if (contact.status === "new") {
      try {
        await contactAPI.markAsRead(contact.id);
        fetchContacts();
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus pesan ini?")) {
      try {
        await contactAPI.delete(id);
        fetchContacts();
      } catch (error) {
        console.error("Error deleting contact:", error);
        alert("Gagal menghapus pesan");
      }
    }
  };

  const filteredContacts = contacts.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "new" && item.status === "new") ||
      (statusFilter === "read" && item.status === "read") ||
      (statusFilter === "replied" && item.status === "replied") ||
      (statusFilter === "archived" && item.status === "archived");

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesan Kontak</h1>
          <p className="text-gray-600 mt-1">
            Kelola pesan dari pengunjung website
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pesan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-gray-700 placeholder-gray-500 w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                statusFilter === "all" ? "text-gray-500" : "text-gray-900"
              }`}
            >
              <option value="all">Semua Pesan</option>
              <option value="new">Baru</option>
              <option value="read">Sudah Dibaca</option>
              <option value="replied">Sudah Dibalas</option>
              <option value="archived">Diarsipkan</option>
            </select>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 hover:bg-gray-50 cursor-pointer ${
                    item.status === "new" ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleViewDetail(item)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiUser className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.name}
                            {item.status === "new" && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Baru
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">{item.email}</p>
                        </div>
                      </div>
                      <div className="ml-13">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {item.subject}
                        </h4>
                        <p className="text-gray-600 line-clamp-2">
                          {item.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <FiPhone className="mr-1" size={14} />
                            {item.phone}
                          </span>
                          <span>{formatDateTime(item.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                {loading ? "Memuat data..." : "Tidak ada pesan"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedContact && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedContact(null);
          }}
          title="Detail Pesan"
          size="lg"
        >
          <div className="space-y-6">
            {/* Sender Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pengirim
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nama
                  </label>
                  <p className="text-gray-900">{selectedContact.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">{selectedContact.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Telepon
                  </label>
                  <p className="text-gray-900">{selectedContact.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tanggal
                  </label>
                  <p className="text-gray-900">
                    {formatDateTime(selectedContact.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Subjek
              </h3>
              <p className="text-gray-900">{selectedContact.subject}</p>
            </div>

            {/* Message */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pesan
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedContact(null);
                }}
              >
                Tutup
              </Button>
              <a
                href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary">
                  <FiMail className="mr-2" />
                  Balas Email
                </Button>
              </a>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
