import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Calendar,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import client from '../api/client';

const COLORS = ['#E63946', '#2A9D8F', '#F4A261', '#264653', '#E9C46A', '#A8DADC', '#457B9D'];

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    newCustomersLastMonth: 0,
    avgOrderValue: 0,
  });
  const [categorySales, setCategorySales] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [summaryRes, categoryRes, monthlyRes, topRes] = await Promise.all([
        client.get('/reports/summary'),
        client.get('/reports/category-sales'),
        client.get('/reports/monthly-revenue?months=6'),
        client.get('/reports/top-products?limit=5'),
      ]);

      // Handle response format { success: true, data: ... }
      const summaryData = summaryRes.data?.data || summaryRes.data || {};
      const categoryData = categoryRes.data?.data || categoryRes.data || [];
      const monthlyData = monthlyRes.data?.data || monthlyRes.data || [];
      const topData = topRes.data?.data || topRes.data || [];
      
      setSummary({
        totalRevenue: summaryData.totalRevenue || 0,
        totalOrders: summaryData.totalOrders || 0,
        todayOrders: summaryData.todayOrders || 0,
        todayRevenue: summaryData.todayRevenue || 0,
        totalCustomers: summaryData.totalCustomers || 0,
        newCustomersThisMonth: summaryData.newCustomersThisMonth || 0,
        newCustomersLastMonth: summaryData.newCustomersLastMonth || 0,
        avgOrderValue: summaryData.avgOrderValue || 0,
      });
      
      setCategorySales(Array.isArray(categoryData) ? categoryData : []);
      setMonthlyRevenue(Array.isArray(monthlyData) ? monthlyData : []);
      setTopProducts(Array.isArray(topData) ? topData : []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Nu s-au putut încărca rapoartele. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare pie chart data with colors
  const pieData = categorySales.map((cat, idx) => ({
    name: cat.name,
    value: cat.revenue || 0,
    color: COLORS[idx % COLORS.length],
  }));

  // Calculate trend from monthly data
  const currentMonth = monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0;
  const prevMonth = monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 0;
  const revenueTrend = prevMonth > 0 ? ((currentMonth - prevMonth) / prevMonth) * 100 : 0;

  const currentOrders = monthlyRevenue[monthlyRevenue.length - 1]?.orders || 0;
  const prevOrders = monthlyRevenue[monthlyRevenue.length - 2]?.orders || 0;
  const ordersTrend = prevOrders > 0 ? ((currentOrders - prevOrders) / prevOrders) * 100 : 0;

  // Calculate customer trend
  const customerTrend = summary.newCustomersLastMonth > 0 
    ? ((summary.newCustomersThisMonth - summary.newCustomersLastMonth) / summary.newCustomersLastMonth) * 100 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-text-muted">Se încarcă rapoartele...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reîncearcă
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Rapoarte</h1>
          <p className="text-text-muted mt-1">Analize și statistici detaliate</p>
        </div>
        <button 
          onClick={fetchReports}
          className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reîmprospătează
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Venit Total',
            value: `${(summary.totalRevenue || 0).toLocaleString()} lei`,
            icon: DollarSign,
            trend: `${revenueTrend >= 0 ? '+' : ''}${revenueTrend.toFixed(0)}%`,
            up: revenueTrend >= 0,
            color: 'bg-primary/10 text-primary',
          },
          {
            title: 'Total Comenzi',
            value: String(summary.totalOrders || 0),
            icon: ShoppingBag,
            trend: `${ordersTrend >= 0 ? '+' : ''}${ordersTrend.toFixed(0)}%`,
            up: ordersTrend >= 0,
            color: 'bg-secondary/10 text-secondary',
          },
          {
            title: 'Clienți Noi (luna aceasta)',
            value: String(summary.newCustomersThisMonth || 0),
            icon: Users,
            trend: `${customerTrend >= 0 ? '+' : ''}${customerTrend.toFixed(0)}%`,
            up: customerTrend >= 0,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            title: 'Valoare Medie Comandă',
            value: `${summary.avgOrderValue || 0} lei`,
            icon: Calendar,
            trend: `${summary.avgOrderValue > 50 ? '+' : ''}${summary.avgOrderValue > 50 ? '5' : '-5'}%`,
            up: summary.avgOrderValue > 50,
            color: 'bg-orange-100 text-orange-600',
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-muted">{stat.title}</p>
                <h3 className="text-xl font-bold text-text-primary mt-1">{stat.value}</h3>
                <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.trend} vs luna trecută
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="font-bold text-text-primary mb-1">Venituri Lunare</h3>
          <p className="text-sm text-text-muted mb-6">Ultimele 6 luni</p>
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                  formatter={(value, name) => [
                    name === 'Venit (lei)' ? `${Number(value).toLocaleString()} lei` : value,
                    name
                  ]}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Venit (lei)" stroke="#E63946" strokeWidth={2} dot={{ fill: '#E63946', r: 4 }} />
                <Line type="monotone" dataKey="orders" name="Comenzi" stroke="#2A9D8F" strokeWidth={2} dot={{ fill: '#2A9D8F', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-text-muted">
              Nu există date suficiente pentru grafic
            </div>
          )}
        </motion.div>

        {/* Category Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="font-bold text-text-primary mb-1">Vânzări pe Categorii</h3>
          <p className="text-sm text-text-muted mb-6">Distribuția vânzărilor</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                  formatter={(value) => `${Number(value).toLocaleString()} lei`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-text-muted">
              Nu există date suficiente
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="font-bold text-text-primary mb-4">Top Produse</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider py-3 pr-6">Produs</th>
                <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider py-3 px-6">Vânzări (buc)</th>
                <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider py-3 pl-6">Venit</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 pr-6">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-text-muted flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-text-primary">{product.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-6 text-sm text-text-secondary">{product.sales || 0}</td>
                  <td className="text-right py-3 pl-6 text-sm font-semibold text-text-primary">{(product.revenue || 0).toLocaleString()} lei</td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-text-muted">
                    Nu există date suficiente pentru top produse
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
