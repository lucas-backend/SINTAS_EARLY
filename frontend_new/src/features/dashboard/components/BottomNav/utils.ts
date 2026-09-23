import { adminMenus, guruMenus, siswaMenus } from "./data";

export function menuSwitcher(userRole: string) {
  switch (userRole) {
    case "siswa":
      return siswaMenus;
    case "guru":
      return guruMenus;
    case "admin":
      return adminMenus;
    default:
      return [];
  }
}
