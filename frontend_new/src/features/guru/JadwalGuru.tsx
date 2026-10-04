import { useMemo, useState } from "react";

import Header from "../../components/Header";
import XPadding from "../../components/XPadding";
import {
  jadwalGuruDates,
  jadwalGuruDefaultDate,
  jadwalGuruItemsByDate,
} from "../../data/guru/jadwalGuruData";
import JadwalGuruCard from "./components/JadwalGuruCard";
import JadwalGuruDateStrip from "./components/JadwalGuruDateStrip";

export default function JadwalGuru() {
  const [selectedIso, setSelectedIso] = useState(jadwalGuruDefaultDate);
  const [pickerOpen, setPickerOpen] = useState(false);

  const items = useMemo(
    () => jadwalGuruItemsByDate[selectedIso] ?? [],
    [selectedIso],
  );

  const selectedDate = jadwalGuruDates.find((item) => item.iso === selectedIso);

  return (
    <div>
      <Header title="Jadwal" backLink="/dashboard" />

      <XPadding className="mt-4 mb-8">
        <JadwalGuruDateStrip
          dates={jadwalGuruDates}
          selectedIso={selectedIso}
          itemsByDate={jadwalGuruItemsByDate}
          onSelect={setSelectedIso}
          onOpenPicker={() => setPickerOpen((open) => !open)}
          onToday={() => setSelectedIso(jadwalGuruDefaultDate)}
          isToday={selectedIso === jadwalGuruDefaultDate}
        />

        {pickerOpen ? (
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Pilih tanggal
            <input
              type="date"
              value={selectedIso}
              onChange={(event) => {
                if (event.target.value) setSelectedIso(event.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-black/10 bg-white px-4 py-2"
            />
          </label>
        ) : null}

        <section className="mt-4">
          <h3 className="text-xl font-semibold">
            {selectedDate ? `${selectedDate.day}, ${selectedDate.date}` : "Jadwal"}
          </h3>

          <div className="mt-4 flex flex-col gap-4">
            {items.length > 0 ? (
              items.map((item) => <JadwalGuruCard key={item.id} item={item} />)
            ) : (
              <p className="rounded-lg border border-dashed border-black/10 px-4 py-8 text-center text-sm text-slate-700">
                Tidak ada jadwal pada tanggal ini.
              </p>
            )}
          </div>
        </section>
      </XPadding>
    </div>
  );
}