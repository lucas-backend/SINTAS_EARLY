import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/Button";
import Header from "../../components/Header";
import WhiteSheet from "../../components/WhiteSheet";
import XPadding from "../../components/XPadding";

const mockAssignments = [
  "Matematika — XII-A",
  "Matematika — XII-B",
  "Fisika — XI-A",
];

const inputClassName =
  "w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-black focus:outline-none";

export default function BuatAbsen() {
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(mockAssignments[0]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/guru/sesi/1");
  }

  return (
    <div className="min-h-dvh bg-blue-500 flex flex-col">
      <Header title="Buat Absen" backLink="/dashboard" />

      <WhiteSheet>
        <XPadding>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Mata pelajaran & kelas
              </label>
              <select
                value={assignment}
                onChange={(event) => setAssignment(event.target.value)}
                className={inputClassName}
              >
                {mockAssignments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Tanggal sesi
              </label>
              <input
                type="date"
                defaultValue="2026-09-30"
                className={inputClassName}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Jam mulai
                </label>
                <input
                  type="time"
                  defaultValue="07:00"
                  className={inputClassName}
                />
              </div>

              <div className="flex flex-1 flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Jam selesai
                </label>
                <input
                  type="time"
                  defaultValue="08:30"
                  className={inputClassName}
                />
              </div>
            </div>

            <p className="rounded-lg bg-blue-100 p-3 text-sm text-slate-700">
              Window scan dibuka 15 menit sebelum jam mulai dan ditutup pada jam
              selesai. Sesi duplikat pada penugasan, tanggal, dan jam yang sama
              ditolak.
            </p>

            <Button type="submit">BUAT ABSEN</Button>
          </form>
        </XPadding>
      </WhiteSheet>
    </div>
  );
}