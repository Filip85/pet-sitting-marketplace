import { AppNavbar } from '@/components/layout/AppNavbar'

export default function SitterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main>{children}</main>
    </div>
  )
}
