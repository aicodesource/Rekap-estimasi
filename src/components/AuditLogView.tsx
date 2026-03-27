import { useMemo, useState } from "react";
import { Search, Filter, History, ChevronRight, Info, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { AuditLog } from "@/src/types";
import { cn } from "@/src/lib/utils";

interface AuditLogViewProps {
  auditLogs: AuditLog[];
}

export default function AuditLogView({ auditLogs }: AuditLogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTipe, setFilterTipe] = useState<string>("all");

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch = !searchQuery || 
        log.aksi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.modul.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchTipe = filterTipe === "all" || log.tipe === filterTipe;
      
      return matchSearch && matchTipe;
    }).sort((a, b) => b.id - a.id);
  }, [auditLogs, searchQuery, filterTipe]);

  const getIcon = (tipe: string) => {
    switch (tipe) {
      case "success": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "danger": return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Cari log aktivitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Semua Tipe</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-neutral-400 italic">Tidak ada log aktivitas ditemukan</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="group p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-all">
                <div className="flex items-start gap-4">
                  <div className={cn("mt-1 p-2 rounded-lg", 
                    log.tipe === "success" ? "bg-green-100 dark:bg-green-900/20" : 
                    log.tipe === "warning" ? "bg-amber-100 dark:bg-amber-900/20" : 
                    log.tipe === "danger" ? "bg-red-100 dark:bg-red-900/20" : "bg-blue-100 dark:bg-blue-900/20"
                  )}>
                    {getIcon(log.tipe)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{log.aksi}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded-full text-neutral-500 font-bold uppercase tracking-widest">{log.modul}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-medium">{log.tgl}</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{log.detail}</p>
                    <div className="mt-2 flex items-center gap-4 text-[10px] text-neutral-400 font-medium">
                      <span className="flex items-center gap-1"><History className="w-3 h-3" /> User: {log.user}</span>
                      {log.sebelum && (
                        <span className="truncate max-w-[200px]">Prev: {log.sebelum}</span>
                      )}
                      {log.sesudah && (
                        <span className="truncate max-w-[200px] text-blue-500">Next: {log.sesudah}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors self-center" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
