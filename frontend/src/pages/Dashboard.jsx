import React, { useEffect, useState } from 'react';
import SideNav from '../components/dashboard/Sidebar';
import UserInfo from '../components/dashboard/UserInfo';
import { Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = ({ user, onLogout }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch analytics report from backend
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token') || user?.token;

        const res = await fetch('http://localhost:4000/api/llm/report', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        console.log("📥 Received data:", data);
        setReport(data);
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600">No analytics data available yet.</p>
      </div>
    );
  }

  // Get top misunderstood term
  const topMisunderstoodTerm = report.topMisunderstood?.reduce((max, item) => 
    (item.misunderstood || 0) > (max.misunderstood || 0) ? item : max
  , report.topMisunderstood?.[0] || {});

  // ✅ Bar chart: simplification, usage instructions, misunderstanding
  const complexityFrequencyData = {
    labels: report.topMisunderstood?.slice(0, 10).map((item) => item.term) || [],
    datasets: [
      {
        label: 'Simplification Score',
        data: report.topMisunderstood?.slice(0, 10).map((item) => item.simpScore || 0) || [],
        backgroundColor: '#36A2EB',
      },
      {
        label: 'Usage Instructions',
        data: report.topMisunderstood?.slice(0, 10).map((item) => item.usageInstr || 0) || [],
        backgroundColor: '#4BC0C0',
      },
      {
        label: 'Misunderstood Count',
        data: report.topMisunderstood?.slice(0, 10).map((item) => item.misunderstood || 0) || [],
        backgroundColor: '#FF6384',
      },
    ],
  };

  // ✅ Correlation scatter: Usage vs Misunderstanding
  const correlationData = {
    datasets: [
      {
        label: 'Usage vs Misunderstanding',
        data: report.topMisunderstood?.map((item) => ({
          x: item.usagecount || 0,
          y: item.misunderstood || 0,
        })) || [],
        backgroundColor: '#FF6384',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // ✅ Regression scatter: Simplification vs Misunderstanding
  const regressionData = {
    datasets: [
      {
        label: 'Simplification vs Misunderstanding',
        data: report.topMisunderstood?.map((item) => ({
          x: item.simpScore || 0,
          y: item.misunderstood || 0,
        })) || [],
        backgroundColor: '#36A2EB',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const barOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: { 
      x: { ticks: { font: { size: 10 } } }, 
      y: { beginAtZero: true, ticks: { font: { size: 10 } } } 
    },
    plugins: { 
      legend: { display: true, position: 'top', labels: { font: { size: 11 } } }
    },
  };

  const scatterOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: { 
        title: { display: true, font: { size: 11 } },
        beginAtZero: true 
      },
      y: { 
        title: { display: true, font: { size: 11 } },
        beginAtZero: true 
      },
    },
    plugins: { 
      legend: { display: true, position: 'top', labels: { font: { size: 11 } } }
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-100">
      <SideNav onLogout={onLogout} />
      <UserInfo user={user} />
      <div className="flex-1 p-6 ml-16 md:ml-64 transition-all duration-300">
        <div className="space-y-6 pt-0">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">Analytics Dashboard</h1>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-sm text-gray-600">Total Queries</p>
              <p className="text-3xl font-bold text-gray-900">{report.totalQueries || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-sm text-gray-600">Terms Tracked</p>
              <p className="text-3xl font-bold text-gray-900">{report.topMisunderstood?.length || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-sm text-gray-600">Top Misunderstood Term</p>
              <p className="text-xl font-bold text-red-600">{topMisunderstoodTerm?.term || 'N/A'}</p>
              <p className="text-xs text-gray-500">
                {topMisunderstoodTerm?.misunderstood || 0} times misunderstood
              </p>
            </div>
          </div>

          {/* Descriptive Table - SCROLLABLE */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pharmaceutical Terminology Data</h3>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr className="border-b-2 border-gray-300">
                    <th className="p-3 text-left">Term</th>
                    <th className="p-3 text-left">Usage Count</th>
                    <th className="p-3 text-left">Simp Score</th>
                    <th className="p-3 text-left">Misunderstood</th>
                    <th className="p-3 text-left">Usage Instr</th>
                  </tr>
                </thead>
                <tbody>
                  {report.topMisunderstood?.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.term}</td>
                      <td className="p-3">{item.usagecount || 0}</td>
                      <td className="p-3">{(item.simpScore || 0).toFixed(2)}</td>
                      <td className="p-3">{item.misunderstood || 0}</td>
                      <td className="p-3">{item.usageInstr || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analytical Bar Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Term Complexity Frequency</h3>
            <div className="h-80">
              <Bar data={complexityFrequencyData} options={barOptions} />
            </div>
          </div>

          {/* Regression/Prediction Scatter Plots */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Correlation & Regression Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Correlation */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Usage vs Misunderstanding</p>
                <div className="h-64">
                  <Scatter 
                    data={correlationData} 
                    options={{
                      ...scatterOptions,
                      scales: {
                        x: { 
                          title: { display: true, text: 'Usage Count', font: { size: 11 } },
                          beginAtZero: true 
                        },
                        y: { 
                          title: { display: true, text: 'Misunderstood', font: { size: 11 } },
                          beginAtZero: true 
                        },
                      }
                    }} 
                  />
                </div>
              </div>

              {/* Regression */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Simplification vs Misunderstanding</p>
                <div className="h-64">
                  <Scatter 
                    data={regressionData} 
                    options={{
                      ...scatterOptions,
                      scales: {
                        x: { 
                          title: { display: true, text: 'Simplification Score', font: { size: 11 } },
                          beginAtZero: true 
                        },
                        y: { 
                          title: { display: true, text: 'Misunderstood', font: { size: 11 } },
                          beginAtZero: true 
                        },
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;