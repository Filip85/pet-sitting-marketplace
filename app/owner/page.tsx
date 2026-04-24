import { LogoutButton } from '../../components/auth/LogoutButton'

export default async function OwnerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Pet Owner Dashboard</h1>
            <p className="text-xl text-gray-600">Manage your pets and find sitters</p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Pets</h3>
            <p className="text-gray-600">View and manage your pet profiles</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Sitters</h3>
            <p className="text-gray-600">Browse available pet sitters</p>
            <a href="/sitters" className="text-blue-600 hover:text-blue-700 font-medium">
              Browse Sitters →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Bookings</h3>
            <p className="text-gray-600">View your upcoming bookings</p>
          </div>
        </div>
      </div>
    </div>
  )
}