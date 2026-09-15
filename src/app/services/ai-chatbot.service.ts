import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, of, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { Expense, ExpenseCategory } from '../models/expense.model';

export interface ChatbotRequest {
  message: string;
  sessionId: string;
  expenses: Expense[];
}

export interface ChatbotResponse {
  reply: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiChatbotService {
  private readonly http = inject(HttpClient);
  private readonly webhookUrl = environment.aiAgentWebhookUrl;
  readonly sessionId = crypto.randomUUID();

  readonly messages = signal<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Ask about your spending: totals, categories, largest expense, or a date range.',
    },
  ]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  sendMessage(message: string, expenses: Expense[]) {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    this.messages.update((current) => [...current, { role: 'user', text: trimmed }]);
    this.loading.set(true);
    this.error.set(null);

    const body: ChatbotRequest = {
      message: trimmed,
      sessionId: this.sessionId,
      expenses,
    };

    this.http
      .post<ChatbotResponse>(this.webhookUrl, body)
      .pipe(
        timeout(15000),
        map((response) => response.reply?.trim() || 'The AI Agent returned an empty reply.'),
        catchError(() =>
          of(
            `${answerFromExpenses(trimmed, expenses)}\n\n(n8n webhook was unavailable, so this answer was generated locally from your current expenses.)`,
          ),
        ),
      )
      .subscribe({
        next: (reply) => {
          this.messages.update((current) => [...current, { role: 'assistant', text: reply }]);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('The AI Agent is unavailable. Please try again later.');
          this.loading.set(false);
        },
      });
  }
}

function answerFromExpenses(message: string, expenses: Expense[]): string {
  if (!expenses.length) {
    return 'There are no expenses in the tracker yet, so I cannot calculate spending.';
  }

  const text = message.toLowerCase();
  const total = sum(expenses);
  const categories: ExpenseCategory[] = [
    'Food',
    'Transport',
    'Shopping',
    'Bills',
    'Entertainment',
    'Other',
  ];
  const matchedCategory = categories.find((category) =>
    text.includes(category.toLowerCase()),
  );

  if (text.includes('largest') || text.includes('biggest') || text.includes('highest')) {
    const largest = [...expenses].sort((a, b) => b.amount - a.amount)[0];
    return `The largest expense is ${money(largest.amount)} on ${largest.date} (${largest.category}${largest.note ? `, ${largest.note}` : ''}).`;
  }

  if (matchedCategory && (text.includes('how much') || text.includes('spent') || text.includes('spend') || text.includes('total') || text.includes('show'))) {
    const filtered = expenses.filter((expense) => expense.category === matchedCategory);
    if (!filtered.length) {
      return `There are no ${matchedCategory} expenses in the current data.`;
    }
    return `${matchedCategory} spending is ${money(sum(filtered))} across ${filtered.length} expense(s).`;
  }

  if (text.includes('by category') || text.includes('each category') || text.includes('breakdown')) {
    const lines = categories
      .map((category) => {
        const items = expenses.filter((expense) => expense.category === category);
        return items.length ? `${category}: ${money(sum(items))}` : null;
      })
      .filter(Boolean);
    return `Spending by category:\n${lines.join('\n')}`;
  }

  const range = extractDateRange(text, expenses);
  if (range) {
    const filtered = expenses.filter((expense) => expense.date >= range.from && expense.date <= range.to);
    if (!filtered.length) {
      return `I found no expenses between ${range.from} and ${range.to}.`;
    }
    return `From ${range.from} to ${range.to} you spent ${money(sum(filtered))} across ${filtered.length} expense(s).`;
  }

  if (text.includes('recent') || text.includes('latest') || text.includes('this week')) {
    const recent = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    const lines = recent.map(
      (expense) => `${expense.date}: ${money(expense.amount)} (${expense.category})`,
    );
    return `Your most recent expenses:\n${lines.join('\n')}\nVisible total: ${money(total)}.`;
  }

  if (text.includes('total') || text.includes('how much') || text.includes('spend')) {
    return `Your total spending is ${money(total)} across ${expenses.length} expense(s).`;
  }

  return 'I can answer totals, spending by category, the largest expense, recent spending, and date-range questions from the expenses you currently have. I will not invent values I cannot calculate.';
}

function extractDateRange(text: string, expenses: Expense[]): { from: string; to: string } | null {
  const dates = text.match(/\d{4}-\d{2}-\d{2}/g);
  if (dates?.length === 2) {
    return { from: dates[0], to: dates[1] };
  }
  if (dates?.length === 1) {
    return { from: dates[0], to: dates[0] };
  }
  if (text.includes('this month')) {
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const to = expenses.map((expense) => expense.date).sort().at(-1) ?? from;
    return { from, to };
  }
  return null;
}

function sum(expenses: Expense[]): number {
  return expenses.reduce((acc, expense) => acc + expense.amount, 0);
}

function money(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
