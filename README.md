# ExpenseTracker
# Expense Tracker (Angular 22)
This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.7.
A small expense tracker with CRUD against `json-server`, reactive forms, a custom pipe, a custom attribute directive, filtering/sorting, and an n8n chatbot.
## Development server
## Run locally
To start a local development server, run:
Use two terminals.
```bash
ng serve
npm install
npm run api
```
Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.
## Code scaffolding
Angular CLI includes powerful code scaffolding tools. To generate a new component, run:
```bash
ng generate component component-name
npm start
```
For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:
Then open http://localhost:4200.
```bash
ng generate --help
```
- API: http://localhost:3000/expenses
- App: http://localhost:4200
## Building
You can also install `json-server` globally (`npm install -g json-server`) and run `json-server --watch db.json --port 3000`.
To build the project run:
## Features
```bash
ng build
```
- Reactive form to add or edit an expense (`amount`, `category`, `date`, optional `note`)
- GET / POST / PUT / DELETE through `ExpenseService`
- Filter by category, search notes, sort by date or amount
- Running total of the currently visible list
- `categoryIcon` pipe
- `appHighlightOverBudget` directive (threshold can be changed in the UI)
- Chatbot that POSTs to an n8n webhook and falls back to a local helper if n8n is down
This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.
## Chatbot / n8n
## Running unit tests
Set the webhook URL in `src/environments/environment.development.ts`:
To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:
```bash
ng test
```ts
aiAgentWebhookUrl: 'http://localhost:5678/webhook/expense-chat'
```
## Running end-to-end tests
Import `n8n/expense-chat-workflow.json` into n8n, activate the workflow, then send questions such as:
For end-to-end (e2e) testing, run:
- What is my total spending?
- How much did I spend by category?
- Which expense was the largest?
- How much did I spend on Food?
```bash
ng e2e
Request body:
```json
{
  "message": "How much did I spend on food this month?",
  "sessionId": "unique-session-id",
  "expenses": []
}
```
Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.
Expected response:
## Additional Resources
For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
```json
{
  "reply": "You spent 245.50 on food this month."
}
```