import type { featureType } from "./types";
import { adminFeatures, guruFeatures, siswaFeatures } from "./data";

export function gridFeaturesSwitcher(userRole: string): featureType[] {
  switch (userRole) {
    case "siswa":
      return siswaFeatures;
    case "guru":
      return guruFeatures;
    case "admin":
      return adminFeatures;
    default:
      return [];
  }
}
