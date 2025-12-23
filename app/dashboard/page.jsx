"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  statisticsAPI,
  newsAPI,
  jobsAPI,
  applicationsAPI,
  contactAPI,
} from "@/lib/api";
import {
  FiFileText,
  FiBriefcase,
  FiUser,
  FiMail,
  FiTrendingUp,
  FiEye,
} from "react-icons/fi";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentNews, setRecentNews] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard statistics from dedicated endpoint
      const [dashboardResponse, newsResponse, jobsResponse] = await Promise.all(
        [
          statisticsAPI.getDashboard(),
          newsAPI.getAll({ limit: 5, includeAll: true }),
          jobsAPI.getAll({ limit: 5 }),
        ]
      );

      // Use data from dashboard endpoint
      const dashboardStats = {
        total_news: dashboardResponse?.data?.data?.counts?.publishedNews || 0,
        total_jobs: dashboardResponse?.data?.data?.counts?.openJobs || 0,
        total_applications:
          dashboardResponse?.data?.data?.counts?.totalApplications || 0,
        pending_applications:
          dashboardResponse?.data?.data?.counts?.pendingApplications || 0,
        total_contacts:
          dashboardResponse?.data?.data?.counts?.totalContacts || 0,
        unread_contacts:
          dashboardResponse?.data?.data?.counts?.unreadContacts || 0,
        total_testimonials:
          dashboardResponse?.data?.data?.counts?.approvedTestimonials || 0,
        pending_testimonials:
          dashboardResponse?.data?.data?.counts?.pendingTestimonials || 0,
      };
      setStats(dashboardStats);

      // Set recent news and jobs
      setRecentNews(newsResponse?.data?.data?.slice(0, 5) || []);
      setRecentJobs(jobsResponse?.data?.data?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Berita",
      value: stats?.total_news || 0,
      icon: FiFileText,
      color: "bg-blue-500",
    },
    {
      title: "Lowongan Aktif",
      value: stats?.total_jobs || 0,
      icon: FiBriefcase,
      color: "bg-green-500",
    },
    {
      title: "Total Lamaran",
      value: stats?.total_applications || 0,
      icon: FiUser,
      color: "bg-purple-500",
    },
    {
      title: "Pesan Kontak",
      value: stats?.total_contacts || 0,
      icon: FiMail,
      color: "bg-yellow-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat Datang di Dashboard Admin
          </h1>
          <p className="text-gray-600 mt-2">
            PT Souci Indoprima - Sistem Manajemen Konten
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              ))
            : statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`${stat.color} p-4 rounded-full`}>
                        <Icon size={24} className="text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Recent Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent News */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Berita Terbaru
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse pb-4 border-b">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentNews.length > 0 ? (
                <div className="space-y-4">
                  {recentNews.map((news) => (
                    <div
                      key={news.id}
                      className="flex items-start gap-4 pb-4 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 line-clamp-2">
                          {news.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiEye size={14} />
                            {news.views || 0} views
                          </span>
                          <span>
                            {new Date(news.created_at).toLocaleDateString(
                              "id-ID"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Belum ada berita
                </p>
              )}
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Lowongan Kerja Terbaru
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse pb-4 border-b">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-start gap-4 pb-4 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 line-clamp-2">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{job.location}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              job.status === "open"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {job.status === "open" ? "Dibuka" : "Ditutup"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Belum ada lowongan kerja
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
