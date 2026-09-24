import { Category } from '../types/entities/category'

// Video categories are fixed in code. The value is stored on each video document
// and used as the i18n key (`categories.<key>`) for the display name.
export const VIDEO_CATEGORIES = [
  'technology',
  'entertainment',
  'education',
  'sports',
  'music',
  'travel',
  'cooking',
  'gaming',
  'lifestyle',
  'business',
  'health',
  'science',
  'news',
  'comedy',
  'art',
  'fashion',
  'automotive',
  'pets',
  'fitness',
  'diy',
  'other',
] as const

export type VideoCategoryKey = (typeof VIDEO_CATEGORIES)[number]

export const DEFAULT_VIDEO_CATEGORY: VideoCategoryKey = 'other'

export const STATIC_CATEGORIES: Category[] = VIDEO_CATEGORIES.map((name, index) => ({
  id: name,
  name,
  description: '',
  icon: '',
  color: '',
  isActive: true,
  order: index,
  createdAt: { seconds: 0, nanoseconds: 0 },
  updatedAt: { seconds: 0, nanoseconds: 0 },
}))
