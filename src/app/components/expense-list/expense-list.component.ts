import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, output, signal } from '@angular/core';
import { HighlightOverBudgetDirective } from '../../directives/highlight-over-budget.directive';
import { EXPENSE_CATEGORIES, Expense, ExpenseCategory } from '../../models/expense.model';
import { CategoryIconPipe } from '../../pipes/category-icon.pipe';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-expense-list',
  imports: [CurrencyPipe, CategoryIconPipe, HighlightOverBudgetDirective],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css',
})
export class ExpenseListComponent {
  readonly expenseService = inject(ExpenseService);
  readonly editExpense = output<Expense>();

  readonly categories = EXPENSE_CATEGORIES;
  readonly category = signal<'All' | ExpenseCategory>('All');
  readonly search = signal('');
  readonly sortBy = signal<'date' | 'amount'>('date');
  readonly sortDir = signal<'asc' | 'desc'>('desc');
  readonly threshold = signal(100);

  readonly filteredExpenses = computed(() => {
    let list = this.expenseService.expenses();
    const category = this.category();
    const search = this.search().trim().toLowerCase();
    const sortBy = this.sortBy();
    const sortDir = this.sortDir();

    if (category !== 'All') {
      list = list.filter((expense) => expense.category === category);
    }

    if (search) {
      list = list.filter((expense) => (expense.note ?? '').toLowerCase().includes(search));
    }

    return [...list].sort((a, b) => {
      const left = sortBy === 'amount' ? a.amount : a.date;
      const right = sortBy === 'amount' ? b.amount : b.date;
      const result = left < right ? -1 : left > right ? 1 : 0;
      return sortDir === 'asc' ? result : -result;
    });
  });

  readonly visibleTotal = computed(() =>
    this.filteredExpenses().reduce((sum, expense) => sum + expense.amount, 0),
  );

  readonly categoryTotals = computed(() =>
    this.categories.map((category) => ({
      category,
      total: this.expenseService
        .expenses()
        .filter((expense) => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0),
    })),
  );

  onCategoryChange(value: string) {
    this.category.set(value as 'All' | ExpenseCategory);
  }

  onSortByChange(value: string) {
    this.sortBy.set(value as 'date' | 'amount');
  }

  onSortDirChange(value: string) {
    this.sortDir.set(value as 'asc' | 'desc');
  }

  onThresholdChange(value: string) {
    const parsed = Number(value);
    this.threshold.set(Number.isFinite(parsed) ? parsed : 100);
  }

  deleteExpense(expense: Expense) {
    if (!confirm(`Delete this ${expense.category} expense of ${expense.amount}?`)) {
      return;
    }

    this.expenseService.deleteExpense(expense.id).subscribe();
  }
}
