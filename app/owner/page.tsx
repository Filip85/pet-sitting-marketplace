import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerAuthClient, createServerSupabaseClient } from '@/lib/supabase/server'
import { LogoutButton } from '../../components/auth/LogoutButton'

export const dynamic = 'force-dynamic'

export default async function OwnerPage() {
  const authClient = await createServerAuthClient()
  const { data: { user } } = await authClient.auth.getUser()

  console.log(user ? `Authenticated user: ${user.email}` : 'No authenticated user found')
  if (!user) redirect('/login')

  const supabase = createServerSupabaseClient()
  const { count: petCount } = await supabase
    .from('pets')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your pets and find sitters</p>
          </div>
          <LogoutButton />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* My Pets */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
              🐾
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">My Pets</h3>
              <p className="text-sm text-gray-400 mt-0.5">
                {petCount ?? 0} {petCount === 1 ? 'pet' : 'pets'} registered
              </p>
            </div>
            <Link
              href="/owner/pets"
              className="mt-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors"
            >
              Manage Pets
            </Link>
          </div>

          {/* Find Sitters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
              🔍
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Find Sitters</h3>
              <p className="text-sm text-gray-400 mt-0.5">Browse available pet sitters</p>
            </div>
            <Link
              href="/sitters"
              className="mt-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors"
            >
              Browse Sitters
            </Link>
          </div>

          {/* Bookings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-xl">
              📅
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">My Bookings</h3>
              <p className="text-sm text-gray-400 mt-0.5">View your upcoming bookings</p>
            </div>
            <span className="mt-auto inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-400 text-sm font-medium py-2.5 px-4 rounded-xl cursor-not-allowed">
              Coming Soon
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}