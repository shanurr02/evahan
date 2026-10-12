import React, { useState } from 'react';
import {
  Plus,
  Search,
  Download,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Receipt,
  Fuel,
  Coins,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Vehicle } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { useToast } from '../common/Toast';

interface ExpenseItem {
  id: string;
  date: string;
  vehicleReg: string;
  category: 'Fuel' | 'Toll' | 'Maintenance' | 'Driver Allowance' | 'Challan';
  amount: number;
  liters?: number;
  merchant: string;
  invoiceNo: string;
  status: 'Approved' | 'Pending Approval';
}

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  customerName: string;
  consignmentNo: string;
  date: string;
  dueDate: string;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

const initialExpenses: ExpenseItem[] = [
  {
    id: 'exp-1',
    date: '16 Sep 2026',
    vehicleReg: 'OD14AB1234',
    category: 'Fuel',
    amount: 14200,
    liters: 155,
    merchant: 'Indian Oil Highway Retail, Keonjhar',
    invoiceNo: 'IOCL-99214',
    status: 'Approved',
  },
  {
    id: 'exp-2',
    date: '16 Sep 2026',
    vehicleReg: 'OD14AB1234',
    category: 'Toll',
    amount: 1450,
    merchant: 'FASTag NH-143 Electronic Toll Plaza',
    invoiceNo: 'NETC-3381',
    status: 'Approved',
  },
  {
    id: 'exp-3',
    date: '15 Sep 2026',
    vehicleReg: 'OD14CD5678',
    category: 'Maintenance',
    amount: 8500,
    merchant: 'Tata Authorized Heavy Workshop Rourkela',
    invoiceNo: 'TATA-WS-441',
    status: 'Approved',
  },
  {
    id: 'exp-4',
    date: '15 Sep 2026',
    vehicleReg: 'JH01EF9012',
    category: 'Driver Allowance',
    amount: 1200,
    merchant: 'Overnight Inter-State Batta (Ranchi Corridor)',
    invoiceNo: 'VOUCH-881',
    status: 'Approved',
  },
  {
    id: 'exp-5',
    date: '14 Sep 2026',
    vehicleReg: 'BR01GH3456',
    category: 'Fuel',
    amount: 18500,
    liters: 200,
    merchant: 'Bharat Petroleum Highway Outpost, Patna Bypass',
    invoiceNo: 'BPCL-7712',
    status: 'Approved',
  },
  {
    id: 'exp-6',
    date: '13 Sep 2026',
    vehicleReg: 'OD14AB1234',
    category: 'Driver Allowance',
    amount: 900,
    merchant: 'Local Loading Dock Food & Lodging Allowance',
    invoiceNo: 'VOUCH-879',
    status: 'Pending Approval',
  },
];

const initialInvoices: InvoiceItem[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-2026-0891',
    customerName: 'Steel Authority of India Ltd (SAIL)',
    consignmentNo: 'DISP-8812',
    date: '12 Sep 2026',
    dueDate: '27 Sep 2026',
    taxableAmount: 184000,
    gstAmount: 33120,
    totalAmount: 217120,
    status: 'Paid',
  },
  {
    id: 'inv-2',
    invoiceNo: 'INV-2026-0892',
    customerName: 'Tata Projects Infrastructure Ltd',
    consignmentNo: 'DISP-8815',
    date: '14 Sep 2026',
    dueDate: '29 Sep 2026',
    taxableAmount: 145000,
    gstAmount: 26100,
    totalAmount: 171100,
    status: 'Pending',
  },
  {
    id: 'inv-3',
    invoiceNo: 'INV-2026-0870',
    customerName: 'Vedanta Smelter Jharsuguda',
    consignmentNo: 'DISP-8740',
    date: '28 Aug 2026',
    dueDate: '12 Sep 2026',
    taxableAmount: 210000,
    gstAmount: 37800,
    totalAmount: 247800,
    status: 'Overdue',
  },
  {
    id: 'inv-4',
    invoiceNo: 'INV-2026-0895',
    customerName: 'Jindal Steel & Power Ltd',
    consignmentNo: 'DISP-8820',
    date: '15 Sep 2026',
    dueDate: '30 Sep 2026',
    taxableAmount: 98000,
    gstAmount: 17640,
    totalAmount: 115640,
    status: 'Pending',
  },
];

const categoryColors: Record<string, string> = {
  Fuel: '#2563eb',
  Toll: '#10b981',
  Maintenance: '#f59e0b',
  'Driver Allowance': '#8b5cf6',
  Challan: '#ef4444',
};

export const FinanceView: React.FC<{ vehicles: Vehicle[] }> = ({ vehicles }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'expenses' | 'invoices' | 'fastag'>('expenses');
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // New Expense form
  const [vehicleReg, setVehicleReg] = useState(vehicles[0]?.regNumber || 'OD14AB1234');
  const [category, setCategory] = useState<ExpenseItem['category']>('Fuel');
  const [amount, setAmount] = useState('');
  const [liters, setLiters] = useState('');
  const [merchant, setMerchant] = useState('');

  // New Invoice form
  const [invCustomer, setInvCustomer] = useState('Tata Projects Infrastructure Ltd');
  const [invConsignment, setInvConsignment] = useState('DISP-8830');
  const [invAmount, setInvAmount] = useState('120000');

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const fuelExpense = expenses.filter((e) => e.category === 'Fuel').reduce((acc, curr) => acc + curr.amount, 0);
  const tollExpense = expenses.filter((e) => e.category === 'Toll').reduce((acc, curr) => acc + curr.amount, 0);
  const maintExpense = expenses.filter((e) => e.category === 'Maintenance').reduce((acc, curr) => acc + curr.amount, 0);
  const totalBilled = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const filteredExpenses = expenses.filter((e) => {
    const matchCat = categoryFilter === 'All' || e.category === categoryFilter;
    const matchSearch =
      e.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredInvoices = invoices.filter((i) => {
    return (
      i.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.consignmentNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const pieData = [
    { name: 'Fuel', value: fuelExpense },
    { name: 'Maintenance', value: maintExpense },
    { name: 'Toll (FASTag)', value: tollExpense },
    { name: 'Driver Allowance', value: 2100 },
  ];

  const barData = [
    { month: 'May', total: 420000, revenue: 840000 },
    { month: 'Jun', total: 465000, revenue: 910000 },
    { month: 'Jul', total: 410000, revenue: 880000 },
    { month: 'Aug', total: 485000, revenue: 990000 },
    { month: 'Sep (MTD)', total: 275000, revenue: 751660 },
  ];

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !merchant) return;

    const newExp: ExpenseItem = {
      id: `exp-${Date.now()}`,
      date: 'Today, 16 Sep',
      vehicleReg,
      category,
      amount: Number(amount),
      liters: liters ? Number(liters) : undefined,
      merchant,
      invoiceNo: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Approved',
    };

    setExpenses([newExp, ...expenses]);
    setIsExpenseModalOpen(false);
    setAmount('');
    setLiters('');
    setMerchant('');
    showToast('success', 'Expense Logged', `₹${newExp.amount.toLocaleString()} added under ${newExp.category}.`);
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(invAmount) || 0;
    const gst = amt * 0.18;
    const total = amt + gst;

    const newInv: InvoiceItem = {
      id: `inv-${Date.now()}`,
      invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: invCustomer,
      consignmentNo: invConsignment,
      date: 'Today',
      dueDate: 'In 15 Days',
      taxableAmount: amt,
      gstAmount: gst,
      totalAmount: total,
      status: 'Pending',
    };

    setInvoices([newInv, ...invoices]);
    setIsInvoiceModalOpen(false);
    showToast('success', 'Invoice Generated', `${newInv.invoiceNo} raised for ₹${total.toLocaleString()}.`);
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[] = [];

    if (activeTab === 'expenses') {
      headers = ['Date', 'Vehicle Reg', 'Category', 'Amount (INR)', 'Merchant', 'Invoice No', 'Status'];
      rows = filteredExpenses.map((e) => [e.date, e.vehicleReg, e.category, e.amount, e.merchant, e.invoiceNo, e.status]);
    } else {
      headers = ['Invoice No', 'Customer', 'Consignment', 'Date', 'Due Date', 'Taxable', 'GST (18%)', 'Total (INR)', 'Status'];
      rows = filteredInvoices.map((i) => [
        i.invoiceNo,
        i.customerName,
        i.consignmentNo,
        i.date,
        i.dueDate,
        i.taxableAmount,
        i.gstAmount,
        i.totalAmount,
        i.status,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((x: any) => `"${x}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial-ledger-${activeTab}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Exported', `Financial ${activeTab} downloaded as CSV.`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <span>Home</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span>Commercial</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span className="text-blue-600 dark:text-red-400 font-bold">Billing & Accounting</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Billing & Fleet Cost Accounting
            </h1>
            <span className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 text-xs font-bold font-mono-num dark:bg-emerald-950/80 dark:border-emerald-800/80 dark:text-emerald-400">
              ₹28.4 / km Avg Fleet Cost
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-zinc-700 dark:bg-[#111116] dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
            <span>Export CSV</span>
          </button>
          {activeTab === 'expenses' ? (
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Expense Voucher</span>
            </button>
          ) : (
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Generate Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10.5px] font-bold uppercase text-slate-500 dark:text-zinc-400">Total Billed Revenue</span>
          <div className="mt-1 text-xl font-black font-mono-num text-slate-900 dark:text-white">
            ₹{totalBilled.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10.5px] text-emerald-600 font-bold dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            <span>+12.4% vs last cycle</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10.5px] font-bold uppercase text-slate-500 dark:text-zinc-400">Total Operating Expenses</span>
          <div className="mt-1 text-xl font-black font-mono-num text-rose-600 dark:text-red-400">
            ₹{totalExpense.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10.5px] text-emerald-600 font-bold dark:text-emerald-400">
            <TrendingDown className="h-3 w-3" />
            <span>-4.2% optimized</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10.5px] font-bold uppercase text-slate-500 dark:text-zinc-400">Fuel Expenditure</span>
          <div className="mt-1 text-xl font-black font-mono-num text-blue-600 dark:text-blue-400">
            ₹{fuelExpense.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">67% of operating cost</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10.5px] font-bold uppercase text-slate-500 dark:text-zinc-400">FASTag Electronic Tolls</span>
          <div className="mt-1 text-xl font-black font-mono-num text-emerald-600 dark:text-emerald-400">
            ₹{tollExpense.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">100% cashless NETC</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10.5px] font-bold uppercase text-slate-500 dark:text-zinc-400">Net Operating Margin</span>
          <div className="mt-1 text-xl font-black font-mono-num text-emerald-700 dark:text-emerald-300">
            ₹{(totalBilled - totalExpense).toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold dark:text-emerald-400">Healthy 68.2% margin</span>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-bold dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors cursor-pointer ${
            activeTab === 'expenses'
              ? 'border-blue-600 text-blue-600 dark:border-red-500 dark:text-red-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Trip & Fleet Expenses</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[10px] dark:bg-zinc-800">
            {expenses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors cursor-pointer ${
            activeTab === 'invoices'
              ? 'border-blue-600 text-blue-600 dark:border-red-500 dark:text-red-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Freight Invoices & Customer Billing</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[10px] dark:bg-zinc-800">
            {invoices.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('fastag')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors cursor-pointer ${
            activeTab === 'fastag'
              ? 'border-blue-600 text-blue-600 dark:border-red-500 dark:text-red-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>FASTag & Fuel Cards Ledger</span>
        </button>
      </div>

      {/* TAB 1: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-[#0e0e13]">
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-zinc-200">
                Expense Distribution
              </h3>
              <p className="text-[10.5px] text-slate-400">Cost classification for current month</p>
              <div className="h-44 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(categoryColors)[index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      formatter={(val: any) => `₹${Number(val).toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-[#0e0e13]">
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-zinc-200">
                Monthly Operating Cost vs Revenue
              </h3>
              <p className="text-[10.5px] text-slate-400">5-Month historical financial trend</p>
              <div className="h-44 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      formatter={(val: any) => `₹${Number(val).toLocaleString()}`}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
                    <Bar dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs dark:bg-[#0e0e13] dark:border-zinc-800">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {['All', 'Fuel', 'Toll', 'Maintenance', 'Driver Allowance'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-lg px-3 py-1.5 font-bold transition-all cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-blue-600 text-white shadow-xs dark:bg-red-600'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800/80 dark:text-zinc-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search plate, invoice #, merchant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
          </div>

          {/* Expenses Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-zinc-800 dark:bg-[#0e0e13]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-[#121218] dark:text-zinc-400">
                    <th className="py-3 px-3.5">Date</th>
                    <th className="py-3 px-3.5">Asset Registration</th>
                    <th className="py-3 px-3.5">Expense Category</th>
                    <th className="py-3 px-3.5">Merchant / Vendor</th>
                    <th className="py-3 px-3.5">Voucher / Invoice</th>
                    <th className="py-3 px-3.5 text-right">Amount (INR)</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-3.5 text-slate-500 font-mono-num text-[11px] dark:text-zinc-400">{exp.date}</td>
                      <td className="py-3 px-3.5 font-bold font-mono-num text-slate-900 dark:text-white">{exp.vehicleReg}</td>
                      <td className="py-3 px-3.5">
                        <span
                          className="rounded-md px-2 py-0.5 text-[10.5px] font-bold"
                          style={{
                            backgroundColor: `${categoryColors[exp.category]}18`,
                            color: categoryColors[exp.category],
                          }}
                        >
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 dark:text-zinc-300 font-medium">{exp.merchant}</td>
                      <td className="py-3 px-3.5 font-mono-num text-slate-500 dark:text-zinc-400 text-[11px]">{exp.invoiceNo}</td>
                      <td className="py-3 px-3.5 text-right font-black font-mono-num text-slate-900 dark:text-white">
                        ₹{exp.amount.toLocaleString()}
                        {exp.liters && (
                          <span className="block text-[10px] text-slate-400 font-normal">{exp.liters} L</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <StatusBadge status={exp.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-zinc-800 dark:bg-[#0e0e13]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-[#121218] dark:text-zinc-400">
                    <th className="py-3 px-3.5">Invoice #</th>
                    <th className="py-3 px-3.5">Customer / Consignor</th>
                    <th className="py-3 px-3.5">Consignment Ref</th>
                    <th className="py-3 px-3.5">Date Raised</th>
                    <th className="py-3 px-3.5">Due Date</th>
                    <th className="py-3 px-3.5 text-right">Taxable Freight</th>
                    <th className="py-3 px-3.5 text-right">GST (18%)</th>
                    <th className="py-3 px-3.5 text-right">Total Invoice</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-3.5 font-bold font-mono-num text-blue-700 dark:text-blue-400">{inv.invoiceNo}</td>
                      <td className="py-3 px-3.5 font-bold text-slate-800 dark:text-zinc-200">{inv.customerName}</td>
                      <td className="py-3 px-3.5 font-mono-num text-slate-500 dark:text-zinc-400">{inv.consignmentNo}</td>
                      <td className="py-3 px-3.5 text-slate-500 text-[11px]">{inv.date}</td>
                      <td className="py-3 px-3.5 text-slate-700 font-semibold dark:text-zinc-300">{inv.dueDate}</td>
                      <td className="py-3 px-3.5 text-right font-mono-num text-slate-700 dark:text-zinc-300">
                        ₹{inv.taxableAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono-num text-slate-500 text-[11px]">
                        ₹{inv.gstAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-right font-black font-mono-num text-slate-900 dark:text-white">
                        ₹{inv.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <StatusBadge status={inv.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FASTAG & FUEL CARDS */}
      {activeTab === 'fastag' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {vehicles.slice(0, 6).map((veh, idx) => (
              <div
                key={veh.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3 dark:border-zinc-800 dark:bg-[#0e0e13]"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs dark:bg-emerald-950/50 dark:text-emerald-400">
                      NETC
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 font-mono-num dark:text-white">{veh.regNumber}</div>
                      <div className="text-[10px] text-slate-400">{veh.model}</div>
                    </div>
                  </div>
                  <span className="rounded bg-emerald-50 text-emerald-700 font-mono-num text-[10px] font-bold px-1.5 py-0.5 dark:bg-emerald-950 dark:text-emerald-400">
                    Active
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">FASTag RFID Tag:</span>
                    <span className="font-mono-num font-bold text-slate-700 dark:text-zinc-300">
                      34161FA88{idx}921
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Issuing Bank:</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">ICICI Commercial Bank</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1 border-t border-slate-100 dark:border-zinc-800">
                    <span className="text-slate-500 font-bold">Wallet Balance:</span>
                    <span className="text-base font-black font-mono-num text-emerald-600 dark:text-emerald-400">
                      ₹{(4800 + idx * 1250).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => showToast('success', 'Wallet Topped Up', `₹2,000 recharged on ${veh.regNumber} FASTag.`)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  Quick Recharge ₹2,000
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOG EXPENSE MODAL */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Log Vehicle Expense Voucher"
        subtitle="Record fuel slip, toll deduction, or driver batta voucher"
      >
        <form onSubmit={handleAddExpenseSubmit} className="space-y-3">
          <div>
            <label className="text-[10.5px] font-bold uppercase text-slate-500">Commercial Vehicle *</label>
            <select
              value={vehicleReg}
              onChange={(e) => setVehicleReg(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.regNumber}>
                  {v.regNumber} - {v.model}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Expense Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              >
                <option value="Fuel">Fuel (HSD Diesel)</option>
                <option value="Toll">Toll (FASTag / Cash)</option>
                <option value="Maintenance">Maintenance & Spares</option>
                <option value="Driver Allowance">Driver Batta / Daily Food</option>
                <option value="Challan">RTO Traffic Challan</option>
              </select>
            </div>
            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Amount (INR) *</label>
              <input
                type="number"
                placeholder="₹ Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-mono-num text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
          </div>

          {category === 'Fuel' && (
            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Fuel Liters Dispensed</label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={liters}
                onChange={(e) => setLiters(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-mono-num text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="text-[10.5px] font-bold uppercase text-slate-500">Merchant / Retail Station *</label>
            <input
              type="text"
              placeholder="e.g. IOCL Highway Outlet, Barbil"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
            >
              Save Voucher
            </button>
          </div>
        </form>
      </Modal>

      {/* GENERATE INVOICE MODAL */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Generate Customer Freight Invoice"
        subtitle="Raise tax invoice with GST breakdown for completed consignment"
      >
        <form onSubmit={handleCreateInvoiceSubmit} className="space-y-3">
          <div>
            <label className="text-[10.5px] font-bold uppercase text-slate-500">Customer Name *</label>
            <input
              type="text"
              value={invCustomer}
              onChange={(e) => setInvCustomer(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Consignment Number</label>
              <input
                type="text"
                value={invConsignment}
                onChange={(e) => setInvConsignment(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-mono-num text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Taxable Freight Amount (INR) *</label>
              <input
                type="number"
                value={invAmount}
                onChange={(e) => setInvAmount(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-mono-num text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-2.5 text-xs space-y-1 dark:bg-zinc-800">
            <div className="flex justify-between text-slate-500">
              <span>GST Rate:</span>
              <span>18.0% (CGST 9% + SGST 9%)</span>
            </div>
            <div className="flex justify-between font-bold text-slate-800 dark:text-white">
              <span>Estimated Total with GST:</span>
              <span>₹{(parseFloat(invAmount || '0') * 1.18).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
            >
              Generate Tax Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
