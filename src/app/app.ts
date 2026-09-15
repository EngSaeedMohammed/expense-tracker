import { Component, signal, viewChild } from '@angular/core';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { ExpenseListComponent } from './components/expense-list/expense-list.component';
import { Expense } from './models/expense.model';

@Component({
  selector: 'app-root',
  imports: [ExpenseFormComponent, ExpenseListComponent, ChatbotComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('expense-tracker');
  private readonly expenseForm = viewChild.required(ExpenseFormComponent);

  onEdit(expense: Expense) {
    this.expenseForm().loadExpense(expense);
  }
}