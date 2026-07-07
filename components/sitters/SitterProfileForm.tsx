'use client'

import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { sitterProfileSchema, type SitterProfileForm as FormType } from '@/lib/validations/sitter-profile'
import { SITTER_SERVICES } from '@/lib/constants/services'
import { updateSitterProfile } from '@/actions/sitter-profile'

interface SitterProfileFormProps {
  defaultValues: Partial<FormType>
  defaultImageUrl?: string | null
}

export function SitterProfileForm({ defaultValues, defaultImageUrl }: SitterProfileFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImageUrl ?? null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormType>({
    resolver: zodResolver(sitterProfileSchema),
    defaultValues: {
      pricePerDay: defaultValues.pricePerDay ?? 0,
      yearsOfExperience: defaultValues.yearsOfExperience,
      services: defaultValues.services ?? [],
      canHostAtHome: defaultValues.canHostAtHome ?? false,
      bio: defaultValues.bio ?? '',
      city: defaultValues.city ?? '',
    },
  })

  const onSubmit = async (data: FormType) => {
    setServerError(null)
    setSaved(false)
    const result = await updateSitterProfile({ ...data, imageFile: selectedFile })
    if (!result.success) {
      setServerError(result.error)
    } else {
      setSaved(true)
      router.refresh()
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : defaultImageUrl ?? null)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {saved && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
          Profile updated successfully!
        </div>
      )}

      {/* Price per day */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Price per day ($) <span className="text-red-500">*</span>
        </label>
        <input
          {...register('pricePerDay', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="50.00"
        />
        {errors.pricePerDay && (
          <p className="mt-1.5 text-xs text-red-600">{errors.pricePerDay.message}</p>
        )}
      </div>

      {/* Years of experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Years of experience <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          {...register('yearsOfExperience', {
            setValueAs: (v) => (v === '' || v === undefined ? undefined : parseInt(v, 10)),
          })}
          type="number"
          min="0"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="e.g. 3"
        />
        {errors.yearsOfExperience && (
          <p className="mt-1.5 text-xs text-red-600">{errors.yearsOfExperience.message}</p>
        )}
      </div>

      {/* Services */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Services you offer
        </label>
        <Controller
          name="services"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SITTER_SERVICES.map((service) => {
                const checked = field.value?.includes(service.id) ?? false
                return (
                  <label
                    key={service.id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${
                      checked
                        ? 'border-blue-200 bg-blue-50 ring-1 ring-blue-200'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...(field.value ?? []), service.id]
                          : (field.value ?? []).filter((s) => s !== service.id)
                        field.onChange(next)
                      }}
                      className="sr-only"
                    />
                    <span className="text-lg select-none" aria-hidden>
                      {service.icon}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {service.label}
                    </span>
                    {checked && (
                      <svg
                        className="ml-auto w-4 h-4 text-blue-600 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0z" />
                      </svg>
                    )}
                  </label>
                )
              })}
            </div>
          )}
        />
        {errors.services && (
          <p className="mt-1.5 text-xs text-red-600">{errors.services.message}</p>
        )}
      </div>

      {/* Pet hotel */}
      <div>
        <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer">
          <input
            {...register('canHostAtHome')}
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            <span className="block text-sm font-medium text-gray-800">Offer pet hotel / boarding at my home</span>
            <span className="block text-xs text-gray-500">Owners will see this on your public profile.</span>
          </span>
        </label>
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          City <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          {...register('city')}
          type="text"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="e.g. Zagreb"
        />
        {errors.city && (
          <p className="mt-1.5 text-xs text-red-600">{errors.city.message}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Bio <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          {...register('bio')}
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
          placeholder="Tell pet owners about yourself, your experience, and why they should trust you..."
        />
        {errors.bio && (
          <p className="mt-1.5 text-xs text-red-600">{errors.bio.message}</p>
        )}
      </div>

      {/* Profile photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Profile photo <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {previewUrl ? (
          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-2">
            <img src={previewUrl} alt="Profile preview" className="h-32 w-full rounded-xl object-cover" />
          </div>
        ) : null}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors"
      >
        {isSubmitting ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  )
}
