import React, { useState, useEffect, useMemo, Dispatch, SetStateAction, ChangeEvent } from "react";
import { 
  Upload, 
  Trash2, 
  FileText, 
  Settings, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Plus,
  Edit2,
  X,
  Search,
  Filter,
  AlertTriangle,
  RefreshCw,
  CheckSquare,
  FileUp,
  Download,
  Eye,
  History,
  Bell
} from "lucide-react";
import { cn, formatCurrency, getYesterdayDate, formatDate } from "@/src/lib/utils";
import { 
  ImportRemap, 
  Transaction, 
  Biller, 
  CA, 
  ImportNoHdrFmt, 
  ImportBillerRule, 
  ImportCARemap, 
  BeritaAcara,
  AuditLog,
  Notification,
  ReconResult
} from "@/src/types";
import { DateRangePicker } from "./ui/DateRangePicker";

type KelolaTab = "import" | "hapus" | "ba" | "aturan" | "recon" | "audit" | "notif";

interface KelolaViewProps {
  impRemap: ImportRemap[];
  setImpRemap: Dispatch<SetStateAction<ImportRemap[]>>;
  impNoHdr: ImportNoHdrFmt[];
  setImpNoHdr: Dispatch<SetStateAction<ImportNoHdrFmt[]>>;
  impBillerRule: ImportBillerRule[];
  setImpBillerRule: Dispatch<SetStateAction<ImportBillerRule[]>>;
  impCARemap: ImportCARemap[];
  setImpCARemap: Dispatch<SetStateAction<ImportCARemap[]>>;
  txs: Transaction[];
  setTxs: Dispatch<SetStateAction<Transaction[]>>;
  billers: Biller[];
  cas: CA[];
  beritaAcaras: BeritaAcara[];
  setBeritaAcaras: Dispatch<SetStateAction<BeritaAcara[]>>;
  reconResults: ReconResult[];
  setReconResults: Dispatch<SetStateAction<ReconResult[]>>;
  auditLogs: AuditLog[];
  setAuditLogs: Dispatch<SetStateAction<AuditLog[]>>;
  notifications: Notification[];
  setNotifications: Dispatch<SetStateAction<Notification[]>>;
  initialTab?: KelolaTab;
  hideTabs?: boolean;
}

export default function KelolaView({ 
  impRemap, setImpRemap, 
  impNoHdr, setImpNoHdr,
  impBillerRule, setImpBillerRule,
  impCARemap, setImpCARemap,
  txs, setTxs, billers, cas,
  beritaAcaras, setBeritaAcaras,
  reconResults, setReconResults,
  auditLogs, setAuditLogs,
  notifications, setNotifications,
  initialTab = "import",
  hideTabs = false
}: KelolaViewProps) {
  const [activeTab, setActiveTab] = useState<KelolaTab>(initialTab);

  // Update activeTab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const tabs: { id: KelolaTab; label: string; icon: any }[] = [
    { id: "import", label: "Import Data", icon: Upload },
    { id: "recon", label: "Rekonsiliasi", icon: CheckSquare },
    { id: "ba", label: "Berita Acara", icon: FileText },
    { id: "aturan", label: "Aturan Import", icon: Settings },
    { id: "hapus", label: "Hapus Data", icon: Trash2 },
    { id: "audit", label: "Audit Logs", icon: History },
    { id: "notif", label: "Notifikasi", icon: Bell },
  ];

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      {!hideTabs && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all duration-200",
                activeTab === tab.id 
                  ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20 scale-[1.02]" 
                  : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-blue-200 dark:hover:border-blue-900/50"
              )}
            >
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-white" : "text-blue-600")} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-center">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden min-h-[500px]">
        {activeTab === "import" && <ImportTab setAuditLogs={setAuditLogs} setNotifications={setNotifications} />}
        {activeTab === "hapus" && <HapusTab txs={txs} setTxs={setTxs} billers={billers} cas={cas} setAuditLogs={setAuditLogs} />}
        {activeTab === "ba" && <BeritaAcaraTab beritaAcaras={beritaAcaras} setBeritaAcaras={setBeritaAcaras} setAuditLogs={setAuditLogs} />}
        {activeTab === "recon" && <ReconTab reconResults={reconResults} setReconResults={setReconResults} cas={cas} billers={billers} setAuditLogs={setAuditLogs} />}
        {activeTab === "aturan" && (
          <AturanTab 
            impRemap={impRemap} setImpRemap={setImpRemap} 
            impNoHdr={impNoHdr} setImpNoHdr={setImpNoHdr}
            impBillerRule={impBillerRule} setImpBillerRule={setImpBillerRule}
            impCARemap={impCARemap} setImpCARemap={setImpCARemap}
            setAuditLogs={setAuditLogs}
          />
        )}
        {activeTab === "audit" && <AuditLogTab logs={auditLogs} />}
        {activeTab === "notif" && <NotificationTab notifications={notifications} setNotifications={setNotifications} />}
      </div>
    </div>
  );
}

// ... ImportTab, HapusTab, BeritaAcaraTab implementations ...

// AturanTab implementation
function AturanTab({ 
  impRemap, setImpRemap,
  impNoHdr, setImpNoHdr,
  impBillerRule, setImpBillerRule,
  impCARemap, setImpCARemap,
  setAuditLogs
}: { 
  impRemap: ImportRemap[]; setImpRemap: Dispatch<SetStateAction<ImportRemap[]>>;
  impNoHdr: ImportNoHdrFmt[]; setImpNoHdr: Dispatch<SetStateAction<ImportNoHdrFmt[]>>;
  impBillerRule: ImportBillerRule[]; setImpBillerRule: Dispatch<SetStateAction<ImportBillerRule[]>>;
  impCARemap: ImportCARemap[]; setImpCARemap: Dispatch<SetStateAction<ImportCARemap[]>>;
  setAuditLogs: Dispatch<SetStateAction<AuditLog[]>>;
}) {
  const [subTab, setSubTab] = useState<"biller" | "ca" | "nohdr" | "digit">("biller");

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl w-fit overflow-x-auto max-w-full">
        {[
          { id: "biller", label: "Remap Biller" },
          { id: "ca", label: "Remap CA" },
          { id: "nohdr", label: "Format No Header" },
          { id: "digit", label: "Digit ID Pel" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id as any)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
              subTab === t.id 
                ? "bg-white dark:bg-neutral-700 text-blue-600 shadow-sm" 
                : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "biller" && <BillerRemapSection impRemap={impRemap} setImpRemap={setImpRemap} setAuditLogs={setAuditLogs} />}
      {subTab === "ca" && <CARemapSection impCARemap={impCARemap} setImpCARemap={setImpCARemap} setAuditLogs={setAuditLogs} />}
      {subTab === "nohdr" && <NoHdrSection impNoHdr={impNoHdr} setImpNoHdr={setImpNoHdr} setAuditLogs={setAuditLogs} />}
      {subTab === "digit" && <BillerRuleSection impBillerRule={impBillerRule} setImpBillerRule={setImpBillerRule} setAuditLogs={setAuditLogs} />}
    </div>
  );
}

function BillerRemapSection({ impRemap, setImpRemap, setAuditLogs }: { impRemap: ImportRemap[]; setImpRemap: Dispatch<SetStateAction<ImportRemap[]>>; setAuditLogs: Dispatch<SetStateAction<AuditLog[]>> }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ImportRemap | null>(null);
  const [formData, setFormData] = useState({ ca: "", billerAsal: "", billerTujuan: "", enabled: true });
  const [errors, setErrors] = useState({ ca: "", billerAsal: "", billerTujuan: "" });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const validate = () => {
    const newErrors = { ca: "", billerAsal: "", billerTujuan: "" };
    let isValid = true;
    
    const codeRegex = /^[A-Z0-9_-]+$/;

    if (!formData.ca.trim()) { 
      newErrors.ca = "Kode CA wajib diisi"; 
      isValid = false; 
    } else if (!codeRegex.test(formData.ca)) {
      newErrors.ca = "Format tidak valid (A-Z, 0-9, _, -)";
      isValid = false;
    }

    if (!formData.billerAsal.trim()) { 
      newErrors.billerAsal = "Source Biller Code wajib diisi"; 
      isValid = false; 
    } else if (!codeRegex.test(formData.billerAsal)) {
      newErrors.billerAsal = "Format tidak valid";
      isValid = false;
    }

    if (!formData.billerTujuan.trim()) { 
      newErrors.billerTujuan = "Biller Tujuan wajib diisi"; 
      isValid = false; 
    } else if (!codeRegex.test(formData.billerTujuan)) {
      newErrors.billerTujuan = "Format tidak valid";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleOpenModal = (rule: ImportRemap | null = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({ ca: rule.ca, billerAsal: rule.billerAsal, billerTujuan: rule.billerTujuan, enabled: rule.enabled ?? true });
    } else {
      setEditingRule(null);
      setFormData({ ca: "", billerAsal: "", billerTujuan: "", enabled: true });
    }
    setErrors({ ca: "", billerAsal: "", billerTujuan: "" });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingRule) {
      setImpRemap(prev => prev.map(r => r.id === editingRule.id ? { ...r, ...formData } : r));
      setAuditLogs(prev => [{
        id: Date.now(),
        aksi: "Update Aturan Remap Biller",
        tgl: new Date().toISOString(),
        user: "Admin",
        modul: "Aturan Import",
        detail: `Update aturan remap biller untuk CA ${formData.ca}`,
        sebelum: JSON.stringify(editingRule),
        sesudah: JSON.stringify({ ...editingRule, ...formData }),
        tipe: "info"
      }, ...prev]);
    } else {
      const newRule = { id: Date.now(), ...formData };
      setImpRemap(prev => [...prev, newRule]);
      setAuditLogs(prev => [{
        id: Date.now(),
        aksi: "Tambah Aturan Remap Biller",
        tgl: new Date().toISOString(),
        user: "Admin",
        modul: "Aturan Import",
        detail: `Tambah aturan remap biller baru untuk CA ${formData.ca}`,
        sesudah: JSON.stringify(newRule),
        tipe: "success"
      }, ...prev]);
    }
    setIsModalOpen(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === impRemap.length && impRemap.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(impRemap.map(r => r.id)));
    }
  };

  const toggleSelectOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const bulkDelete = () => {
    if (selectedIds.size === 0) return;
    setImpRemap(prev => prev.filter(r => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
  };

  const bulkToggleEnabled = (enabled: boolean) => {
    if (selectedIds.size === 0) return;
    setImpRemap(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, enabled } : r));
    setSelectedIds(new Set());
  };

  const handleDelete = (id: number) => {
    setImpRemap(prev => prev.filter(r => r.id !== id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleEnabled = (id: number) => {
    setImpRemap(prev => prev.map(r => r.id === id ? { ...r, enabled: !(r.enabled ?? true) } : r));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-blue-600">Remapping Kode Biller</h4>
          <p className="text-xs text-neutral-400 font-medium">Ganti kode biller tertentu berdasarkan CA saat proses import</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-in fade-in slide-in-from-right-4">
              <span className="text-[10px] font-bold text-neutral-500 mr-2">{selectedIds.size} Terpilih</span>
              <button onClick={() => bulkToggleEnabled(true)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title="Enable Selected"><CheckCircle2 className="w-4 h-4" /></button>
              <button onClick={() => bulkToggleEnabled(false)} className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Disable Selected"><AlertCircle className="w-4 h-4" /></button>
              <button onClick={bulkDelete} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Selected"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
            <Plus className="w-4 h-4" /> Tambah Aturan
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-neutral-100 dark:border-neutral-800">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 font-bold">
            <tr>
              <th className="w-12 px-6 py-3">
                <input 
                  type="checkbox" 
                  checked={selectedIds.size === impRemap.length && impRemap.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3">Kode CA</th>
              <th className="px-6 py-3">Source Biller Code</th>
              <th className="px-6 py-3 text-center">→</th>
              <th className="px-6 py-3">Biller Tujuan</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {impRemap.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-neutral-400 italic">Belum ada aturan remapping</td></tr>
            ) : (
              impRemap.map((rule) => (
                <tr key={rule.id} className={cn(
                  "hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors",
                  selectedIds.has(rule.id) && "bg-blue-50/50 dark:bg-blue-900/10"
                )}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(rule.id)}
                      onChange={() => toggleSelectOne(rule.id)}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-neutral-700 dark:text-neutral-300">{rule.ca}</td>
                  <td className="px-6 py-4 font-medium text-neutral-500">{rule.billerAsal}</td>
                  <td className="px-6 py-4 text-center text-neutral-300">→</td>
                  <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{rule.billerTujuan}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleEnabled(rule.id)}
                      className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all hover:scale-105 active:scale-95",
                        (rule.enabled ?? true) 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50" 
                          : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      )}
                      title="Klik untuk ganti status"
                    >
                      {(rule.enabled ?? true) ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(rule)} className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(rule.id)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold">{editingRule ? "Edit Aturan" : "Tambah Aturan"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Kode CA</label>
                <input 
                  type="text" 
                  value={formData.ca} 
                  onChange={(e) => setFormData(prev => ({ ...prev, ca: e.target.value.toUpperCase() }))} 
                  className={cn(
                    "w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20",
                    errors.ca && "ring-2 ring-red-500/50"
                  )} 
                  placeholder="CONTOH: BANK_ABC"
                />
                {errors.ca && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.ca}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Source Biller Code</label>
                  <input 
                    type="text" 
                    value={formData.billerAsal} 
                    onChange={(e) => setFormData(prev => ({ ...prev, billerAsal: e.target.value.toUpperCase() }))} 
                    className={cn(
                      "w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20",
                      errors.billerAsal && "ring-2 ring-red-500/50"
                    )} 
                    placeholder="KODE LAMA"
                  />
                  {errors.billerAsal && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.billerAsal}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Biller Tujuan</label>
                  <input 
                    type="text" 
                    value={formData.billerTujuan} 
                    onChange={(e) => setFormData(prev => ({ ...prev, billerTujuan: e.target.value.toUpperCase() }))} 
                    className={cn(
                      "w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20",
                      errors.billerTujuan && "ring-2 ring-red-500/50"
                    )} 
                    placeholder="KODE BARU"
                  />
                  {errors.billerTujuan && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.billerTujuan}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="rule-enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="rule-enabled" className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest cursor-pointer">Aktifkan Aturan</label>
              </div>
            </div>
            <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-sm font-bold rounded-xl hover:bg-neutral-50 transition-all">Batal</button>
              <button onClick={handleSave} className="flex-1 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CARemapSection({ impCARemap, setImpCARemap, setAuditLogs }: { impCARemap: ImportCARemap[]; setImpCARemap: Dispatch<SetStateAction<ImportCARemap[]>>; setAuditLogs: Dispatch<SetStateAction<AuditLog[]>> }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ImportCARemap | null>(null);
  const [formData, setFormData] = useState({ caAsal: "", biller: "", caTujuan: "", enabled: true });
  const [errors, setErrors] = useState({ caAsal: "", biller: "", caTujuan: "" });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const validate = () => {
    const newErrors = { caAsal: "", biller: "", caTujuan: "" };
    let isValid = true;
    const codeRegex = /^[A-Z0-9_-]+$/;

    if (!formData.biller.trim()) {
      newErrors.biller = "Kode Biller wajib diisi";
      isValid = false;
    } else if (!codeRegex.test(formData.biller)) {
      newErrors.biller = "Format tidak valid";
      isValid = false;
    }

    if (!formData.caAsal.trim()) {
      newErrors.caAsal = "CA Asal wajib diisi";
      isValid = false;
    } else if (!codeRegex.test(formData.caAsal)) {
      newErrors.caAsal = "Format tidak valid";
      isValid = false;
    }

    if (!formData.caTujuan.trim()) {
      newErrors.caTujuan = "CA Tujuan wajib diisi";
      isValid = false;
    } else if (!codeRegex.test(formData.caTujuan)) {
      newErrors.caTujuan = "Format tidak valid";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleOpenModal = (rule: ImportCARemap | null = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({ caAsal: rule.caAsal, biller: rule.biller, caTujuan: rule.caTujuan, enabled: rule.enabled ?? true });
    } else {
      setEditingRule(null);
      setFormData({ caAsal: "", biller: "", caTujuan: "", enabled: true });
    }
    setErrors({ caAsal: "", biller: "", caTujuan: "" });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingRule) {
      setImpCARemap(prev => prev.map(r => r.id === editingRule.id ? { ...r, ...formData } : r));
      setAuditLogs(prev => [{
        id: Date.now(),
        aksi: "Update Aturan Remap CA",
        tgl: new Date().toISOString(),
        user: "Admin",
        modul: "Aturan Import",
        detail: `Update aturan remap CA untuk Biller ${formData.biller}`,
        sebelum: JSON.stringify(editingRule),
        sesudah: JSON.stringify({ ...editingRule, ...formData }),
        tipe: "info"
      }, ...prev]);
    } else {
      const newRule = { id: Date.now(), ...formData };
      setImpCARemap(prev => [...prev, newRule]);
      setAuditLogs(prev => [{
        id: Date.now(),
        aksi: "Tambah Aturan Remap CA",
        tgl: new Date().toISOString(),
        user: "Admin",
        modul: "Aturan Import",
        detail: `Tambah aturan remap CA baru untuk Biller ${formData.biller}`,
        sesudah: JSON.stringify(newRule),
        tipe: "success"
      }, ...prev]);
    }
    setIsModalOpen(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === impCARemap.length && impCARemap.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(impCARemap.map(r => r.id)));
    }
  };

  const toggleSelectOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const bulkDelete = () => {
    if (selectedIds.size === 0) return;
    setImpCARemap(prev => prev.filter(r => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
  };

  const bulkToggleEnabled = (enabled: boolean) => {
    if (selectedIds.size === 0) return;
    setImpCARemap(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, enabled } : r));
    setSelectedIds(new Set());
  };

  const handleDelete = (id: number) => {
    setImpCARemap(prev => prev.filter(r => r.id !== id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleEnabled = (id: number) => {
    setImpCARemap(prev => prev.map(r => r.id === id ? { ...r, enabled: !(r.enabled ?? true) } : r));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-blue-600">Remapping Kode CA</h4>
          <p className="text-xs text-neutral-400 font-medium">Ganti kode CA tertentu berdasarkan Biller saat proses import</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-in fade-in slide-in-from-right-4">
              <span className="text-[10px] font-bold text-neutral-500 mr-2">{selectedIds.size} Terpilih</span>
              <button onClick={() => bulkToggleEnabled(true)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title="Enable Selected"><CheckCircle2 className="w-4 h-4" /></button>
              <button onClick={() => bulkToggleEnabled(false)} className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Disable Selected"><AlertCircle className="w-4 h-4" /></button>
              <button onClick={bulkDelete} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Selected"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
            <Plus className="w-4 h-4" /> Tambah Aturan
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-neutral-100 dark:border-neutral-800">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 font-bold">
            <tr>
              <th className="w-12 px-6 py-3">
                <input 
                  type="checkbox" 
                  checked={selectedIds.size === impCARemap.length && impCARemap.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3">Biller</th>
              <th className="px-6 py-3">CA Asal</th>
              <th className="px-6 py-3 text-center">→</th>
              <th className="px-6 py-3">CA Tujuan</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {impCARemap.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-neutral-400 italic">Belum ada aturan remapping CA</td></tr>
            ) : (
              impCARemap.map((rule) => (
                <tr key={rule.id} className={cn(
                  "hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors",
                  selectedIds.has(rule.id) && "bg-blue-50/50 dark:bg-blue-900/10"
                )}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(rule.id)}
                      onChange={() => toggleSelectOne(rule.id)}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-neutral-700 dark:text-neutral-300">{rule.biller}</td>
                  <td className="px-6 py-4 font-medium text-neutral-500">{rule.caAsal}</td>
                  <td className="px-6 py-4 text-center text-neutral-300">→</td>
                  <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{rule.caTujuan}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleEnabled(rule.id)}
                      className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all hover:scale-105 active:scale-95",
                        (rule.enabled ?? true) 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50" 
                          : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      )}
                      title="Klik untuk ganti status"
                    >
                      {(rule.enabled ?? true) ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(rule)} className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(rule.id)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold">{editingRule ? "Edit Aturan Remap CA" : "Tambah Aturan Remap CA"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Kode Biller</label>
                <input 
                  type="text" 
                  value={formData.biller} 
                  onChange={(e) => setFormData(prev => ({ ...prev, biller: e.target.value.toUpperCase() }))} 
                  className={cn(
                    "w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20",
                    errors.biller && "ring-2 ring-red-500/50"
                  )} 
                  placeholder="CONTOH: PLN_POST"
                />
                {errors.biller && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.biller}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">CA Asal</label>
                  <input 
                    type="text" 
                    value={formData.caAsal} 
                    onChange={(e) => setFormData(prev => ({ ...prev, caAsal: e.target.value.toUpperCase() }))} 
                    className={cn(
                      "w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20",
                      errors.caAsal && "ring-2 ring-red-500/50"
                    )} 
                    placeholder="KODE LAMA"
                  />
                  {errors.caAsal && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.caAsal}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">CA Tujuan</label>
                  <input 
                    type="text" 
                    value={formData.caTujuan} 
                    onChange={(e) => setFormData(prev => ({ ...prev, caTujuan: e.target.value.toUpperCase() }))} 
                    className={cn(
                      "w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20",
                      errors.caTujuan && "ring-2 ring-red-500/50"
                    )} 
                    placeholder="KODE BARU"
                  />
                  {errors.caTujuan && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.caTujuan}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="ca-rule-enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="ca-rule-enabled" className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest cursor-pointer">Aktifkan Aturan</label>
              </div>
            </div>
            <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-sm font-bold rounded-xl hover:bg-neutral-50 transition-all">Batal</button>
              <button onClick={handleSave} className="flex-1 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoHdrSection({ impNoHdr, setImpNoHdr, setAuditLogs }: { impNoHdr: ImportNoHdrFmt[]; setImpNoHdr: Dispatch<SetStateAction<ImportNoHdrFmt[]>>; setAuditLogs: Dispatch<SetStateAction<AuditLog[]>> }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ImportNoHdrFmt | null>(null);
  const [formData, setFormData] = useState({ nama: "", kodeCA: "", kolCA: 0, kolBiller: 0, kolID: 0, kolNom: 0, kolPeriode: 0, kolLembar: 0 });
  const [previewLines, setPreviewLines] = useState<string[]>([]);
  const [delimiter, setDelimiter] = useState(",");

  const handleOpenModal = (rule: ImportNoHdrFmt | null = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({ 
        nama: rule.nama, 
        kodeCA: rule.kodeCA, 
        kolCA: rule.kolCA, 
        kolBiller: rule.kolBiller, 
        kolID: rule.kolID, 
        kolNom: rule.kolNom, 
        kolPeriode: rule.kolPeriode, 
        kolLembar: rule.kolLembar 
      });
    } else {
      setEditingRule(null);
      setFormData({ nama: "", kodeCA: "", kolCA: 0, kolBiller: 0, kolID: 0, kolNom: 0, kolPeriode: 0, kolLembar: 0 });
    }
    setPreviewLines([]);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      const sampleLines = lines.slice(0, 5);
      setPreviewLines(sampleLines);
      
      // Robust auto-detect delimiter
      const delimiters = [",", ";", "|", "\t"];
      const detectionLines = lines.slice(0, 10);
      
      let bestDelimiter = ",";
      let maxScore = -1;

      delimiters.forEach(delim => {
        const counts = detectionLines.map(line => line.split(delim).length);
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
        
        // Variance check: how much the column count varies across lines
        const variance = counts.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / counts.length;
        
        // Score based on:
        // 1. Having more than 1 column (avg > 1)
        // 2. Consistency (low variance)
        // 3. Number of columns (more is usually better if consistent)
        if (avg > 1.5) {
          const score = (avg * 10) - (variance * 20);
          if (score > maxScore) {
            maxScore = score;
            bestDelimiter = delim;
          }
        }
      });

      setDelimiter(bestDelimiter);
      
      // Auto-suggest mapping after detection
      setTimeout(() => {
        performAutoMapping(sampleLines, bestDelimiter);
      }, 100);
    };
    reader.readAsText(file);
  };

  const performAutoMapping = (lines: string[], delim: string) => {
    if (lines.length === 0) return;
    
    // Use first 3 lines to get more reliable heuristics
    const sampleSize = Math.min(lines.length, 3);
    const allCols = lines.slice(0, sampleSize).map(line => line.split(delim).map(c => c.trim()));
    const numCols = allCols[0].length;
    
    const newFormData = { ...formData };
    const detectedFields = new Set<string>();

    for (let colIdx = 1; colIdx <= numCols; colIdx++) {
      const idx = colIdx - 1;
      const values = allCols.map(row => row[idx] || "");
      
      // Heuristics based on all sample values in this column
      const isNumeric = values.every(v => /^\d+$/.test(v));
      const isAllUppercase = values.every(v => /^[A-Z0-9_-]+$/.test(v) && /[A-Z]/.test(v));
      const avgLen = values.reduce((a, b) => a + b.length, 0) / values.length;
      
      // 1. ID Pelanggan (Long numeric, consistent length)
      if (!detectedFields.has("kolID") && isNumeric && avgLen >= 8 && avgLen <= 20) {
        newFormData.kolID = colIdx;
        detectedFields.add("kolID");
        continue;
      }

      // 2. Nominal (Numeric, usually large)
      if (!detectedFields.has("kolNom") && isNumeric) {
        const avgVal = values.reduce((a, b) => a + parseInt(b), 0) / values.length;
        if (avgVal > 500) {
          newFormData.kolNom = colIdx;
          detectedFields.add("kolNom");
          continue;
        }
      }

      // 3. Periode (6 digits YYYYMM or 4 digits MMYY or date-like)
      if (!detectedFields.has("kolPeriode")) {
        const isDateLike = values.every(v => v.length === 6 || v.length === 4 || v.includes("/") || v.includes("-"));
        if (isDateLike) {
          newFormData.kolPeriode = colIdx;
          detectedFields.add("kolPeriode");
          continue;
        }
      }

      // 4. Lembar (Small numeric)
      if (!detectedFields.has("kolLembar") && isNumeric) {
        const maxVal = Math.max(...values.map(v => parseInt(v)));
        if (maxVal > 0 && maxVal < 50) {
          newFormData.kolLembar = colIdx;
          detectedFields.add("kolLembar");
          continue;
        }
      }

      // 5. CA vs Biller (Uppercase strings)
      if (isAllUppercase) {
        // Usually CA is shorter than Biller code
        if (!detectedFields.has("kolCA") && avgLen <= 6) {
          newFormData.kolCA = colIdx;
          detectedFields.add("kolCA");
        } else if (!detectedFields.has("kolBiller")) {
          newFormData.kolBiller = colIdx;
          detectedFields.add("kolBiller");
        }
      }
    }
    
    setFormData(newFormData);
  };

  const suggestMapping = () => {
    performAutoMapping(previewLines, delimiter);
  };

  const mappedPreview = useMemo(() => {
    return previewLines.map(line => {
      const cols = line.split(delimiter).map(c => c.trim());
      return {
        ca: cols[formData.kolCA - 1] || "-",
        biller: cols[formData.kolBiller - 1] || "-",
        id: cols[formData.kolID - 1] || "-",
        nom: cols[formData.kolNom - 1] || "-",
        per: cols[formData.kolPeriode - 1] || "-",
        lem: cols[formData.kolLembar - 1] || "-",
        raw: line
      };
    });
  }, [previewLines, formData, delimiter]);

  const handleSave = () => {
    if (!formData.nama || !formData.kodeCA) return;
    if (editingRule) {
      setImpNoHdr(prev => prev.map(r => r.id === editingRule.id ? { ...r, ...formData } : r));
      setAuditLogs(prev => [{
        id: Date.now(),
        aksi: "Update Format No-Header",
        tgl: new Date().toISOString(),
        user: "Admin",
        modul: "Aturan Import",
        detail: `Update format no-header: ${formData.nama}`,
        sebelum: JSON.stringify(editingRule),
        sesudah: JSON.stringify({ ...editingRule, ...formData }),
        tipe: "info"
      }, ...prev]);
    } else {
      const newRule = { id: Date.now(), ...formData };
      setImpNoHdr(prev => [...prev, newRule]);
      setAuditLogs(prev => [{
        id: Date.now(),
        aksi: "Tambah Format No-Header",
        tgl: new Date().toISOString(),
        user: "Admin",
        modul: "Aturan Import",
        detail: `Tambah format no-header baru: ${formData.nama}`,
        sesudah: JSON.stringify(newRule),
        tipe: "success"
      }, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-blue-600">Format Import Tanpa Header</h4>
          <p className="text-xs text-neutral-400 font-medium">Definisikan urutan kolom untuk file .txt/.csv tanpa header</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
          <Plus className="w-4 h-4" /> Tambah Format
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-neutral-100 dark:border-neutral-800">
        <table className="w-full text-left text-xs min-w-[800px]">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 font-bold">
            <tr>
              <th className="px-6 py-3">Nama Format</th>
              <th className="px-6 py-3">Kode CA</th>
              <th className="px-6 py-3">Kolom (Index)</th>
              <th className="px-6 py-3">Deskripsi Mapping</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {impNoHdr.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-400 italic">Belum ada format no-header</td></tr>
            ) : (
              impNoHdr.map((fmt) => (
                <tr key={fmt.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-neutral-700 dark:text-neutral-300">{fmt.nama}</td>
                  <td className="px-6 py-4 font-medium text-neutral-500">{fmt.kodeCA}</td>
                  <td className="px-6 py-4 font-mono text-blue-600">{fmt.kolCA}, {fmt.kolBiller}, {fmt.kolID}, {fmt.kolNom}, {fmt.kolPeriode}, {fmt.kolLembar}</td>
                  <td className="px-6 py-4 text-[10px] text-neutral-500 font-medium italic">
                    CA (Column {fmt.kolCA}), Biller Code (Column {fmt.kolBiller}), Customer ID (Column {fmt.kolID}), Nominal Amount (Column {fmt.kolNom}), Period (Column {fmt.kolPeriode}), Number of Sheets (Column {fmt.kolLembar})
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(fmt)} className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setImpNoHdr(prev => prev.filter(r => r.id !== fmt.id))} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold">{editingRule ? "Edit Format No-Header" : "Tambah Format No-Header"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Nama Format</label>
                    <input type="text" value={formData.nama} onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Kode CA</label>
                    <input type="text" value={formData.kodeCA} onChange={(e) => setFormData(prev => ({ ...prev, kodeCA: e.target.value }))} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: "kolCA", label: "Kol CA" },
                    { id: "kolBiller", label: "Kol Bill" },
                    { id: "kolID", label: "Kol ID" },
                    { id: "kolNom", label: "Kol Nom" },
                    { id: "kolPeriode", label: "Kol Per" },
                    { id: "kolLembar", label: "Kol Lem" },
                  ].map((f) => (
                    <div key={f.id} className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">{f.label}</label>
                      <input type="number" value={(formData as any)[f.id]} onChange={(e) => setFormData(prev => ({ ...prev, [f.id]: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-l border-neutral-100 dark:border-neutral-800 pl-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Preview Mapping</h4>
                  <div className="flex items-center gap-2">
                    {previewLines.length > 0 && (
                      <button 
                        onClick={suggestMapping}
                        className="text-[9px] px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                        title="Coba tebak mapping kolom"
                      >
                        Saran Mapping
                      </button>
                    )}
                    <select 
                      value={delimiter} 
                      onChange={(e) => setDelimiter(e.target.value)}
                      className="text-[10px] bg-neutral-100 dark:bg-neutral-800 border-none rounded-lg px-2 py-1 font-bold"
                    >
                      <option value=",">Koma (,)</option>
                      <option value=";">Titik Koma (;)</option>
                      <option value="|">Pipe (|)</option>
                      <option value="\t">Tab</option>
                    </select>
                    <label className="cursor-pointer p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <input type="file" className="hidden" accept=".txt,.csv" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 min-h-[200px]">
                  {previewLines.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-2">
                      <FileText className="w-8 h-8 text-neutral-300" />
                      <p className="text-[10px] text-neutral-400 font-medium">Upload file sample (.txt/.csv) untuk melihat preview mapping</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px] text-left">
                        <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-400 font-bold uppercase tracking-tighter">
                          <tr>
                            <th className="px-3 py-2">CA</th>
                            <th className="px-3 py-2">Bill</th>
                            <th className="px-3 py-2">ID</th>
                            <th className="px-3 py-2">Nom</th>
                            <th className="px-3 py-2">Per</th>
                            <th className="px-3 py-2">Lem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {mappedPreview.map((row, idx) => (
                            <tr key={idx} className="hover:bg-white dark:hover:bg-neutral-800 transition-colors">
                              <td className="px-3 py-2 font-bold text-neutral-600 dark:text-neutral-400">{row.ca}</td>
                              <td className="px-3 py-2 text-neutral-500">{row.biller}</td>
                              <td className="px-3 py-2 font-mono text-blue-600">{row.id}</td>
                              <td className="px-3 py-2 font-bold text-neutral-700 dark:text-neutral-300">{row.nom}</td>
                              <td className="px-3 py-2 text-neutral-500">{row.per}</td>
                              <td className="px-3 py-2 text-neutral-500">{row.lem}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                {previewLines.length > 0 && (
                  <p className="text-[9px] text-neutral-400 italic">* Menampilkan 5 baris pertama dari file sample</p>
                )}
              </div>
            </div>
            <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-sm font-bold rounded-xl hover:bg-neutral-50 transition-all">Batal</button>
              <button onClick={handleSave} className="flex-1 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">Simpan</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function BillerRuleSection({ impBillerRule, setImpBillerRule, setAuditLogs }: { impBillerRule: ImportBillerRule[]; setImpBillerRule: Dispatch<SetStateAction<ImportBillerRule[]>>; setAuditLogs: Dispatch<SetStateAction<AuditLog[]>> }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ImportBillerRule | null>(null);
  const [formData, setFormData] = useState({ biller: "", aturan: "digit_id" as const, digit: 0 });

  const handleOpenModal = (rule: ImportBillerRule | null = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({ biller: rule.biller, aturan: rule.aturan, digit: rule.digit });
    } else {
      setEditingRule(null);
      setFormData({ biller: "", aturan: "digit_id", digit: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.biller || formData.digit <= 0) return;
    if (editingRule) {
      setImpBillerRule(prev => prev.map(r => r.id === editingRule.id ? { ...r, ...formData } : r));
      setAuditLogs(prev => [{
        id: Date.now(),
        aksi: "Update Aturan Biller",
        tgl: new Date().toISOString(),
        user: "Admin",
        modul: "Aturan Import",
        detail: `Update aturan khusus biller: ${formData.biller}`,
        sebelum: JSON.stringify(editingRule),
        sesudah: JSON.stringify({ ...editingRule, ...formData }),
        tipe: "info"
      }, ...prev]);
    } else {
      const newRule = { id: Date.now(), ...formData };
      setImpBillerRule(prev => [...prev, newRule]);
      setAuditLogs(prev => [{
        id: Date.now(),
        aksi: "Tambah Aturan Biller",
        tgl: new Date().toISOString(),
        user: "Admin",
        modul: "Aturan Import",
        detail: `Tambah aturan khusus biller baru: ${formData.biller}`,
        sesudah: JSON.stringify(newRule),
        tipe: "success"
      }, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-blue-600">Aturan Khusus Biller</h4>
          <p className="text-xs text-neutral-400 font-medium">Validasi khusus (misal: jumlah digit ID) saat proses import</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
          <Plus className="w-4 h-4" /> Tambah Aturan
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-neutral-100 dark:border-neutral-800">
        <table className="w-full text-left text-xs min-w-[500px]">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 font-bold">
            <tr>
              <th className="px-6 py-3">Kode Biller</th>
              <th className="px-6 py-3">Jenis Aturan</th>
              <th className="px-6 py-3">Nilai</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {impBillerRule.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-400 italic">Belum ada aturan khusus biller</td></tr>
            ) : (
              impBillerRule.map((rule) => (
                <tr key={rule.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-neutral-700 dark:text-neutral-300">{rule.biller}</td>
                  <td className="px-6 py-4 font-medium text-neutral-500">{rule.aturan === "digit_id" ? "Jumlah Digit ID" : rule.aturan}</td>
                  <td className="px-6 py-4 font-bold text-blue-600">{rule.digit} Digit</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(rule)} className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setImpBillerRule(prev => prev.filter(r => r.id !== rule.id))} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold">{editingRule ? "Edit Aturan Biller" : "Tambah Aturan Biller"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Kode Biller</label>
                <input type="text" value={formData.biller} onChange={(e) => setFormData(prev => ({ ...prev, biller: e.target.value }))} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Jenis Aturan</label>
                  <select value={formData.aturan} onChange={(e) => setFormData(prev => ({ ...prev, aturan: e.target.value as any }))} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20">
                    <option value="digit_id">Jumlah Digit ID</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Jumlah Digit</label>
                  <input type="number" value={formData.digit} onChange={(e) => setFormData(prev => ({ ...prev, digit: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-sm font-bold rounded-xl hover:bg-neutral-50 transition-all">Batal</button>
              <button onClick={handleSave} className="flex-1 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function ImportTab({ setAuditLogs, setNotifications }: { setAuditLogs: Dispatch<SetStateAction<AuditLog[]>>; setNotifications: Dispatch<SetStateAction<Notification[]>> }) {
  const [importedFiles, setImportedFiles] = useState([
    { id: 1, fileName: "transaksi_hari_ini.xlsx", status: "Completed", date: "2026-03-25 08:30" },
    { id: 2, fileName: "data_cabang_bandung.csv", status: "Processing", date: "2026-03-25 09:15" },
    { id: 3, fileName: "rekap_maret_v2.zip", status: "Failed", date: "2026-03-25 10:00", error: "Format file tidak valid" },
  ]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newFile = {
      id: Date.now(),
      fileName: file.name,
      status: "Processing",
      date: new Date().toLocaleString()
    };

    setImportedFiles(prev => [newFile, ...prev]);

    // Simulate processing
    setTimeout(() => {
      setImportedFiles(prev => prev.map(f => 
        f.id === newFile.id ? { ...f, status: "Completed" } : f
      ));

      setAuditLogs(prev => [{
        id: Date.now(),
        aksi: "Import Data",
        tgl: new Date().toISOString(),
        user: "Admin",
        modul: "Import",
        detail: `Berhasil import file: ${file.name}`,
        tipe: "success"
      }, ...prev]);

      setNotifications(prev => [{
        id: Date.now(),
        judul: "Import Berhasil",
        pesan: `File ${file.name} telah selesai diproses.`,
        tgl: new Date().toISOString(),
        tipe: "success",
        read: false
      }, ...prev]);
    }, 3000);
  };

  const handleRetry = (id: number) => {
    setImportedFiles(prev => prev.map(file => 
      file.id === id ? { ...file, status: "Processing", error: undefined } : file
    ));
    
    // Simulate re-processing
    setTimeout(() => {
      setImportedFiles(prev => prev.map(file => 
        file.id === id ? { ...file, status: "Completed" } : file
      ));
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-tighter">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </div>
        );
      case "Processing":
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold uppercase tracking-tighter animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            Processing
          </div>
        );
      case "Failed":
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold uppercase tracking-tighter">
            <AlertTriangle className="w-3 h-3" />
            Failed
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
        <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">Upload File Transaksi</h3>
          <p className="text-sm text-neutral-500 font-medium max-w-md">
            Dukung format <span className="text-blue-600">.xlsx, .csv, .txt, .json, .xml</span> dan <span className="text-blue-600">.zip</span>. 
            Sistem akan mendeteksi kolom secara otomatis.
          </p>
        </div>
        
        <div className="w-full p-10 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[2rem] hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group bg-neutral-50/50 dark:bg-neutral-800/10">
          <input type="file" className="hidden" id="file-upload" onChange={handleFileUpload} />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
            <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
              <Plus className="w-6 h-6 text-neutral-400 group-hover:text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Klik untuk pilih file atau seret ke sini</p>
              <p className="text-xs text-neutral-400 mt-1">Maksimal ukuran file 50MB</p>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center gap-3 text-left border border-emerald-100 dark:border-emerald-900/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Auto Mapping</p>
              <p className="text-xs font-medium text-emerald-900/70 dark:text-emerald-400">Deteksi kolom pintar</p>
            </div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center gap-3 text-left border border-blue-100 dark:border-blue-900/30">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Validasi Data</p>
              <p className="text-xs font-medium text-blue-900/70 dark:text-blue-400">Cek duplikat & kode</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Imports Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Riwayat Import Terakhir</h4>
          <button className="text-[10px] font-bold text-blue-600 hover:underline">Lihat Semua</button>
        </div>
        
        <div className="overflow-x-auto rounded-2xl border border-neutral-100 dark:border-neutral-800">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 font-bold">
              <tr>
                <th className="px-6 py-3">Nama File</th>
                <th className="px-6 py-3">Waktu</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {importedFiles.map((file) => (
                <tr key={file.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-neutral-700 dark:text-neutral-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      {file.fileName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">{file.date}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(file.status)}
                    {file.error && <p className="text-[10px] text-red-500 mt-1 font-medium">{file.error}</p>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {file.status === "Failed" && (
                        <button 
                          onClick={() => handleRetry(file.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-tighter rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                          title="Retry Process"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Retry
                        </button>
                      )}
                      <button className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HapusTab({ txs, setTxs, billers, cas, setAuditLogs }: { txs: Transaction[]; setTxs: Dispatch<SetStateAction<Transaction[]>>; billers: Biller[]; cas: CA[]; setAuditLogs: Dispatch<SetStateAction<AuditLog[]>> }) {
  const [dateRange, setDateRange] = useState({ from: getYesterdayDate(), to: getYesterdayDate() });
  const [selectedCA, setSelectedCA] = useState("");
  const [selectedBiller, setSelectedBiller] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const filteredTxs = useMemo(() => {
    return txs.filter(tx => {
      const matchSearch = !searchQuery || tx.txid.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCA = !selectedCA || tx.ca === selectedCA;
      const matchBiller = !selectedBiller || tx.biller === selectedBiller;
      const matchDate = (!dateRange.from || tx.tgl >= dateRange.from) && (!dateRange.to || tx.tgl <= dateRange.to);
      const matchStatus = !selectedStatus || tx.status === selectedStatus;
      return matchSearch && matchCA && matchBiller && matchDate && matchStatus;
    });
  }, [txs, searchQuery, selectedCA, selectedBiller, dateRange, selectedStatus]);

  // Auto-select all filtered transactions when filters change
  useEffect(() => {
    setSelectedIds(new Set(filteredTxs.map(tx => tx.id)));
  }, [filteredTxs]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTxs.length && filteredTxs.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTxs.map(tx => tx.id)));
    }
  };

  const toggleSelectOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleDelete = () => {
    if (selectedIds.size === 0) return;
    
    if (confirm(`Hapus ${selectedIds.size} data transaksi yang terpilih secara permanen?`)) {
      const deletedTxs = txs.filter(tx => selectedIds.has(tx.id));
      setTxs(prev => prev.filter(tx => !selectedIds.has(tx.id)));
      
      setAuditLogs(prev => [{
        id: Date.now(),
        aksi: "Hapus Data Transaksi",
        tgl: new Date().toISOString(),
        user: "Admin",
        modul: "Hapus Data",
        detail: `Menghapus ${selectedIds.size} transaksi`,
        sebelum: JSON.stringify(deletedTxs),
        tipe: "danger"
      }, ...prev]);

      alert(`${selectedIds.size} data berhasil dihapus.`);
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Hapus Data Transaksi</h3>
          <p className="text-xs text-neutral-400 font-medium">Filter data yang ingin dihapus secara permanen</p>
        </div>
        <button 
          onClick={handleDelete}
          disabled={selectedIds.size === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          Hapus {selectedIds.size} Data Terpilih
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-6 bg-neutral-50 dark:bg-neutral-800/30 rounded-3xl border border-neutral-100 dark:border-neutral-800">
        <DateRangePicker 
          from={dateRange.from}
          to={dateRange.to}
          onChange={(range) => setDateRange(range)}
        />
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Collecting Agent</label>
          <select 
            value={selectedCA}
            onChange={(e) => setSelectedCA(e.target.value)}
            className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="">Semua CA</option>
            {cas.map(ca => <option key={ca.kode} value={ca.kode}>{ca.nama}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Biller</label>
          <select 
            value={selectedBiller}
            onChange={(e) => setSelectedBiller(e.target.value)}
            className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="">Semua Biller</option>
            {billers.map(b => <option key={b.kode} value={b.kode}>{b.nama}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Status</label>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="">Semua Status</option>
            <option value="Cocok">Cocok</option>
            <option value="Duplikat">Duplikat</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Cari ID Pelanggan</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="ID Pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex items-end pb-0.5">
          <button 
            onClick={() => {
              setDateRange({ from: getYesterdayDate(), to: getYesterdayDate() });
              setSelectedCA("");
              setSelectedBiller("");
              setSelectedStatus("");
              setSearchQuery("");
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-bold rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Reset Filter
          </button>
        </div>
      </div>
      
      {/* Preview Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Preview Data yang akan dihapus</h4>
          <span className="text-[10px] font-bold px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500">
            {filteredTxs.length} Transaksi
          </span>
        </div>
        
        <div className="overflow-x-auto rounded-2xl border border-neutral-100 dark:border-neutral-800">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 font-bold">
              <tr>
                <th className="px-6 py-3 w-10">
                  <input 
                    type="checkbox" 
                    checked={filteredTxs.length > 0 && selectedIds.size === filteredTxs.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">ID Pelanggan</th>
                <th className="px-6 py-3">CA</th>
                <th className="px-6 py-3">Biller</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-400 italic">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="w-8 h-8 opacity-20" />
                      <p>Pilih filter untuk melihat preview data</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTxs.slice(0, 50).map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(tx.id)}
                        onChange={() => toggleSelectOne(tx.id)}
                        className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium">{formatDate(tx.tgl)}</td>
                    <td className="px-6 py-4 font-bold text-neutral-700 dark:text-neutral-300">{tx.txid}</td>
                    <td className="px-6 py-4">{cas.find(c => c.kode === tx.ca)?.nama || tx.ca}</td>
                    <td className="px-6 py-4">{billers.find(b => b.kode === tx.biller)?.nama || tx.biller}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        tx.status === "Cocok" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      )}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-red-600">{formatCurrency(tx.nominal)}</td>
                  </tr>
                ))
              )}
              {filteredTxs.length > 50 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-neutral-400 font-medium bg-neutral-50/50 dark:bg-neutral-800/20">
                    Menampilkan 50 dari {filteredTxs.length} data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredTxs.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-red-900 dark:text-red-100">Peringatan Penghapusan</p>
              <p className="text-[11px] text-red-700 dark:text-red-400 font-medium leading-relaxed">
                Anda akan menghapus {filteredTxs.length} data transaksi secara permanen. Data yang sudah dihapus tidak dapat dikembalikan kecuali Anda memiliki file backup.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BeritaAcaraTab({ beritaAcaras, setBeritaAcaras, setAuditLogs }: { beritaAcaras: BeritaAcara[]; setBeritaAcaras: Dispatch<SetStateAction<BeritaAcara[]>>; setAuditLogs: Dispatch<SetStateAction<AuditLog[]>> }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ noBa: "", tgl: new Date().toISOString().split('T')[0], lembar: 0, nominal: 0, namaFile: "", attachment: "", attachmentName: "" });
  const [selectedBA, setSelectedBA] = useState<BeritaAcara | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const stats = useMemo(() => {
    return {
      total: beritaAcaras.length,
      lembar: beritaAcaras.reduce((s, b) => s + b.lembar, 0),
      nominal: beritaAcaras.reduce((s, b) => s + b.nominal, 0),
    };
  }, [beritaAcaras]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData(prev => ({ ...prev, namaFile: file.name, attachment: base64, attachmentName: file.name }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!formData.noBa || !formData.tgl) return;
    const newBA = { id: Date.now(), ...formData };
    setBeritaAcaras(prev => [...prev, newBA]);
    setAuditLogs(prev => [{
      id: Date.now(),
      aksi: "Tambah Berita Acara",
      tgl: new Date().toISOString(),
      user: "Admin",
      modul: "Berita Acara",
      detail: `Tambah Berita Acara baru: ${formData.noBa}`,
      sesudah: JSON.stringify(newBA),
      tipe: "success"
    }, ...prev]);
    setIsModalOpen(false);
    setFormData({ noBa: "", tgl: new Date().toISOString().split('T')[0], lembar: 0, nominal: 0, namaFile: "", attachment: "", attachmentName: "" });
  };

  const handleDelete = (id: number) => {
    const ba = beritaAcaras.find(x => x.id === id);
    if (!ba) return;
    if (confirm(`Hapus Berita Acara ${ba.noBa}?`)) {
      setBeritaAcaras(prev => prev.filter(x => x.id !== id));
      setAuditLogs(prev => [{
        id: Date.now(),
        aksi: "Hapus Berita Acara",
        tgl: new Date().toISOString(),
        user: "Admin",
        modul: "Berita Acara",
        detail: `Hapus Berita Acara: ${ba.noBa}`,
        sebelum: JSON.stringify(ba),
        tipe: "danger"
      }, ...prev]);
    }
  };

  const handleView = (ba: BeritaAcara) => {
    setSelectedBA(ba);
    setIsViewModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Manajemen Berita Acara</h3>
          <p className="text-xs text-neutral-400 font-medium">Data ekstraksi dari PDF Berita Acara</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all cursor-pointer">
          <Plus className="w-4 h-4" />
          Tambah Berita Acara
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total BA", value: stats.total, sub: "Dokumen" },
          { label: "Total Lembar", value: stats.lembar, sub: "Transaksi" },
          { label: "Total Nominal", value: formatCurrency(stats.nominal), sub: "IDR" },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-neutral-50 dark:bg-neutral-800/30 rounded-3xl border border-neutral-100 dark:border-neutral-800">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{stat.value}</p>
            <p className="text-[10px] text-neutral-400 font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-100 dark:border-neutral-800">
        <table className="w-full text-left text-xs min-w-[800px]">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 font-bold">
            <tr>
              <th className="px-6 py-3">No. Berita Acara</th>
              <th className="px-6 py-3">Tanggal</th>
              <th className="px-6 py-3">Nama File</th>
              <th className="px-6 py-3 text-center">Lembar</th>
              <th className="px-6 py-3 text-right">Nominal</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {beritaAcaras.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-400 italic">Belum ada data Berita Acara</td></tr>
            ) : (
              beritaAcaras.map((ba) => (
                <tr key={ba.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-blue-600">{ba.noBa}</td>
                  <td className="px-6 py-4 font-medium text-neutral-500">{formatDate(ba.tgl)}</td>
                  <td className="px-6 py-4 font-medium text-neutral-400">{ba.namaFile}</td>
                  <td className="px-6 py-4 text-center font-bold">{ba.lembar}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold">{formatCurrency(ba.nominal)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleView(ba)} className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(ba.id)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add BA Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold">Tambah Berita Acara</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">No. Berita Acara</label>
                <input type="text" value={formData.noBa} onChange={(e) => setFormData(prev => ({ ...prev, noBa: e.target.value }))} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="BA/2026/001" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Tanggal</label>
                  <input type="date" value={formData.tgl} onChange={(e) => setFormData(prev => ({ ...prev, tgl: e.target.value }))} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Lampiran PDF</label>
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all">
                    <FileUp className="w-4 h-4 text-blue-600" />
                    <span className="text-neutral-500 truncate max-w-[100px]">{formData.namaFile || "Pilih File"}</span>
                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Total Lembar</label>
                  <input type="number" value={formData.lembar} onChange={(e) => setFormData(prev => ({ ...prev, lembar: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Total Nominal</label>
                  <input type="number" value={formData.nominal} onChange={(e) => setFormData(prev => ({ ...prev, nominal: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-sm font-bold rounded-xl hover:bg-neutral-50 transition-all">Batal</button>
              <button onClick={handleSave} className="flex-1 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* View BA Modal */}
      {isViewModalOpen && selectedBA && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold">Detail Berita Acara</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">No. Berita Acara</p>
                  <p className="text-lg font-bold text-blue-600">{selectedBA.noBa}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Tanggal</p>
                  <p className="font-medium">{formatDate(selectedBA.tgl)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Lembar</p>
                    <p className="font-bold">{selectedBA.lembar}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Nominal</p>
                    <p className="font-bold text-emerald-600">{formatCurrency(selectedBA.nominal)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 border border-neutral-100 dark:border-neutral-800">
                <div className="w-16 h-16 bg-white dark:bg-neutral-800 rounded-2xl flex items-center justify-center shadow-sm">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 truncate max-w-[200px]">{selectedBA.namaFile}</p>
                  <p className="text-[10px] text-neutral-400 mt-1">Dokumen PDF Lampiran</p>
                </div>
                <div className="flex gap-2 w-full">
                  {selectedBA.attachment && (
                    <a 
                      href={selectedBA.attachment} 
                      download={selectedBA.attachmentName || "BA.pdf"}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 flex justify-end">
              <button onClick={() => setIsViewModalOpen(false)} className="px-8 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-sm font-bold rounded-xl hover:bg-neutral-50 transition-all">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReconTab({ 
  reconResults, 
  setReconResults, 
  cas, 
  billers, 
  setAuditLogs 
}: { 
  reconResults: ReconResult[]; 
  setReconResults: Dispatch<SetStateAction<ReconResult[]>>; 
  cas: CA[]; 
  billers: Biller[]; 
  setAuditLogs: Dispatch<SetStateAction<AuditLog[]>> 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tgl: new Date().toISOString().split('T')[0],
    ca: "",
    biller: "",
    totalLembarCA: 0,
    totalNominalCA: 0,
    totalLembarBiller: 0,
    totalNominalBiller: 0
  });

  const handleProcess = () => {
    if (!formData.ca || !formData.biller) return;

    const selisihLembar = formData.totalLembarCA - formData.totalLembarBiller;
    const selisihNominal = formData.totalNominalCA - formData.totalNominalBiller;
    
    let status: "Cocok" | "Selisih" | "Suspect" = "Cocok";
    if (selisihLembar !== 0 || selisihNominal !== 0) {
      status = "Selisih";
      if (Math.abs(selisihNominal) > 10000000) {
        status = "Suspect";
      }
    }

    const newResult: ReconResult = {
      id: Date.now(),
      ...formData,
      selisihLembar,
      selisihNominal,
      status
    };

    setReconResults(prev => [newResult, ...prev]);
    setAuditLogs(prev => [{
      id: Date.now(),
      aksi: "Proses Rekonsiliasi",
      tgl: new Date().toISOString(),
      user: "Admin",
      modul: "Rekonsiliasi",
      detail: `Proses recon untuk CA ${formData.ca} & Biller ${formData.biller}. Status: ${status}`,
      sesudah: JSON.stringify(newResult),
      tipe: status === "Cocok" ? "success" : status === "Selisih" ? "warning" : "danger"
    }, ...prev]);

    setIsModalOpen(false);
    setFormData({
      tgl: new Date().toISOString().split('T')[0],
      ca: "",
      biller: "",
      totalLembarCA: 0,
      totalNominalCA: 0,
      totalLembarBiller: 0,
      totalNominalBiller: 0
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Hapus data rekonsiliasi ini?")) {
      setReconResults(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Rekonsiliasi Data</h3>
          <p className="text-xs text-neutral-400 font-medium">Bandingkan total transaksi antara CA dan Biller</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Mulai Rekon Baru
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-100 dark:border-neutral-800">
        <table className="w-full text-left text-xs min-w-[1000px]">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 font-bold">
            <tr>
              <th className="px-6 py-3">Tanggal</th>
              <th className="px-6 py-3">CA / Biller</th>
              <th className="px-6 py-3 text-right">Total CA (L/N)</th>
              <th className="px-6 py-3 text-right">Total Biller (L/N)</th>
              <th className="px-6 py-3 text-right">Selisih (L/N)</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {reconResults.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-neutral-400 italic">Belum ada hasil rekonsiliasi</td></tr>
            ) : (
              reconResults.map((res) => (
                <tr key={res.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{formatDate(res.tgl)}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <p className="font-bold text-neutral-700 dark:text-neutral-300">{res.ca}</p>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">{res.biller}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="space-y-0.5">
                      <p className="font-bold">{res.totalLembarCA} Lbr</p>
                      <p className="text-neutral-500">{formatCurrency(res.totalNominalCA)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="space-y-0.5">
                      <p className="font-bold">{res.totalLembarBiller} Lbr</p>
                      <p className="text-neutral-500">{formatCurrency(res.totalNominalBiller)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="space-y-0.5">
                      <p className={cn("font-bold", res.selisihLembar !== 0 ? "text-red-600" : "text-emerald-600")}>
                        {res.selisihLembar > 0 ? "+" : ""}{res.selisihLembar} Lbr
                      </p>
                      <p className={cn("font-bold", res.selisihNominal !== 0 ? "text-red-600" : "text-emerald-600")}>
                        {res.selisihNominal > 0 ? "+" : ""}{formatCurrency(res.selisihNominal)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      res.status === "Cocok" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      res.status === "Selisih" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {res.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(res.id)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold">Input Data Rekonsiliasi</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Tanggal</label>
                  <input type="date" value={formData.tgl} onChange={(e) => setFormData(prev => ({ ...prev, tgl: e.target.value }))} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Collecting Agent</label>
                  <select value={formData.ca} onChange={(e) => setFormData(prev => ({ ...prev, ca: e.target.value }))} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20">
                    <option value="">Pilih CA</option>
                    {cas.map(ca => <option key={ca.kode} value={ca.kode}>{ca.nama}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Biller</label>
                  <select value={formData.biller} onChange={(e) => setFormData(prev => ({ ...prev, biller: e.target.value }))} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20">
                    <option value="">Pilih Biller</option>
                    {billers.map(b => <option key={b.kode} value={b.kode}>{b.nama}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-blue-600">Data dari CA</h4>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Total Lembar</label>
                      <input type="number" value={formData.totalLembarCA} onChange={(e) => setFormData(prev => ({ ...prev, totalLembarCA: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Total Nominal</label>
                      <input type="number" value={formData.totalNominalCA} onChange={(e) => setFormData(prev => ({ ...prev, totalNominalCA: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-6 bg-amber-50/50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-amber-600">Data dari Biller</h4>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Total Lembar</label>
                      <input type="number" value={formData.totalLembarBiller} onChange={(e) => setFormData(prev => ({ ...prev, totalLembarBiller: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Total Nominal</label>
                      <input type="number" value={formData.totalNominalBiller} onChange={(e) => setFormData(prev => ({ ...prev, totalNominalBiller: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-sm font-bold rounded-xl hover:bg-neutral-50 transition-all">Batal</button>
              <button onClick={handleProcess} className="flex-1 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">Proses Rekon</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditLogTab({ logs }: { logs: AuditLog[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredLogs = logs.filter(log => 
    log.aksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.modul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.detail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Audit Logs</h3>
          <p className="text-xs text-neutral-400 font-medium">Riwayat aktivitas dan perubahan data sistem</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari log..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-100 dark:border-neutral-800">
        <table className="w-full text-left text-xs min-w-[900px]">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 font-bold">
            <tr>
              <th className="px-6 py-3">Waktu</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Modul</th>
              <th className="px-6 py-3">Aksi</th>
              <th className="px-6 py-3">Detail</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredLogs.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-400 italic">Tidak ada log ditemukan</td></tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-neutral-500">
                    {new Date(log.tgl).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 font-bold text-neutral-700 dark:text-neutral-300">{log.user}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      {log.modul}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{log.aksi}</td>
                  <td className="px-6 py-4 text-neutral-500 max-w-xs truncate">{log.detail}</td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      log.tipe === "success" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                      log.tipe === "warning" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                      "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    )} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NotificationTab({ 
  notifications, 
  setNotifications 
}: { 
  notifications: Notification[]; 
  setNotifications: Dispatch<SetStateAction<Notification[]>> 
}) {
  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotif = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    if (confirm("Hapus semua notifikasi?")) {
      setNotifications([]);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Notifikasi</h3>
          <p className="text-xs text-neutral-400 font-medium">Pemberitahuan sistem dan aktivitas terbaru</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={clearAll}
            className="text-[10px] font-bold text-red-600 hover:text-red-700 uppercase tracking-widest px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
          >
            Hapus Semua
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {notifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-neutral-50/50 dark:bg-neutral-800/20 rounded-[3rem] border border-dashed border-neutral-200 dark:border-neutral-800">
            <div className="w-16 h-16 bg-white dark:bg-neutral-800 rounded-2xl flex items-center justify-center shadow-sm">
              <Bell className="w-8 h-8 text-neutral-300" />
            </div>
            <p className="text-sm text-neutral-400 italic">Belum ada notifikasi baru</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={cn(
                "group relative p-6 rounded-[2rem] border transition-all flex items-start gap-6",
                n.read 
                  ? "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 opacity-60" 
                  : "bg-white dark:bg-neutral-900 border-blue-100 dark:border-blue-900/30 shadow-xl shadow-blue-500/5"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                n.tipe === "success" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" :
                n.tipe === "warning" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20" :
                "bg-red-50 text-red-600 dark:bg-red-900/20"
              )}>
                {n.tipe === "success" ? <CheckCircle2 className="w-6 h-6" /> :
                 n.tipe === "warning" ? <AlertCircle className="w-6 h-6" /> :
                 <AlertCircle className="w-6 h-6" />}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-neutral-800 dark:text-neutral-200">{n.judul}</h4>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                    {new Date(n.tgl).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 leading-relaxed">{n.pesan}</p>
                <div className="pt-2 flex items-center gap-4">
                  {!n.read && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotif(n.id)}
                    className="text-[10px] font-bold text-neutral-400 hover:text-red-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              
              {!n.read && (
                <div className="absolute top-6 right-6 w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
