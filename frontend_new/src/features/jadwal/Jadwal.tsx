import Header from "../../components/Header";
import XPadding from "../../components/XPadding";
import JadwalTab from "./components/sectionPelajaran/PelajaranTab";

export default function Jadwal() {
  return (
    <div>
      <Header title="Jadwal" backLink="/dashboard" />

      <XPadding className="mt-4 mb-8">
        <JadwalTab />
      </XPadding>
    </div>
  );
}