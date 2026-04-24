# AyosGadget | Neural Repair Engine

Isang modernong platform para sa pag-aayos ng gadgets gamit ang AI at iFixit database.

## 🚀 Free Deployment Guide (Vercel)

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

### 3. I-setup ang Vercel
1. Pumunta sa [Vercel](https://vercel.com/).
2. I-click ang **Add New...** -> **Project**.
3. I-import ang iyong GitHub repository.
4. Sa **Environment Variables** section, i-set ang `GEMINI_API_KEY` (kunin ito sa [Google AI Studio](https://aistudio.google.com/)).
5. I-click ang **Deploy**.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **AI**: Genkit + Gemini 2.5 Flash
- **Database/Auth**: Firebase (Firestore & Auth)
- **UI**: Tailwind CSS + ShadCN UI
- **Data Source**: iFixit API v2.0
