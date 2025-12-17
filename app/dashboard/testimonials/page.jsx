"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { testimonialsAPI } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiStar } from "react-icons/fi";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    company: "",
    content: "",
    rating: 5,
    status: "pending",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await testimonialsAPI.getAll({
        limit: 100,
        includeAll: true,
      });
      setTestimonials(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
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

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "rating" ? parseInt(value) : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("position", formData.position || "");
      submitData.append("company", formData.company || "");
      submitData.append("content", formData.content);
      submitData.append("rating", formData.rating);
      submitData.append("status", formData.status);

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      if (editingTestimonial) {
        await testimonialsAPI.update(editingTestimonial.id, submitData);
      } else {
        await testimonialsAPI.create(submitData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchTestimonials();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      alert(
        "Gagal menyimpan testimoni: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleEdit = (item) => {
    setEditingTestimonial(item);
    setFormData({
      name: item.name,
      position: item.position || "",
      company: item.company || "",
      content: item.content,
      rating: item.rating || 5,
      status: item.status || "pending",
      image: null,
    });

    // Set preview from existing image
    if (item.image) {
      setImagePreview(`http://localhost:3000${item.image}`);
    } else {
      setImagePreview(null);
    }

    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await testimonialsAPI.updateStatus(id, status);
      fetchTestimonials();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal mengupdate status");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus testimoni ini?")) {
      try {
        await testimonialsAPI.delete(id);
        fetchTestimonials();
      } catch (error) {
        console.error("Error deleting testimonial:", error);
        alert("Gagal menghapus testimoni");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      company: "",
      content: "",
      rating: 5,
      status: "pending",
      image: null,
    });
    setImagePreview(null);
    setEditingTestimonial(null);

    // Reset file input
    const fileInput = document.querySelector(
      'input[type="file"][name="image"]'
    );
    if (fileInput) fileInput.value = "";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Testimoni
            </h1>
            <p className="text-gray-600 mt-1">Kelola testimoni pelanggan</p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            <FiPlus className="mr-2" /> Tambah Testimoni
          </Button>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.length > 0 ? (
            testimonials.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiUser className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.position} {item.company && `at ${item.company}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={16}
                      className={
                        i < item.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {item.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : item.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status === "approved"
                      ? "Approved"
                      : item.status === "rejected"
                      ? "Rejected"
                      : "Pending"}
                  </span>

                  <div className="flex gap-2">
                    {item.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateStatus(item.id, "approved")
                          }
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                        >
                          <FiStar size={18} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              {loading ? "Memuat data..." : "Tidak ada testimoni"}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form dengan Scrollbar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingTestimonial ? "Edit Testimoni" : "Tambah Testimoni"}
        size="lg"
      >
        {/* Wrapper dengan scrollbar - BAGIAN INI YANG DITAMBAHKAN */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scroll-smooth">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Nama pelanggan"
            />

            <Input
              label="Posisi"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              placeholder="Jabatan"
            />

            <Input
              label="Perusahaan"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="Nama perusahaan"
            />

            <Textarea
              label="Testimoni"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={5}
              required
              placeholder="Tulis testimoni..."
            />

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Profil
              </label>
              <input
                type="file"
                name="image"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleInputChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: JPG, PNG, WebP (Max 5MB)
              </p>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}
            </div>

            <Select
              label="Rating"
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              options={[
                { value: 5, label: "5 Bintang" },
                { value: 4, label: "4 Bintang" },
                { value: 3, label: "3 Bintang" },
                { value: 2, label: "2 Bintang" },
                { value: 1, label: "1 Bintang" },
              ]}
            />

            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
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
                {editingTestimonial ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </DashboardLayout>
  );
}