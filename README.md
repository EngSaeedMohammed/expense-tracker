# Expense Tracker (Angular 22)

A small expense tracker with CRUD against `json-server`, reactive forms, a custom pipe, a custom attribute directive, filtering/sorting, and an n8n chatbot.

## Run locally

Use two terminals.

```bash
npm install
npm run api
```

```bash
npm start
```

Then open http://localhost:4200.

- API: http://localhost:3000/expenses
- App: http://localhost:4200

You can also install `json-server` globally (`npm install -g json-server`) and run `json-server --watch db.json --port 3000`.

## Features

- Reactive form to add or edit an expense (`amount`, `category`, `date`, optional `note`)
- GET / POST / PUT / DELETE through `ExpenseService`
- Filter by category, search notes, sort by date or amount
- Running total of the currently visible list
- `categoryIcon` pipe
- `appHighlightOverBudget` directive (threshold can be changed in the UI)
- Chatbot that POSTs to an n8n webhook and falls back to a local helper if n8n is down

## Chatbot / n8n

Set the webhook URL in `src/environments/environment.development.ts`:

```ts
aiAgentWebhookUrl: 'http://localhost:5678/webhook/expense-chat'
```

Import `n8n/expense-chat-workflow.json` into n8n, activate the workflow, then send questions such as:

- What is my total spending?
- How much did I spend by category?
- Which expense was the largest?
- How much did I spend on Food?

Request body:

```json
{
  "message": "How much did I spend on food this month?",
  "sessionId": "unique-session-id",
  "expenses": []
}
```

Expected response:

```json
{
  "reply": "You spent 245.50 on food this month."
}
```
