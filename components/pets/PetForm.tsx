'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { petSchema, type PetForm as PetFormType } from '@/lib/validations/pets'
import type { ActionResult } from '@/lib/utils'

interface PetFormProps {
  action: (data: PetFormType) => Promise<ActionResult>
  defaultValues?: Partial<PetFormType>
  submitLabel: string
}

export function PetForm({ action, defaultValues, submitLabel }: PetFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PetFormType>({
    resolver: zodResolver(petSchema),
    defaultValues: defaultValues ?? {},
  })

  const onSubmit = async (data: PetFormType) => {
    setServerError(null)
    const result = await action(data)
    if (!result.success) {
      setServerError(result.error)
    } else {
      router.push('/owner/pets')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Server error */}
      {serverError && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Pet Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          type="text"
          placeholder="e.g. Buddy"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        {errors.name && (
          <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          {...register('type')}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        >
          <option value="">Select a type</option>
          <option value="dog">🐕 Dog</option>
          <option value="cat">🐈 Cat</option>
          <option value="other">🐾 Other</option>
        </select>
        {errors.type && (
          <p className="mt-1.5 text-xs text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* Breed */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Breed <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          {...register('breed')}
          type="text"
          placeholder="e.g. Golden Retriever"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        {errors.breed && (
          <p className="mt-1.5 text-xs text-red-600">{errors.breed.message}</p>
        )}
      </div>

      {/* Age */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Age <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          {...register('age', {
            setValueAs: (v) => v === '' || v === undefined ? undefined : parseInt(v, 10),
          })}
          type="number"
          min="0"
          placeholder="e.g. 3"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        {errors.age && (
          <p className="mt-1.5 text-xs text-red-600">{errors.age.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>

    </form>
  )
}
