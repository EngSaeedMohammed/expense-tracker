import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiChatbotService } from '../../services/ai-chatbot.service';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-chatbot',
  imports: [FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
})
export class ChatbotComponent {
  private readonly chatbot = inject(AiChatbotService);
  private readonly expenses = inject(ExpenseService);

  readonly messages = this.chatbot.messages;
  readonly loading = this.chatbot.loading;
  readonly error = this.chatbot.error;
  draft = '';

  send() {
    const message = this.draft.trim();
    if (!message || this.loading()) {
      return;
    }

    this.chatbot.sendMessage(message, this.expenses.expenses());
    this.draft = '';
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }
}
