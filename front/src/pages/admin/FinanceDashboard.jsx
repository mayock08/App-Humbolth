import React from 'react';
import {
    DollarSign,
    CreditCard,
    TrendingUp,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Search
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';

const FinanceDashboard = () => {
    // Mock Data
    const transactions = [
        { id: 'INV-2024-001', student: 'Liam Johnson', type: 'Tuition Fee', amount: 450.00, status: 'Paid', date: 'Oct 24, 2024' },
        { id: 'INV-2024-002', student: 'Emma Wilson', type: 'Bus Service', amount: 120.00, status: 'Pending', date: 'Oct 24, 2024' },
        { id: 'INV-2024-003', student: 'Noah Brown', type: 'Cafeteria', amount: 50.00, status: 'Paid', date: 'Oct 23, 2024' },
        { id: 'INV-2024-004', student: 'Olivia Anderson', type: 'Books & Materials', amount: 200.00, status: 'Overdue', date: 'Oct 20, 2024' },
    ];

    const revenueData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Aug', 'Sep', 'Oct'],
        datasets: [
            {
                label: 'Income ($)',
                data: [12000, 19000, 15000, 22000, 24000, 20000, 35000, 32000, 38000],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    const expenseData = {
        labels: ['Payroll', 'Maintenance', 'Utilities', 'Supplies', 'Marketing'],
        datasets: [
            {
                label: 'Expenses',
                data: [45, 20, 15, 12, 8],
                backgroundColor: [
                    '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'
                ],
                borderRadius: 8
            }
        ]
    };

    const lineOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { grid: { display: true, color: '#f3f4f6' } } }
    };

    const barOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
                    <p className="text-gray-500 text-sm">Monitor school income, expenses, and pending payments.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                        <Download size={16} className="mr-2" /> Export Report
                    </button>
                    <button className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                        <PlusIcon size={16} className="mr-2" /> Record Transaction
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <DollarSign className="text-green-600" size={24} />
                        </div>
                        <span className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                            <trendingUp size={12} className="mr-1" /> +12%
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Revenue (YTD)</p>
                        <h3 className="text-3xl font-bold text-gray-900">$1,245,300</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 rounded-xl">
                            <TrendingUp className="text-red-500" size={24} />
                        </div>
                        <span className="flex items-center text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">
                            +5%
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                        <h3 className="text-3xl font-bold text-gray-900">$840,200</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <CreditCard className="text-orange-500" size={24} />
                        </div>
                        <span className="text-xs font-medium text-gray-400">Due within 7 days</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pending Collections</p>
                        <h3 className="text-3xl font-bold text-gray-900">$45,150</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800">Revenue Growth</h3>
                        <select className="text-xs border-gray-200 rounded-lg p-1.5 bg-gray-50">
                            <option>This Year</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-64">
                        <Line data={revenueData} options={lineOptions} />
                    </div>
                </div>

                {/* Expenses Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6">Expense Distribution</h3>
                    <div className="h-64">
                        <Bar data={expenseData} options={barOptions} />
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-lg text-gray-900">Recent Transactions</h3>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by student or invoice..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-blue-100 focus:ring-2 focus:ring-blue-50 rounded-lg text-sm transition-all"
                            />
                        </div>
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <Filter size={18} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-left">Invoice ID</th>
                                <th className="px-6 py-4 text-left">Student</th>
                                <th className="px-6 py-4 text-left">Type</th>
                                <th className="px-6 py-4 text-left">Amount</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.map((tx, i) => (
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{tx.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{tx.student}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{tx.type}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">${tx.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                            ${tx.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                tx.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'}`
                                        }>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{tx.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-blue-600">Download</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Helper for icon
const PlusIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14"></path>
        <path d="M12 5v14"></path>
    </svg>
);

export default FinanceDashboard;
