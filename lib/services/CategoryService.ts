import { STATIC_CATEGORIES } from '../constants/categories'
import { Category } from '../types/entities/category'

export class CategoryService {
  async getCategories(): Promise<Category[]> {
    return STATIC_CATEGORIES
  }
}
