# Research: Daily Task Organizer

**Date**: 2026-02-15
**Feature**: Daily Task Organizer
**Phase**: Phase 0 - Technical Research

## Overview

This document captures technical decisions, best practices, and patterns researched for implementing the Daily Task Organizer as a Vite-based single-page web application using vanilla HTML, CSS, and JavaScript.

---

## 1. Vite Setup for Vanilla JavaScript

### Decision
Use Vite 6.x with minimal configuration, no framework plugins, serving vanilla HTML/CSS/JS.

### Rationale
- **Zero framework overhead**: Vite works perfectly with vanilla JS, no React/Vue needed
- **Fast HMR**: Hot module replacement for rapid development without framework complexity
- **Simple build**: Single `vite build` command produces optimized bundle
- **Modern defaults**: ES modules, minification, tree-shaking out of the box

### Implementation Pattern
```javascript
// vite.config.js (minimal)
export default {
  base: './',  // For relative paths if deploying to subdirectory
  build: {
    outDir: 'dist',
    sourcemap: false  // Disable for production
  }
}
```

### Alternatives Considered
- **Plain HTML with no build tool**: Rejected - no module system, no dev server with HMR
- **Webpack/Parcel**: Rejected - more configuration overhead than Vite for vanilla JS
- **Snowpack**: Rejected - Vite has better ecosystem support and performance

---

## 2. localStorage Best Practices

### Decision
Store tasks and categories as separate JSON-serialized arrays in localStorage keys:
- Key: `supertodo_tasks` → Value: `JSON.stringify([...tasks])`
- Key: `supertodo_categories` → Value: `JSON.stringify([...categories])`

### Rationale
- **Simplicity**: Straightforward read/write operations
- **Atomicity**: Entire collection updated at once, no partial state issues
- **Size appropriate**: 1000 tasks × ~200 bytes = ~200KB, well within 5-10MB localStorage limit
- **Namespace safety**: Prefix `supertodo_` prevents collisions with other apps

### Implementation Pattern
```javascript
// services/storage.js
class StorageService {
  constructor(namespace = 'supertodo') {
    this.namespace = namespace;
  }

  getTasks() {
    const data = localStorage.getItem(`${this.namespace}_tasks`);
    return data ? JSON.parse(data) : [];
  }

  saveTasks(tasks) {
    localStorage.setItem(`${this.namespace}_tasks`, JSON.stringify(tasks));
  }

  getCategories() {
    const data = localStorage.getItem(`${this.namespace}_categories`);
    return data ? JSON.parse(data) : this.getDefaultCategories();
  }

  saveCategories(categories) {
    localStorage.setItem(`${this.namespace}_categories`, JSON.stringify(categories));
  }

  getDefaultCategories() {
    return [
      { id: crypto.randomUUID(), name: 'Work' },
      { id: crypto.randomUUID(), name: 'Personal' },
      { id: crypto.randomUUID(), name: 'Shopping' },
      { id: crypto.randomUUID(), name: 'Health' }
    ];
  }
}
```

### Edge Cases (Deferred to Productionization)
- QuotaExceededError handling (when localStorage is full)
- JSON parse errors (corrupted data)
- Concurrent tab updates (StorageEvent handling)

### Alternatives Considered
- **IndexedDB**: Rejected for prototype - async API adds complexity, overkill for <1MB data
- **Individual task keys**: Rejected - N+1 reads/writes, harder to manage collections
- **sessionStorage**: Rejected - data loss on tab close, not suitable for task persistence

---

## 3. UUID Generation in Browser

### Decision
Use native `crypto.randomUUID()` API for generating task and category IDs.

### Rationale
- **Native support**: Available in all modern browsers (Chrome 92+, Firefox 95+, Safari 15.4+)
- **Zero dependencies**: No need for uuid npm package
- **Cryptographically secure**: Better randomness than Math.random()-based solutions
- **Standard format**: Returns RFC 4122 v4 UUID string

### Implementation Pattern
```javascript
// models/task.js
class Task {
  constructor({ title, description = '', dueDate = null, categoryId = null }) {
    this.id = crypto.randomUUID();  // e.g., "550e8400-e29b-41d4-a716-446655440000"
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;  // ISO 8601 string or null
    this.categoryId = categoryId;  // UUID of category or null
    this.completed = false;
    this.createdAt = new Date().toISOString();
  }
}
```

### Browser Compatibility
- Target browsers (Chrome, Firefox, Safari, Edge latest 2 versions) all support this API
- No polyfill needed

### Alternatives Considered
- **uuid npm package**: Rejected - adds dependency when native API available
- **Timestamp + random suffix**: Rejected - potential collisions, non-standard format
- **Auto-increment IDs**: Rejected - requires coordination across browser tabs

---

## 4. Date Handling and Grouping

### Decision
Use native `Date` API with ISO 8601 strings for storage, group tasks into logical date buckets.

### Rationale
- **Native API sufficient**: No need for date libraries (date-fns, dayjs) for basic date operations
- **ISO 8601 storage**: Standardized, sortable, timezone-aware
- **Logical grouping**: "Today", "Tomorrow", "This Week", "Future", "Past", "Unscheduled"

### Implementation Pattern
```javascript
// ui/dateGroups.js
function groupTasksByDate(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const groups = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    future: [],
    past: [],
    unscheduled: []
  };

  tasks.forEach(task => {
    if (!task.dueDate) {
      groups.unscheduled.push(task);
      return;
    }

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      groups.past.push(task);
    } else if (dueDate.getTime() === today.getTime()) {
      groups.today.push(task);
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      groups.tomorrow.push(task);
    } else if (dueDate < endOfWeek) {
      groups.thisWeek.push(task);
    } else {
      groups.future.push(task);
    }
  });

  return groups;
}
```

### Edge Cases (Deferred to Productionization)
- Timezone handling for users across timezones
- Date rollover at midnight (auto-refresh)
- Invalid date strings (graceful degradation)

### Alternatives Considered
- **date-fns or dayjs**: Rejected for prototype - native Date API sufficient for basic operations
- **Luxon**: Rejected - heavyweight for simple date grouping

---

## 5. DOM Manipulation Patterns

### Decision
Use vanilla JavaScript DOM manipulation with template strings and event delegation.

### Rationale
- **No framework overhead**: Avoid React/Vue/Svelte learning curve and bundle size
- **Direct control**: Explicit DOM updates, easier to debug
- **Event delegation**: Attach listeners to parent elements for better performance
- **Template strings**: Readable HTML-in-JS without JSX compilation

### Implementation Pattern
```javascript
// ui/taskList.js
class TaskListUI {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.setupEventListeners();
  }

  render(tasks) {
    const html = tasks.map(task => `
      <div class="task-item" data-task-id="${task.id}">
        <input type="checkbox"
               class="task-checkbox"
               ${task.completed ? 'checked' : ''}>
        <div class="task-content">
          <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
          ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
          ${task.dueDate ? `<span class="task-date">${this.formatDate(task.dueDate)}</span>` : ''}
        </div>
        <button class="task-delete" aria-label="Delete task">×</button>
      </div>
    `).join('');

    this.container.innerHTML = html;
  }

  setupEventListeners() {
    // Event delegation: single listener for all task interactions
    this.container.addEventListener('click', (e) => {
      const taskItem = e.target.closest('.task-item');
      if (!taskItem) return;

      const taskId = taskItem.dataset.taskId;

      if (e.target.classList.contains('task-checkbox')) {
        this.onTaskToggle?.(taskId);
      } else if (e.target.classList.contains('task-delete')) {
        this.onTaskDelete?.(taskId);
      }
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(isoDate) {
    return new Date(isoDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}
```

### Security Considerations
- **XSS Prevention**: Always escape user input with `textContent` or `escapeHtml()` helper
- **No innerHTML for user data**: Use `textContent` or sanitized template strings

### Alternatives Considered
- **React/Vue/Svelte**: Rejected - adds framework complexity counter to "minimal libraries" requirement
- **jQuery**: Rejected - legacy API, unnecessary in modern browsers
- **Web Components**: Rejected for prototype - added complexity, not needed for simple app

---

## 6. CSS Architecture

### Decision
Use a single flat CSS file with BEM-inspired naming for component scoping.

### Rationale
- **Simplicity**: No CSS preprocessors (Sass/Less) or CSS-in-JS complexity
- **BEM-lite naming**: Readable class names that indicate component relationships
- **CSS Custom Properties**: For theme-able colors and spacing
- **Mobile-first**: Base styles for mobile, media queries for larger screens

### Implementation Pattern
```css
/* src/styles/main.css */
:root {
  --color-primary: #3b82f6;
  --color-danger: #ef4444;
  --color-success: #10b981;
  --color-text: #1f2937;
  --color-border: #e5e7eb;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
}

/* Task list component */
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.task-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
}

.task-item--completed {
  opacity: 0.6;
}

.task-checkbox {
  flex-shrink: 0;
}

.task-content {
  flex: 1;
}

.task-title {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text);
}

.task-description {
  margin: var(--spacing-sm) 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.task-delete {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-danger);
  cursor: pointer;
  font-size: 1.5rem;
}
```

### Alternatives Considered
- **Tailwind CSS**: Rejected - adds build complexity and library dependency
- **CSS Modules**: Rejected - requires build tool configuration, overkill for single-page app
- **Styled Components**: Rejected - requires React/framework, adds runtime overhead

---

## 7. Application Architecture

### Decision
Simple layered architecture: Models → Services → UI

### Rationale
- **Clear separation**: Each layer has a single responsibility
- **No over-engineering**: No dependency injection, no repositories, no abstractions beyond necessary
- **Testable**: Services and models are pure functions/classes, easy to test if needed later

### Layer Responsibilities
1. **Models** (`src/models/`): Plain JavaScript classes representing entities (Task, Category)
2. **Services** (`src/services/`): Business logic and data persistence (StorageService)
3. **UI** (`src/ui/`): DOM rendering and event handling (TaskListUI, TaskFormUI, etc.)
4. **Main** (`src/main.js`): Application initialization and wiring

### Data Flow
```
User Interaction (DOM Event)
  ↓
UI Component Handler
  ↓
Service Method (e.g., storage.saveTasks)
  ↓
localStorage Update
  ↓
UI Re-render
```

### No State Management Library
- Simple in-memory arrays for tasks/categories
- UI components read from services on render
- No Redux, Zustand, or other state management needed for prototype

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Build Tool** | Vite 6.x | Fast HMR, zero framework config, modern defaults |
| **Storage** | localStorage with JSON | Simple, sufficient for prototype scale, no backend needed |
| **IDs** | crypto.randomUUID() | Native browser API, secure, no dependencies |
| **Dates** | Native Date API + ISO 8601 | No date library needed for basic operations |
| **DOM** | Vanilla JS + template strings | No framework, direct control, event delegation |
| **CSS** | Single flat file + BEM-lite | Simple, no preprocessor, custom properties for theming |
| **Architecture** | Models → Services → UI | Clear layers, no over-engineering |

---

## Deferred to Productionization

The following areas require further research/implementation only if the prototype is validated:

1. **Testing Strategy**: Unit tests (Vitest), integration tests, E2E tests (Playwright)
2. **Accessibility**: ARIA labels, keyboard navigation, screen reader testing
3. **Performance Optimization**: Virtual scrolling for 1000+ tasks, debounced localStorage writes
4. **Error Handling**: QuotaExceededError, JSON parse errors, network failures (if sync added)
5. **Data Export/Import**: JSON export, backup/restore functionality
6. **Advanced Features**: Task search, recurring tasks, task dependencies, attachments
7. **Progressive Enhancement**: Service workers for offline capability, PWA manifest

---

**Phase 0 Complete**: All technical unknowns resolved. Ready to proceed to Phase 1 (Design & Contracts).
