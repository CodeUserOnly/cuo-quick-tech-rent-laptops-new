# 🖥️ Quick Tech Rent – Laptop Rental Platform

Quick Tech Rent is a full-featured laptop rental web application with **Authentication**, **Shopping Cart**, **Checkout**, **User Profile**, **role-based Admin Inventory Dashboard** and **more** — powered by **React + Supabase**.

---

## 🚀 Live Demo

🔗 https://quick-tech-rent-001.netlify.app/

---

## ✅ Major Features

### 👥 User Side
- User Sign Up / Login with Supabase Auth
- Browse laptops with filters & categories
- Add to cart + Smooth Shopping Cart experience
- Checkout page with order summary
- Personalized User Dashboard with active rentals
- Support & Help page
- Fully responsive UI

### 🛠️ Admin Side
- Admin Sign Up / Login (separate credentials)
- Admin Dashboard for inventory control
- Add / Edit / Delete laptops
- Database updates in real-time

---

## ⭐ Tech Stack & Tools Used

<p align="left"> <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" /> <img src="https://img.shields.io/badge/Language-JavaScript-yellow?style=for-the-badge&logo=javascript" /> <img src="https://img.shields.io/badge/Backend-Supabase-brightgreen?style=for-the-badge&logo=supabase" /> <img src="https://img.shields.io/badge/Database-PostgreSQL-316192?style=for-the-badge&logo=postgresql" /> <img src="https://img.shields.io/badge/Hosting-Netlify-00c7b7?style=for-the-badge&logo=netlify" /> <img src="https://img.shields.io/badge/Version%20Control-GitHub-black?style=for-the-badge&logo=github" /> <img src="https://img.shields.io/badge/UI-Bootstrap-purple?style=for-the-badge&logo=bootstrap" /> </p>

---

## 📂 Project Folder Structure

```bash

git-quick-tech-rent-laptops/
├── node_modules/
├── public/
│   ├── index.html
│   ├── manifest.json
├── src/
│   ├── components/
│   │   ├── DeviceCard.js
│   │   ├── ErrorBoundary.js
│   │   ├── FilterSection.js
│   │   ├── Footer.js
│   │   ├── Header.js
│   ├── pages/
│   │   ├── AboutPage.js
│   │   ├── AdminLogin.js
│   │   ├── AdminPanel.js
│   │   ├── AdminSignup.js
│   │   ├── BrowseDevice.js
│   │   ├── CheckoutPage.js
│   │   ├── Homepage.js
│   │   ├── ProductPage.js
│   │   ├── ShoppingCart.js
│   │   ├── SupportPage.js
│   │   ├── UserDashboard.js
│   │   ├── UserLogin.js
│   │   ├── UserSignup.js
│   ├── services/
│   │   ├── supabase/
│   │   │   ├── devicesService.js
│   │   │   ├── index.js
│   │   │   ├── ordersService.js
│   │   │   ├── usersService.js
│   ├── supabase/
│   │   ├── client.js
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── index.css
│   ├── index.js
│   ├── reportWebVitals.js
│   ├── setupTests.js
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── README.md

```
---

## 🛠️ Tech Stack

| Category | Technology |
|---------|------------|
| Frontend | React, JavaScript, Bootstrap |
| Backend & Auth | Supabase (PostgreSQL + APIs) |
| Routing | React Router |
| Deployment | Netlify |
| Version Control | GitHub |

---

## ⚙️ Local Setup Instructions

```bash
# 1️⃣ Clone repo
git clone https://github.com/CodeUserOnly/cuo-quick-tech-rent-laptops-alpha.git

cd cuo-quick-tech-rent-laptops-alpha

# 2️⃣ Install dependencies
npm install

# 3️⃣ Create .env file
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# 4️⃣ Run project
npm run dev
✅ The app will run on: http://localhost:3000/
```

---

## 📌 Roadmap (Upcoming Features)

- Payment Gateway Integration (Razorpay/Stripe)
- Admin Order Tracking System
- Email Notifications (Password reset + confirmations)
- Multi-device rental support
- User Profile management

---

## 🤝 Contributing

Pull Requests are welcome.
Feel free to open issues for suggestions or bugs.

---

## 📄 License

MIT License © 2025 CodeUserOnly

---

## 👤 Author

CodeUserOnly — Passionate Web Developer
