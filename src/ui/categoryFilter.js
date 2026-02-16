/**
 * CategoryFilterUI - Category filter component
 * Displays category buttons for filtering tasks
 */
export class CategoryFilterUI {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.onCategorySelect = null; // Callback for category selection
    this.selectedCategoryId = null; // Currently selected category (null = "All")
  }

  /**
   * Renders the category filter buttons
   * @param {Array} categories - Array of category objects
   */
  render(categories) {
    const allButton = `
      <button
        class="category-button ${this.selectedCategoryId === null ? 'category-button--active' : ''}"
        data-category-id="all"
      >
        All Tasks
      </button>
    `;

    const categoryButtons = categories.map(category => `
      <button
        class="category-button ${this.selectedCategoryId === category.id ? 'category-button--active' : ''}"
        data-category-id="${category.id}"
      >
        ${this.escapeHtml(category.name)}
      </button>
    `).join('');

    this.container.innerHTML = `
      <div class="category-filter" role="navigation" aria-label="Category filter">
        <h3 class="category-filter__title">Filter by Category</h3>
        <div class="category-filter__buttons" role="group" aria-label="Category filter buttons">
          ${allButton}
          ${categoryButtons}
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for category button clicks
   */
  setupEventListeners() {
    const buttons = this.container.querySelectorAll('.category-button');

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const categoryId = button.dataset.categoryId;

        // Update selected category
        this.selectedCategoryId = categoryId === 'all' ? null : categoryId;

        // Update button states
        buttons.forEach(btn => btn.classList.remove('category-button--active'));
        button.classList.add('category-button--active');

        // Call callback with selected category
        if (this.onCategorySelect) {
          this.onCategorySelect(this.selectedCategoryId);
        }
      });
    });
  }

  /**
   * Resets the filter to "All"
   */
  reset() {
    this.selectedCategoryId = null;
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
