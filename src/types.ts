export interface Biller {
  id: number;
  no: number;
  kode: string;
  nama: string;
  status: "Aktif" | "Nonaktif";
}

export interface CA {
  id: number;
  no: number;
  kode: string;
  nama: string;
  status: "Aktif" | "Nonaktif";
}

export interface Fee {
  id: number;
  no: number;
  ca: string;
  biller: string;
  fee: number;
  admin: number;
}

export interface Transaction {
  id: number;
  txid: string;
  tgl: string;
  periode: string;
  ca: string;
  biller: string;
  lembar: number;
  nominal: number;
  status: "Cocok" | "Duplikat";
}

export interface Settlement {
  id: number;
  billerKode: string;
  bank: string;
  rekening: string;
  caList: string[];
}

export interface BeritaAcara {
  id: number;
  noBa: string;
  tgl: string;
  lembar: number;
  nominal: number;
  namaFile: string;
  incomplete?: boolean;
  attachment?: string; // Base64 string for file
  attachmentName?: string;
}

export interface AuditLog {
  id: number;
  aksi: string;
  tgl: string;
  user: string;
  modul: string;
  detail: string;
  sebelum?: string;
  sesudah?: string;
  tipe: "info" | "warning" | "danger" | "success";
}

export interface Notification {
  id: number;
  judul: string;
  pesan: string;
  tgl: string;
  tipe: "info" | "warning" | "error" | "success";
  read: boolean;
}

export interface ReconResult {
  id: number;
  tgl: string;
  ca: string;
  biller: string;
  totalLembarCA: number;
  totalNominalCA: number;
  totalLembarBiller: number;
  totalNominalBiller: number;
  selisihLembar: number;
  selisihNominal: number;
  status: "Cocok" | "Selisih" | "Suspect";
}

export interface ImportRemap {
  id: number;
  ca: string;
  billerAsal: string;
  billerTujuan: string;
  enabled?: boolean;
}

export interface ImportNoHdrFmt {
  id: number;
  nama: string;
  kodeCA: string;
  kolCA: number;
  kolBiller: number;
  kolID: number;
  kolNom: number;
  kolPeriode: number;
  kolLembar: number;
}

export interface ImportBillerRule {
  id: number;
  biller: string;
  aturan: "digit_id";
  digit: number;
}

export interface ImportCARemap {
  id: number;
  caAsal: string;
  biller: string;
  caTujuan: string;
  enabled?: boolean;
}
