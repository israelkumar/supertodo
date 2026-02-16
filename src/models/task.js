/**
 * Task Model
 * Represents a single actionable item that a user wants to track and complete.
 */

export class Task {
  /**
   * Creates a new Task instance
   * @param {Object} data - Task data
   * @param {string} data.title - Task title (required, 1-200 chars)
   * @param {string} [data.description=''] - Task description (0-1000 chars)
   * @param {string|null} [data.dueDate=null] - Due date in ISO 8601 format
   * @param {string|null} [data.categoryId=null] - Category UUID
   * @param {string} [data.id] - Task UUID (auto-generated if not provided)
   * @param {boolean} [data.completed=false] - Completion status
   * @param {string} [data.createdAt] - Creation timestamp (auto-generated if not provided)
   */
  constructor(data) {
    // Validate required fields
    if (!data.title || typeof data.title !== 'string') {
      throw new Error('Task title is required');
    }

    const trimmedTitle = data.title.trim();
    if (trimmedTitle.length === 0) {
      throw new Error('Task title cannot be empty');
    }

    if (trimmedTitle.length > 200) {
      throw new Error('Task title must be between 1 and 200 characters');
    }

    // Validate optional fields
    const description = (data.description || '').trim();
    if (description.length > 1000) {
      throw new Error('Task description must be 1000 characters or less');
    }

    // Assign properties
    this.id = data.id || crypto.randomUUID();
    this.title = trimmedTitle;
    this.description = description;
    this.dueDate = data.dueDate || null;
    this.categoryId = data.categoryId || null;
    this.completed = data.completed || false;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  /**
   * Validates a task object against validation rules
   * @param {Object} data - Task data to validate
   * @throws {Error} If validation fails
   */
  static validate(data) {
    // VR-001, VR-002: Title validation
    if (!data.title || typeof data.title !== 'string') {
      throw new Error('Task title is required');
    }

    const trimmedTitle = data.title.trim();
    if (trimmedTitle.length === 0) {
      throw new Error('Task title cannot be empty');
    }

    if (trimmedTitle.length < 1 || trimmedTitle.length > 200) {
      throw new Error('Task title must be between 1 and 200 characters');
    }

    // VR-003: Description validation
    if (data.description) {
      const trimmedDesc = data.description.trim();
      if (trimmedDesc.length > 1000) {
        throw new Error('Task description must be 1000 characters or less');
      }
    }

    // VR-004: Due date validation
    if (data.dueDate !== null && data.dueDate !== undefined) {
      if (typeof data.dueDate !== 'string') {
        throw new Error('Invalid due date format');
      }
      // Basic ISO 8601 date format check (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.dueDate)) {
        throw new Error('Invalid due date format');
      }
    }

    return true;
  }

  /**
   * Creates a plain object representation of the task
   * @returns {Object} Plain task object
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      categoryId: this.categoryId,
      completed: this.completed,
      createdAt: this.createdAt
    };
  }

  /**
   * Creates a Task instance from a plain object
   * @param {Object} obj - Plain task object
   * @returns {Task} Task instance
   */
  static fromJSON(obj) {
    return new Task(obj);
  }
}
