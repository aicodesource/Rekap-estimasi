import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, Download, Printer, Trash2, Edit2, Plus, Sparkles, Loader2, AlertTriangle, X, ChevronDown, ChevronUp, Info, RefreshCw, BarChart3 } from "lucide-react";
import { Transaction, Biller, CA } from "@/src/types";
import { cn, formatCurrency, getYesterdayDate, formatDate, formatNumber } from "@/src/lib/utils";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { DateRangePicker } from "./ui/DateRangePicker";
import { utils, writeFile } from "xlsx";

interface RekapViewProps {
  txs: Transaction[];
  billers: Biller[];
  cas: CA[];
  initialMode?: "detail" | "rekap";
  hideTabs?: boolean;
}

export default function RekapView({ txs, billers, cas, initialMode = "detail", hideTabs = false }: RekapViewProps) {
  const [viewMode, setViewMode] = useState<"detail" | "rekap">(initialMode);
  
  // Update viewMode when initialMode prop changes
  useEffect(() => {
    setViewMode(initialMode);
  }, [initialMode]);
  const [dateRange, setDateRange] = useState({ from: getYesterdayDate(), to: getYesterdayDate() });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCA, setSelectedCA] = useState("");
  const [selectedBiller, setSelectedBiller] = useState("");
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [aiFocus, setAiFocus] = useState<"general" | "high_value" | "volume" | "biller_pattern">("general");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction | null; direction: "asc" | "desc" }>({
    key: "tgl",
    direction: "desc"
  });

  const handleSort = (key: keyof Transaction) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const filteredTxs = useMemo(() => {
    return txs.filter(tx => {
      const matchSearch = !searchQuery || tx.txid.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCA = !selectedCA || tx.ca === selectedCA;
      const matchBiller = !selectedBiller || tx.biller === selectedBiller;
      const matchDate = (!dateRange.from || tx.tgl >= dateRange.from) && (!dateRange.to || tx.tgl <= dateRange.to);
      return matchSearch && matchCA && matchBiller && matchDate;
    });
  }, [txs, searchQuery, selectedCA, selectedBiller, dateRange]);

  const sortedTxs = useMemo(() => {
    const sortableTxs = [...filteredTxs];
    if (sortConfig.key) {
      sortableTxs.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === "asc" 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === "asc" 
            ? aValue - bValue 
            : bValue - aValue;
        }
        
        return 0;
      });
    }
    return sortableTxs;
  }, [filteredTxs, sortConfig]);

  const recapData = useMemo(() => {
    const groups: Record<string, any> = {};
    filteredTxs.forEach(tx => {
      const key = `${tx.tgl}|${tx.ca}|${tx.biller}`;
      if (!groups[key]) {
        groups[key] = { tgl: tx.tgl, ca: tx.ca, biller: tx.biller, lembar: 0, nominal: 0 };
      }
      groups[key].lembar += (tx.lembar || 1);
      groups[key].nominal += tx.nominal;
    });
    return Object.values(groups).sort((a: any, b: any) => a.tgl.localeCompare(b.tgl));
  }, [filteredTxs]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCA("");
    setSelectedBiller("");
    setDateRange({ from: getYesterdayDate(), to: getYesterdayDate() });
    setExpandedRowId(null);
    setSelectedIds(new Set());
    setCurrentPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedTxs.length && sortedTxs.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedTxs.map(tx => tx.id)));
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

  const paginatedTxs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTxs.slice(start, start + itemsPerPage);
  }, [sortedTxs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedTxs.length / itemsPerPage);

  const paginatedRecap = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return recapData.slice(start, start + itemsPerPage);
  }, [recapData, currentPage, itemsPerPage]);

  const totalRecapPages = Math.ceil(recapData.length / itemsPerPage);

  const handleAIRekap = async () => {
    if (recapData.length === 0) {
      setAiError("Tidak ada data untuk dianalisis.");
      return;
    }

    setIsAiLoading(true);
    setAiError(null);
    setAiReport(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const dataSummary = recapData.map(d => ({
        tanggal: formatDate(d.tgl),
        ca: cas.find(c => c.kode === d.ca)?.nama || d.ca,
        biller: billers.find(b => b.kode === d.biller)?.nama || d.biller,
        lembar: d.lembar,
        nominal: d.nominal
      }));

      const focusPrompts = {
        general: "Berikan analisis umum mengenai potensi anomali, ketidakkonsistenan, atau tren yang mencurigakan.",
        high_value: "Fokus utama pada perbedaan nominal yang tidak wajar atau sangat tinggi antar periode yang mungkin mengindikasikan kesalahan finansial.",
        volume: "Fokus utama pada lonjakan jumlah transaksi (lembar) yang tidak biasa pada CA atau Biller tertentu yang mungkin mengindikasikan aktivitas bot atau anomali operasional.",
        biller_pattern: "Fokus utama pada pola transaksi spesifik per Biller, mencari ketidakkonsistenan dalam distribusi transaksi antar Collecting Agent."
      };

      const prompt = `Analisis data transaksi berikut. ${focusPrompts[aiFocus]}
      
      Data Transaksi (Ringkasan):
      ${JSON.stringify(dataSummary, null, 2)}
      
      Berikan laporan dalam Bahasa Indonesia yang profesional menggunakan format Markdown. Gunakan heading, bullet points, dan bold text untuk menyoroti temuan penting.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });

      if (response.text) {
        setAiReport(response.text);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (err) {
      console.error("AI Rekap Error:", err);
      setAiError("Gagal menghasilkan analisis AI. Pastikan koneksi internet stabil dan API Key valid.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = viewMode === "detail" 
      ? sortedTxs.map(tx => ({
          Tanggal: formatDate(tx.tgl),
          'ID Pelanggan': tx.txid,
          'Collecting Agent': cas.find(c => c.kode === tx.ca)?.nama || tx.ca,
          Biller: billers.find(b => b.kode === tx.biller)?.nama || tx.biller,
          Lembar: tx.lembar || 1,
          Nominal: tx.nominal,
          Status: tx.status,
          Periode: tx.periode || "-"
        }))
      : recapData.map(row => ({
          Tanggal: formatDate(row.tgl),
          'Collecting Agent': cas.find(c => c.kode === row.ca)?.nama || row.ca,
          Biller: billers.find(b => b.kode === row.biller)?.nama || row.biller,
          'Total Lembar': row.lembar,
          'Total Nominal': row.nominal
        }));

    const ws = utils.json_to_sheet(dataToExport);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, viewMode === "detail" ? "Detail Transaksi" : "Rekap Transaksi");
    
    const fileName = `Laporan_${viewMode}_${dateRange.from}_to_${dateRange.to}.xlsx`;
    writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats for Filtered Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Transaksi</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{formatNumber(filteredTxs.length)}</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Records</span>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Lembar</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{formatNumber(filteredTxs.reduce((s, t) => s + (t.lembar || 1), 0))}</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Lembar</span>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Nominal</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{formatCurrency(filteredTxs.reduce((s, t) => s + t.nominal, 0))}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Cakupan Data</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-neutral-900 flex items-center justify-center text-[8px] font-bold text-blue-600" title="Unique CA">
                {new Set(filteredTxs.map(t => t.ca)).size}
              </div>
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border-2 border-white dark:border-neutral-900 flex items-center justify-center text-[8px] font-bold text-emerald-600" title="Unique Biller">
                {new Set(filteredTxs.map(t => t.biller)).size}
              </div>
            </div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">CA & Biller</span>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] ml-1">Cari ID Pelanggan</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="ID Pelanggan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] ml-1">Collecting Agent</label>
            <div className="relative">
              <select 
                value={selectedCA}
                onChange={(e) => setSelectedCA(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all appearance-none outline-none cursor-pointer"
              >
                <option value="">Semua CA</option>
                {cas.map(ca => <option key={ca.id} value={ca.kode}>{ca.kode} - {ca.nama}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] ml-1">Biller</label>
            <div className="relative">
              <select 
                value={selectedBiller}
                onChange={(e) => setSelectedBiller(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all appearance-none outline-none cursor-pointer"
              >
                <option value="">Semua Biller</option>
                {billers.map(b => <option key={b.id} value={b.kode}>{b.kode} - {b.nama}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] ml-1">Rentang Tanggal</label>
            <div className="flex gap-2">
              <DateRangePicker 
                from={dateRange.from}
                to={dateRange.to}
                onChange={(range) => setDateRange(range)}
                className="flex-1"
              />
              <button 
                onClick={handleReset}
                title="Reset Filter"
                className="p-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800 gap-6">
          {!hideTabs ? (
            <div className="flex p-1.5 bg-neutral-100 dark:bg-neutral-800/50 rounded-[1.25rem] w-full sm:w-auto">
              <button 
                onClick={() => setViewMode("detail")}
                className={cn(
                  "flex-1 sm:flex-none px-8 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200",
                  viewMode === "detail" 
                    ? "bg-white dark:bg-neutral-700 text-blue-600 shadow-xl shadow-blue-500/10" 
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                )}
              >
                📋 Detail
              </button>
              <button 
                onClick={() => setViewMode("rekap")}
                className={cn(
                  "flex-1 sm:flex-none px-8 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200",
                  viewMode === "rekap" 
                    ? "bg-white dark:bg-neutral-700 text-blue-600 shadow-xl shadow-blue-500/10" 
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                )}
              >
                📊 Rekap
              </button>
            </div>
          ) : (
            <div />
          )}

          <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-end w-full sm:w-auto">
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Fokus AI</label>
              <div className="relative">
                <select 
                  value={aiFocus}
                  onChange={(e) => setAiFocus(e.target.value as any)}
                  className="w-full pl-3 pr-8 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none outline-none cursor-pointer"
                >
                  <option value="general">Analisis Umum</option>
                  <option value="high_value">Nominal Tinggi</option>
                  <option value="volume">Volume Transaksi</option>
                  <option value="biller_pattern">Pola Biller</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex gap-2 self-end">
              <button 
                onClick={handleAIRekap}
                disabled={isAiLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                AI Rekap
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all">
                <Printer className="w-4 h-4 text-blue-600" />
                Cetak
              </button>
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Report Section */}
      {(aiReport || aiError) && (
        <div className={cn(
          "p-8 rounded-[2rem] border animate-in fade-in slide-in-from-top-4 duration-500",
          aiError 
            ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30" 
            : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30"
        )}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-xl",
                aiError ? "bg-red-100 dark:bg-red-900/30" : "bg-blue-100 dark:bg-blue-900/30"
              )}>
                {aiError ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : (
                  <Sparkles className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className={cn(
                  "font-bold text-lg",
                  aiError ? "text-red-900 dark:text-red-100" : "text-blue-900 dark:text-blue-100"
                )}>
                  {aiError ? "Terjadi Kesalahan" : "Hasil Analisis AI"}
                </h3>
                <p className="text-xs opacity-60 font-medium">
                  {aiError ? "Gagal memproses data" : "Berdasarkan data transaksi yang difilter"}
                </p>
              </div>
            </div>
            <button 
              onClick={() => { setAiReport(null); setAiError(null); }}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 opacity-40" />
            </button>
          </div>

          {aiError ? (
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{aiError}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:mb-4 prose-headings:mt-6 first:prose-headings:mt-0">
              <ReactMarkdown>{aiReport!}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 text-[10px] uppercase tracking-[0.2em] font-bold">
              {viewMode === "detail" ? (
                <tr>
                  <th className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 w-10">
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.size === sortedTxs.length && sortedTxs.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </th>
                  {[
                    { key: "tgl", label: "Tanggal", align: "left" },
                    { key: "txid", label: "ID Pelanggan", align: "left" },
                    { key: "ca", label: "CA", align: "left" },
                    { key: "biller", label: "Biller", align: "left" },
                    { key: "lembar", label: "Lembar", align: "center" },
                    { key: "nominal", label: "Nominal", align: "right" },
                  ].map((col) => (
                    <th 
                      key={col.key}
                      onClick={() => handleSort(col.key as keyof Transaction)}
                      className={cn(
                        "px-8 py-5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group border-b border-neutral-100 dark:border-neutral-800",
                        col.align === "center" && "text-center",
                        col.align === "right" && "text-right"
                      )}
                    >
                      <div className={cn(
                        "flex items-center gap-2",
                        col.align === "center" && "justify-center",
                        col.align === "right" && "justify-end"
                      )}>
                        <span className="font-serif italic lowercase opacity-70 tracking-normal text-xs mr-1">{col.label[0]}</span>
                        {col.label}
                        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronUp className={cn(
                            "w-2.5 h-2.5 -mb-1",
                            sortConfig.key === col.key && sortConfig.direction === "asc" ? "text-blue-600" : "text-neutral-300"
                          )} />
                          <ChevronDown className={cn(
                            "w-2.5 h-2.5",
                            sortConfig.key === col.key && sortConfig.direction === "desc" ? "text-blue-600" : "text-neutral-300"
                          )} />
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="px-8 py-5 text-right border-b border-neutral-100 dark:border-neutral-800">
                    <span className="font-serif italic lowercase opacity-70 tracking-normal text-xs mr-1">a</span>
                    Aksi
                  </th>
                </tr>
              ) : (
                <tr>
                  {[
                    { label: "Tanggal", align: "left" },
                    { label: "CA", align: "left" },
                    { label: "Biller", align: "left" },
                    { label: "Total Lembar", align: "center" },
                    { label: "Total Nominal", align: "right" },
                  ].map((col, i) => (
                    <th 
                      key={i}
                      className={cn(
                        "px-8 py-5 border-b border-neutral-100 dark:border-neutral-800",
                        col.align === "center" && "text-center",
                        col.align === "right" && "text-right"
                      )}
                    >
                      <div className={cn(
                        "flex items-center gap-2",
                        col.align === "center" && "justify-center",
                        col.align === "right" && "justify-end"
                      )}>
                        <span className="font-serif italic lowercase opacity-70 tracking-normal text-xs mr-1">{col.label[0]}</span>
                        {col.label}
                      </div>
                    </th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {viewMode === "detail" ? (
                paginatedTxs.length === 0 ? (
                  <tr><td colSpan={8} className="px-8 py-20 text-center text-neutral-400 italic font-medium">Tidak ada data transaksi yang ditemukan</td></tr>
                ) : (
                  paginatedTxs.map((tx) => (
                    <React.Fragment key={tx.id}>
                      <tr 
                        onClick={() => setExpandedRowId(expandedRowId === tx.id ? null : tx.id)}
                        className={cn(
                          "hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer group",
                          expandedRowId === tx.id && "bg-blue-50/30 dark:bg-blue-900/10",
                          selectedIds.has(tx.id) && "bg-blue-50/50 dark:bg-blue-900/20"
                        )}
                      >
                        <td className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              checked={selectedIds.has(tx.id)}
                              onChange={() => toggleSelectOne(tx.id)}
                              className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        </td>
                        <td className="px-8 py-5 text-neutral-500 font-medium">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-6 h-6 rounded-lg flex items-center justify-center transition-colors",
                              expandedRowId === tx.id ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500"
                            )}>
                              {expandedRowId === tx.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </div>
                            {formatDate(tx.tgl)}
                          </div>
                        </td>
                        <td className="px-8 py-5 font-mono font-bold text-neutral-700 dark:text-neutral-300 tracking-tight">{tx.txid}</td>
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-[10px] font-bold border border-neutral-200/50 dark:border-neutral-700/50">
                            {tx.ca}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold border border-blue-100 dark:border-blue-900/30">
                            {tx.biller}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center font-bold text-neutral-700 dark:text-neutral-300">{tx.lembar}</td>
                        <td className="px-8 py-5 text-right font-mono font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(tx.nominal)}</td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); }}
                              className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); }}
                              className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRowId === tx.id && (
                        <tr className="bg-blue-50/30 dark:bg-blue-900/5">
                          <td colSpan={8} className="px-8 py-8 border-t border-blue-100 dark:border-blue-900/20">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Informasi Transaksi</p>
                                </div>
                                <div className="space-y-3 pl-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                      <Info className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-neutral-400 font-bold uppercase">ID Pelanggan</p>
                                      <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{tx.txid}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">
                                      <RefreshCw className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-neutral-400 font-bold uppercase">Periode Tagihan</p>
                                      <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{tx.periode || "-"}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Status Rekonsiliasi</p>
                                </div>
                                <div className="space-y-3 pl-3">
                                  <div className={cn(
                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border",
                                    tx.status === "Cocok" 
                                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600" 
                                      : "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30 text-amber-600"
                                  )}>
                                    <div className={cn("w-2 h-2 rounded-full animate-pulse", tx.status === "Cocok" ? "bg-emerald-500" : "bg-amber-500")} />
                                    <span className="text-xs font-bold uppercase tracking-wider">{tx.status}</span>
                                  </div>
                                  <p className="text-xs text-neutral-500 leading-relaxed">
                                    {tx.status === "Cocok" 
                                      ? "Data transaksi ini telah diverifikasi dan sesuai dengan laporan Berita Acara dari pihak terkait." 
                                      : "Terdeteksi ketidaksesuaian data. Mohon lakukan pengecekan manual pada file sumber atau Berita Acara."}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Detail CA & Biller</p>
                                </div>
                                <div className="space-y-3 pl-3">
                                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-[10px] text-neutral-400 font-bold uppercase">Collecting Agent</span>
                                      <span className="text-[10px] font-mono font-bold bg-neutral-200 dark:bg-neutral-700 px-1.5 rounded text-neutral-600 dark:text-neutral-400">{tx.ca}</span>
                                    </div>
                                    <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                      {cas.find(c => c.kode === tx.ca)?.nama || "Unknown CA"}
                                    </p>
                                  </div>
                                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-[10px] text-neutral-400 font-bold uppercase">Biller</span>
                                      <span className="text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900/30 px-1.5 rounded text-blue-600 dark:text-blue-400">{tx.biller}</span>
                                    </div>
                                    <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                      {billers.find(b => b.kode === tx.biller)?.nama || "Unknown Biller"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )
              ) : (
                paginatedRecap.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-neutral-400 italic font-medium">Tidak ada data rekap untuk ditampilkan</td></tr>
                ) : (
                  paginatedRecap.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all group border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                      <td className="px-8 py-6 text-neutral-500 font-medium">{formatDate(row.tgl)}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 text-[10px] font-bold border border-neutral-200 dark:border-neutral-700 shadow-sm group-hover:bg-white dark:group-hover:bg-neutral-700 transition-colors">
                            {row.ca}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-neutral-700 dark:text-neutral-300 leading-tight">{cas.find(c => c.kode === row.ca)?.nama || row.ca}</span>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Collecting Agent</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 text-[10px] font-bold border border-blue-100 dark:border-blue-900/30 shadow-sm group-hover:bg-white dark:group-hover:bg-neutral-700 transition-colors">
                            {row.biller}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-neutral-700 dark:text-neutral-300 leading-tight">{billers.find(b => b.kode === row.biller)?.nama || row.biller}</span>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Biller Partner</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-lg font-black text-neutral-900 dark:text-neutral-100 leading-none">{row.lembar}</span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter mt-1">Lembar</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight leading-none">{formatCurrency(row.nominal)}</span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter mt-1">Total IDR</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
            {filteredTxs.length > 0 && (
              <tfoot className="bg-neutral-50/50 dark:bg-neutral-800/30 border-t-2 border-neutral-100 dark:border-neutral-800">
                <tr>
                  <td colSpan={viewMode === "detail" ? 5 : 3} className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Ringkasan Laporan</p>
                        <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Total Keseluruhan Transaksi</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase mb-1">Total Lembar</p>
                    <p className="text-xl font-black text-neutral-900 dark:text-neutral-100">{filteredTxs.reduce((s, t) => s + (t.lembar || 1), 0)}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase mb-1">Total Nominal</p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">
                      {formatCurrency(filteredTxs.reduce((s, t) => s + t.nominal, 0))}
                    </p>
                  </td>
                  {viewMode === "detail" && <td />}
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-6 bg-neutral-50 dark:bg-neutral-800/30 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium">Baris per halaman:</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-bold px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {[10, 25, 50, 100].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <span className="text-xs text-neutral-400 font-medium">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, viewMode === "detail" ? sortedTxs.length : recapData.length)} dari {viewMode === "detail" ? sortedTxs.length : recapData.length} data
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, viewMode === "detail" ? totalPages : totalRecapPages) }, (_, i) => {
                const pageNum = i + 1;
                // Simple pagination logic for now
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded-xl text-xs font-bold transition-all",
                      currentPage === pageNum 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                        : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {(viewMode === "detail" ? totalPages : totalRecapPages) > 5 && (
                <span className="text-neutral-400 px-1">...</span>
              )}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(viewMode === "detail" ? totalPages : totalRecapPages, prev + 1))}
              disabled={currentPage === (viewMode === "detail" ? totalPages : totalRecapPages)}
              className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
