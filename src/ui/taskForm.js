/**
 * TaskFormUI - Task creation form component
 * Handles rendering and submission of new task form
 */
export class TaskFormUI {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.onTaskCreate = null; // Callback for task creation
    this.onTaskUpdate = null; // Callback for task updates
    this.categories = []; // Categories for the dropdown
    this.editingTaskId = null; // Track which task is being edited
  }

  /**
   * Renders the task form with title, description, date, and category inputs
   * @param {Array} categories - Array of category objects
   */
  render(categories = []) {
    this.categories = categories;
    const isEditing = this.editingTaskId !== null;
    this.container.innerHTML = `
      <form class="task-form" id="task-form" aria-label="${isEditing ? 'Task editing' : 'Task creation'} form">
        <h2 class="task-form__title">${isEditing ? 'Edit Task' : 'Create New Task'}</h2>

        <div class="task-form__field">
          <label for="task-title" class="task-form__label">
            Title <span class="task-form__required">*</span>
          </label>
          <input
            type="text"
            id="task-title"
            class="task-form__input"
            placeholder="Enter task title (1-200 characters)"
            maxlength="200"
            required
          />
          <span class="task-form__error" id="title-error"></span>
        </div>

        <div class="task-form__field">
          <label for="task-description" class="task-form__label">
            Description
          </label>
          <textarea
            id="task-description"
            class="task-form__textarea"
            placeholder="Optional details (up to 1000 characters)"
            maxlength="1000"
            rows="3"
          ></textarea>
        </div>

        <div class="task-form__field">
          <label for="task-due-date" class="task-form__label">
            Due Date
          </label>
          <input
            type="date"
            id="task-due-date"
            class="task-form__input"
          />
          <span class="task-form__help">Optional: When should this task be completed?</span>
        </div>

        <div class="task-form__field">
          <label for="task-category" class="task-form__label">
            Category
          </label>
          <select id="task-category" class="task-form__select">
            <option value="">Uncategorized</option>
            ${this.categories.map(cat => `
              <option value="${cat.id}">${this.escapeHtml(cat.name)}</option>
            `).join('')}
          </select>
          <span class="task-form__help">Optional: Organize your task by category</span>
        </div>

        <div class="task-form__actions">
          <button type="submit" class="task-form__submit" aria-label="${isEditing ? 'Update task' : 'Add new task'}">
            ${isEditing ? 'Update Task' : 'Add Task'}
          </button>
          ${isEditing ? `
            <button type="button" class="task-form__cancel" aria-label="Cancel editing">
              Cancel
            </button>
          ` : `
            <button type="reset" class="task-form__reset" aria-label="Clear form">
              Clear
            </button>
          `}
        </div>
      </form>
    `;

    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for form submission
   */
  setupEventListeners() {
    const form = document.getElementById('task-form');
    const titleInput = document.getElementById('task-title');
    const descriptionInput = document.getElementById('task-description');
    const dueDateInput = document.getElementById('task-due-date');
    const categorySelect = document.getElementById('task-category');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = titleInput.value.trim();
      const description = descriptionInput.value.trim();
      const dueDate = dueDateInput.value || null;
      const categoryId = categorySelect.value || null;

      // Validate title (VR-001, VR-002)
      const validationError = this.validateTitle(title);
      if (validationError) {
        this.showError('title-error', validationError);
        return;
      }

      // Clear any previous errors
      this.clearError('title-error');

      // Call appropriate callback based on mode
      if (this.editingTaskId) {
        // Update mode
        if (this.onTaskUpdate) {
          this.onTaskUpdate(this.editingTaskId, { title, description, dueDate, categoryId });
        }
        this.exitEditMode();
      } else {
        // Create mode
        if (this.onTaskCreate) {
          this.onTaskCreate({ title, description, dueDate, categoryId });
        }
        // Reset form after successful submission
        form.reset();
      }
    });

    // Handle cancel button in edit mode
    const cancelButton = form.querySelector('.task-form__cancel');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        this.exitEditMode();
      });
    }
  }

  /**
   * Validates task title according to VR-001 and VR-002
   * @param {string} title - The title to validate
   * @returns {string|null} - Error message or null if valid
   */
  validateTitle(title) {
    // VR-002: Must not be empty or whitespace-only
    if (!title || title.length === 0) {
      return 'Task title cannot be empty';
    }

    // VR-001: Must be 1-200 characters
    if (title.length < 1 || title.length > 200) {
      return 'Task title must be between 1 and 200 characters';
    }

    return null;
  }

  /**
   * Shows an error message for a specific field
   * @param {string} errorElementId - ID of the error span element
   * @param {string} message - Error message to display
   */
  showError(errorElementId, message) {
    const errorElement = document.getElementById(errorElementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  /**
   * Clears an error message for a specific field
   * @param {string} errorElementId - ID of the error span element
   */
  clearError(errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  /**
   * Escapes HTML to prevent XSS attacks
   * @param {string} text - The text to escape
   * @returns {string} - HTML-escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * T098: Enters edit mode and populates form with task data
   * @param {Object} task - Task object to edit
   */
  enterEditMode(task) {
    this.editingTaskId = task.id;

    // Re-render form with edit mode
    this.render(this.categories);

    // Populate form fields
    const titleInput = document.getElementById('task-title');
    const descriptionInput = document.getElementById('task-description');
    const dueDateInput = document.getElementById('task-due-date');
    const categorySelect = document.getElementById('task-category');

    if (titleInput) titleInput.value = task.title;
    if (descriptionInput) descriptionInput.value = task.description || '';
    if (dueDateInput) dueDateInput.value = task.dueDate || '';
    if (categorySelect) categorySelect.value = task.categoryId || '';

    // Scroll form into view and focus title
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    titleInput?.focus();
  }

  /**
   * T098: Exits edit mode and resets form to create mode
   */
  exitEditMode() {
    this.editingTaskId = null;
    this.render(this.categories);

    // Reset form
    const form = document.getElementById('task-form');
    if (form) form.reset();
  }
}
