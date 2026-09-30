import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { STATIC_CATEGORIES } from '@/lib/constants/categories'
import { Category } from '@/lib/types/entities/category'

export const useCategories = () => {
  const { t } = useTranslation()

  const categories = useMemo<Category[]>(
    () =>
      STATIC_CATEGORIES.map(category => ({
        ...category,
        displayName: t(`categories.${category.name}`, { defaultValue: category.name }),
      })),
    [t]
  )

  return {
    categories,
    loading: false,
  }
}
