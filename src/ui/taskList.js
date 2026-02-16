/**
 * TaskListUI - Task list display component
 * Handles rendering and interaction with task list
 */
export class TaskListUI {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.onTaskToggle = null; // Callback for task completion toggle
    this.onTaskDelete = null; // Callback for task deletion
    this.setupEventListeners();
  }

  /**
   * Renders the task list with checkboxes and delete buttons
   * @param {Array} tasks - Array of task objects to render
   */
  render(tasks) {
    if (!tasks || tasks.length === 0) {
      this.container.innerHTML = `
        <div class="task-list-empty">
          <p>No tasks yet. Create your first task above!</p>
        </div>
      `;
      return;
    }

    const html = tasks.map(task => `
      <div class="task-item ${task.completed ? 'task-item--completed' : ''}" data-task-id="${task.id}">
        <input
          type="checkbox"
          class="task-checkbox"
          ${task.completed ? 'checked' : ''}
          aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}"
        />
        <div class="task-content">
          <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
          ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
        </div>
        <button
          class="task-delete"
          aria-label="Delete task: ${this.escapeHtml(task.title)}"
        >
          ×
        </button>
      </div>
    `).join('');

    this.container.innerHTML = `<div class="task-list">${html}</div>`;
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
   * Formats a date string for display
   * @param {string} isoDate - ISO 8601 date string
   * @returns {string} - Formatted date (e.g., "Feb 15")
   */
  formatDate(isoDate) {
    return new Date(isoDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}
