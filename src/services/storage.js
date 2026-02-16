/**
 * Storage Service
 * Provides a consistent interface for persisting and retrieving tasks and categories
 * using browser localStorage.
 */

import { Task } from '../models/task.js';
import { Category } from '../models/category.js';
import { groupTasksByDate } from '../ui/dateGroups.js';

export class StorageService {
  /**
   * Creates a new StorageService instance
   * @param {string} [namespace='supertodo'] - Prefix for localStorage keys
   */
  constructor(namespace = 'supertodo') {
    this.namespace = namespace;
    this.tasksKey = `${namespace}_tasks`;
    this.categoriesKey = `${namespace}_categories`;
  }

  // ========== TASK OPERATIONS ==========

  /**
   * Retrieves all tasks from localStorage
   * T070: Enhanced error handling with corrupted data recovery
   * @returns {Array<Object>} Array of task objects (may be empty)
   */
  getTasks() {
    try {
      const data = localStorage.getItem(this.tasksKey);
      if (!data) return [];

      // T070: Try to parse, recover from corruption
      try {
        return JSON.parse(data);
      } catch (parseError) {
        console.error('Corrupted tasks data detected, clearing and reinitializing:', parseError);
        // Clear corrupted data
        localStorage.removeItem(this.tasksKey);
        return [];
      }
    } catch (error) {
      console.error('Error reading tasks from localStorage:', error);
      return [];
    }
  }

  /**
   * Retrieves a single task by its UUID
   * @param {string} id - UUID of the task to retrieve
   * @returns {Object|null} Task object if found, null otherwise
   */
  getTaskById(id) {
    const tasks = this.getTasks();
    return tasks.find(task => task.id === id) || null;
  }

  /**
   * Persists an array of tasks to localStorage
   * T069: Enhanced with QuotaExceededError handling
   * @param {Array<Object>} tasks - Array of task objects to persist
   * @throws {Error} If storage quota exceeded
   */
  saveTasks(tasks) {
    try {
      localStorage.setItem(this.tasksKey, JSON.stringify(tasks));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded. Unable to save tasks.');
        throw new Error('Storage quota exceeded. Please delete some tasks or export your data.');
      }
      throw error;
    }
  }

  /**
   * Creates a new task and persists it
   * @param {Object} data - Task data
   * @param {string} data.title - Task title (required, 1-200 chars)
   * @param {string} [data.description=''] - Task description (0-1000 chars)
   * @param {string|null} [data.dueDate=null] - Due date in ISO 8601 format
   * @param {string|null} [data.categoryId=null] - Category UUID
   * @returns {Object} Newly created task object
   * @throws {Error} If validation fails
   */
  createTask(data) {
    // Validate using Task model
    Task.validate(data);

    // VR-005: Validate categoryId if provided
    if (data.categoryId) {
      const category = this.getCategoryById(data.categoryId);
      if (!category) {
        throw new Error('Invalid category selected');
      }
    }

    // Create task instance to ensure proper structure
    const task = new Task(data);
    const taskObj = task.toJSON();

    // Add to tasks array
    const tasks = this.getTasks();
    tasks.push(taskObj);
    this.saveTasks(tasks);

    return taskObj;
  }

  /**
   * Updates an existing task and persists changes
   * @param {string} id - UUID of task to update
   * @param {Object} updates - Object containing fields to update
   * @returns {Object} Updated task object
   * @throws {Error} If task not found or validation fails
   */
  updateTask(id, updates) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
      throw new Error('Task not found');
    }

    // Merge updates with existing task
    const updatedTask = { ...tasks[index], ...updates };

    // Validate the updated task
    Task.validate(updatedTask);

    // VR-005: Validate categoryId if being updated
    if (updates.categoryId !== undefined && updates.categoryId !== null) {
      const category = this.getCategoryById(updates.categoryId);
      if (!category) {
        throw new Error('Invalid category selected');
      }
    }

    // Update task in array
    tasks[index] = updatedTask;
    this.saveTasks(tasks);

    return updatedTask;
  }

  /**
   * Toggles a task's completion status
   * @param {string} id - UUID of task to toggle
   * @returns {Object} Updated task object
   * @throws {Error} If task not found
   */
  toggleTaskCompletion(id) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);

    if (!task) {
      throw new Error('Task not found');
    }

    task.completed = !task.completed;
    this.saveTasks(tasks);

    return task;
  }

  /**
   * Deletes a task permanently
   * @param {string} id - UUID of task to delete
   * @throws {Error} If task not found
   */
  deleteTask(id) {
    const tasks = this.getTasks();
    const filtered = tasks.filter(task => task.id !== id);

    if (tasks.length === filtered.length) {
      throw new Error('Task not found');
    }

    this.saveTasks(filtered);
  }

  // ========== CATEGORY OPERATIONS ==========

  /**
   * Retrieves all categories from localStorage
   * T070: Enhanced error handling with corrupted data recovery
   * @returns {Array<Object>} Array of category objects
   */
  getCategories() {
    try {
      const data = localStorage.getItem(this.categoriesKey);

      if (data) {
        // T070: Try to parse, recover from corruption
        try {
          return JSON.parse(data);
        } catch (parseError) {
          console.error('Corrupted categories data detected, reinitializing with defaults:', parseError);
          // Clear corrupted data and reinitialize
          localStorage.removeItem(this.categoriesKey);
          const defaultCategories = this.getDefaultCategories();
          this.saveCategories(defaultCategories);
          return defaultCategories;
        }
      }

      // Initialize with default categories if none exist
      const defaultCategories = this.getDefaultCategories();
      this.saveCategories(defaultCategories);
      return defaultCategories;
    } catch (error) {
      console.error('Error reading categories from localStorage:', error);
      const defaultCategories = this.getDefaultCategories();
      return defaultCategories;
    }
  }

  /**
   * Retrieves a single category by its UUID
   * @param {string} id - UUID of the category to retrieve
   * @returns {Object|null} Category object if found, null otherwise
   */
  getCategoryById(id) {
    const categories = this.getCategories();
    return categories.find(category => category.id === id) || null;
  }

  /**
   * Persists an array of categories to localStorage
   * T069: Enhanced with QuotaExceededError handling
   * @param {Array<Object>} categories - Array of category objects to persist
   * @throws {Error} If storage quota exceeded
   */
  saveCategories(categories) {
    try {
      localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded. Unable to save categories.');
        throw new Error('Storage quota exceeded. Please export your data or clear browser storage.');
      }
      throw error;
    }
  }

  /**
   * Creates a new category and persists it
   * @param {Object} data - Category data
   * @param {string} data.name - Category name (required, 1-50 chars, unique)
   * @param {string} [data.description=''] - Category description (0-200 chars)
   * @returns {Object} Newly created category object
   * @throws {Error} If validation fails or name is duplicate
   */
  createCategory(data) {
    // Validate using Category model
    Category.validate(data);

    const categories = this.getCategories();

    // VR-008: Check for duplicate name (case-insensitive)
    const trimmedName = data.name.trim();
    const duplicate = categories.find(
      c => c.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicate) {
      throw new Error('A category with this name already exists');
    }

    // Create category instance
    const category = new Category(data);
    const categoryObj = category.toJSON();

    // Add to categories array
    categories.push(categoryObj);
    this.saveCategories(categories);

    return categoryObj;
  }

  /**
   * Updates an existing category and persists changes
   * @param {string} id - UUID of category to update
   * @param {Object} updates - Object containing fields to update
   * @returns {Object} Updated category object
   * @throws {Error} If category not found, validation fails, or name is duplicate
   */
  updateCategory(id, updates) {
    const categories = this.getCategories();
    const index = categories.findIndex(category => category.id === id);

    if (index === -1) {
      throw new Error('Category not found');
    }

    // Merge updates with existing category
    const updatedCategory = { ...categories[index], ...updates };

    // Validate the updated category
    Category.validate(updatedCategory);

    // VR-008: Check for duplicate name if name is being updated
    if (updates.name) {
      const trimmedName = updates.name.trim();
      const duplicate = categories.find(
        c => c.id !== id && c.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (duplicate) {
        throw new Error('A category with this name already exists');
      }
    }

    // Update category in array
    categories[index] = updatedCategory;
    this.saveCategories(categories);

    return updatedCategory;
  }

  /**
   * Deletes a category and reassigns all associated tasks to "Uncategorized"
   * @param {string} id - UUID of category to delete
   * @throws {Error} If category not found
   */
  deleteCategory(id) {
    const categories = this.getCategories();
    const filtered = categories.filter(category => category.id !== id);

    if (categories.length === filtered.length) {
      throw new Error('Category not found');
    }

    // FR-014: Set categoryId to null for all tasks using this category
    const tasks = this.getTasks();
    const updatedTasks = tasks.map(task =>
      task.categoryId === id ? { ...task, categoryId: null } : task
    );

    // Save both updated arrays
    this.saveTasks(updatedTasks);
    this.saveCategories(filtered);
  }

  // ========== QUERY OPERATIONS ==========

  /**
   * Retrieves all tasks belonging to a specific category
   * @param {string|null} categoryId - UUID of category to filter by, or null for uncategorized
   * @returns {Array<Object>} Array of task objects matching the category filter
   */
  getTasksByCategory(categoryId) {
    const tasks = this.getTasks();
    return tasks.filter(task => task.categoryId === categoryId);
  }

  /**
   * Retrieves all tasks organized into date-based groups
   * @returns {Object} Object with six arrays, one for each date group
   */
  getTasksGroupedByDate() {
    const tasks = this.getTasks();
    return groupTasksByDate(tasks);
  }

  // ========== HELPER METHODS ==========

  /**
   * Generates the default categories for initial app state
   * @private
   * @returns {Array<Object>} Array of 4 default category objects
   */
  getDefaultCategories() {
    return [
      new Category({ name: 'Work', description: 'Tasks related to job and professional projects' }).toJSON(),
      new Category({ name: 'Personal', description: 'Personal tasks and errands' }).toJSON(),
      new Category({ name: 'Shopping', description: 'Shopping lists and purchases' }).toJSON(),
      new Category({ name: 'Health', description: 'Health and wellness tasks' }).toJSON()
    ];
  }

  // ========== DATA EXPORT/IMPORT (T096, T097) ==========

  /**
   * T096: Exports all data (tasks and categories) as JSON
   * @returns {Object} Object containing tasks and categories arrays with metadata
   */
  exportData() {
    const tasks = this.getTasks();
    const categories = this.getCategories();

    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        tasks,
        categories
      }
    };
  }

  /**
   * T096: Exports data and triggers browser download
   * @param {string} [filename] - Optional custom filename
   */
  downloadExport(filename) {
    const data = this.exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const defaultFilename = `supertodo-backup-${new Date().toISOString().split('T')[0]}.json`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * T097: Imports data from JSON with validation
   * @param {Object} data - Import data object
   * @throws {Error} If data is invalid or corrupted
   * @returns {Object} Summary of imported data
   */
  importData(data) {
    // Validate data structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid import data: must be an object');
    }

    if (!data.data || typeof data.data !== 'object') {
      throw new Error('Invalid import data: missing data property');
    }

    const { tasks = [], categories = [] } = data.data;

    // Validate tasks array
    if (!Array.isArray(tasks)) {
      throw new Error('Invalid import data: tasks must be an array');
    }

    // Validate categories array
    if (!Array.isArray(categories)) {
      throw new Error('Invalid import data: categories must be an array');
    }

    // Validate each task
    tasks.forEach((task, index) => {
      try {
        Task.validate(task);
      } catch (error) {
        throw new Error(`Invalid task at index ${index}: ${error.message}`);
      }
    });

    // Validate each category
    categories.forEach((category, index) => {
      try {
        Category.validate(category);
      } catch (error) {
        throw new Error(`Invalid category at index ${index}: ${error.message}`);
      }
    });

    // If validation passes, save the data
    this.saveTasks(tasks);
    this.saveCategories(categories);

    return {
      tasksImported: tasks.length,
      categoriesImported: categories.length
    };
  }
}
