# 💰 Expense AI – Smart Personal Finance Tracker

Expense AI is a modern full-stack web application that helps users manage their personal finances efficiently. It enables users to track expenses, set budgets, monitor savings goals, analyze spending habits, and gain AI-powered financial insights through an intuitive dashboard.

## 🚀 Features

* 🔐 Secure User Authentication (JWT)
* 💵 Add, Edit & Delete Expenses
* 📊 Interactive Analytics Dashboard
* 🎯 Savings Goals Management
* 💳 Budget Planning & Tracking
* 🔄 Recurring Expense Management
* 🧾 Receipt Upload & OCR Support
* 🤖 AI-Powered Expense Analysis
* 🌙 Dark & Light Theme
* 📱 Fully Responsive Design
* 🔍 Search, Filter & Pagination
* ⚡ Fast and Modern User Experience

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Axios
* Context API

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Multer
* OCR Integration
* AI Service Integration

---

## 📂 Project Structure

```
Expense-calculator/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── utils/
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/Souravpandere/Expense-calculator.git
cd Expense-calculator
```

---

### Install Frontend Dependencies

```bash
cd client
npm install
```

---

### Install Backend Dependencies

```bash
cd ../server
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the **server** directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_api_key
```

Create a `.env` file inside the **client** directory.

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ Running the Application

### Backend

```bash
cd server
npm run dev
```

### Frontend

```bash
cd client
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 📸 Screenshots

You can add screenshots here after deployment.

```
Home Page
Dashboard
Analytics
Budget
Goals
Receipt Scanner
```

---

## 📌 Future Improvements

* AI Financial Advisor
* Monthly Expense Forecasting
* Email Notifications
* PDF & Excel Report Export
* Multi-Currency Support
* Mobile Application
* Bank Account Integration
* Voice-Based Expense Entry

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Sourav Pandere**

* GitHub: https://github.com/Souravpandere

---

⭐ If you found this project helpful, consider giving it a **star** on GitHub!
