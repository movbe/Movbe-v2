import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Category } from '@/lib/types/entities/category'

import { CategoryService } from '../services/CategoryService'

const CATEGORIES_TIMEOUT_MS = 15000

export const useCategories = () => {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    try {
      setLoading(true)
      setError(null)
      const categoryService = new CategoryService()
      // Firestore can hang indefinitely when its connection is blocked (ad blockers,
      // proxies, antivirus), so fail after a timeout instead of loading forever
      const timeout = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error('Timed out fetching categories')),
          CATEGORIES_TIMEOUT_MS
        )
      })
      const categoriesData = await Promise.race([categoryService.getCategories(), timeout])

      // Agregar traducción a cada categoría usando i18n
      const translatedCategories = categoriesData.map((category: Category) => ({
        ...category,
        displayName: t(`categories.${category.name}`, { defaultValue: category.name }),
      }))

      setCategories(translatedCategories)
    } catch (err) {
      setError(t('common.error'))
      // eslint-disable-next-line no-console
      console.error('Error fetching categories:', err)
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  }
}
