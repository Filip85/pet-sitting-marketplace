'use client'

import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { updateOwnerProfile } from '@/actions/signup'

interface OwnerProfileFormProps {
  defaultValues: {
    firstName: string
    lastName: string
    city?: string
    bio?: string
  }
  defaultImageUrl?: string | null
}

export function OwnerProfileForm({ defaultValues, defaultImageUrl }: OwnerProfileFormProps) {
  const t = useTranslations('Owner.profile')
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImageUrl ?? null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
  })

  const onSubmit = async (data: typeof defaultValues) => {
    setServerError(null)
    setSaved(false)
    const result = await updateOwnerProfile({ ...data, imageFile: selectedFile })
    if (!result?.error) {
      setSaved(true)
      router.refresh()
    } else {
      setServerError(result.error)
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
          {t('success')}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('firstName')}</label>
          <input
            {...register('firstName', { required: 'First name is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-600">{String(errors.firstName.message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('lastName')}</label>
          <input
            {...register('lastName', { required: 'Last name is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-600">{String(errors.lastName.message)}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('city')}</label>
        <input
          {...register('city')}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('bio')}</label>
        <textarea
          {...register('bio')}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('photo')}</label>
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors"
      >
        {isSubmitting ? t('saving') : t('save')}
      </button>
    </form>
  )
}
