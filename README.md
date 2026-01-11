# Action-Reaction (AREA)

> **Create an automation platform.**

The goal of this project is to implement a software suite that functions similarly to [IFTTT](https://ifttt.com/) and [Zapier](https://zapier.com/). It allows users to interconnect services (like Gmail, GitHub) by creating **AREAs** (Action-REAction).

An **AREA** consists of:

- **Action:** A trigger (e.g., "A new email is received").
- **REaction:** A consequence (e.g., "Create a GitHub issue").

---

## 🏗 Architecture

The project is organized as a Monorepo and consists of three main components:

1.  **Application Server (Backend):**

- REST API powered by **ElysiaJS**.
- Handles business logic, user management, and the execution of AREA triggers (Hooks).
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
- **Type Safety:** Eden Treaty (End-to-End type safety between Backend, Web, and Mobile)
- **DevOps:** Docker, Docker Compose

---

## 🚀 Features

- **User Management:**
- Registration/Login via Email & Password.
- **Services Integration:**
- OAuth2 authentication for external services (Gmail, GitHub).
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
2. Add your database URL, OAuth Credentials (GitHub, Gmail), and API configurations.
3. **Crucial:** For the mobile app to connect to the backend, define `PUBLIC_BACKEND_API_URL`.

```ini
# Mobile Connection (Use http://0.0.0.0:8080 for emulators, or ngrok for physical devices)
PUBLIC_BACKEND_API_URL=https://your-generated-id.ngrok-free.app
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
- Web runs at: `http://localhost:5173`

**Terminal 2: Mobile (Expo)**

To run the mobile app, you have two options:

**Option A: Emulators (iOS/Android)**
If you are using a computer emulator, `localhost` works fine.

```bash
cd apps/mobile
bun start
```

**Option B: Physical Device (Recommended)**
To run the app on your real phone, your phone needs to access the backend. We use **ngrok** for this.

1. Start ngrok on port 8080:

```bash
ngrok http 8080
```

2. Copy the HTTPS URL provided by ngrok (e.g., `https://xxxx.ngrok-free.app`).
3. Update your **root `.env`**:

```ini
PUBLIC_BACKEND_API_URL="https://xxxx.ngrok-free.app"
```

4. Start the mobile app:

```bash
cd apps/mobile
bun start
```

5. Scan the QR code with Expo Go.

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
            "name": "new_issue",
            "description": "Triggered when a new issue is created in a repository"
          },
          {
            "name": "new_star",
            "description": "Triggered when a repository receives a new star"
          }
        ],
        "reactions": [
          {
            "name": "create_issue",
            "description": "Creates a new issue in a GitHub repository"
          }
        ]
      },
      {
        "name": "gmail",
        "actions": [
          {
            "name": "new_email",
            "description": "Triggered when a new email is received"
          },
          {
            "name": "new_email_with_attachment",
            "description": "Triggered when a new email with attachment is received"
          }
        ],
        "reactions": [
          {
            "name": "send_email",
            "description": "Sends an email via Gmail"
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
│   └── types/      # Shared Types & DTOs
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
