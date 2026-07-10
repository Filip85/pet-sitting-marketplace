import { AppNavbar } from '@/components/layout/AppNavbar'
import { Footer } from '@/components/layout/Footer'

export default function SitterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
