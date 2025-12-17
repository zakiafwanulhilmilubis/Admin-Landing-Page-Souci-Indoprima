"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { newsAPI, getBaseURL } from "@/lib/api";
import { formatDateTime, slugify } from "@/lib/utils";
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch } from "react-icons/fi";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "company_news",
    status: "draft",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsAPI.getAll({ limit: 100, includeAll: true });
      setNews(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "title" && !editingNews ? { slug: slugify(value) } : {}),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("slug", formData.slug);
      submitData.append("category", formData.category || "company_news");
      submitData.append("excerpt", formData.excerpt || "");
      submitData.append("content", formData.content);
      submitData.append("status", formData.status);

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      if (editingNews) {
        await newsAPI.update(editingNews.id, submitData);
      } else {
        await newsAPI.create(submitData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchNews();
    } catch (error) {
      console.error("Error saving news:", error);
      alert(
        "Gagal menyimpan berita: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleEdit = (item) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || "",
      content: item.content || "",
      category: item.category || "",
      status: item.status || "draft",
      image: null,
    });
    if (item.image) {
      setImagePreview(`${getBaseURL()}${item.image}`);
    } else {
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
      try {
        await newsAPI.delete(id);
        fetchNews();
      } catch (error) {
        console.error("Error deleting news:", error);
        alert("Gagal menghapus berita");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "company_news",
      status: "draft",
      image: null,
    });
    setImagePreview(null);
    setEditingNews(null);
    const fileInput = document.querySelector(
      'input[type="file"][name="image"]'
    );
    if (fileInput) fileInput.value = "";
  };

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Berita
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola berita dan artikel website
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            <FiPlus className="mr-2" /> Tambah Berita
          </Button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Filter Status:
            </span>
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Semua ({news.length})
            </button>
            <button
              onClick={() => setStatusFilter("published")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "published"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Published (
              {news.filter((item) => item.status === "published").length})
            </button>
            <button
              onClick={() => setStatusFilter("draft")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "draft"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Draft ({news.filter((item) => item.status === "draft").length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Judul
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNews.length > 0 ? (
                  filteredNews.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-500">{item.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          {item.category === "company_news"
                            ? "Company News"
                            : item.category === "achievement"
                            ? "Achievement"
                            : item.category === "tips"
                            ? "Tips"
                            : item.category === "event"
                            ? "Event"
                            : item.category || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.status === "published"
                            ? "✓ Published"
                            : "⏳ Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiEye className="mr-1" size={14} />
                          {item.views || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(item.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {loading ? "Memuat data..." : "Tidak ada data berita"}
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
        title={editingNews ? "Edit Berita" : "Tambah Berita"}
        size="lg"
      >
        {/* Wrapper dengan max-height dan overflow-y-auto untuk scroll */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Judul"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Masukkan judul berita"
            />

            <Input
              label="Slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              required
              placeholder="judul-berita"
            />

            <Select
              label="Kategori"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              options={[
                { value: "", label: "Pilih Kategori" },
                { value: "achievement", label: "Achievement" },
                { value: "company_news", label: "Company News" },
                { value: "tips", label: "Tips" },
                { value: "event", label: "Event" },
              ]}
              required
            />

            <Textarea
              label="Ringkasan"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows={3}
              placeholder="Ringkasan singkat berita"
            />

            <Textarea
              label="Konten"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={8}
              required
              placeholder="Konten lengkap berita"
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Gambar
              </label>
              <input
                type="file"
                name="image"
                onChange={handleInputChange}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Max 5MB. Format: JPG, PNG, atau WebP
              </p>
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>

            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
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
                {editingNews ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </DashboardLayout>
  );
}