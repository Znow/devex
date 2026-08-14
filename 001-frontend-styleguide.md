**001 Frontend Style Guide**

# Overview

This guide defines Angular code style conventions, component architecture, and best practices for the Et-Kontakt-Punkt frontend. It focuses on atomic design methodology and modern Angular patterns.

**External Reference:** [Atomic Design Methodology | Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/chapter-2/)

# Atomic Component Design

## Component Hierarchy (Atoms, Molecules, Organisms)

- Follow an **atomic design** hierarchy to structure UI:

  - **Atoms**: Lowest-level, reusable UI elements with no business logic.

    - Examples: buttons, icons, labels, inputs, help texts, links.

    - Characteristics:

      - No direct service or API calls.

      - Simple `@Input()` / `@Output()` APIs and pure visual behavior.

  - **Molecules**: Small compositions of atoms that implement a focused piece of UI behavior.

    - Examples: form-field wrappers, search bars, theme toggles, footer sections.

    - Characteristics:

      - May contain light UI logic (validation display, state toggling).

      - Still avoid direct domain/business logic and API calls.

  - **Organisms**: Larger, self-contained sections of the interface built from atoms and molecules.

    - Examples: navbar, footer, modals, complex cards or panels.

    - Characteristics:

      - May coordinate multiple molecules and atoms.

      - Should keep domain/business logic thin and delegate to services where possible.

  - **Pages / Layouts**: Route-level containers that compose organisms and connect them to data.

    - Responsible for routing, data loading, and high-level orchestration.

    - Should use services for business logic and pass data down via inputs/outputs.

- Dependency direction:

  - Atoms must **not** depend on molecules, organisms, or pages.

  - Molecules may depend on atoms, but not organisms or pages.

  - Organisms may depend on molecules and atoms, but not pages.

  - Pages depend on all lower layers (organisms, molecules, atoms, services).

- Reuse guidelines:

  - When adding a new UI element, first check whether an existing atom/molecule already fits.

  - Prefer adding new atoms/molecules/organisms to shared locations when they are conceptually reusable across features.

  - Keep feature-specific variants inside the relevant feature folder to avoid polluting global/shared layers.

---

# Angular Code Style Guide

> This guide defines conventions for Angular, TypeScript, RxJS, and project structure in this codebase. When in doubt, prefer readability, consistency, and alignment with Angular’s official style guide.

---

## 1. General Principles

- Prefer clarity over cleverness; optimize for readability and maintainability.

- Be consistent: if you must break a rule, do it consistently and document it.

- Follow Angular, TypeScript, and RxJS official style guides where not overridden here.

- Keep files focused: one public class per file.

---

## 2. Project & Folder Structure

- Group **by feature**, not by type (e.g. `pages`, `components`, `services`, `shared`).

- Within a feature, prefer a structure like:

  - `components/` – presentational pieces

  - `services/` – logic and API integration

  - `models/` or `types/` – interfaces, DTOs, enums

  - `utils/` – pure helpers

- Use clear, descriptive folder names (e.g. `analysis-environment`, `approval`, `admin`).

- Keep public/shared utilities in common locations rather than duplicating code inside features.

---

## 3. Naming Conventions

- **Classes, interfaces, enums**: `PascalCase`

  - Examples: `AdminPageComponent`, `UserDto`, `ApplicationStatus`.

- **Variables, functions, methods, properties**: `camelCase`.

- **Observables**: end with `$`.

  - Examples: `user$`, `isLoading$`, `formValueChanges$`.

- **Components**: suffix with `Component`.

- **Services**: suffix with `Service`.

- **Pipes**: suffix with `Pipe`.

- **Guards/Interceptors/Resolvers**: suffix with `Guard`, `Interceptor`, `Resolver`.

- Prefer explicit, domain-specific names over abbreviations or generic terms (`applicationStatus` instead of `status`, `environmentType` instead of `env`).

---

## 4. TypeScript & Code Structure

- Use strict TypeScript settings and do not circumvent them with `any` unless absolutely necessary.

- Always type **public APIs**:

  - Function parameters

  - Return types

  - Class properties

- Avoid `any`; prefer:

  - Generics (`Observable<User>`)

  - Union types (`'pending' | 'approved' | 'rejected'`)

  - Discriminated unions for complex state.

- Prefer `readonly` for values that should not change.

- Always use access modifiers explicitly (`public`, `private`, `protected`).

- Keep methods short and single-responsibility; extract helpers when they exceed ~20–30 lines.

---

## 5. Standalone Components & Configuration

- Prefer **standalone components** and route-level configuration rather than large NgModules.

- Keep bootstrapping minimal:

  - Use `main.ts` with `bootstrapApplication`.

  - Configure providers in `app.config.ts` via `provideRouter`, `provideHttpClient`, etc.

- Use route-level lazy loading for heavier features with `loadComponent` or `loadChildren`.

---

## 6. Components

- Treat components as **thin, view-focused**:

  - Compose UI elements.

  - Wire inputs and outputs.

  - Delegate business logic to services.

- **Inputs/Outputs**:

  - Use `@Input()` / `@Output()` with clear names (`isDisabled`, `valueChange`).

  - Avoid abbreviations (`val`, `cfg`, etc.) in public APIs.

- **Lifecycle**:

  - Implement only the hooks you actually need.

  - Prefer `ngOnInit` for initialization over heavy constructors.

- **Change detection**:

  - Default to `ChangeDetectionStrategy.OnPush` where feasible.

  - Prefer `async` pipes in templates over manual subscriptions.

---

## 7. Templates (HTML)

- Keep templates **simple and declarative**.

- Prefer moving complex expressions into component methods or pure pipes.

- Use `*ngIf` / `*ngFor` with care:

  - Use `trackBy` for large or frequently updated lists.

- Favor semantic HTML and accessibility:

  - Use correct HTML elements (`button`, `nav`, `main`, `section`, etc.).

  - Provide ARIA attributes only when necessary and correct.

- Internationalization:

  - Avoid hard-coded user-facing text.

  - Use centralized translation keys and services (e.g. from the `i18n` setup).

---

## 8. Styles (SCSS/CSS)

- Prefer **component-scoped styles** over global styles.

- Use a consistent class naming convention (BEM-like or equivalent) and reuse design tokens.

- Keep layout and styling in SCSS, not templates (avoid `style` attributes).

- Use existing theme variables, mixins, and utilities when available rather than hard-coded values.

- Avoid `::ng-deep` except as a last resort; prefer configuration or input APIs.

---

## 9. Services & State Management

- Services own **business logic** and API calls; components coordinate them.

- Keep services stateless where possible; when stateful, document the state clearly.

- For internal state:

  - Keep `Subject` / `BehaviorSubject` **private**.

  - Expose derived `Observable` streams via `asObservable()` or computed streams.

- Do not perform side effects in constructors; use explicit methods or lifecycle hooks.

---

## 10. HTTP & API Integration

- Centralize HTTP calls in typed services or generated API clients.

- Always type responses with shared models/types.

- Use RxJS operators to:

  - Map API shapes to domain models.

  - Handle errors (`catchError`) and retries when appropriate.

- Avoid duplicating REST endpoints across multiple services; compose from shared clients.

---

## 11. RxJS & Async Code

- Prefer `Observable`-based APIs for asynchronous flows.

- Naming:

  - Streams end with `$` (e.g. `user$`, `isLoading$`).

  - Subjects stay private; Expose read-only streams.

- Unsubscription:

  - Prefer `async` pipe in templates.

  - For manual subscriptions, use `takeUntil` patterns or Angular utilities like `DestroyRef` / `takeUntilDestroyed`.

- Avoid nested `subscribe` calls; compose with `switchMap`, `mergeMap`, etc.

---

## 12. Routing & Guards

- Use **feature-level** routing where appropriate.

- Use guards for:

  - Authentication (`AuthGuard`).

  - Authorization (roles/permissions).

  - Protecting unsaved changes (deactivation guards).

- Centralize route path constants or use typed helpers to avoid magic strings.

---

## 13. Forms

- Prefer **reactive forms** for anything non-trivial.

- Build forms in a dedicated method (e.g. `buildForm()`), not inline in the constructor.

- Use built-in validators and custom validator functions for complex rules.

- Keep business rules in services when they become complex, not buried inside validators.

- Use strongly-typed forms where possible.

---

## 14. Pipes

- Use pure pipes for simple formatting logic:

  - Localization, date/number formatting, safe HTML, label lookups, etc.

- Keep pipes stateless and side-effect free.

- Do not put heavy or complex business logic in pipes; use services instead.

---

## 15. Testing

- Write unit tests for:

  - Components with logic (beyond simple binding).

  - Services, guards, and pipes.

- Prefer shallow component tests; mock dependencies where reasonable.

- For end-to-end tests (e.g. Playwright):

  - Test main user flows and critical paths.

  - Keep tests deterministic and independent.

- Use descriptive test names: **scenario – action – expected result**.

---

## 16. Error Handling & Logging

- Wrap risky operations and handle errors explicitly.

- Avoid silently swallowing errors:

  - Log via a centralized logging service.

  - Surface user-friendly messages via UI components/services.

- Differentiate between user-facing and developer-facing errors.

---

## 17. Imports & Modules

- Use configured path aliases (e.g. `@app/...`) instead of deep relative paths where available.

- Import order:

  1. Angular packages (`@angular/...`).

  2. Third-party libraries.

  3. Internal application libraries.

  4. Relative imports (feature-local files).

- Avoid circular dependencies; refactor shared code into dedicated shared modules/areas if needed.

---

## 18. Performance

- Use `ChangeDetectionStrategy.OnPush` for most components.

- Use `trackBy` functions for lists rendered with `*ngFor`.

- Avoid heavy computations in template expressions or getters.

- Cache or memoize expensive computations where necessary, with clear documentation.

---

## 19. Documentation & Comments

- Prefer self-explanatory code and meaningful names over comments.

- Use comments to explain **why**, not **what**:

  - Clarify complex business rules.

  - Link to external specifications or tickets when helpful.

- Keep high-level documentation (e.g. README, architecture notes) updated when making significant changes.

---

## 20. Contribution Notes

- Before opening a PR:

  - Ensure the code follows this guide and existing patterns in the feature.

  - Run relevant tests (unit, integration, or E2E where applicable).

- In reviews:

  - Prefer suggestions aligned with this style guide.

  - Discuss intentional deviations in code review and document them when accepted.

This guide is a living document. When you encounter new patterns or edge cases, propose updates so the whole team can stay aligned.