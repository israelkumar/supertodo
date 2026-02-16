/**
 * SuperTodo - Daily Task Organizer
 * Main application entry point
 */

import { StorageService } from './services/storage.js';
import { TaskFormUI } from './ui/taskForm.js';
import { DateGroupsUI } from './ui/dateGroupsUI.js';
import { CategoryFilterUI } from './ui/categoryFilter.js';
import { CategoryManagerUI } from './ui/categoryManager.js';
import { DataManagerUI } from './ui/dataManager.js';
import './styles/main.css';

// Initialize storage service
const storage = new StorageService();

// Log initialization status
console.log('SuperTodo initialized');
console.log('Phase 1: Setup ✓');
console.log('Phase 2: Foundational ✓');
console.log('Phase 3: User Story 1 ✓');
console.log('Phase 4: User Story 2 ✓');
console.log('Phase 5: User Story 3 - Implementing...');

// State management
let selectedCategoryId = null; // null = "All" categories

// Get app container and set up structure
const app = document.querySelector('#app');
app.innerHTML = `
  <div class="app-container">
    <header class="app-header">
      <div class="app-header-content">
        <div class="app-header-text">
          <h1 class="app-title">SuperTodo</h1>
          <p class="app-subtitle">Daily Task Organizer</p>
        </div>
        <button id="theme-toggle" class="theme-toggle" aria-label="Toggle dark mode">
          <span class="theme-icon">🌙</span>
        </button>
      </div>
    </header>

    <main class="app-main">
      <section class="task-form-section" id="task-form-container"></section>

      <section class="category-section">
        <div id="category-filter-container"></div>
        <details class="category-manager-details">
          <summary class="category-manager-summary">⚙️ Manage Categories</summary>
          <div id="category-manager-container"></div>
        </details>
        <details class="data-manager-details">
          <summary class="data-manager-summary">💾 Backup & Restore</summary>
          <div id="data-manager-container"></div>
        </details>
      </section>

      <section class="task-list-section">
        <h2 class="section-title">My Tasks</h2>
        <div id="task-list-container"></div>
      </section>
    </main>
  </div>
`;

// Initialize UI components
const taskForm = new TaskFormUI('#task-form-container');
const dateGroupsUI = new DateGroupsUI('#task-list-container');
const categoryFilter = new CategoryFilterUI('#category-filter-container');
const categoryManager = new CategoryManagerUI('#category-manager-container');
const dataManager = new DataManagerUI('#data-manager-container');

// Render initial UI
renderAll();

// T056: Setup keyboard shortcuts
setupKeyboardShortcuts();

// Setup theme toggle
setupThemeToggle();

/**
 * T059: Shows success notification
 */
function showSuccessNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'success-notification';
  notification.textContent = message;
  notification.setAttribute('role', 'status');
  notification.setAttribute('aria-live', 'polite');

  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Renders all UI components
 */
function renderAll() {
  const categories = storage.getCategories();

  // Render task form with categories
  taskForm.render(categories);

  // Render category filter
  categoryFilter.render(categories);

  // Render category manager
  categoryManager.render(categories);

  // Render data manager
  dataManager.render();

  // Render task list
  renderTaskList();
}

/**
 * Renders the task list with current tasks from storage
 * Using date-grouped view (Phase 4: User Story 2)
 * With category filtering (Phase 5: User Story 3)
 */
function renderTaskList() {
  const categories = storage.getCategories();
  let tasks = storage.getTasks();

  // T050: Apply category filter if selected
  if (selectedCategoryId !== null) {
    tasks = tasks.filter(task => task.categoryId === selectedCategoryId);
  }

  dateGroupsUI.renderGrouped(tasks, categories);
  console.log(`Rendered ${tasks.length} tasks in date groups (filter: ${selectedCategoryId || 'All'})`);
}

/**
 * T021: Task creation handler
 * Handles form submission by creating a new task
 */
taskForm.onTaskCreate = (taskData) => {
  try {
    const task = storage.createTask(taskData);
    console.log('Task created:', task);
    renderTaskList();
    showSuccessNotification('✓ Task created successfully!');
  } catch (error) {
    console.error('Error creating task:', error);
    alert(`Error: ${error.message}`);
  }
};

/**
 * T024: Task toggle handler
 * Handles task completion toggle
 */
dateGroupsUI.onTaskToggle = (taskId) => {
  try {
    const updatedTask = storage.toggleTaskCompletion(taskId);
    console.log('Task toggled:', updatedTask);
    renderTaskList();
  } catch (error) {
    console.error('Error toggling task:', error);
    alert(`Error: ${error.message}`);
  }
};

/**
 * T025 & T105: Task delete handler with confirmation
 * Handles task deletion with user confirmation
 */
dateGroupsUI.onTaskDelete = (taskId) => {
  try {
    const task = storage.getTaskById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // T105: Confirm before deleting
    const confirmed = confirm(
      `Are you sure you want to delete this task?\n\n"${task.title}"\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      console.log('Task deletion cancelled by user');
      return;
    }

    storage.deleteTask(taskId);
    console.log('Task deleted:', taskId);
    renderTaskList();
    showSuccessNotification('✓ Task deleted');
  } catch (error) {
    console.error('Error deleting task:', error);
    alert(`Error: ${error.message}`);
  }
};

/**
 * T098: Task edit handler
 * Handles task editing by populating form with task data
 */
dateGroupsUI.onTaskEdit = (taskId) => {
  try {
    const task = storage.getTaskById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    const categories = storage.getCategories();
    taskForm.enterEditMode(task, categories);
    console.log('Editing task:', taskId);
  } catch (error) {
    console.error('Error loading task for editing:', error);
    alert(`Error: ${error.message}`);
  }
};

/**
 * T098: Task update handler
 * Handles task update from form submission
 */
taskForm.onTaskUpdate = (taskId, updates) => {
  try {
    const updatedTask = storage.updateTask(taskId, updates);
    console.log('Task updated:', updatedTask);
    renderTaskList();
    showSuccessNotification('✓ Task updated successfully!');
  } catch (error) {
    console.error('Error updating task:', error);
    alert(`Error: ${error.message}`);
  }
};

/**
 * T042 & T043: Category filter handler
 * Handles category selection for filtering tasks
 */
categoryFilter.onCategorySelect = (categoryId) => {
  selectedCategoryId = categoryId;
  console.log('Category filter:', categoryId || 'All');
  renderTaskList();
};

/**
 * T044 & T045: Category creation handler
 * Handles creating new categories with uniqueness validation (T051)
 */
categoryManager.onCategoryCreate = (categoryData) => {
  try {
    // T051: Check for duplicate name (case-insensitive)
    const categories = storage.getCategories();
    const duplicate = categories.find(
      c => c.name.toLowerCase() === categoryData.name.toLowerCase()
    );

    if (duplicate) {
      alert('A category with this name already exists');
      return;
    }

    const category = storage.createCategory(categoryData);
    console.log('Category created:', category);
    renderAll();
    showSuccessNotification('✓ Category created!');
  } catch (error) {
    console.error('Error creating category:', error);
    alert(`Error: ${error.message}`);
  }
};

/**
 * T044 & T046: Category update handler
 * Handles editing existing categories with uniqueness validation (T051)
 */
categoryManager.onCategoryUpdate = (categoryId, updates) => {
  try {
    // T051: Check for duplicate name (case-insensitive) excluding current category
    if (updates.name) {
      const categories = storage.getCategories();
      const duplicate = categories.find(
        c => c.id !== categoryId && c.name.toLowerCase() === updates.name.toLowerCase()
      );

      if (duplicate) {
        alert('A category with this name already exists');
        return;
      }
    }

    const category = storage.updateCategory(categoryId, updates);
    console.log('Category updated:', category);
    renderAll();
  } catch (error) {
    console.error('Error updating category:', error);
    alert(`Error: ${error.message}`);
  }
};

/**
 * T044, T047 & T105: Category deletion handler with confirmation
 * Handles deleting categories with cascade logic (tasks become uncategorized)
 */
categoryManager.onCategoryDelete = (categoryId) => {
  try {
    const category = storage.getCategoryById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Count tasks in this category
    const tasksInCategory = storage.getTasksByCategory(categoryId);

    // T105: Confirm before deleting
    const message = tasksInCategory.length > 0
      ? `Are you sure you want to delete the category "${category.name}"?\n\n` +
        `${tasksInCategory.length} task(s) will become uncategorized.\n\n` +
        `This action cannot be undone.`
      : `Are you sure you want to delete the category "${category.name}"?\n\nThis action cannot be undone.`;

    const confirmed = confirm(message);

    if (!confirmed) {
      console.log('Category deletion cancelled by user');
      return;
    }

    storage.deleteCategory(categoryId);
    console.log('Category deleted:', categoryId);

    // Reset filter if the deleted category was selected
    if (selectedCategoryId === categoryId) {
      selectedCategoryId = null;
      categoryFilter.reset();
    }

    renderAll();
    showSuccessNotification('✓ Category deleted');
  } catch (error) {
    console.error('Error deleting category:', error);
    alert(`Error: ${error.message}`);
  }
};

/**
 * Provide current categories to CategoryManager for editing
 */
categoryManager.onCategoriesChange = () => {
  return storage.getCategories();
};

/**
 * T096: Data export handler
 * Handles exporting all data as JSON download
 */
dataManager.onExport = () => {
  try {
    storage.downloadExport();
    console.log('Data exported successfully');
    showSuccessNotification('✓ Data exported successfully!');
  } catch (error) {
    console.error('Error exporting data:', error);
    alert(`Error exporting data: ${error.message}`);
  }
};

/**
 * T097: Data import handler
 * Handles importing data from JSON file with validation
 */
dataManager.onImport = (data) => {
  try {
    // Confirm before importing (will overwrite current data)
    const confirmed = confirm(
      'Warning: Importing will replace all current data. ' +
      'Make sure you have exported your current data first.\n\n' +
      'Do you want to continue?'
    );

    if (!confirmed) {
      console.log('Import cancelled by user');
      return;
    }

    const result = storage.importData(data);
    console.log('Data imported:', result);

    // Re-render everything with new data
    renderAll();

    showSuccessNotification(
      `✓ Imported ${result.tasksImported} tasks and ${result.categoriesImported} categories!`
    );
  } catch (error) {
    console.error('Error importing data:', error);
    alert(`Error importing data: ${error.message}`);
  }
};

/**
 * T056: Setup keyboard shortcuts
 * Ctrl+N: Focus on new task title input
 * Escape: Clear/reset forms
 * Ctrl+/: Toggle category manager
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+N or Cmd+N: Focus on task title input
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      const titleInput = document.getElementById('task-title');
      if (titleInput) {
        titleInput.focus();
        titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Escape: Clear forms and close details
    if (e.key === 'Escape') {
      // Reset task form
      const taskForm = document.getElementById('task-form');
      if (taskForm && document.activeElement?.form === taskForm) {
        taskForm.reset();
        document.activeElement.blur();
      }

      // Reset category form
      const categoryForm = document.getElementById('category-form');
      if (categoryForm && document.activeElement?.form === categoryForm) {
        categoryManager.resetForm();
      }

      // Close category manager if open
      const categoryDetails = document.querySelector('.category-manager-details');
      if (categoryDetails?.open) {
        categoryDetails.open = false;
      }
    }

    // Ctrl+/ or Cmd+/: Toggle category manager
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      const categoryDetails = document.querySelector('.category-manager-details');
      if (categoryDetails) {
        categoryDetails.open = !categoryDetails.open;
      }
    }
  });

  console.log('Keyboard shortcuts enabled: Ctrl+N (new task), Escape (cancel), Ctrl+/ (toggle categories)');
}

/**
 * Setup theme toggle functionality
 * Supports manual toggle and persists preference
 */
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle.querySelector('.theme-icon');
  const root = document.documentElement;

  // Load saved theme preference or use system preference
  const savedTheme = localStorage.getItem('supertodo_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  // Apply initial theme
  applyTheme(currentTheme);

  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    localStorage.setItem('supertodo_theme', currentTheme);
  });

  // Apply theme to document
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);

    if (theme === 'dark') {
      themeIcon.textContent = '☀️';
      themeToggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
      themeIcon.textContent = '🌙';
      themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-switch if user hasn't set a preference
    if (!localStorage.getItem('supertodo_theme')) {
      currentTheme = e.matches ? 'dark' : 'light';
      applyTheme(currentTheme);
    }
  });

  console.log('Theme toggle enabled. Current theme:', currentTheme);
}

// Export storage instance for use in other modules
export { storage };
