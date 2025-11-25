# Action-Reaction (AREA)

> **Create an automation platform.**

The goal of this project is to implement a software suite that functions similarly to [IFTTT](https://ifttt.com/) and [Zapier](https://zapier.com/). It allows users to interconnect services (like Google, GitHub, Outlook) by creating **AREAs** (Action-REAction).

An **AREA** consists of:

- **Action:** A trigger (e.g., "A new email is received").
- **REaction:** A consequence (e.g., "Post a message to Discord").

---

## 🏗 Architecture

The project is organized as a Monorepo and consists of three main components:

1.  **Application Server (Backend):**
    - REST API powered by **ElysiaJS**.
    - Handles business logic, user management (OAuth2), and the execution of AREA triggers (Hooks).
    - Exposes `about.json` for service discovery.
2.  **Web Client:**
    - Frontend powered by **SvelteKit**.
    - Allows users to register, login, and configure their widgets and areas.
3.  **Mobile Client:**
    - Native app powered by **React Native (Expo)**.
    - Provides the same functionality as the web client optimized for mobile devices.

### Tech Stack

- **Runtime/Manager:** Bun
- **Backend:** ElysiaJS, Prisma (PostgreSQL)
- **Frontend:** SvelteKit, TailwindCSS
- **Mobile:** Expo (React Native)
- **DevOps:** Docker, Docker Compose

---

## 🚀 Features

- **User Management:**
  - Registration/Login via Email & Password.
  - OAuth2 Integration (Google, GitHub, Discord, etc.).
- **Services:**
  - Subscription to external services.
  - Management of API tokens.
- **Automation:**
  - Configuration of **Actions** (Triggers).
  - Configuration of **REactions** (Outputs).
  - Automatic polling and execution via Hooks.
- **Accessibility:**
  - Fully accessible Web and Mobile interfaces.

---

## 🛠️ Installation & Setup

### Prerequisites

- [Bun](https://bun.com/) (v1.0.0+)
- [Docker](https://www.docker.com/) & Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/Area-Organization/main-area.git
cd area
```

### 2. Install Dependencies

Since this is a **Bun workspace**, installing at the root installs for all packages.

```bash
bun install
```

### 3. Environment Variables

Copy the example environment files and configure your keys (Database URL, OAuth Client IDs, etc.).

```bash
cp apps/backend/.env.example .env
cp packages/shared/.env.example .env
# Edit .env with your specific configuration
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
- Web runs at: `http://localhost:5173` (Vite dev port)

**Terminal 2: Mobile (Expo)**

```bash
cd main-area/apps/mobile
bun run start
```

- Scan the QR code with Expo Go.

---

## 🐳 Docker (Production Build)

Per the project requirements, the entire suite can be orchestrated via Docker Compose.

**Build and Run:**

```bash
docker-compose up --build
```

**Services:**

- **Server:** Accessible at `http://localhost:8080`
- **Web Client:** Accessible at `http://localhost:8081`
- **Mobile Build:** The `client_mobile` container generates an APK. You can download it via the web client at `http://localhost:8081/client.apk`.

---

## 📡 API Documentation (about.json)

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
          {
            "name": "new_commit",
            "description": "A new commit is pushed to the repository"
          }
        ],
        "reactions": [
          {
            "name": "create_issue",
            "description": "Creates a new issue on a repository"
          }
        ]
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
│   └── shared/     # Prisma Client & Shared Types
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
