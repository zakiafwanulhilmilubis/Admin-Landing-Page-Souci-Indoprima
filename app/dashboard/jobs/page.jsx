"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { jobsAPI } from "@/lib/api";
import { formatDateTime, slugify } from "@/lib/utils";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiSearch } from "react-icons/fi";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    company: "",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    location: "",
    type: "full_time",
    salary_range: "",
    kuota: "",
    education: "",
    experience: "",
    category: "",
    deadline: "",
    status: "open",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getAll({ limit: 100, status: "all" });
      setJobs(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // When title changes, auto-generate slug for new jobs
    if (name === "title" && !editingJob) {
      const baseSlug = slugify(value);
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: baseSlug,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingJob) {
        await jobsAPI.update(editingJob.id, formData);
      } else {
        await jobsAPI.create(formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error("Error saving job:", error);
      console.error("Error response:", error.response?.data);
      const errorData = error.response?.data;
      const errorMsg = errorData?.message || error.message || "Unknown error";

      // Special handling for duplicate slug
      if (
        errorMsg.includes("sudah digunakan") ||
        errorMsg.includes("already exists")
      ) {
        const suggestedSlug =
          errorData?.suggestedSlug ||
          formData.slug + "-" + Math.random().toString(36).substr(2, 5);
        const retry = confirm(
          `${errorMsg}\n\n` +
            `Apakah Anda ingin menggunakan slug alternatif?\n"${suggestedSlug}"\n\n` +
            `Klik OK untuk menggunakan slug baru, atau Cancel untuk mengedit manual.`
        );

        if (retry) {
          setFormData((prev) => ({ ...prev, slug: suggestedSlug }));
        }
      } else {
        alert("Gagal menyimpan lowongan kerja: " + errorMsg);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingJob(item);

    // Format deadline to YYYY-MM-DD for date input
    let deadlineValue = "";
    if (item.deadline) {
      const date = new Date(item.deadline);
      if (!isNaN(date.getTime())) {
        deadlineValue = date.toISOString().split("T")[0];
      }
    }

    // Convert JSON arrays to text for textarea
    const requirementsText = Array.isArray(item.requirements)
      ? item.requirements.join("\n")
      : typeof item.requirements === "string"
      ? item.requirements
      : "";

    const responsibilitiesText = Array.isArray(item.responsibilities)
      ? item.responsibilities.join("\n")
      : typeof item.responsibilities === "string"
      ? item.responsibilities
      : "";

    const benefitsText = Array.isArray(item.benefits)
      ? item.benefits.join("\n")
      : typeof item.benefits === "string"
      ? item.benefits
      : "";

    setFormData({
      title: item.title,
      slug: item.slug,
      company: item.company || "",
      description: item.description || "",
      requirements: requirementsText,
      responsibilities: responsibilitiesText,
      benefits: benefitsText,
      location: item.location || "",
      type: item.type || "full_time",
      salary_range: item.salary_range || "",
      kuota: item.kuota || "",
      education: item.education || "",
      experience: item.experience || "",
      category: item.category || "",
      deadline: deadlineValue,
      status: item.status || "open",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus lowongan ini?")) {
      try {
        await jobsAPI.delete(id);
        fetchJobs();
      } catch (error) {
        console.error("Error deleting job:", error);
        alert(
          "Gagal menghapus lowongan kerja: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      company: "",
      description: "",
      requirements: "",
      responsibilities: "",
      benefits: "",
      location: "",
      type: "full_time",
      salary_range: "",
      kuota: "",
      education: "",
      experience: "",
      category: "",
      deadline: "",
      status: "open",
    });
    setEditingJob(null);
  };

  const filteredJobs = jobs.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Lowongan Kerja
            </h1>
            <p className="text-gray-600 mt-1">Kelola lowongan pekerjaan</p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            <FiPlus className="mr-2" /> Tambah Lowongan
          </Button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari lowongan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-gray-700 placeholder-gray-500 w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posisi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kuota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipe
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
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-500">{item.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FiMapPin className="mr-1" size={14} />
                          {item.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.kuota || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                          {item.type || "Full-time"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.status === "open"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status === "open" ? "Dibuka" : "Ditutup"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(item.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {loading
                        ? "Memuat data..."
                        : "Tidak ada data lowongan kerja"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form dengan Scrollbar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingJob ? "Edit Lowongan" : "Tambah Lowongan"}
        size="lg"
      >
        {/* Wrapper dengan scrollbar - BAGIAN INI YANG DITAMBAHKAN */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scroll-smooth">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formData.status === "closed" && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Lowongan ini sedang <strong>DITUTUP</strong>. Ubah status
                      menjadi "Dibuka" untuk mengedit informasi lainnya.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Input
              label="Posisi"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Contoh: Software Engineer"
              disabled={formData.status === "closed"}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  placeholder="software-engineer"
                  className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 ${
                    formData.status === "closed" ? "bg-gray-100" : "bg-white"
                  }`}
                  disabled={formData.status === "closed"}
                />
                <button
                  type="button"
                  onClick={() => {
                    const uniqueSlug =
                      formData.slug +
                      "-" +
                      Math.random().toString(36).substr(2, 5);
                    setFormData((prev) => ({ ...prev, slug: uniqueSlug }));
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors whitespace-nowrap"
                  title="Generate slug unik"
                  disabled={formData.status === "closed"}
                >
                  🔄 Unik
                </button>
              </div>
              {!formData.status === "closed" && (
                <p className="text-xs text-gray-500 mt-1">
                  Klik "🔄 Unik" jika slug sudah digunakan
                </p>
              )}
            </div>

            <Input
              label="Perusahaan"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              required
              placeholder="Contoh: PT Souci Indoprima"
              disabled={formData.status === "closed"}
            />

            <Input
              label="Lokasi"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              placeholder="Contoh: Jakarta, Indonesia"
              disabled={formData.status === "closed"}
            />

            <Select
              label="Tipe Pekerjaan"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: "full_time", label: "Full Time" },
                { value: "part_time", label: "Part Time" },
                { value: "contract", label: "Contract" },
                { value: "internship", label: "Internship" },
              ]}
              disabled={formData.status === "closed"}
            />

            <Input
              label="Rentang Gaji"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleInputChange}
              placeholder="Contoh: Rp 8.000.000 - Rp 12.000.000"
              disabled={formData.status === "closed"}
            />

            <Input
              label="Kuota Terima"
              name="kuota"
              value={formData.kuota}
              onChange={handleInputChange}
              placeholder="10 Orang"
              disabled={formData.status === "closed"}
            />

            <Input
              label="Pendidikan"
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              placeholder="Contoh: S1 Teknik Informatika"
              disabled={formData.status === "closed"}
            />

            <Input
              label="Pengalaman"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              placeholder="Contoh: 1-2 Tahun"
              disabled={formData.status === "closed"}
            />

            <Input
              label="Kategori"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="Contoh: IT & Software"
              disabled={formData.status === "closed"}
            />

            <Input
              label="Deadline Lamaran"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleInputChange}
              placeholder="YYYY-MM-DD"
              disabled={formData.status === "closed"}
            />

            <Textarea
              label="Deskripsi"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              required
              placeholder="Deskripsi pekerjaan..."
              disabled={formData.status === "closed"}
            />

            <Textarea
              label="Persyaratan"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows={5}
              placeholder="Persyaratan yang dibutuhkan (satu per baris)..."
              disabled={formData.status === "closed"}
            />

            <Textarea
              label="Tanggung Jawab"
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleInputChange}
              rows={5}
              placeholder="Tanggung jawab pekerjaan (satu per baris)..."
              disabled={formData.status === "closed"}
            />

            <Textarea
              label="Benefit & Fasilitas"
              name="benefits"
              value={formData.benefits}
              onChange={handleInputChange}
              rows={5}
              placeholder="Benefit yang didapat (satu per baris)..."
              disabled={formData.status === "closed"}
            />

            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: "open", label: "Dibuka" },
                { value: "closed", label: "Ditutup" },
              ]}
            />

            <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2 border-t border-gray-200 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary">
                {editingJob ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </DashboardLayout>
  );
}