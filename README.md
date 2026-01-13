# Action-Reaction (AREA)

> **Create an automation platform.**

[![Documentation](https://img.shields.io/badge/Documentation-Read-blue)](./docs/README.md)

The goal of this project is to implement a software suite that functions similarly to [IFTTT](https://ifttt.com/) and [Zapier](https://zapier.com/). It allows users to interconnect services (like Gmail, GitHub, Spotify) by creating **AREAs** (Action-REAction).

An **AREA** consists of:

- **Action:** A trigger (e.g., "A new email is received").
- **REaction:** A consequence (e.g., "Create a GitHub issue").

---

## 🏗 Architecture

The project is organized as a Monorepo managed by **Bun Workspaces** and consists of three main components:

1.  **Application Server (Backend):**
    - REST API powered by **ElysiaJS**.
    - Handles business logic, user management, and the execution of AREA triggers (Hooks).
    - Exposes `about.json` for service discovery.

2.  **Web Client:**
    - Frontend powered by **SvelteKit (Svelte 5)**.
    - Allows users to register, login, and configure their widgets and areas via a Node-based editor.

3.  **Mobile Client:**
    - Native app powered by **React Native (Expo SDK 54)**.
    - Provides the same functionality as the web client, optimized for mobile devices with native animations.

### Tech Stack

- **Runtime/Manager:** Bun
- **Backend:** ElysiaJS, Prisma (PostgreSQL), TypeBox
- **Frontend:** SvelteKit (Svelte 5), TailwindCSS v4, Shadcn-Svelte
- **Mobile:** Expo (React Native 0.81), NativeWind
- **Type Safety:** Eden Treaty (End-to-End type safety between Backend, Web, and Mobile)
- **DevOps:** Docker, Docker Compose

---

## 🚀 Features

- **User Management:**
  - Registration/Login via Email & Password.
- **Services Integration:**
  - OAuth2 authentication (Gmail, GitHub, Spotify).
  - API Key management (Discord, Trello).
- **Automation:**
  - **Trigger/Action:** Automatic polling via `HookManager`.
  - **Reaction:** Asynchronous execution.
  - **Interpolation:** Dynamic variable injection (e.g., use the Issue Title in a Discord message).
- **Accessibility:**
  - Fully accessible Web and Mobile interfaces.

---

## 🛠️ Installation & Setup

### Prerequisites

- [Bun](https://bun.sh/) (v1.1+)
- [Docker](https://www.docker.com/) & Docker Compose
- (Optional) [ngrok](https://ngrok.com/) for mobile testing on physical devices.

### 1. Clone the repository

```bash
git clone https://github.com/Area-Organization/main-area.git
cd main-area
```

### 2. Install Dependencies

Since this is a **Bun workspace**, installing at the root installs for all packages.

```bash
bun install
```

### 3. Environment Variables

We use a centralized `.env` file at the **root** of the monorepo.

1. Rename `.env.example` to `.env` at the root.
2. Add your database URL, OAuth Credentials (GitHub, Google, Spotify), and API configurations (Trello).
3. **Crucial:** For the mobile app to connect to the backend, define `PUBLIC_BACKEND_API_URL`.

```ini
# Mobile Connection (Use http://0.0.0.0:8080 for emulators, or ngrok for physical devices)
PUBLIC_BACKEND_API_URL=https://your-generated-id.ngrok-free.app
FRONTEND_URL=http://localhost:8081
```

### 4. Database Setup

Start the local database and push the schema:

```bash
bun run db:push
```

---

## 💻 Development Usage

To run the project locally for development:

**Terminal 1: Infrastructure (Backend + Web)**

```bash
bun run dev
```

- Server runs at: `http://localhost:8080`
- Web runs at: `http://localhost:8081`

**Terminal 2: Mobile (Expo)**

To run the mobile app, you have two options:

**Option A: Emulators (iOS/Android)**
If you are using a computer emulator, `localhost` works fine.

```bash
cd apps/mobile
bun start --android # or --ios
```

**Option B: Physical Device (Recommended)**
To run the app on your real phone, your phone needs to access the backend. We use **ngrok** for this.

1. Start ngrok on port 8080:
   ```bash
   ngrok http 8080
   ```
2. Update `PUBLIC_BACKEND_API_URL` in your **root `.env`** with the ngrok HTTPS URL.
3. Start the mobile app with `bun run start` and scan the QR code.

---

## 🐳 Docker (Production Build)

Per the project requirements, the entire suite can be orchestrated via Docker Compose.

**1. Pre-build Mobile APK (Optional)**
If you want the mobile APK to be served by the container:

```bash
bun run --filter mobile build:preview
# Renames the output to client.apk automatically handled by script if configured,
# otherwise rename manually to apps/mobile/client.apk
```

**2. Build and Run**

```bash
docker-compose up --build
```

**Services:**

- **Server:** Accessible at `http://localhost:8080`
- **Web Client:** Accessible at `http://localhost:8081`
- **Mobile Download:** The APK is accessible via a shared volume (implementation dependent).

---

## 📡 API Discovery (about.json)

The server exposes a strictly formatted `about.json` at the root to describe available services.

**GET** `http://localhost:8080/about.json`

**Response Example:**

```json
{
  "client": {
    "host": "127.0.0.1"
  },
  "server": {
    "current_time": 1709210000,
    "services": [
      {
        "name": "github",
        "actions": [
          { "name": "new_issue", "description": "..." },
          { "name": "new_star", "description": "..." }
        ],
        "reactions": [{ "name": "create_issue", "description": "..." }]
      },
      {
        "name": "discord",
        "actions": [{ "name": "on_message", "description": "..." }],
        "reactions": [{ "name": "send_message", "description": "..." }]
      }
    ]
  }
}
```

---

## 📂 Project Structure

```txt
area-monorepo/
├── apps/
│   ├── backend/    # ElysiaJS API Server
│   ├── mobile/     # Expo React Native App
│   └── web/        # SvelteKit Web App
├── packages/
│   └── types/      # Shared Types & DTOs (Eden Treaty)
├── docs/           # Docusaurus Documentation
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 🤝 Contributing

We welcome contributions! Please read our **[HOWTOCONTRIBUTE.md](./HOWTOCONTRIBUTE.md)** for details on our code of conduct, and the process for submitting pull requests.

---

## 👥 Authors

| Name                   | GitHub                                               | Role         |
| :--------------------- | :--------------------------------------------------- | :----------- |
| **Thibaud Wimmer**     | [@BonesFR](https://github.com/BonesFR)               | Frontend Web |
| **Mateo Cabrera**      | [@novaepitech](https://github.com/novaepitech)       | Mobile App   |
| **Alexandre Bacha**    | [@Aurelien744](https://github.com/Aurelien744)       | Backend      |
| **Aurélien Lamberger** | [@bachaalexandre](https://github.com/bachaalexandre) | Backend      |
