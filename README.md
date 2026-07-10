# 🎓 ClassTrack

An AI-powered classroom observation and coaching platform that enables observers to record classroom sessions, analyze learner engagement, and generate personalized coaching insights using **Google Gemini AI**.

🌐 **Live Demo:** https://classtrack-eight.vercel.app/

👨‍💻 **Author:** Fahad Rahman

🔗 **LinkedIn:** https://www.linkedin.com/in/fahadrahmaan/

---

## 📖 Overview

ClassTrack is a classroom observation platform designed to support instructional coaching. Observers can create observation sessions, monitor classroom activities using structured observation windows, and provide trainers with actionable feedback.

The platform also integrates **Google Gemini AI** to generate personalized coaching insights based on classroom observations, helping trainers reflect on their teaching practices and improve learner engagement.

---

## ✨ Features

- 👨‍🏫 Trainer and Observer workflows
- 📝 Create and manage classroom observation sessions
- ⏱️ Timed classroom observation windows
- 📊 ICAP-based learner engagement tracking
- 📈 Interactive engagement analytics and visualizations
- 🤖 AI-powered coaching insights using Google Gemini
- 💾 Automatic session persistence using Local Storage
- 📱 Responsive design for desktop and tablet devices

---

## 🤖 AI Coaching

ClassTrack integrates the **Google Gemini API** to generate structured coaching feedback after each classroom observation.

The AI analyzes:

- Observation timeline
- Classroom interactions
- Learner engagement
- Session format
- Topic information

It generates feedback in three sections:

- **Overall Observation**
- **Positive Highlight**
- **Suggestion for Next Session**

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Vercel Serverless Functions

### AI

- Google Gemini API
- Google GenAI SDK

### Development

- Git
- GitHub
- Vercel

---

## 📂 Project Structure

```text
ClassTrack
│
├── api/                  # Vercel Serverless Functions
├── public/
├── src/
│   ├── components/
│   ├── screens/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/fahadrahmaan/classtrack.git
cd classtrack
```

### Install dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file in the project root.

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Generate an API key from **Google AI Studio**.

### Run the project

```bash
npm run dev
```

---

## 🌐 Deployment

The application is deployed on **Vercel**.

Frontend:
- React + Vite

Backend:
- Vercel Serverless Functions

AI:
- Google Gemini API

---

## 🔄 Workflow

1. Observer starts a classroom observation.
2. Teaching and learner activities are recorded using observation windows.
3. Session data is stored locally.
4. Analytics summarize learner engagement.
5. Google Gemini generates personalized coaching insights for the trainer.

---

## 🚧 Future Improvements

- User authentication
- Cloud database integration
- PDF coaching reports
- Historical trend analysis
- Multi-school support
- Export observation reports

---

## 📸 Screenshots

> Add screenshots here after deployment.

Recommended screenshots:

- Login Screen
- Observer Dashboard
- Observation Screen
- Analytics Dashboard
- AI Coach Insight

---

## 🙌 Acknowledgements

- React
- Vite
- Tailwind CSS
- Google Gemini API
- Vercel

---

## 📬 Contact

**Fahad Rahman**

🔗 LinkedIn: https://www.linkedin.com/in/fahadrahmaan/

🌐 GitHub: https://github.com/fahadrahmaan

---

⭐ If you found this project interesting, consider giving it a star!
