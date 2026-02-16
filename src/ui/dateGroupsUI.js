/**
 * DateGroupsUI - Date-grouped task list display component
 * Renders tasks organized by date groups (Today, Tomorrow, This Week, Future, Past, Unscheduled)
 */
import { groupTasksByDate, getGroupDisplayName, getGroupOrder } from './dateGroups.js';

export class DateGroupsUI {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.onTaskToggle = null; // Callback for task completion toggle
    this.onTaskDelete = null; // Callback for task deletion
    this.categories = []; // Categories for badge display
    this.setupEventListeners();
  }

  /**
   * Renders tasks organized by date groups
   * @param {Array} tasks - Array of task objects to render
   * @param {Array} categories - Array of category objects for badge display
   */
  renderGrouped(tasks, categories = []) {
    this.categories = categories;
    if (!tasks || tasks.length === 0) {
      this.container.innerHTML = `
        <div class="task-list-empty">
          <p>No tasks yet. Create your first task above!</p>
        </div>
      `;
      return;
    }

    // Group tasks by date
    const groupedTasks = groupTasksByDate(tasks);
    const groupOrder = getGroupOrder();

    // Build HTML for all groups
    const groupsHtml = groupOrder
      .map(groupKey => {
        const tasks = groupedTasks[groupKey];
        const displayName = getGroupDisplayName(groupKey);

        // Skip empty groups (or show with empty state)
        if (tasks.length === 0) {
          return ''; // Hide empty groups for cleaner UI
        }

        const tasksHtml = tasks.map(task => this.renderTask(task)).join('');

        return `
          <div class="date-group" data-group="${groupKey}">
            <h3 class="date-group-header ${groupKey === 'past' ? 'date-group-header--past' : ''}">
              ${displayName}
              <span class="date-group-count">(${tasks.length})</span>
            </h3>
            <div class="date-group-tasks">
              ${tasksHtml}
            </div>
          </div>
        `;
      })
      .join('');

    this.container.innerHTML = `<div class="date-group-container">${groupsHtml}</div>`;
  }

  /**
   * Renders a single task item
   * @param {Object} task - Task object
   * @returns {string} HTML string for task item
   */
  renderTask(task) {
    const isPast = task.dueDate && new Date(task.dueDate + 'T00:00:00') < new Date().setHours(0, 0, 0, 0);
    const dueDateDisplay = task.dueDate ? this.formatDate(task.dueDate) : '';

    // Get category name for badge
    const category = task.categoryId ? this.categories.find(c => c.id === task.categoryId) : null;
    const categoryBadge = category ? `<span class="category-badge">${this.escapeHtml(category.name)}</span>` : '';

    return `
      <div class="task-item ${task.completed ? 'task-item--completed' : ''} ${isPast && !task.completed ? 'task-item--overdue' : ''}"
           data-task-id="${task.id}">
        <input
          type="checkbox"
          class="task-checkbox"
          ${task.completed ? 'checked' : ''}
          aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}"
        />
        <div class="task-content">
          <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
          ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
          <div class="task-meta">
            ${categoryBadge}
            ${dueDateDisplay ? `<span class="task-date ${isPast && !task.completed ? 'task-date--overdue' : ''}">${dueDateDisplay}</span>` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button
            class="task-edit"
            aria-label="Edit task: ${this.escapeHtml(task.title)}"
            title="Edit task"
          >
            ✏️
          </button>
          <button
            class="task-delete"
            aria-label="Delete task: ${this.escapeHtml(task.title)}"
            title="Delete task"
          >
            ×
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Sets up event delegation for task interactions
   */
  setupEventListeners() {
    // Event delegation: single listener for all task interactions
    this.container.addEventListener('click', (e) => {
      const taskItem = e.target.closest('.task-item');
      if (!taskItem) return;

      const taskId = taskItem.dataset.taskId;

      // Handle checkbox toggle
      if (e.target.classList.contains('task-checkbox')) {
        if (this.onTaskToggle) {
          this.onTaskToggle(taskId);
        }
      }

      // Handle edit button
      if (e.target.classList.contains('task-edit')) {
        if (this.onTaskEdit) {
          this.onTaskEdit(taskId);
        }
      }

      // Handle delete button
      if (e.target.classList.contains('task-delete')) {
        if (this.onTaskDelete) {
          this.onTaskDelete(taskId);
        }
      }
    });
  }

  /**
   * Escapes HTML to prevent XSS attacks on user-generated content
   * @param {string} text - The text to escape
   * @returns {string} - HTML-escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Formats a date string for display (e.g., "Feb 15")
   * @param {string} dateString - ISO date string (YYYY-MM-DD)
   * @returns {string} - Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}
