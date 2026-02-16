# SuperTodo - Daily Task Organizer

<div align="center">

![SuperTodo Banner](https://img.shields.io/badge/SuperTodo-Daily%20Task%20Organizer-blue?style=for-the-badge)

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=flat-square)](https://supertodo-1771260772.netlify.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-181717?style=flat-square&logo=github)](https://github.com/israelkumar/supertodo)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-83%20Passing-brightgreen?style=flat-square)](tests/)

**A modern, lightweight task manager with smart date grouping, categories, and data backup.**

[Live Demo](https://supertodo-1771260772.netlify.app) • [Features](#features) • [Installation](#installation) • [Documentation](#documentation)

</div>

---

## ✨ Features

### 📋 Task Management
- ✅ **Create & Edit Tasks** - Full CRUD operations with inline editing
- 📅 **Smart Date Grouping** - Automatic organization into 6 date groups:
  - Today
  - Tomorrow
  - This Week
  - Future
  - Past (with overdue indicators)
  - Unscheduled
- ✏️ **Rich Task Details** - Title, description, due date, and category
- ☑️ **Completion Tracking** - Mark tasks complete with visual feedback

### 🏷️ Category Management
- 📂 **Custom Categories** - Create unlimited categories
- 🎨 **Smart Filtering** - Filter tasks by category while maintaining date grouping
- 🔄 **Safe Deletion** - Tasks become uncategorized when category is deleted
- ✅ **Validation** - Prevents duplicate category names (case-insensitive)

### 💾 Data Management
- 📥 **Export Data** - Download all tasks and categories as JSON
- 📤 **Import Data** - Restore from backup with validation
- 🔒 **Local Storage** - All data stored securely in your browser
- 🛡️ **Data Validation** - Import validation prevents corrupted data

### 🎨 User Experience
- 🌙 **Dark Mode** - System preference detection + manual toggle
- ⚡ **Keyboard Shortcuts**:
  - `Ctrl+N` - Focus on new task
  - `Escape` - Clear forms
  - `Ctrl+/` - Toggle category manager
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- ✅ **Confirmation Dialogs** - Safety prompts for destructive actions
- 🎯 **Success Notifications** - Visual feedback for all actions

### 🔒 Safety & Reliability
- ⚠️ **Confirmation Dialogs** - Prevents accidental deletions
- 🛡️ **Error Recovery** - Automatic corrupted data cleanup
- 💪 **Quota Handling** - Graceful handling of storage limits
- ✨ **XSS Protection** - All user input sanitized

---

## 🚀 Quick Start

### Try it Live
Visit **[https://supertodo-1771260772.netlify.app](https://supertodo-1771260772.netlify.app)** to try it instantly!

### Run Locally

```bash
# Clone the repository
git clone https://github.com/israelkumar/supertodo.git
cd supertodo

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Development

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🏗️ Tech Stack

- **Framework**: Vanilla JavaScript ES6+ (no framework overhead!)
- **Build Tool**: [Vite 6.x](https://vitejs.dev/) - Lightning-fast HMR
- **Testing**: [Vitest](https://vitest.dev/) - 83 unit tests, 100% pass rate
- **Styling**: Pure CSS with CSS Custom Properties
- **Storage**: Browser localStorage API
- **Deployment**: [Netlify](https://www.netlify.com/) with CDN

### Bundle Size
- **CSS**: 18.50 KB (3.17 KB gzipped)
- **JavaScript**: 30.17 KB (7.48 KB gzipped)
- **Total**: ~49 KB (~11 KB gzipped) ⚡

---

## 📊 Project Stats

- **Lines of Code**: ~5,000+
- **Test Coverage**: 83 unit tests (Models, Services, UI)
- **Files**: 33 source files
- **Components**: 6 UI components
- **Build Time**: <300ms
- **Load Time**: <1 second on 3G

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage
```

**Test Suite:**
- ✅ Task Model (23 tests)
- ✅ Category Model (23 tests)
- ✅ Storage Service (37 tests)
- ✅ Error handling & edge cases
- ✅ Data validation

---

## 📖 Documentation

### User Guides
- [Deployment Guide](DEPLOYMENT.md) - Deploy to 5+ platforms
- [Feature Specification](specs/001-daily-task-organizer/spec.md) - User stories & requirements
- [Implementation Plan](specs/001-daily-task-organizer/plan.md) - Technical architecture
- [Data Model](specs/001-daily-task-organizer/data-model.md) - Entities & relationships

### Developer Docs
- [Task Breakdown](specs/001-daily-task-organizer/tasks.md) - Complete task list (79 tasks)
- [Validation Report](specs/001-daily-task-organizer/VALIDATION-REPORT.md) - Phase 7 validation
- [API Contracts](specs/001-daily-task-organizer/contracts/storage-service.md) - Storage API

---

## 🗂️ Project Structure

```
supertodo/
├── src/
│   ├── models/           # Data models (Task, Category)
│   ├── services/         # Business logic (StorageService)
│   ├── ui/              # UI components (6 components)
│   ├── styles/          # CSS styling
│   └── main.js          # Application entry point
├── tests/               # Unit tests (Vitest)
│   ├── task.test.js
│   ├── category.test.js
│   ├── storage.test.js
│   └── setup.js
├── specs/               # Documentation & specifications
├── dist/                # Production build output
└── DEPLOYMENT.md        # Deployment guide
```

---

## 🎯 Roadmap

### Phase 8 - Tier 1 ✅ (Complete)
- [x] Error handling & resilience
- [x] Comprehensive test suite (83 tests)
- [x] Task editing functionality
- [x] Data export/import
- [x] Confirmation dialogs
- [x] Production optimization
- [x] Netlify deployment

### Phase 8 - Tier 2 (Standard Features)
- [ ] Cross-browser testing (Firefox, Safari, Edge)
- [ ] Performance optimization (1000+ tasks)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Search functionality
- [ ] Keyboard navigation improvements

### Phase 8 - Tier 3 (Complete)
- [ ] Undo/redo functionality
- [ ] Drag-and-drop reordering
- [ ] Recurring tasks
- [ ] Task dependencies
- [ ] PWA support (offline mode)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Run tests (`npm test`)
4. Commit your changes (`git commit -m 'feat: add amazing feature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

---

## 🐛 Known Issues

- Storage limited to ~5-10MB (localStorage limit)
- No sync between devices (local storage only)
- Browser must allow localStorage (no private/incognito mode)

See [issues](https://github.com/israelkumar/supertodo/issues) for known bugs and feature requests.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Tested with [Vitest](https://vitest.dev/)
- Deployed on [Netlify](https://www.netlify.com/)
- Icons: Unicode emoji (no dependencies!)
- Fast prototyping methodology by [SpecKit](https://github.com/anthropics/claude-code)

---

## 📞 Contact

**Project Maintainer**: [israelkumar](https://github.com/israelkumar)

**Live Demo**: [https://supertodo-1771260772.netlify.app](https://supertodo-1771260772.netlify.app)

**Report Issues**: [GitHub Issues](https://github.com/israelkumar/supertodo/issues)

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ and ☕ by israelkumar

</div>
