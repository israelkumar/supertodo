/**
 * CategoryManagerUI - Category management component
 * Handles creating, editing, and deleting categories
 */
export class CategoryManagerUI {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.onCategoryCreate = null; // Callback for category creation
    this.onCategoryUpdate = null; // Callback for category update
    this.onCategoryDelete = null; // Callback for category deletion
    this.onCategoriesChange = null; // Callback when categories list changes
    this.editingCategoryId = null; // ID of category being edited
  }

  /**
   * Renders the category manager with list and form
   * @param {Array} categories - Array of category objects
   */
  render(categories) {
    const categoriesList = categories.map(category => `
      <div class="category-item" data-category-id="${category.id}">
        <div class="category-item__info">
          <strong class="category-item__name">${this.escapeHtml(category.name)}</strong>
          ${category.description ? `<p class="category-item__description">${this.escapeHtml(category.description)}</p>` : ''}
        </div>
        <div class="category-item__actions">
          <button class="category-item__edit" data-category-id="${category.id}">
            Edit
          </button>
          <button class="category-item__delete" data-category-id="${category.id}">
            Delete
          </button>
        </div>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="category-manager">
        <h3 class="category-manager__title">Manage Categories</h3>

        <div class="category-manager__form">
          <form id="category-form">
            <input type="hidden" id="category-id" value="">

            <div class="category-form__field">
              <label for="category-name" class="category-form__label">
                Category Name <span class="category-form__required">*</span>
              </label>
              <input
                type="text"
                id="category-name"
                class="category-form__input"
                placeholder="e.g., Work, Personal, Shopping"
                maxlength="50"
                required
              />
              <span class="category-form__error" id="category-name-error"></span>
            </div>

            <div class="category-form__field">
              <label for="category-description" class="category-form__label">
                Description
              </label>
              <input
                type="text"
                id="category-description"
                class="category-form__input"
                placeholder="Optional description"
                maxlength="200"
              />
            </div>

            <div class="category-form__actions">
              <button type="submit" class="category-form__submit" id="category-submit-btn">
                Add Category
              </button>
              <button type="button" class="category-form__cancel" id="category-cancel-btn" style="display: none;">
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div class="category-manager__list">
          <h4 class="category-manager__list-title">Your Categories</h4>
          ${categories.length > 0 ? categoriesList : '<p class="category-manager__empty">No custom categories yet.</p>'}
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for category management
   */
  setupEventListeners() {
    const form = document.getElementById('category-form');
    const nameInput = document.getElementById('category-name');
    const descriptionInput = document.getElementById('category-description');
    const categoryIdInput = document.getElementById('category-id');
    const submitBtn = document.getElementById('category-submit-btn');
    const cancelBtn = document.getElementById('category-cancel-btn');

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = nameInput.value.trim();
      const description = descriptionInput.value.trim();
      const categoryId = categoryIdInput.value;

      // Validate name
      const validationError = this.validateCategoryName(name);
      if (validationError) {
        this.showError('category-name-error', validationError);
        return;
      }

      this.clearError('category-name-error');

      // Call appropriate callback
      if (categoryId) {
        // Update existing category
        if (this.onCategoryUpdate) {
          this.onCategoryUpdate(categoryId, { name, description });
        }
      } else {
        // Create new category
        if (this.onCategoryCreate) {
          this.onCategoryCreate({ name, description });
        }
      }

      // Reset form
      this.resetForm();
    });

    // Cancel button
    cancelBtn.addEventListener('click', () => {
      this.resetForm();
    });

    // Edit buttons
    const editButtons = this.container.querySelectorAll('.category-item__edit');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const categoryId = button.dataset.categoryId;
        this.startEditing(categoryId);
      });
    });

    // Delete buttons
    const deleteButtons = this.container.querySelectorAll('.category-item__delete');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const categoryId = button.dataset.categoryId;

        if (confirm('Delete this category? Tasks in this category will become uncategorized.')) {
          if (this.onCategoryDelete) {
            this.onCategoryDelete(categoryId);
          }
        }
      });
    });
  }

  /**
   * Starts editing a category
   * @param {string} categoryId - ID of category to edit
   */
  startEditing(categoryId) {
    this.editingCategoryId = categoryId;

    // Get category data (assuming we can access it from the callback)
    if (this.onCategoriesChange) {
      // This will be set by main.js to provide current categories
      const categories = this.onCategoriesChange();
      const category = categories.find(c => c.id === categoryId);

      if (category) {
        document.getElementById('category-id').value = category.id;
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-description').value = category.description || '';
        document.getElementById('category-submit-btn').textContent = 'Update Category';
        document.getElementById('category-cancel-btn').style.display = 'inline-block';
      }
    }
  }

  /**
   * Resets the form to initial state
   */
  resetForm() {
    document.getElementById('category-form').reset();
    document.getElementById('category-id').value = '';
    document.getElementById('category-submit-btn').textContent = 'Add Category';
    document.getElementById('category-cancel-btn').style.display = 'none';
    this.editingCategoryId = null;
    this.clearError('category-name-error');
  }

  /**
   * Validates category name (VR-006, VR-007, VR-008)
   * @param {string} name - The name to validate
   * @returns {string|null} - Error message or null if valid
   */
  validateCategoryName(name) {
    // VR-007: Must not be empty or whitespace-only
    if (!name || name.length === 0) {
      return 'Category name cannot be empty';
    }

    // VR-006: Must be 1-50 characters
    if (name.length < 1 || name.length > 50) {
      return 'Category name must be between 1 and 50 characters';
    }

    return null;
  }

  /**
   * Shows an error message
   * @param {string} errorElementId - ID of error span
   * @param {string} message - Error message
   */
  showError(errorElementId, message) {
    const errorElement = document.getElementById(errorElementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  /**
   * Clears an error message
   * @param {string} errorElementId - ID of error span
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
}
