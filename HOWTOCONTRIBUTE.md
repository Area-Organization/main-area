# HOW TO CONTRIBUTE

Thank you for your interest in contributing to the AREA project! This guide will help you get started, understand the architecture, and extend the platform with new features, services, actions, or reactions.

---

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/main-area.git
   cd main-area
   ```
3. **Install dependencies** (from the root):
   ```bash
   bun install
   ```
4. **Copy and configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials and URLs
   ```
5. **Set up the database**:
   ```bash
   bun run db:push
   ```
6. **Run the project locally**:
   ```bash
   bun run dev
   # In another terminal for mobile:
   cd apps/mobile
   bun start --android # or --ios
   ```

---

## Project Structure

- `apps/backend/` — ElysiaJS API server (business logic, services, database)
- `apps/web/` — SvelteKit web client
- `apps/mobile/` — Expo React Native mobile app
- `packages/types/` — Shared TypeScript types
- `docs/` — Docusaurus documentation

---

## Adding a New Service

To add a new service (e.g., Slack, Notion):

### 1. Backend

- Create a folder: `apps/backend/src/services/<service-name>/`
- Add:
  - `index.ts` — Service definition (see `IService` interface)
  - `actions/` — Action files (implement `IAction`)
  - `reactions/` — Reaction files (implement `IReaction`)
- Register your service in [`apps/backend/src/services/registry.ts`](apps/backend/src/services/ServiceRegistry.ts):

  ```typescript
  import { myService } from "./myservice";
  // ...
  this.register(myService);
  ```

- Your service will be auto-exposed in `/about.json`.

### 2. Web Client

- Add your service's icon in [`apps/web/src/lib/components/ServiceIcon.svelte`](apps/web/src/lib/components/ServiceIcon.svelte):

  ```svelte
  {:else if saneName == "myservice"}
    <svg>...</svg>
  ```

### 3. Mobile Client

- Add your service's brand color in [`apps/mobile/app/(tabs)/services.tsx`](<apps/mobile/app/(tabs)/services.tsx>):

  ```typescript
  const BRAND_COLORS: Record<string, string> = {
    discord: "#5865F2",
    myservice: "#FF5733"
  };
  ```

---

## Adding an Action or Reaction

1. **Backend**:
   - Add a new file in the appropriate service's `actions/` or `reactions/` folder.
   - Implement the `IAction` or `IReaction` interface.
   - Export and register it in the service's `index.ts`.

2. **Types**:
   - If new parameters or variables are introduced, update the shared types in [`packages/types/`](packages/types/).

3. **Frontend**:
   - The web and mobile clients dynamically fetch available actions/reactions from `/about.json`. No manual UI update is needed unless you want to customize the display.

---

## Testing

- **Backend**:
  - Add or update tests in `apps/backend/tests/`.
  - Run tests with:
    ```bash
    cd apps/backend
    bun test
    ```

- **Web**:
  - Add tests in `apps/web/tests/`.
  - Run with:
    ```bash
    cd apps/web
    bun run test
    ```

- **Mobile**:
  - Add tests in `apps/mobile/tests/`.
  - Run with:
    ```bash
    cd apps/mobile
    bun run test
    ```

---

## Code Style & Guidelines

- Follow the existing code style (Prettier config is provided).
- Write clear, readable code and comments.
- Keep changes focused and avoid mixing unrelated changes.
- Update documentation if you change or add features.

---

## Submitting Changes

1. **Create a new branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit your changes** with clear messages.
3. **Push to your fork** and open a Pull Request on GitHub.
4. **Describe your changes** and reference any related issues.
5. **Ensure all tests pass** and respond to feedback.

---

## Reporting Issues

- Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) for bugs.
- Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) for suggestions.
- Provide as much detail as possible.

---

## Questions?

Open an issue or start a discussion on GitHub if you need help.

Thank you for contributing to AREA!
