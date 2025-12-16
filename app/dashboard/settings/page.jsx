"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { settingsAPI } from "@/lib/api";
import { FiSave } from "react-icons/fi";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    site_title: "",
    site_description: "",
    contact_email: "",
    contact_phone: "",
    contact_whatsapp: "",
    contact_address: "",
    social_facebook: "",
    social_instagram: "",
    social_linkedin: "",
    social_twitter: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getAll();
      const data = response?.data?.data || [];

      // Convert array to object
      const settingsObj = {};
      if (Array.isArray(data)) {
        data.forEach((item) => {
          settingsObj[item.key_name] = item.value || "";
        });
      }

      setSettings((prevSettings) => ({
        ...prevSettings,
        ...settingsObj,
      }));
    } catch (error) {
      console.error("Error fetching settings:", error);
      alert("Gagal memuat pengaturan");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsAPI.update(settings);
      alert("Pengaturan berhasil disimpan");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pengaturan Website
          </h1>
          <p className="text-gray-600 mt-1">Kelola konfigurasi website</p>
        </div>

        {loading ? (
          // Loading skeleton
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-5 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
              <div className="mt-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-5 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informasi Umum
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Website"
                  name="site_title"
                  value={settings.site_title}
                  onChange={handleChange}
                  placeholder="PT Souci Indoprima"
                />

                <Input
                  label="Email Kontak"
                  name="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={handleChange}
                  placeholder="info@souci.com"
                />

                <Input
                  label="Nomor Telepon"
                  name="contact_phone"
                  value={settings.contact_phone}
                  onChange={handleChange}
                  placeholder="+62 21 1234567"
                />

                <Input
                  label="WhatsApp"
                  name="contact_whatsapp"
                  value={settings.contact_whatsapp}
                  onChange={handleChange}
                  placeholder="6281234567890"
                />
              </div>

              <div className="mt-4">
                <Textarea
                  label="Deskripsi Website"
                  name="site_description"
                  value={settings.site_description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Deskripsi singkat tentang perusahaan..."
                />
              </div>

              <div className="mt-4">
                <Textarea
                  label="Alamat"
                  name="contact_address"
                  value={settings.contact_address}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Alamat lengkap perusahaan..."
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Media Sosial
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Facebook URL"
                  name="social_facebook"
                  value={settings.social_facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                />

                <Input
                  label="Instagram URL"
                  name="social_instagram"
                  value={settings.social_instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                />

                <Input
                  label="LinkedIn URL"
                  name="social_linkedin"
                  value={settings.social_linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/..."
                />

                <Input
                  label="Twitter URL"
                  name="social_twitter"
                  value={settings.social_twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                disabled={saving}
              >
                <FiSave className="mr-2" />
                Simpan Pengaturan
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
