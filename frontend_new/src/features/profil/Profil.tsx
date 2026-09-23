import { useState } from "react";

import PermIdentityRoundedIcon from "@mui/icons-material/PermIdentityRounded";
import Button from "../../components/Button";
import Header from "../../components/Header";
import WhiteSheet from "../../components/WhiteSheet";
import XPadding from "../../components/XPadding";
import { userData } from "../dashboard/data.mock";

const inputClassName =
  "w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-black focus:outline-none disabled:bg-black/5 disabled:text-slate-500";

export default function Profil() {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
  }

  return (
    <div className="min-h-dvh bg-blue-500 flex flex-col">
      <Header title="Profil" backLink="/dashboard" />

      <WhiteSheet>
        <XPadding className="flex flex-col gap-4">
          {/* Identitas */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <PermIdentityRoundedIcon className="h-12! w-12! text-blue-500" />
            </div>
            <p className="text-xl font-bold">{userData.name}</p>
            <p className="text-sm text-slate-700">
              Siswa · Kelas {userData.kelas}
            </p>
          </div>

          {/* Read-only */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Username</label>
            <input
              type="text"
              value={userData.username}
              disabled
              aria-describedby="username-hint"
              className={inputClassName}
            />
            <span id="username-hint" className="text-xs text-slate-500">
              Username tidak dapat diubah.
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">NIM</label>
            <input
              type="text"
              value={userData.nim}
              disabled
              aria-describedby="nim-hint"
              className={inputClassName}
            />
            <span id="nim-hint" className="text-xs text-slate-500">
              NIM tidak dapat diubah.
            </span>
          </div>

          {/* Editable */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Nama</label>
            <input type="text" defaultValue={userData.name} className={inputClassName} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input type="email" defaultValue={userData.email} className={inputClassName} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Nomor WhatsApp
            </label>
            <input
              type="tel"
              defaultValue="0812-3456-7890"
              placeholder="08xx-xxxx-xxxx"
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Tanggal lahir
            </label>
            <input type="date" defaultValue="2008-05-12" className={inputClassName} />
          </div>

          <Button type="button" onClick={handleSave} disabled={saved}>
            {saved ? "TERSIMPAN" : "SIMPAN PERUBAHAN"}
          </Button>

          {saved && (
            <p className="text-center text-sm font-semibold text-green-600">
              Perubahan tersimpan.
            </p>
          )}
        </XPadding>
      </WhiteSheet>
    </div>
  );
}