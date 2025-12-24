"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { applicationsAPI, getBaseURL } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiFileText,
  FiSearch,
  FiDownload,
  FiX,
  FiImage,
  FiTrash2,
} from "react-icons/fi";
import { FaWhatsapp, FaIdCard, FaUsers, FaGraduationCap, FaShieldAlt, FaAward } from "react-icons/fa";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Select from "@/components/Select";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch applications saat pertama kali load
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsAPI.getAll({ limit: 100 });
      setApplications(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredApplications = applications.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Filter berdasarkan search term (nama atau job title)
    const matchesSearch =
      !searchTerm ||
      item.name?.toLowerCase().includes(searchLower) ||
      item.job_title?.toLowerCase().includes(searchLower);

    // Filter berdasarkan status
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      // Pastikan applicationsAPI.updateStatus mengirimkan object { status: status }
      const response = await applicationsAPI.updateStatus(id, status);
      
      if (response.success || response.status === 200) {
        // Refresh data agar UI terupdate
        await fetchApplications();
        // 🔔 refresh NOTIFIKASI navbar
        window.dispatchEvent(new Event("refresh-notifications"));
        // Tutup modal
        setIsModalOpen(false);
        // Opsional: Berikan feedback sukses
        console.log("Status berhasil diperbarui");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      
      // Mengambil pesan error dari backend jika ada
      const errorMessage = error.response?.data?.message || "Gagal mengupdate status";
      alert(errorMessage);
    }
  };

  const handleDelete = async (id, name) => {
    // Konfirmasi sebelum menghapus
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus lamaran dari ${name}?\n\nTindakan ini akan menghapus:\n- Data lamaran\n- File CV yang terupload\n- Semua dokumen terkait\n\nTindakan ini tidak dapat dibatalkan!`
    );

    if (!isConfirmed) return;

    try {
      const response = await applicationsAPI.delete(id);
      
      if (response.success || response.status === 200) {
        // Refresh data
        await fetchApplications();
        // Refresh notifikasi
        window.dispatchEvent(new Event("refresh-notifications"));
        // Tutup modal jika sedang membuka detail lamaran yang dihapus
        if (selectedApplication?.id === id) {
          setIsModalOpen(false);
          setSelectedApplication(null);
        }
        // Berikan feedback sukses
        alert(`Lamaran dari ${name} berhasil dihapus`);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      const errorMessage = error.response?.data?.message || "Gagal menghapus lamaran";
      alert(errorMessage);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Helper untuk parse sertifikat paths (JSON array)
  const parseSertifikatPaths = (paths) => {
    if (!paths) return [];
    try {
      return typeof paths === 'string' ? JSON.parse(paths) : paths;
    } catch {
      return [];
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Lamaran
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola lamaran pekerjaan - Menampilkan {filteredApplications.length} dari {applications.length} lamaran
            </p>
          </div>
          {(searchTerm || statusFilter !== "all") && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetFilters}
              className="flex items-center gap-2"
            >
              <FiX size={16} />
              Reset Filter
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau posisi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-gray-700 placeholder-gray-500 w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                statusFilter === "all" ? "text-gray-500" : "text-gray-900"
              }`}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelamar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posisi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <center>Aksi</center> 
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredApplications.length > 0 ? (
                  filteredApplications.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.job_title || `Job ID: ${item.job_id}`}
                        </div>
                        {item.job_company && (
                          <div className="text-xs text-gray-500">
                            {item.job_company}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiMail className="mr-1" size={14} />
                            {item.email}
                          </div>
                          <div className="flex items-center mt-1">
                            <FiPhone className="mr-1" size={14} />
                            {item.phone}
                          </div>
                          {item.whatsapp && (
                            <div className="flex items-center mt-1">
                              <FaWhatsapp className="mr-1 text-green-500" size={14} />
                              {item.whatsapp}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : item.status === "reviewed"
                              ? "bg-blue-100 text-blue-700"
                              : item.status === "shortlisted"
                              ? "bg-green-100 text-green-700"
                              : item.status === "accepted"
                              ? "bg-green-200 text-green-800"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status === "pending"
                            ? "Pending"
                            : item.status === "reviewed"
                            ? "Reviewed"
                            : item.status === "shortlisted"
                            ? "Shortlisted"
                            : item.status === "accepted"
                            ? "Accepted"
                            : "Rejected"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(item.applied_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(item)}
                          >
                            Detail
                          </Button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                            title="Hapus lamaran"
                          >
                            <FiTrash2 size={16} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <FiSearch className="text-gray-300 mb-2" size={48} />
                        <p className="font-medium">Tidak ada data lamaran</p>
                        {searchTerm && (
                          <p className="text-sm mt-1">
                            Coba ubah kata kunci pencarian
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApplication && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedApplication(null);
          }}
          title="Detail Lamaran"
          size="lg"
        >
          <div className="max-h-[80vh] overflow-y-auto pr-2">
            <div className="space-y-6">
            {/* Applicant Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informasi Pelamar
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nama Lengkap
                  </label>
                  <p className="text-gray-900">{selectedApplication.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Posisi
                  </label>
                  <p className="text-gray-900">
                    {selectedApplication.job_title ||
                      `Job ID: ${selectedApplication.job_id}`}
                  </p>
                  {selectedApplication.job_company && (
                    <p className="text-sm text-gray-500">
                      {selectedApplication.job_company}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <FiMail className="text-green-500" />
                       Email
                    </label>
                  <p className="text-gray-900">{selectedApplication.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <FiPhone className="text-green-500" />
                      Nomor Telepon
                  </label>
                  <p className="text-gray-900">{selectedApplication.phone}</p>
                </div>
                {selectedApplication.whatsapp && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <FaWhatsapp className="text-green-500" />
                      WhatsApp
                    </label>
                    <p className="text-gray-900">{selectedApplication.whatsapp}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tanggal Melamar
                  </label>
                  <p className="text-gray-900">
                    {formatDateTime(selectedApplication.applied_at)}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Status Saat Ini
                  </label>
                  <p className="text-gray-900 mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedApplication.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : selectedApplication.status === "reviewed"
                          ? "bg-blue-100 text-blue-700"
                          : selectedApplication.status === "shortlisted"
                          ? "bg-green-100 text-green-700"
                          : selectedApplication.status === "accepted"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedApplication.status === "pending"
                        ? "Pending"
                        : selectedApplication.status === "reviewed"
                        ? "Reviewed"
                        : selectedApplication.status === "shortlisted"
                        ? "Shortlisted"
                        : selectedApplication.status === "accepted"
                        ? "Accepted"
                        : "Rejected"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            {selectedApplication.cover_letter && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cover Letter
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {selectedApplication.cover_letter}
                </p>
              </div>
            )}

            {/* Dokumen Download Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dokumen Lamaran
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* KTP */}
                {selectedApplication.ktp_path && (
                  <a
                    href={`${getBaseURL()}${selectedApplication.ktp_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <FaIdCard className="text-white" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Kartu Tanda Penduduk (KTP)</p>
                      <p className="text-xs text-gray-500">Klik untuk download</p>
                    </div>
                    <FiDownload className="text-purple-600 group-hover:text-purple-700" size={20} />
                  </a>
                )}

                {/* Kartu Keluarga */}
                {selectedApplication.kartu_keluarga_path && (
                  <a
                    href={`${getBaseURL()}${selectedApplication.kartu_keluarga_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <FaUsers className="text-white" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Kartu Keluarga (KK)</p>
                      <p className="text-xs text-gray-500">Klik untuk download</p>
                    </div>
                    <FiDownload className="text-green-600 group-hover:text-green-700" size={20} />
                  </a>
                )}

                {/* Ijazah */}
                {selectedApplication.ijazah_path && (
                  <a
                    href={`${getBaseURL()}${selectedApplication.ijazah_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                      <FaGraduationCap className="text-white" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Ijazah</p>
                      <p className="text-xs text-gray-500">Klik untuk download</p>
                    </div>
                    <FiDownload className="text-yellow-600 group-hover:text-yellow-700" size={20} />
                  </a>
                )}

                {/* SKCK */}
                {selectedApplication.skck_path && (
                  <a
                    href={`${getBaseURL()}${selectedApplication.skck_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <FaShieldAlt className="text-white" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Surat Keterangan Catatan Kepolisian (SKCK)</p>
                      <p className="text-xs text-gray-500">Klik untuk download</p>
                    </div>
                    <FiDownload className="text-red-600 group-hover:text-red-700" size={20} />
                  </a>
                )}

                {/* CV */}
                {selectedApplication.cv_path && (
                  <a
                    href={`${getBaseURL()}${selectedApplication.cv_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <FiFileText className="text-white" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">CV / Resume</p>
                      <p className="text-xs text-gray-500">Klik untuk download</p>
                    </div>
                    <FiDownload className="text-blue-600 group-hover:text-blue-700" size={20} />
                  </a>
                )}
                
              </div>

              {/* Sertifikat (Multiple Files) */}
              {selectedApplication.sertifikat_paths && parseSertifikatPaths(selectedApplication.sertifikat_paths).length > 0 && (
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaAward className="text-orange-500" />
                    Sertifikat ({parseSertifikatPaths(selectedApplication.sertifikat_paths).length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {parseSertifikatPaths(selectedApplication.sertifikat_paths).map((path, index) => (
                      <a
                        key={index}
                        href={`${getBaseURL()}${path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors group"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                          <FaAward className="text-white" size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">Sertifikat {index + 1}</p>
                          <p className="text-xs text-gray-500 truncate">{path.split('/').pop()}</p>
                        </div>
                        <FiDownload className="text-orange-600 group-hover:text-orange-700" size={18} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {selectedApplication.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Catatan
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {selectedApplication.notes}
                </p>
              </div>
            )}

            {/* Status Update & Delete Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Aksi
              </h3>
              
              {/* Status Update Buttons */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Update Status:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedApplication.id, "pending")
                    }
                    disabled={selectedApplication.status === "pending"}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      selectedApplication.status === "pending"
                        ? "border-yellow-300 bg-yellow-50 text-yellow-700 cursor-not-allowed"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedApplication.id, "reviewed")
                    }
                    disabled={selectedApplication.status === "reviewed"}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedApplication.status === "reviewed"
                        ? "bg-blue-700 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Reviewed
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedApplication.id, "shortlisted")
                    }
                    disabled={selectedApplication.status === "shortlisted"}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedApplication.status === "shortlisted"
                        ? "bg-green-700 text-white cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    Shortlisted
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedApplication.id, "accepted")
                    }
                    disabled={selectedApplication.status === "accepted"}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedApplication.status === "accepted"
                        ? "bg-green-800 text-white cursor-not-allowed"
                        : "bg-green-700 text-white hover:bg-green-800"
                    }`}
                  >
                    Accepted
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedApplication.id, "rejected")
                    }
                    disabled={selectedApplication.status === "rejected"}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedApplication.status === "rejected"
                        ? "bg-red-700 text-white cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}