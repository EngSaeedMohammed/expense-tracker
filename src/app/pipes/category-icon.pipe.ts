import { Pipe, PipeTransform } from '@angular/core';
import { ExpenseCategory } from '../models/expense.model';

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍',
  Bills: '💡',
  Entertainment: '🎬',
  Other: '📦',
};

@Pipe({
  name: 'categoryIcon',
})
export class CategoryIconPipe implements PipeTransform {
  transform(category: ExpenseCategory): string {
    const icon = CATEGORY_ICONS[category] ?? '📦';
    return `${icon} ${category}`;
  }
}
