/**
 * Category Model
 * Represents a grouping mechanism for organizing tasks by context.
 */

export class Category {
  /**
   * Creates a new Category instance
   * @param {Object} data - Category data
   * @param {string} data.name - Category name (required, 1-50 chars, unique)
   * @param {string} [data.description=''] - Category description (0-200 chars)
   * @param {string} [data.id] - Category UUID (auto-generated if not provided)
   */
  constructor(data) {
    // Validate required fields
    if (!data.name || typeof data.name !== 'string') {
      throw new Error('Category name is required');
    }

    const trimmedName = data.name.trim();
    if (trimmedName.length === 0) {
      throw new Error('Category name cannot be empty');
    }

    if (trimmedName.length > 50) {
      throw new Error('Category name must be between 1 and 50 characters');
    }

    // Validate optional fields
    const description = (data.description || '').trim();
    if (description.length > 200) {
      throw new Error('Category description must be 200 characters or less');
    }

    // Assign properties
    this.id = data.id || crypto.randomUUID();
    this.name = trimmedName;
    this.description = description;
  }

  /**
   * Validates a category object against validation rules
   * @param {Object} data - Category data to validate
   * @throws {Error} If validation fails
   */
  static validate(data) {
    // VR-006, VR-007: Name validation
    if (!data.name || typeof data.name !== 'string') {
      throw new Error('Category name is required');
    }

    const trimmedName = data.name.trim();
    if (trimmedName.length === 0) {
      throw new Error('Category name cannot be empty');
    }

    if (trimmedName.length < 1 || trimmedName.length > 50) {
      throw new Error('Category name must be between 1 and 50 characters');
    }

    // VR-009: Description validation
    if (data.description) {
      const trimmedDesc = data.description.trim();
      if (trimmedDesc.length > 200) {
        throw new Error('Category description must be 200 characters or less');
      }
    }

    return true;
  }

  /**
   * Creates a plain object representation of the category
   * @returns {Object} Plain category object
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description
    };
  }

  /**
   * Creates a Category instance from a plain object
   * @param {Object} obj - Plain category object
   * @returns {Category} Category instance
   */
  static fromJSON(obj) {
    return new Category(obj);
  }
}
