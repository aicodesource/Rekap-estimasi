import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Plus, Search, Filter, Edit2, Trash2, Download, Upload } from "lucide-react";
import { Biller, CA, Fee, Settlement } from "@/src/types";
import { cn, formatCurrency } from "@/src/lib/utils";

interface MasterDataViewProps {
  billers: Biller[];
  cas: CA[];
  fees: Fee[];
  setFees: Dispatch<SetStateAction<Fee[]>>;
  settlements: Settlement[];
  setSettlements: Dispatch<SetStateAction<Settlement[]>>;
  initialTab?: TabType;
  hideTabs?: boolean;
}

type TabType = "biller" | "ca" | "fee" | "settlement";

export default function MasterDataView({ 
  billers, cas, fees, setFees, settlements, setSettlements, initialTab = "biller", hideTabs = false 
}: MasterDataViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  // Update activeTab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const tabs: { id: TabType; label: string }[] = [
    { id: "biller", label: "Biller" },
    { id: "ca", label: "CA" },
    { id: "fee", label: "Fee & Admin" },
    { id: "settlement", label: "Bank Settlement" },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      {!hideTabs && (
        <div className="bg-white dark:bg-neutral-900 p-2 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-200",
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder={`Cari ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-bold rounded-xl hover:bg-neutral-200 transition-all">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 text-[10px] uppercase tracking-widest font-bold">
              {activeTab === "biller" && (
                <tr>
                  <th className="px-8 py-4 w-16">No</th>
                  <th className="px-8 py-4">Kode</th>
                  <th className="px-8 py-4">Nama Biller</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Aksi</th>
                </tr>
              )}
              {activeTab === "ca" && (
                <tr>
                  <th className="px-8 py-4 w-16">No</th>
                  <th className="px-8 py-4">Kode</th>
                  <th className="px-8 py-4">Nama CA</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Aksi</th>
                </tr>
              )}
              {activeTab === "fee" && (
                <tr>
                  <th className="px-8 py-4 w-16">No</th>
                  <th className="px-8 py-4">CA</th>
                  <th className="px-8 py-4">Biller</th>
                  <th className="px-8 py-4 text-right">Fee</th>
                  <th className="px-8 py-4 text-right">Admin</th>
                  <th className="px-8 py-4 text-right">Aksi</th>
                </tr>
              )}
              {activeTab === "settlement" && (
                <tr>
                  <th className="px-8 py-4 w-16">No</th>
                  <th className="px-8 py-4">Biller</th>
                  <th className="px-8 py-4">Bank</th>
                  <th className="px-8 py-4">Rekening</th>
                  <th className="px-8 py-4">CA Terkait</th>
                  <th className="px-8 py-4 text-right">Aksi</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {activeTab === "biller" && billers.map((b, i) => (
                <tr key={b.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-8 py-4 text-neutral-400 font-medium">{b.no}</td>
                  <td className="px-8 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">{b.kode}</td>
                  <td className="px-8 py-4 font-semibold">{b.nama}</td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight",
                      b.status === "Aktif" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                    )}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {activeTab === "ca" && cas.map((c, i) => (
                <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-8 py-4 text-neutral-400 font-medium">{c.no}</td>
                  <td className="px-8 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">{c.kode}</td>
                  <td className="px-8 py-4 font-semibold">{c.nama}</td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight",
                      c.status === "Aktif" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                    )}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {activeTab === "fee" && fees.map((f, i) => (
                <tr key={f.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-8 py-4 text-neutral-400 font-medium">{f.no}</td>
                  <td className="px-8 py-4 font-bold">{f.ca}</td>
                  <td className="px-8 py-4 font-bold">{f.biller}</td>
                  <td className="px-8 py-4 text-right font-mono">{formatCurrency(f.fee)}</td>
                  <td className="px-8 py-4 text-right font-mono">{formatCurrency(f.admin)}</td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setFees(prev => prev.filter(x => x.id !== f.id))} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {activeTab === "settlement" && settlements.map((s, i) => (
                <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-8 py-4 text-neutral-400 font-medium">{s.id}</td>
                  <td className="px-8 py-4 font-bold text-blue-600">{s.billerKode}</td>
                  <td className="px-8 py-4 font-semibold">{s.bank}</td>
                  <td className="px-8 py-4 font-mono">{s.rekening}</td>
                  <td className="px-8 py-4">
                    <div className="flex flex-wrap gap-1">
                      {s.caList.map(ca => <span key={ca} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-bold">{ca}</span>)}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setSettlements(prev => prev.filter(x => x.id !== s.id))} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
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
