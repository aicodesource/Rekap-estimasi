import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { Transaction, Biller, CA, AuditLog } from "@/src/types";
import { formatCurrency, formatNumber, formatDate, cn } from "@/src/lib/utils";

interface DashboardViewProps {
  txs: Transaction[];
  billers: Biller[];
  cas: CA[];
  auditLogs: AuditLog[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardView({ txs, billers, cas, auditLogs }: DashboardViewProps) {
  const totalNominal = useMemo(() => txs.reduce((sum, tx) => sum + tx.nominal, 0), [txs]);
  
  const trendData = useMemo(() => {
    const daily: Record<string, number> = {};
    txs.forEach(tx => {
      const date = tx.tgl || "Unknown";
      daily[date] = (daily[date] || 0) + (tx.lembar || 1);
    });
    return Object.entries(daily)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
  }, [txs]);

  const caDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    txs.forEach(tx => {
      const caName = cas.find(c => c.kode === tx.ca)?.nama || tx.ca;
      counts[caName] = (counts[caName] || 0) + (tx.lembar || 1);
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [txs, cas]);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Transaksi", value: formatNumber(txs.length), sub: "Semua periode", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
          { label: "Total Nominal", value: formatCurrency(totalNominal), sub: "IDR", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Total Biller", value: formatNumber(billers.length), sub: "Aktif & Nonaktif", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
          { label: "Total CA", value: formatNumber(cas.length), sub: "Partner Agent", color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all hover:shadow-md">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 font-bold", stat.color)}>
              {stat.label[0]}
            </div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-[10px] text-neutral-400 mt-1 font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Tren Transaksi Harian</h3>
              <p className="text-xs text-neutral-400 font-medium">Jumlah lembar transaksi 7 hari terakhir</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#a3a3a3" }} 
                  dy={10}
                  tickFormatter={(date) => formatDate(date)}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#a3a3a3" }} 
                />
                <Tooltip 
                  cursor={{ fill: "#f5f5f5" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <h3 className="text-lg font-bold mb-1">Distribusi CA</h3>
          <p className="text-xs text-neutral-400 font-medium mb-8">Top 5 Collecting Agent</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={caDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {caDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Riwayat Aktivitas</h3>
            <p className="text-xs text-neutral-400 font-medium">Log perubahan data terbaru</p>
          </div>
          <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 transition-all">
            Lihat Semua
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 text-[10px] uppercase tracking-[0.2em] font-bold">
              <tr>
                <th className="px-8 py-5 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-serif italic lowercase opacity-70 tracking-normal text-xs mr-1">a</span>
                  Aksi
                </th>
                <th className="px-8 py-5 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-serif italic lowercase opacity-70 tracking-normal text-xs mr-1">t</span>
                  Tanggal
                </th>
                <th className="px-8 py-5 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-serif italic lowercase opacity-70 tracking-normal text-xs mr-1">c</span>
                  CA / Biller
                </th>
                <th className="px-8 py-5 text-right border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-serif italic lowercase opacity-70 tracking-normal text-xs mr-1">n</span>
                  Nominal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-neutral-400 italic font-medium">
                    Belum ada aktivitas tercatat
                  </td>
                </tr>
              ) : (
                auditLogs.slice(0, 5).map((log, i) => (
                  <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all group relative">
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border",
                        log.tipe === "success" ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30" : 
                        log.tipe === "danger" ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/30" : 
                        log.tipe === "warning" ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30" :
                        "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30"
                      )}>
                        {log.aksi}
                      </span>
                      
                      {/* Tooltip Detail */}
                      <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 p-6 bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-100 dark:border-neutral-800 pointer-events-none">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Detail Aktivitas</p>
                        </div>
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-400 font-medium">Aksi</span>
                            <span className="font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-tighter">{log.aksi}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-400 font-medium">Tanggal</span>
                            <span className="font-bold text-neutral-700 dark:text-neutral-300">{formatDate(log.tgl)}</span>
                          </div>
                          <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                          <div className="flex justify-between items-start">
                            <span className="text-neutral-400 font-medium">Modul</span>
                            <span className="font-bold text-neutral-700 dark:text-neutral-300 text-right">{log.modul}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-neutral-400 font-medium">User</span>
                            <span className="font-bold text-neutral-700 dark:text-neutral-300 text-right">{log.user}</span>
                          </div>
                          <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                          <div className="text-neutral-400 font-medium mb-1">Detail:</div>
                          <div className="text-neutral-700 dark:text-neutral-300 text-[10px] leading-relaxed break-words">{log.detail}</div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-neutral-900" />
                      </div>
                    </td>
                    <td className="px-8 py-6 text-neutral-500 font-medium">{formatDate(log.tgl)}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-700 dark:text-neutral-300 leading-tight">{log.modul}</span>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {log.tipe.toUpperCase()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
