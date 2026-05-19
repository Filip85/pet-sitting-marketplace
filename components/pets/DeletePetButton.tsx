'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deletePet } from '@/actions/pets'

interface DeletePetButtonProps {
  petId: string
  petName: string
}

export function DeletePetButton({ petId, petName }: DeletePetButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    const result = await deletePet(petId)
    if (!result.success) {
      setError(result.error)
      setLoading(false)
      setConfirming(false)
    } else {
      router.refresh()
    }
  }

  if (error) {
    return <span className="text-xs text-red-600">{error}</span>
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Delete {petName}?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          {loading ? 'Deleting...' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
    >
      Delete
    </button>
  )
}
