/**
 * Unit tests for StorageService
 * T076: Test localStorage operations, CRUD, and error handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../src/services/storage.js';

describe('StorageService', () => {
  let storage;

  beforeEach(() => {
    // Create fresh storage instance for each test
    storage = new StorageService('test');
    localStorage.clear();
  });

  describe('Task Operations', () => {
    describe('getTasks', () => {
      it('should return empty array when no tasks exist', () => {
        const tasks = storage.getTasks();
        expect(tasks).toEqual([]);
      });

      it('should return stored tasks', () => {
        const mockTasks = [
          { id: '1', title: 'Task 1', completed: false },
          { id: '2', title: 'Task 2', completed: true }
        ];
        localStorage.setItem('test_tasks', JSON.stringify(mockTasks));

        const tasks = storage.getTasks();
        expect(tasks).toEqual(mockTasks);
      });

      it('should handle corrupted JSON data gracefully', () => {
        localStorage.setItem('test_tasks', 'corrupted{json]');

        const tasks = storage.getTasks();
        expect(tasks).toEqual([]);
        expect(localStorage.getItem('test_tasks')).toBeNull();
      });

      it('should handle localStorage errors gracefully', () => {
        // Simulate localStorage.getItem throwing an error
        const originalGetItem = localStorage.getItem;
        localStorage.getItem = () => {
          throw new Error('localStorage unavailable');
        };

        const tasks = storage.getTasks();
        expect(tasks).toEqual([]);

        // Restore original method
        localStorage.getItem = originalGetItem;
      });
    });

    describe('getTaskById', () => {
      it('should return task by id', () => {
        const mockTasks = [
          { id: 'task-1', title: 'Task 1' },
          { id: 'task-2', title: 'Task 2' }
        ];
        localStorage.setItem('test_tasks', JSON.stringify(mockTasks));

        const task = storage.getTaskById('task-1');
        expect(task).toEqual({ id: 'task-1', title: 'Task 1' });
      });

      it('should return null if task not found', () => {
        const task = storage.getTaskById('nonexistent');
        expect(task).toBeNull();
      });
    });

    describe('createTask', () => {
      it('should create and save a new task', () => {
        const taskData = {
          title: 'New task',
          description: 'Task description'
        };

        const task = storage.createTask(taskData);

        expect(task.id).toBeDefined();
        expect(task.title).toBe('New task');
        expect(task.description).toBe('Task description');
        expect(task.completed).toBe(false);

        const savedTasks = storage.getTasks();
        expect(savedTasks).toHaveLength(1);
        expect(savedTasks[0]).toEqual(task);
      });

      it('should throw error for invalid task data', () => {
        expect(() => storage.createTask({ title: '' }))
          .toThrow('Task title is required');
      });

      it('should throw error if category is invalid', () => {
        expect(() => storage.createTask({ title: 'Task', categoryId: 'invalid-cat' }))
          .toThrow('Invalid category selected');
      });

      it('should accept valid categoryId', () => {
        // Create a category first (use unique name to avoid default category conflict)
        const category = storage.createCategory({ name: 'TestCategory' });

        const task = storage.createTask({
          title: 'Work task',
          categoryId: category.id
        });

        expect(task.categoryId).toBe(category.id);
      });
    });

    describe('updateTask', () => {
      it('should update an existing task', () => {
        const task = storage.createTask({ title: 'Original' });

        const updated = storage.updateTask(task.id, {
          title: 'Updated',
          description: 'New description'
        });

        expect(updated.title).toBe('Updated');
        expect(updated.description).toBe('New description');
        expect(updated.id).toBe(task.id);

        const savedTask = storage.getTaskById(task.id);
        expect(savedTask.title).toBe('Updated');
      });

      it('should throw error if task not found', () => {
        expect(() => storage.updateTask('nonexistent', { title: 'Updated' }))
          .toThrow('Task not found');
      });

      it('should validate updated data', () => {
        const task = storage.createTask({ title: 'Original' });

        expect(() => storage.updateTask(task.id, { title: '' }))
          .toThrow('Task title is required');
      });

      it('should throw error if updating to invalid category', () => {
        const task = storage.createTask({ title: 'Task' });

        expect(() => storage.updateTask(task.id, { categoryId: 'invalid-cat' }))
          .toThrow('Invalid category selected');
      });
    });

    describe('toggleTaskCompletion', () => {
      it('should toggle task completion status', () => {
        const task = storage.createTask({ title: 'Task' });
        expect(task.completed).toBe(false);

        const toggled = storage.toggleTaskCompletion(task.id);
        expect(toggled.completed).toBe(true);

        const toggledAgain = storage.toggleTaskCompletion(task.id);
        expect(toggledAgain.completed).toBe(false);
      });

      it('should throw error if task not found', () => {
        expect(() => storage.toggleTaskCompletion('nonexistent'))
          .toThrow('Task not found');
      });
    });

    describe('deleteTask', () => {
      it('should delete a task', () => {
        const task = storage.createTask({ title: 'To delete' });
        expect(storage.getTasks()).toHaveLength(1);

        storage.deleteTask(task.id);
        expect(storage.getTasks()).toHaveLength(0);
      });

      it('should throw error if task not found', () => {
        expect(() => storage.deleteTask('nonexistent'))
          .toThrow('Task not found');
      });
    });

    describe('getTasksByCategory', () => {
      it('should filter tasks by category', () => {
        const category = storage.createCategory({ name: 'Projects' });

        storage.createTask({ title: 'Project task', categoryId: category.id });
        storage.createTask({ title: 'Personal task', categoryId: null });
        storage.createTask({ title: 'Another project task', categoryId: category.id });

        const projectTasks = storage.getTasksByCategory(category.id);
        expect(projectTasks).toHaveLength(2);
        expect(projectTasks.every(t => t.categoryId === category.id)).toBe(true);
      });

      it('should return uncategorized tasks when categoryId is null', () => {
        storage.createTask({ title: 'Task 1', categoryId: null });
        storage.createTask({ title: 'Task 2', categoryId: null });

        const uncategorized = storage.getTasksByCategory(null);
        expect(uncategorized).toHaveLength(2);
      });
    });
  });

  describe('Category Operations', () => {
    describe('getCategories', () => {
      it('should return default categories if none exist', () => {
        const categories = storage.getCategories();

        expect(categories).toHaveLength(4);
        expect(categories.map(c => c.name)).toEqual(['Work', 'Personal', 'Shopping', 'Health']);
      });

      it('should return stored categories', () => {
        const mockCategories = [
          { id: '1', name: 'Category 1' },
          { id: '2', name: 'Category 2' }
        ];
        localStorage.setItem('test_categories', JSON.stringify(mockCategories));

        const categories = storage.getCategories();
        expect(categories).toEqual(mockCategories);
      });

      it('should handle corrupted JSON data gracefully', () => {
        localStorage.setItem('test_categories', 'corrupted{json]');

        const categories = storage.getCategories();
        expect(categories).toHaveLength(4); // Should return defaults
        expect(categories.map(c => c.name)).toEqual(['Work', 'Personal', 'Shopping', 'Health']);
      });
    });

    describe('getCategoryById', () => {
      it('should return category by id', () => {
        const categories = storage.getCategories();
        const firstCat = categories[0];

        const category = storage.getCategoryById(firstCat.id);
        expect(category).toEqual(firstCat);
      });

      it('should return null if category not found', () => {
        const category = storage.getCategoryById('nonexistent');
        expect(category).toBeNull();
      });
    });

    describe('createCategory', () => {
      it('should create and save a new category', () => {
        const categoryData = {
          name: 'Finance',
          description: 'Financial tasks'
        };

        const category = storage.createCategory(categoryData);

        expect(category.id).toBeDefined();
        expect(category.name).toBe('Finance');
        expect(category.description).toBe('Financial tasks');

        const categories = storage.getCategories();
        expect(categories.some(c => c.id === category.id)).toBe(true);
      });

      it('should throw error for invalid category data', () => {
        expect(() => storage.createCategory({ name: '' }))
          .toThrow('Category name is required');
      });

      it('should throw error for duplicate category name (case-insensitive)', () => {
        storage.createCategory({ name: 'Finance' });

        expect(() => storage.createCategory({ name: 'Finance' }))
          .toThrow('A category with this name already exists');

        expect(() => storage.createCategory({ name: 'finance' }))
          .toThrow('A category with this name already exists');

        expect(() => storage.createCategory({ name: 'FINANCE' }))
          .toThrow('A category with this name already exists');
      });
    });

    describe('updateCategory', () => {
      it('should update an existing category', () => {
        const category = storage.createCategory({ name: 'Original' });

        const updated = storage.updateCategory(category.id, {
          name: 'Updated',
          description: 'New description'
        });

        expect(updated.name).toBe('Updated');
        expect(updated.description).toBe('New description');
        expect(updated.id).toBe(category.id);
      });

      it('should throw error if category not found', () => {
        expect(() => storage.updateCategory('nonexistent', { name: 'Updated' }))
          .toThrow('Category not found');
      });

      it('should throw error for duplicate name when updating', () => {
        storage.createCategory({ name: 'Finance' });
        const category2 = storage.createCategory({ name: 'Travel' });

        expect(() => storage.updateCategory(category2.id, { name: 'Finance' }))
          .toThrow('A category with this name already exists');
      });

      it('should allow updating category with same name (case change)', () => {
        const category = storage.createCategory({ name: 'finance' });

        expect(() => storage.updateCategory(category.id, { name: 'Finance' }))
          .not.toThrow();
      });
    });

    describe('deleteCategory', () => {
      it('should delete a category', () => {
        const category = storage.createCategory({ name: 'To delete' });
        const categoriesBefore = storage.getCategories();
        const countBefore = categoriesBefore.length;

        storage.deleteCategory(category.id);

        const categoriesAfter = storage.getCategories();
        expect(categoriesAfter.length).toBe(countBefore - 1);
        expect(categoriesAfter.some(c => c.id === category.id)).toBe(false);
      });

      it('should throw error if category not found', () => {
        expect(() => storage.deleteCategory('nonexistent'))
          .toThrow('Category not found');
      });

      it('should set tasks categoryId to null when category is deleted', () => {
        const category = storage.createCategory({ name: 'TestCat' });
        const task1 = storage.createTask({ title: 'Categorized task', categoryId: category.id });
        const task2 = storage.createTask({ title: 'Personal task', categoryId: null });

        storage.deleteCategory(category.id);

        const tasks = storage.getTasks();
        const updatedTask1 = tasks.find(t => t.id === task1.id);
        const updatedTask2 = tasks.find(t => t.id === task2.id);

        expect(updatedTask1.categoryId).toBeNull();
        expect(updatedTask2.categoryId).toBeNull();
      });
    });
  });

  describe('Error Handling - QuotaExceededError', () => {
    it('should throw meaningful error when quota exceeded on saveTasks', () => {
      // Simulate quota exceeded
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      };

      expect(() => storage.saveTasks([]))
        .toThrow('Storage quota exceeded. Please delete some tasks or export your data.');

      // Restore original method
      localStorage.setItem = originalSetItem;
    });

    it('should throw meaningful error when quota exceeded on saveCategories', () => {
      // Simulate quota exceeded
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      };

      expect(() => storage.saveCategories([]))
        .toThrow('Storage quota exceeded. Please export your data or clear browser storage.');

      // Restore original method
      localStorage.setItem = originalSetItem;
    });
  });
});
