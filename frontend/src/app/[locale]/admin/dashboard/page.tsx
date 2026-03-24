'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { FiDollarSign, FiShoppingCart, FiUsers, FiTrendingUp } from 'react-icons/fi';

interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  totalUsers: number;
  totalFoods: number;
  totalCategories: number;
  dailyStats: { _id: string; orders: number; revenue: number }[];
  recentOrders: {
    _id: string;
    customerName: string;
    totalPrice: number;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-card border border-border rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-card border border-border rounded-xl" />
      </div>
    );
  }

  if (!data) return <p className="text-muted">{tCommon('error')}</p>;

  const stats = [
    { label: t('total_revenue'), value: `${data.totalRevenue.toLocaleString()} ${tCommon('sum')}`, icon: FiDollarSign, color: 'text-green-500 bg-green-500/10' },
    { label: t('total_orders'), value: data.totalOrders, icon: FiShoppingCart, color: 'text-blue-500 bg-blue-500/10' },
    { label: t('today_orders'), value: data.todayOrders, icon: FiTrendingUp, color: 'text-orange-500 bg-orange-500/10' },
    { label: t('total_users'), value: data.totalUsers, icon: FiUsers, color: 'text-purple-500 bg-purple-500/10' },
  ];

  const maxRevenue = Math.max(...data.dailyStats.map((s) => s.revenue), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t('dashboard')}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Simple Bar Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">{t('daily_stats')}</h3>
        {data.dailyStats.length > 0 ? (
          <div className="flex items-end gap-2 h-48">
            {data.dailyStats.map((day) => (
              <div key={day._id} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted">{day.revenue.toLocaleString()}</span>
                <div
                  className="w-full bg-primary/80 rounded-t-md min-h-[4px] transition-all"
                  style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                />
                <span className="text-xs text-muted">{day._id.slice(5)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm">{t('no_data')}</p>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">{t('recent_orders')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="pb-3 font-medium">ID</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order._id} className="border-b border-border/50">
                  <td className="py-3 font-mono text-xs">{order._id.slice(-6)}</td>
                  <td className="py-3">{order.customerName}</td>
                  <td className="py-3 font-medium">{order.totalPrice.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                      order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                      order.status === 'preparing' ? 'bg-blue-500/10 text-blue-500' :
                      order.status === 'delivering' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
