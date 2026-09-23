import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./features/dashboard/Dashboard";
import Jadwal from "./features/jadwal/Jadwal";
import Login from "./features/login/Login";
import Scan from "./features/scan/Scan";
import ScanResult from "./features/scan/ScanResult";
import Riwayat from "./features/riwayat/Riwayat";
import Profil from "./features/profil/Profil";
import BuatAbsen from "./features/guru/BuatAbsen";
import SesiQr from "./features/guru/SesiQr";
import RekapKelas from "./features/guru/RekapKelas";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jadwal" element={<Jadwal />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/scan/result" element={<ScanResult />} />
        <Route path="/riwayat" element={<Riwayat />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/guru/buat-absen" element={<BuatAbsen />} />
        <Route path="/guru/sesi/:id" element={<SesiQr />} />
        <Route path="/guru/rekap" element={<RekapKelas />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}