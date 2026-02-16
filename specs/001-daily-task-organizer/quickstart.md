# Quickstart Guide: Daily Task Organizer

**Date**: 2026-02-15
**Feature**: Daily Task Organizer
**Target Audience**: Developers setting up and running the application

## Overview

This guide walks you through setting up, running, and developing the Daily Task Organizer application - a single-page web app built with Vite and vanilla JavaScript for organizing daily tasks by date and category.

---

## Prerequisites

### Required Software

- **Node.js**: Version 18.x or 20.x (latest LTS recommended)
  - Download: https://nodejs.org/
  - Verify: `node --version`

- **npm**: Version 9.x or higher (comes with Node.js)
  - Verify: `npm --version`

- **Modern Web Browser**: One of the following (latest 2 versions):
  - Chrome 120+
  - Firefox 121+
  - Safari 17+
  - Edge 120+

### Optional Tools

- **Git**: For version control
- **VS Code**: Recommended editor with extensions:
  - ESLint
  - Prettier
  - Live Server (for quick previews)

---

## Project Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd supertodo

# Switch to the feature branch
git checkout 001-daily-task-organizer
```

### 2. Install Dependencies

```bash
# Install Vite and minimal dependencies
npm install
```

**Expected Dependencies** (from `package.json`):
```json
{
  "name": "supertodo",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^6.0.0"
  }
}
```

---

## Running the Application

### Development Mode

Start the Vite development server with hot module replacement (HMR):

```bash
npm run dev
```

**Expected Output**:
```
VITE v6.0.0  ready in 100 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Access the App**:
- Open your browser to `http://localhost:5173/`
- Changes to source files automatically refresh the browser

### Production Build

Build an optimized version for deployment:

```bash
npm run build
```

**Output**:
- Built files in `dist/` directory
- Minified JavaScript and CSS
- Optimized for production

**Preview Production Build**:
```bash
npm run preview
```
- Serves the `dist/` folder at `http://localhost:4173/`

---

## Project Structure

```
supertodo/
├── index.html              # Main HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration (minimal)
├── src/
│   ├── main.js             # Application entry point
│   ├── styles/
│   │   └── main.css        # Application styles
│   ├── models/
│   │   ├── task.js         # Task entity class
│   │   └── category.js     # Category entity class
│   ├── services/
│   │   └── storage.js      # localStorage wrapper service
│   └── ui/
│       ├── taskList.js     # Task list rendering and interaction
│       ├── taskForm.js     # Task creation/edit form
│       ├── categoryFilter.js # Category filter UI
│       └── dateGroups.js   # Date-based grouping logic
└── dist/                   # Production build output (generated)
```

---

## Key Files Explained

### `index.html`
Main HTML file loaded by the browser. Contains:
- App container `<div id="app">`
- Script tag loading `src/main.js` as a module

### `src/main.js`
Application entry point. Responsibilities:
- Initialize StorageService
- Set up UI components (TaskListUI, TaskFormUI, CategoryFilterUI)
- Wire up event handlers
- Render initial view

### `src/models/task.js`
Task entity class with validation. Example:
```javascript
class Task {
  constructor({ title, description = '', dueDate = null, categoryId = null }) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.categoryId = categoryId;
    this.completed = false;
    this.createdAt = new Date().toISOString();
  }

  validate() {
    // VR-001, VR-002: Title validation
    if (!this.title || this.title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }
    if (this.title.length > 200) {
      throw new Error('Task title must be 200 characters or less');
    }
    // ... more validation
  }
}
```

### `src/services/storage.js`
localStorage abstraction. See `contracts/storage-service.md` for full API documentation.

Example usage:
```javascript
import StorageService from './services/storage.js';

const storage = new StorageService();

// Create task
const task = storage.createTask({
  title: 'Buy groceries',
  dueDate: '2026-02-15',
  categoryId: '...'
});

// Get all tasks
const tasks = storage.getTasks();

// Group tasks by date
const groups = storage.getTasksGroupedByDate();
```

### `src/ui/taskList.js`
Renders task list and handles interactions. Uses vanilla DOM manipulation with event delegation.

### `src/styles/main.css`
Application styles using CSS custom properties for theming. BEM-inspired naming convention.

---

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

### 2. Make Changes

Edit files in `src/` directory. Changes are automatically reflected in the browser via HMR (Hot Module Replacement).

### 3. View in Browser

Open `http://localhost:5173/` and interact with the application.

### 4. Inspect localStorage

Use browser DevTools to inspect stored data:
1. Open DevTools (F12 or Cmd+Opt+I)
2. Navigate to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Select **Local Storage** → `http://localhost:5173`
4. View keys: `supertodo_tasks`, `supertodo_categories`

### 5. Clear Data (if needed)

To reset the application state:

**Option 1: Browser DevTools**
- Application → Local Storage → Right-click → Clear

**Option 2: Console Command**
```javascript
localStorage.clear();
location.reload();
```

---

## Common Development Tasks

### Add a New UI Component

1. Create file in `src/ui/` directory (e.g., `src/ui/newComponent.js`)
2. Export a class or functions from the file
3. Import and initialize in `src/main.js`

Example:
```javascript
// src/ui/newComponent.js
export class NewComponent {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
  }

  render(data) {
    this.container.innerHTML = `<div>${data}</div>`;
  }
}

// src/main.js
import { NewComponent } from './ui/newComponent.js';

const component = new NewComponent('#app');
component.render('Hello World');
```

### Add a New Model

1. Create file in `src/models/` directory (e.g., `src/models/tag.js`)
2. Define class with constructor and validation
3. Update `src/services/storage.js` to persist new entity

### Modify Styles

Edit `src/styles/main.css`. Changes are instantly reflected via HMR.

**CSS Custom Properties**:
```css
:root {
  --color-primary: #3b82f6;
  --color-danger: #ef4444;
  --spacing-md: 1rem;
}

/* Use in components */
.button-primary {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
}
```

---

## Testing the Application

### Manual Testing Checklist (Prototype Phase)

**P1: Create and View Tasks**
- [ ] Create task with title only
- [ ] Create task with title and description
- [ ] View list of all created tasks
- [ ] Task appears in list after creation

**P2: Organize Tasks by Date**
- [ ] Assign today's date to a task
- [ ] Assign tomorrow's date to a task
- [ ] Assign future date (7+ days) to a task
- [ ] Create task without date (unscheduled)
- [ ] Verify tasks appear in correct date groups (Today, Tomorrow, Future, Unscheduled)
- [ ] Past date tasks appear in "Past" group

**P3: Categorize Tasks**
- [ ] View default categories (Work, Personal, Shopping, Health)
- [ ] Create custom category
- [ ] Assign category to task
- [ ] Filter tasks by category
- [ ] View uncategorized tasks

**Edge Cases**
- [ ] Create task with empty title (should show error)
- [ ] Create task with 201-character title (should show error)
- [ ] Delete category with tasks (tasks become uncategorized)
- [ ] Mark task as complete/incomplete
- [ ] Reload page (data persists)

**Browser Compatibility**
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari (if on macOS)
- [ ] Test in Edge

---

## Debugging Tips

### Console Logging

Add `console.log()` statements to trace data flow:

```javascript
// In src/services/storage.js
getTasks() {
  const data = localStorage.getItem('supertodo_tasks');
  const tasks = data ? JSON.parse(data) : [];
  console.log('getTasks:', tasks.length, 'tasks loaded');
  return tasks;
}
```

### Inspect localStorage

Use browser console:
```javascript
// View all tasks
JSON.parse(localStorage.getItem('supertodo_tasks'));

// View all categories
JSON.parse(localStorage.getItem('supertodo_categories'));

// Clear all data
localStorage.clear();
```

### Vite DevTools

Press `h + Enter` in terminal while dev server is running to see available commands:
- `r`: Restart server
- `u`: Show server URL
- `o`: Open in browser
- `c`: Clear console
- `q`: Quit

### Browser DevTools

- **Elements tab**: Inspect DOM structure and styles
- **Console tab**: View errors, warnings, and console.log output
- **Network tab**: Monitor resource loading (though minimal for this app)
- **Application tab**: Inspect localStorage, check storage quota

---

## Troubleshooting

### Issue: Port 5173 already in use

**Solution**: Kill existing Vite process or use different port
```bash
# Option 1: Kill existing process
# (Find and kill process on port 5173)

# Option 2: Use different port
npm run dev -- --port 5174
```

### Issue: Changes not reflecting in browser

**Solution**:
1. Hard refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Restart Vite dev server

### Issue: "Cannot find module" error

**Solution**:
1. Verify import path is correct (case-sensitive on some systems)
2. Ensure file extension `.js` is included in imports
3. Check that file exists in specified location

### Issue: localStorage data corrupted

**Symptoms**: App crashes on load, JSON parse errors in console

**Solution**:
```javascript
// Clear corrupted data
localStorage.removeItem('supertodo_tasks');
localStorage.removeItem('supertodo_categories');
location.reload();
```

### Issue: Vite not installed

**Symptoms**: `npm run dev` fails with "vite: command not found"

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Performance Notes

### Prototype Performance Targets

- **Task creation**: Appears in list within 2 seconds
- **Page load**: Renders within 1 second for <50 tasks
- **localStorage operations**: Negligible delay (<5ms)

### Known Limitations (Deferred to Production)

- No virtual scrolling (may lag with 1000+ tasks)
- No search functionality
- No data export/import
- No cross-tab synchronization
- No offline service worker

---

## Next Steps

After validating the prototype:

1. **Gather User Feedback**: Use validation criteria from `plan.md`
2. **Run `/speckit.tasks`**: Generate implementation tasks
3. **Implement Features**: Follow P1 → P2 → P3 priority order
4. **Test Thoroughly**: Manual testing per checklist above
5. **Demo to Stakeholder**: Validate against success criteria
6. **Decide**: Proceed to productionization, pivot, or abandon

---

## Additional Resources

- **Vite Documentation**: https://vitejs.dev/
- **localStorage API**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **UUID API**: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
- **Feature Specification**: `specs/001-daily-task-organizer/spec.md`
- **Implementation Plan**: `specs/001-daily-task-organizer/plan.md`
- **Data Model**: `specs/001-daily-task-organizer/data-model.md`
- **Storage Contract**: `specs/001-daily-task-organizer/contracts/storage-service.md`

---

**Version**: 1.0.0 | **Status**: Prototype | **Last Updated**: 2026-02-15
