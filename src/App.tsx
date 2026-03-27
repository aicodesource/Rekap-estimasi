import { useState, useEffect, useMemo } from "react";
import { 
  LayoutDashboard, 
  Database, 
  FileText, 
  Settings2, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  Save, 
  RotateCcw,
  ChevronDown,
  LogOut,
  Download,
  Users,
  DollarSign,
  CreditCard,
  Upload,
  Trash2,
  List,
  BarChart3,
  Bell,
  History,
  CheckSquare,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { 
  Biller, CA, Fee, Transaction, Settlement, 
  BeritaAcara, AuditLog, ImportRemap, 
  ImportNoHdrFmt, ImportBillerRule, ImportCARemap,
  Notification, ReconResult
} from "@/src/types";

// Views
import DashboardView from "./components/DashboardView";
import MasterDataView from "./components/MasterDataView";
import RekapView from "./components/RekapView";
import KelolaView from "./components/KelolaView";
import AuditLogView from "./components/AuditLogView";

// Default Data
const DEFAULT_BILLERS: Biller[] = [
  { id: 1, no: 1, kode: "1000", nama: "PERUMDAM Tirta Kerta Raharja", status: "Aktif" },
  { id: 2, no: 2, kode: "1001", nama: "PERUMDA Tirta Benteng", status: "Aktif" },
  { id: 3, no: 3, kode: "1002", nama: "PERUMDA Tirtanadi Sumut", status: "Aktif" },
];

const DEFAULT_CAS: CA[] = [
  { id: 1, no: 1, kode: "10028", nama: "PPOB Tektaya", status: "Aktif" },
  { id: 2, no: 2, kode: "20028", nama: "BANK OCBC NISP", status: "Aktif" },
  { id: 3, no: 3, kode: "0002", nama: "BANK BRI", status: "Aktif" },
];

const SAMPLE_TXS: Transaction[] = [
  { id: 1, txid: "0123456789", tgl: "2026-03-24", periode: "202603", ca: "10028", biller: "1000", lembar: 1, nominal: 150000, status: "Cocok" },
  { id: 2, txid: "9876543210", tgl: "2026-03-24", periode: "202603", ca: "20028", biller: "1001", lembar: 2, nominal: 300000, status: "Cocok" },
  { id: 3, txid: "1122334455", tgl: "2026-03-23", periode: "202603", ca: "0002", biller: "1002", lembar: 1, nominal: 75000, status: "Cocok" },
];

const SAMPLE_LOGS: AuditLog[] = [
  { id: 1, aksi: "Import", tgl: "2026-03-24 10:00:00", user: "Admin", modul: "Import", detail: "Import data CA 10028", tipe: "success" },
  { id: 2, aksi: "Update", tgl: "2026-03-24 11:30:00", user: "Admin", modul: "Master Biller", detail: "Update status biller 1000", tipe: "info" },
];

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("rd_dark");
    if (saved !== null) return saved === "1";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // Data State
  const [billers, setBillers] = useState<Biller[]>(() => {
    const saved = localStorage.getItem("rd_v6");
    return saved ? JSON.parse(saved).billers : DEFAULT_BILLERS;
  });
  const [cas, setCas] = useState<CA[]>(() => {
    const saved = localStorage.getItem("rd_v6");
    return saved ? JSON.parse(saved).cas : DEFAULT_CAS;
  });
  const [txs, setTxs] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("rd_v6");
    return saved ? JSON.parse(saved).txs : SAMPLE_TXS;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem("rd_v6");
    return saved && JSON.parse(saved).auditLogs ? JSON.parse(saved).auditLogs : SAMPLE_LOGS;
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("rd_v6");
    return saved && JSON.parse(saved).notifications ? JSON.parse(saved).notifications : [
      { id: 1, judul: "Import Berhasil", pesan: "Data CA 10028 berhasil diimport", tgl: "2026-03-24", tipe: "success", read: false },
      { id: 2, judul: "Peringatan", pesan: "Ada 5 transaksi suspect pada CA 20028", tgl: "2026-03-24", tipe: "warning", read: false }
    ];
  });
  const [reconResults, setReconResults] = useState<ReconResult[]>(() => {
    const saved = localStorage.getItem("rd_v6");
    return saved && JSON.parse(saved).reconResults ? JSON.parse(saved).reconResults : [];
  });
  const [impRemap, setImpRemap] = useState<ImportRemap[]>(() => {
    const saved = localStorage.getItem("rd_v6");
    return saved && JSON.parse(saved).impRemap ? JSON.parse(saved).impRemap : [
      { id: 1, ca: "20002", billerAsal: "1449", billerTujuan: "1049" },
      { id: 2, ca: "20002", billerAsal: "1049", billerTujuan: "1047" },
    ];
  });
  const [impNoHdr, setImpNoHdr] = useState<ImportNoHdrFmt[]>(() => {
    const saved = localStorage.getItem("rd_v6");
    return saved && JSON.parse(saved).impNoHdr ? JSON.parse(saved).impNoHdr : [];
  });
  const [impBillerRule, setImpBillerRule] = useState<ImportBillerRule[]>(() => {
    const saved = localStorage.getItem("rd_v6");
    return saved && JSON.parse(saved).impBillerRule ? JSON.parse(saved).impBillerRule : [];
  });
  const [impCARemap, setImpCARemap] = useState<ImportCARemap[]>(() => {
    const saved = localStorage.getItem("rd_v6");
    return saved && JSON.parse(saved).impCARemap ? JSON.parse(saved).impCARemap : [];
  });
  const [fees, setFees] = useState<Fee[]>(() => {
    const saved = localStorage.getItem("rd_v6");
    return saved && JSON.parse(saved).fees ? JSON.parse(saved).fees : [];
  });
  const [settlements, setSettlements] = useState<Settlement[]>(() => {
    const saved = localStorage.getItem("rd_v6");
    return saved && JSON.parse(saved).settlements ? JSON.parse(saved).settlements : [];
  });
  const [beritaAcaras, setBeritaAcaras] = useState<BeritaAcara[]>(() => {
    const saved = localStorage.getItem("rd_v6");
    return saved && JSON.parse(saved).beritaAcaras ? JSON.parse(saved).beritaAcaras : [];
  });

  // Persistence
  useEffect(() => {
    const data = { 
      billers, cas, txs, auditLogs, impRemap, impNoHdr, 
      impBillerRule, impCARemap, fees, settlements, beritaAcaras,
      notifications, reconResults
    };
    localStorage.setItem("rd_v6", JSON.stringify(data));
  }, [billers, cas, txs, auditLogs, impRemap, impNoHdr, impBillerRule, impCARemap, fees, settlements, beritaAcaras, notifications, reconResults]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("rd_dark", isDarkMode ? "1" : "0");
  }, [isDarkMode]);

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Main" },
    { id: "master-biller", label: "Master Biller", icon: Database, group: "Master Data" },
    { id: "master-ca", label: "Master CA", icon: Users, group: "Master Data" },
    { id: "master-fee", label: "Fee & Admin", icon: DollarSign, group: "Master Data" },
    { id: "master-settlement", label: "Bank Settlement", icon: CreditCard, group: "Master Data" },
    { id: "rekap-detail", label: "Detail Transaksi", icon: List, group: "Laporan" },
    { id: "rekap-rekap", label: "Rekap Transaksi", icon: BarChart3, group: "Laporan" },
    { id: "kelola-import", label: "Import Data", icon: Upload, group: "Kelola" },
    { id: "kelola-ba", label: "Berita Acara", icon: FileText, group: "Kelola" },
    { id: "kelola-aturan", label: "Aturan Import", icon: Settings2, group: "Kelola" },
    { id: "kelola-recon", label: "Rekonsiliasi", icon: CheckSquare, group: "Kelola" },
    { id: "audit-logs", label: "Audit Logs", icon: History, group: "System" },
    { id: "kelola-hapus", label: "Hapus Data", icon: Trash2, group: "Kelola" },
  ];

  // Grouped navigation
  const groupedNavigation = useMemo(() => {
    const groups: Record<string, typeof navigation> = {};
    navigation.forEach(item => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });
    return groups;
  }, [navigation]);

  const handleExportBackup = () => {
    const data = { billers, cas, txs, auditLogs, version: "2.0", timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekap_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              R
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Rekap<span className="text-blue-600">App</span></h1>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">Transaction Manager</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {Object.entries(groupedNavigation).map(([group, items]) => (
              <div key={group} className="space-y-2">
                <h3 className="px-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">{group}</h3>
                <div className="space-y-1">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200",
                        activePage === item.id 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                          : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4", activePage === item.id ? "text-white" : "text-blue-600")} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-neutral-100 dark:border-neutral-800">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-5 h-5">
                  <AnimatePresence mode="wait">
                    {isDarkMode ? (
                      <motion.div
                        key="sun"
                        initial={{ scale: 0, rotate: -90, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0, rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="w-5 h-5 text-amber-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ scale: 0, rotate: -90, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0, rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="w-5 h-5 text-blue-600" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
              </div>
              <motion.div 
                className="w-10 h-5 rounded-full relative flex items-center px-1"
                animate={{ 
                  backgroundColor: isDarkMode ? "#2563eb" : "#d4d4d4" 
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-3 h-3 rounded-full bg-white shadow-sm"
                  animate={{ 
                    x: isDarkMode ? 20 : 0 
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 30 
                  }}
                />
              </motion.div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold capitalize">
              {navigation.find(n => n.id === activePage)?.label || activePage}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full text-[11px] text-neutral-500">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Auto-saved
            </div>
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900" />
                )}
              </button>
              
              <AnimatePresence>
                {isNotifOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setIsNotifOpen(false)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                        <h3 className="font-bold text-sm">Notifikasi</h3>
                        <button 
                          onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                          className="text-[10px] font-bold text-blue-600 uppercase tracking-widest"
                        >
                          Tandai Semua Dibaca
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-neutral-400 italic text-xs">Tidak ada notifikasi</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={cn("p-4 border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors", !n.read && "bg-blue-50/30 dark:bg-blue-900/10")}>
                              <div className="flex gap-3">
                                <div className={cn("w-2 h-2 mt-1.5 rounded-full flex-shrink-0", 
                                  n.tipe === "success" ? "bg-green-500" : 
                                  n.tipe === "warning" ? "bg-amber-500" : 
                                  n.tipe === "error" ? "bg-red-500" : "bg-blue-500"
                                )} />
                                <div>
                                  <p className="text-xs font-bold leading-tight">{n.judul}</p>
                                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">{n.pesan}</p>
                                  <p className="text-[9px] text-neutral-400 mt-2 font-medium uppercase tracking-widest">{n.tgl}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleExportBackup}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Backup Data</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activePage === "dashboard" && <DashboardView txs={txs} billers={billers} cas={cas} auditLogs={auditLogs} />}
            {activePage === "audit-logs" && <AuditLogView auditLogs={auditLogs} />}
            {activePage.startsWith("master-") && (
              <MasterDataView 
                billers={billers} 
                cas={cas} 
                fees={fees}
                setFees={setFees}
                settlements={settlements}
                setSettlements={setSettlements}
                initialTab={activePage.split("-")[1] as any} 
                hideTabs={true}
              />
            )}
            {activePage.startsWith("rekap-") && (
              <RekapView 
                txs={txs} 
                billers={billers} 
                cas={cas} 
                initialMode={activePage.split("-")[1] as any} 
                hideTabs={true}
              />
            )}
            {activePage.startsWith("kelola-") && (
              <KelolaView 
                impRemap={impRemap} setImpRemap={setImpRemap} 
                impNoHdr={impNoHdr} setImpNoHdr={setImpNoHdr}
                impBillerRule={impBillerRule} setImpBillerRule={setImpBillerRule}
                impCARemap={impCARemap} setImpCARemap={setImpCARemap}
                txs={txs} setTxs={setTxs} 
                billers={billers} cas={cas} 
                beritaAcaras={beritaAcaras}
                setBeritaAcaras={setBeritaAcaras}
                reconResults={reconResults}
                setReconResults={setReconResults}
                auditLogs={auditLogs}
                setAuditLogs={setAuditLogs}
                notifications={notifications}
                setNotifications={setNotifications}
                initialTab={activePage.split("-")[1] as any}
                hideTabs={true}
              />
            )}
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

