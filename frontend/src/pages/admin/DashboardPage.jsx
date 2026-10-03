import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded'
import { Link } from 'react-router-dom'

const QUICK_LINKS = [
  { to: '/app/admin/banners', label: 'Banner sekolah', description: 'Atur banner yang tampil di beranda.', icon: CampaignRoundedIcon },
  { to: '/app/admin/users', label: 'Pengguna', description: 'Kelola akun dan reset password.', icon: GroupOutlinedIcon },
  { to: '/app/admin/academic', label: 'Akademik', description: 'Jenjang, kelas, dan mata pelajaran.', icon: SchoolRoundedIcon },
  { to: '/app/admin/plotting', label: 'Penempatan', description: 'Siswa pada kelas dan guru.', icon: HubOutlinedIcon },
  { to: '/app/admin/reports', label: 'Laporan kehadiran', description: 'Rekap global dan export.', icon: BarChartRoundedIcon },
]

export default function AdminDashboardPage() {
  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink-900 text-center">Kelola</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((entry) => {
            const Icon = entry.icon
            return (
              <Link
                key={entry.to}
                to={entry.to}
                className="group flex items-center gap-3 rounded-xl border border-black/10 bg-white p-5 transition hover:border-blue-500 focus-visible:outline-blue-500"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                  <Icon className="h-5! w-5!" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-900 group-hover:text-blue-500">
                    {entry.label}
                  </span>
                  <span className="block text-xs text-slate-700">{entry.description}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
