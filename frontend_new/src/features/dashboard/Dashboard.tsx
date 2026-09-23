import { useState } from "react";

import AdSlider from "../../components/AdSlider";
import SearchBar from "./components/SearchBar";
import DashboardHeader from "./components/DashboardHeader";
import StatusAbsen from "./components/StatusAbsen";

import FeatureGrid from "./components/FeatureGrid/FeatureGrid";
import { gridFeaturesSwitcher } from "./components/FeatureGrid/utils";

import BottomNav from "./components/BottomNav/BottomNav";
import { menuSwitcher } from "./components/BottomNav/utils";
import XPadding from "../../components/XPadding";
import { userData } from "./data.mock";

const user = userData;

// -- Mock Data --
export default function Dashboard() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-dvh bg-blue-500 pt-8 flex flex-col">
      <DashboardHeader user={user} />

      <XPadding className="mt-8">
        <SearchBar value={search} onChange={setSearch} />
      </XPadding>
      {/* Background White Negative Margin Top for Overlap with Search Button */}
      <div className="bg-white flex-1 w-full max-w-md mx-auto -mt-6 rounded-t-[60px] pt-13 pb-40">
        {/* Children*/}
        {/* Di bagian nanti ini bisa disesuaikan seusai dengan role user nya */}

        <XPadding>
          {/* AdSlider Container : Untuk Box Styling AdSlider lewat container di Page nya aja */}
          <div className="rounded-xl overflow-hidden">
            <AdSlider />
          </div>

          {/* Status Absen Siswa */}
          {user.role == "siswa" && <StatusAbsen isPresent={user.isPresent} />}

          {/* Grid Fitur */}
          <FeatureGrid features={gridFeaturesSwitcher(user.role)} search={search} />
        </XPadding>
      </div>

      {/* Bottom Nav */}
      <BottomNav menus={menuSwitcher(user.role)} />
    </div>
  );
}