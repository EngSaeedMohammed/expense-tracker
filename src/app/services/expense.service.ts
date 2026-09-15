import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Expense, ExpensePayload } from '../models/expense.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.expensesApiUrl;

  readonly expenses = signal<Expense[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);

  loadExpenses() {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<Expense[]>(this.apiUrl)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (expenses) => this.expenses.set(expenses.map(normalizeExpense)),
        error: () =>
          this.error.set(
            'Could not load expenses. Make sure json-server is running on http://localhost:3000.',
          ),
      });
  }

  addExpense(payload: ExpensePayload) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<Expense>(this.apiUrl, payload).pipe(
      tap(() => this.loadExpenses()),
      catchError((err) => {
        this.error.set('Could not add the expense. Please try again.');
        this.loading.set(false);
        return throwError(() => err);
      }),
    );
  }

  updateExpense(id: number, payload: ExpensePayload) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<Expense>(`${this.apiUrl}/${id}`, { ...payload, id }).pipe(
      tap(() => {
        this.editingId.set(null);
        this.loadExpenses();
      }),
      catchError((err) => {
        this.error.set('Could not update the expense. Please try again.');
        this.loading.set(false);
        return throwError(() => err);
      }),
    );
  }

  deleteExpense(id: number) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        if (this.editingId() === id) {
          this.editingId.set(null);
        }
        this.loadExpenses();
      }),
      catchError((err) => {
        this.error.set('Could not delete the expense. Please try again.');
        this.loading.set(false);
        return throwError(() => err);
      }),
    );
  }

  startEdit(id: number) {
    this.editingId.set(id);
  }

  cancelEdit() {
    this.editingId.set(null);
  }
}

function normalizeExpense(expense: Expense): Expense {
  return {
    ...expense,
    id: Number(expense.id),
    amount: Number(expense.amount),
  };
}
