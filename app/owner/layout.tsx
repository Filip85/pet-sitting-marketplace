import { AppNavbar } from '@/components/layout/AppNavbar'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main>{children}</main>
    </div>
  )
}
