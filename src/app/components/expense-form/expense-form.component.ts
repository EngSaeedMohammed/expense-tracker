import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EXPENSE_CATEGORIES, Expense, ExpensePayload } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';
import { notFutureDate } from '../../validators/date.validators';

@Component({
  selector: 'app-expense-form',
  imports: [ReactiveFormsModule],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.css',
})
export class ExpenseFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly expenseService = inject(ExpenseService);
  readonly categories = EXPENSE_CATEGORIES;

  readonly form = this.fb.nonNullable.group({
    amount: this.fb.nonNullable.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    category: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    date: this.fb.nonNullable.control('', {
      validators: [Validators.required, notFutureDate()],
    }),
    note: this.fb.nonNullable.control('', { validators: [Validators.maxLength(200)] }),
  });

  ngOnInit() {
    this.expenseService.loadExpenses();
  }

  get amount() {
    return this.form.controls.amount;
  }

  get category() {
    return this.form.controls.category;
  }

  get date() {
    return this.form.controls.date;
  }

  get note() {
    return this.form.controls.note;
  }

  get isEditing() {
    return this.expenseService.editingId() !== null;
  }

  loadExpense(expense: Expense) {
    this.expenseService.startEdit(expense.id);
    this.form.patchValue({
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      note: expense.note ?? '',
    });
    this.form.markAsUntouched();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: ExpensePayload = {
      amount: Number(value.amount),
      category: value.category as ExpensePayload['category'],
      date: value.date,
      note: value.note.trim() || undefined,
    };

    const editingId = this.expenseService.editingId();
    const request$ =
      editingId === null
        ? this.expenseService.addExpense(payload)
        : this.expenseService.updateExpense(editingId, payload);

    request$.subscribe({
      next: () => this.resetForm(),
    });
  }

  cancelEdit() {
    this.expenseService.cancelEdit();
    this.resetForm();
  }

  private resetForm() {
    this.form.reset({
      amount: null,
      category: '',
      date: '',
      note: '',
    });
  }
}
