# AyosGadget | Neural Repair Engine

Isang modernong platform para sa pag-aayos ng gadgets gamit ang AI at iFixit database.

## 🚀 Free Deployment Guide (Firebase App Hosting)

Para ma-deploy ito nang libre, sundin ang mga hakbang na ito:

### 1. Ihanda ang Git sa Terminal
```bash
git init
git add .
git commit -m "Initial commit - Neural Engine Stable"
```

### 2. I-connect sa GitHub
1. Gumawa ng bagong repository sa GitHub.
2. I-paste ang URL ng repo mo rito:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 3. I-setup ang Firebase App Hosting
1. Pumunta sa [Firebase Console](https://console.firebase.google.com/).
2. Buksan ang iyong project: **ayosgadg3t**.
3. Sa menu, i-click ang **App Hosting**.
4. I-click ang **Get Started** at i-connect ang iyong GitHub repository.
5. Sa **Environment Variables** section sa Firebase Console, i-set ang `GEMINI_API_KEY` (kunin ito sa [Google AI Studio](https://aistudio.google.com/)).

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **AI**: Genkit + Gemini 2.5 Flash
- **Database/Auth**: Firebase (Firestore & Auth)
- **UI**: Tailwind CSS + ShadCN UI
- **Data Source**: iFixit API v2.0
