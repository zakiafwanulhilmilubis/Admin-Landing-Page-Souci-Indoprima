"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { statisticsAPI, newsAPI, jobsAPI } from "@/lib/api";
import {
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiBriefcase,
  FiMail,
  FiMessageSquare,
  FiEye,
} from "react-icons/fi";

export default function StatisticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [dashboardResponse, newsResponse, jobsResponse] = await Promise.all(
        [
          statisticsAPI.getDashboard(),
          newsAPI.getAll({ limit: 10, includeAll: true }),
          jobsAPI.getAll({ limit: 10 }),
        ]
      );

      const dashboardData = dashboardResponse?.data?.data;
      const allNews = newsResponse?.data?.data || [];
      const allJobs = jobsResponse?.data?.data || [];

      // Sort news by views (descending)
      const popularNews = [...allNews]
        .filter((n) => n.status === "published")
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);

      // Calculate total news views
      const totalNewsViews = allNews
        .filter((n) => n.status === "published")
        .reduce((sum, news) => sum + (news.views || 0), 0);

      // Get active jobs (open status)
      const activeJobs = allJobs
        .filter((j) => j.status === "open")
        .slice(0, 5)
        .map((job) => ({
          ...job,
          applicants_count: 0, // Will need to query applications count per job
        }));

      // Transform dashboard data to match statistics page format
      const transformedStats = {
        total_news: dashboardData?.counts?.publishedNews || 0,
        total_news_views: totalNewsViews,
        total_jobs: dashboardData?.counts?.openJobs || 0,
        total_applications: dashboardData?.counts?.totalApplications || 0,
        total_contacts: dashboardData?.counts?.totalContacts || 0,
        total_testimonials: dashboardData?.counts?.approvedTestimonials || 0,
        popular_news: popularNews,
        active_jobs: activeJobs,
      };

      setStats(transformedStats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
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
      description: "Total artikel yang dipublikasikan",
    },
    {
      title: "Total Views Berita",
      value: stats?.total_news_views || 0,
      icon: FiEye,
      color: "bg-purple-500",
      description: "Total pembaca artikel",
    },
    {
      title: "Total Lowongan",
      value: stats?.total_jobs || 0,
      icon: FiBriefcase,
      color: "bg-green-500",
      description: "Lowongan yang tersedia",
    },
    {
      title: "Total Lamaran",
      value: stats?.total_applications || 0,
      icon: FiUsers,
      color: "bg-yellow-500",
      description: "Lamaran yang diterima",
    },
    {
      title: "Pesan Kontak",
      value: stats?.total_contacts || 0,
      icon: FiMail,
      color: "bg-red-500",
      description: "Pesan dari pengunjung",
    },
    {
      title: "Total Testimoni",
      value: stats?.total_testimonials || 0,
      icon: FiMessageSquare,
      color: "bg-indigo-500",
      description: "Testimoni pelanggan",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Statistik Website
          </h1>
          <p className="text-gray-600 mt-1">
            Overview data dan aktivitas website
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <FiTrendingUp className="text-green-500" size={20} />
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {loading ? "..." : stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Viewed News */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Berita Paling Populer
            </h3>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500 text-center py-4">Loading...</p>
              ) : stats?.popular_news && stats.popular_news.length > 0 ? (
                stats.popular_news.slice(0, 5).map((news, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between pb-3 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {news.title}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {news.category?.replace("_", " ") || "Uncategorized"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiEye size={14} />
                      <span>{news.views || 0}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Belum ada data</p>
              )}
            </div>
          </div>

          {/* Active Jobs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Lowongan Aktif
            </h3>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500 text-center py-4">Loading...</p>
              ) : stats?.active_jobs && stats.active_jobs.length > 0 ? (
                stats.active_jobs.slice(0, 5).map((job, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between pb-3 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {job.title}
                      </p>
                      <p className="text-sm text-gray-500">{job.location}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      {job.applicants_count || 0} lamaran
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Belum ada data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
