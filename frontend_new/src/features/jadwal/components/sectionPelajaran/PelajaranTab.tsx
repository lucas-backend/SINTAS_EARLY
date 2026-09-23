import {
  jadwalDates,
  jadwalSections,
} from "../../../../data/jadwal/jadwalData";
import JadwalDateStrip from "./JadwalDateStrip";
import JadwalSection from "./JadwalSection";

export default function JadwalTab() {
  return (
    <>
      <JadwalDateStrip dates={jadwalDates} />

      {jadwalSections.map((section) => (
        <JadwalSection
          key={section.title}
          title={section.title}
          items={section.items}
        />
      ))}
    </>
  );
}
