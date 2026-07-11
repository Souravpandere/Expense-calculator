# Expense AI

A full-stack, AI-powered personal expense tracker: log expenses, get instant AI
category predictions, track budgets with alerts, view analytics, set savings
goals, automate recurring bills, and scan receipts with OCR.

**Stack:** React + Vite + Tailwind (frontend, with dark mode) · Node.js + Express
+ MongoDB (backend) · JWT + bcrypt auth · Google Gemini for AI categorization
and insights (with a keyword-based offline fallback so it works with no API key)
· Tesseract.js for receipt OCR · CSV/Excel export.

## Project Structure
```
expense-ai/
├── client/     # React + Vite + Tailwind frontend
└── server/     # Node.js + Express backend
```

## 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense-ai
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
AI_PROVIDER=gemini
CLIENT_URL=http://localhost:5173
BASE_CURRENCY=INR
```

- Requires a running MongoDB instance — local `mongod`, or a free MongoDB Atlas
  cluster (paste the connection string into `MONGO_URI`).
- **`GEMINI_API_KEY` is optional.** Without it (or if the API call fails), the
  backend automatically falls back to a keyword-based categorizer (e.g. "Uber"
  → Travel, "Pizza Hut" → Food, "Netflix" → Entertainment) so the app is fully
  functional out of the box. Get a free key at https://aistudio.google.com/app/apikey
  for smarter, more general categorization.
- **Multi-currency** uses static approximate exchange rates by default. For
  live rates, get a free key at https://www.exchangerate-api.com and set
  `EXCHANGE_RATE_API_KEY` in `.env`.

Run the server:
```bash
npm run dev     # with nodemon
# or
npm start
```
Server runs at `http://localhost:5000`. Health check: `GET /api/health`.

## 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```
App runs at `http://localhost:5173`.

(Optional) create `client/.env` if your API isn't on the default URL:
```
VITE_API_URL=http://localhost:5000/api
```

## 3. Using the App
1. Register an account.
2. **Add Expense** — type a description like "Uber Ride" and click **Analyze**
   to see the AI-predicted category before saving. Or upload a receipt photo
   to auto-fill amount/description via OCR.
3. **Dashboard** — totals, remaining budget, AI insights, and recent transactions.
4. **History** — search, sort, filter (by month/category/amount/payment method),
   paginate, edit, delete, and export to CSV/Excel.
5. **Analytics** — pie/bar/line charts of this month's spending.
6. **Budget** — set per-category limits; see live progress bars and over-budget
   alerts.
7. **Savings Goals** — create a goal (e.g. "Laptop ₹80,000") and contribute
   toward it over time.
8. **Recurring** — set up subscriptions/bills; they're auto-added as real
   expenses on their due date (checked daily + on server startup).
9. Toggle dark mode from the top-right of the dashboard.

## API Routes

**Auth:** `POST /api/register` · `POST /api/login` · `GET /api/profile` · `PUT /api/profile`

**Expenses:** `POST /api/expenses/analyze` · `GET/POST /api/expenses` · `PUT/DELETE /api/expenses/:id` · `GET /api/expenses/export?format=csv|excel`

**Budget:** `GET/PUT /api/budget`

**Analytics:** `GET /api/analytics` · `GET /api/monthly-summary` · `GET /api/ai-insights`

**Goals:** `GET/POST /api/goals` · `PUT/DELETE /api/goals/:id` · `PUT /api/goals/:id/contribute`

**Recurring:** `GET/POST /api/recurring` · `PUT/DELETE /api/recurring/:id` · `POST /api/recurring/process`

**Receipts:** `POST /api/receipts/scan` (multipart image upload, OCR)

## Notes & Honest Limitations
- **OCR accuracy varies** — Tesseract.js does client-independent text recognition
  on the server, but receipt layouts vary widely; treat extracted fields as a
  starting point to review, not ground truth.
- **Multi-currency** static rates are approximate snapshots, not live — for
  real accuracy, set `EXCHANGE_RATE_API_KEY`.
- **Recurring expenses** are processed via `node-cron` (daily at 1am) plus once
  on server startup — fine for local hosting or an always-on server; on
  serverless/free-tier hosts that spin down, trigger `POST /api/recurring/process`
  manually or via an external cron ping if entries aren't appearing on schedule.
- Uploaded receipt images are deleted from disk immediately after OCR — only
  the extracted data is used, not the image itself.
