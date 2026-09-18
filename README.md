# AudioMail Agent 🎧📬
### AI-Powered Email Audio Digest & Smart Mobile Inbox

> **AudioMail Agent** is an autonomous executive inbox assistant that ingests emails, processes them with high-performance LLM reasoning via **NVIDIA NIM (`openai/gpt-oss-20b`)** and **Google Gemini**, extracts prioritized action items, and generates natural voice-ready audio briefings you can listen to on headphones.

---

## 🌟 Features

- **NVIDIA NIM Reasoning**: Powered by `openai/gpt-oss-20b` (21B MoE architecture) for deep email summarization, key takeaway extraction, sentiment classification, and action item detection.
- **Hands-Free Audio Digest**: Conversational audio briefings with multi-speed playback (1x, 1.25x, 1.5x), track scrubbing, play-all continuous briefing deck, and Web Speech synthesis.
- **Live Gmail Integration**: Secure Google Workspace OAuth flow to poll and summarize unread emails in real time.
- **Local / Test Email Simulation**: Built-in sample threads and custom email composer (`+ Add Email`) to test AI processing immediately without needing live credentials.
- **Autonomous Polling Agent**: Configurable background intervals (15m, 30m, 1h, 2h, 4h) with next-sync countdown and status telemetry.
- **Full-Stack Express + Vite Architecture**: Fully proxies API keys securely on the server (`/api/*`) without exposing credentials to the browser.

---

## 🛠️ Prerequisites

Make sure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher (`v20+` LTS recommended)
  - Verify with: `node -v`
- **npm** (`v9+`) or **pnpm** or **bun**
  - Verify with: `npm -v`
- **Git**
  - Verify with: `git -v`
- **VS Code** (or any code editor of your choice)

---

## 🚀 Getting Started in VS Code

### 1. Open the Project in VS Code

If you downloaded the ZIP or cloned the repository, navigate to the folder and open it:

```bash
cd audiomail-agent
code .
```

### 2. Install Dependencies

In the VS Code integrated terminal (`Ctrl + \`` or `Cmd + \``):

```bash
npm install
```

### 3. Configure Environment Variables

Create your local `.env` file from the provided `.env.example`:

```bash
cp .env.example .env
```

Open `.env` in VS Code and fill in the values:

```env
# GEMINI_API_KEY: Optional/Required for Gemini models
GEMINI_API_KEY="your-gemini-api-key"

# NVIDIA_NIM_API_KEY: Key from build.nvidia.com (a working development key is bundled by default)
NVIDIA_NIM_API_KEY="your-nvidia-nim-key"
NVIDIA_NIM_BASE_URL="https://integrate.api.nvidia.com/v1"

# Local dev server URL
APP_URL="http://localhost:3000"
```

> **Note:** A fallback development NVIDIA NIM API key is pre-configured in `server.ts` so you can start analyzing emails right out of the box.

### 4. Run the Development Server

Start the full-stack server (Express backend + Vite frontend middleware):

```bash
npm run dev
```

The terminal will display:
```
Server running on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📦 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express server + Vite dev middleware on port 3000 with hot reload |
| `npm run build` | Compiles frontend assets with Vite and bundles `server.ts` into `dist/server.cjs` |
| `npm start` | Runs the compiled production server (`node dist/server.cjs`) |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run preview` | Previews the production Vite build |
| `npm run clean` | Cleans up the `dist` folder |

---

## 🧭 Project Architecture

```
├── .env.example              # Environment variable documentation
├── firebase-applet-config.json # Firebase client configuration
├── index.html                # HTML entry point with metadata
├── package.json              # Project scripts and dependencies
├── server.ts                 # Express backend: NVIDIA NIM & Gemini proxies, Vite middleware
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration with Tailwind CSS v4
├── public/                   # Static assets
└── src/
    ├── main.tsx              # React entry point
    ├── App.tsx               # Main mobile-first inbox dashboard & audio state
    ├── index.css             # Tailwind CSS styles
    ├── types.ts              # TypeScript interfaces for emails, status, settings
    ├── components/
    │   ├── AddEmailModal.tsx       # Custom test email submission dialog
    │   ├── AgentSettingsModal.tsx  # Polling interval, model selection, voice speed
    │   ├── AudioPlayerBar.tsx      # Sticky audio player with scrub bar & speed toggles
    │   ├── DashboardStats.tsx      # Executive briefing deck, play-all, health stats
    │   ├── EmailCard.tsx           # Email list card with AI badge, tags, & quick listen
    │   ├── EmailDetailModal.tsx    # Modal showing full email + AI summary + actions
    │   ├── GoogleSignInButton.tsx  # Google Workspace sign-in component
    │   └── OAuthHelpModal.tsx      # Google OAuth Error 403 troubleshooting helper
    ├── services/
    │   ├── firebaseAuth.ts   # Firebase Google OAuth popup handler
    │   └── gmailClient.ts    # Gmail REST API client (messages, list, get, batch)
    └── utils/
        └── audioPlayer.ts    # Web Speech synthesis engine with voice selection & pitch control
```

---

## 🔑 Google Workspace OAuth Setup & Troubleshooting

### Understanding Google Error 403 ("App Not Verified")
If you click **Connect Gmail** and receive:
```
Access blocked: gen-lang-client-0243169433.firebaseapp.com has not completed the Google verification process
Error 403: access_denied
```

This occurs because Google Cloud OAuth requires apps in **Testing** mode to pre-register tester email addresses.

#### To Resolve:
1. **Option A (Instant)**: Sign in using the project owner Google account: `erenuzumaki850@gmail.com`.
2. **Option B (Add your email)**:
   - Visit [Google Cloud Console > OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent?project=gen-lang-client-0243169433).
   - Under **Test Users**, click **+ ADD USERS**.
   - Add your Gmail address (e.g. `joyboyluffy2019@gmail.com`) and save.
3. **Option C (Test without OAuth)**: Click **+ Add Email** in the app to paste any custom email and run the full NVIDIA NIM AI analysis and voice briefing immediately.

---

## 📤 Pushing Changes to GitHub

The Git repository is already initialized and your initial commit is created locally on branch `main`.

### Push to your GitHub repository:

1. Create a new, empty repository on [GitHub](https://github.com/new) (e.g. `audiomail-agent`). Do **not** initialize it with a README or `.gitignore`.
2. In VS Code terminal, run:

```bash
# Add your GitHub repository as remote origin
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# Verify remote
git remote -v

# Push the main branch
git push -u origin main
```

*(If using the Google AI Studio Web UI, you can also export directly to GitHub at any time using the **Settings > Export to GitHub** menu item).*

---

## 🧩 Recommended VS Code Extensions

For the best developer experience, install these extensions in VS Code:
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **Prettier - Code formatter** (`esbenp.prettier-vscode`)
- **TypeScript and JavaScript Language Features** (built into VS Code)
- **Thunder Client** or **Postman** (for testing `/api/email/summarize`)

---

## 📄 License

MIT License. Open source and free for development and testing.
