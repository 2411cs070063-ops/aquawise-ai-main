# 💧 AquaWise AI

A smart water management web application built with React, TypeScript, Vite, and Supabase.

---

## 🚀 Live Demo

> Deployed via GitHub Pages — link will appear here after first deploy.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [React 18](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [shadcn/ui](https://ui.shadcn.com/) | UI components |
| [Supabase](https://supabase.com/) | Backend & database |
| [React Router](https://reactrouter.com/) | Client-side routing |
| [Leaflet](https://leafletjs.com/) | Interactive maps |
| [Recharts](https://recharts.org/) | Data visualization |

---

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher

### 1. Clone the repository

```sh
git clone https://github.com/<YOUR_USERNAME>/aquawise-ai.git
cd aquawise-ai
```

### 2. Set up environment variables

```sh
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
```

> Get these from your [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API.

### 3. Install dependencies

```sh
npm install
```

### 4. Start the development server

```sh
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

---

## 🚢 Deployment (GitHub Pages)

This project auto-deploys to **GitHub Pages** via GitHub Actions on every push to `main`.

### One-time setup:

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_URL`
3. Go to **Settings** → **Pages** → set Source to **"GitHub Actions"**

After that, every push to `main` will automatically build and deploy your app! ✅

---

## 📁 Project Structure

```
aquawise-ai/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions CI/CD
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/             # React context providers
│   ├── data/                # Static data / mock data
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # Supabase integration
│   ├── lib/                 # Utility functions
│   ├── pages/               # Page components
│   └── main.tsx             # App entry point
├── supabase/
│   └── migrations/          # Database migrations
├── .env.example             # Environment variable template
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
