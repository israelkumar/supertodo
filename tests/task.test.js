/**
 * Unit tests for Task model
 * T074: Test task creation, validation, and serialization
 */

import { describe, it, expect } from 'vitest';
import { Task } from '../src/models/task.js';

describe('Task Model', () => {
  describe('Constructor', () => {
    it('should create a task with valid title', () => {
      const task = new Task({ title: 'Buy groceries' });

      expect(task.title).toBe('Buy groceries');
      expect(task.description).toBe('');
      expect(task.dueDate).toBeNull();
      expect(task.categoryId).toBeNull();
      expect(task.completed).toBe(false);
      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeDefined();
    });

    it('should trim whitespace from title', () => {
      const task = new Task({ title: '  Spaced title  ' });
      expect(task.title).toBe('Spaced title');
    });

    it('should accept optional fields', () => {
      const taskData = {
        title: 'Task with options',
        description: 'A detailed description',
        dueDate: '2026-12-31',
        categoryId: 'cat-123',
        completed: true
      };

      const task = new Task(taskData);

      expect(task.title).toBe('Task with options');
      expect(task.description).toBe('A detailed description');
      expect(task.dueDate).toBe('2026-12-31');
      expect(task.categoryId).toBe('cat-123');
      expect(task.completed).toBe(true);
    });

    it('should throw error if title is missing', () => {
      expect(() => new Task({})).toThrow('Task title is required');
      expect(() => new Task({ title: null })).toThrow('Task title is required');
    });

    it('should throw error if title is not a string', () => {
      expect(() => new Task({ title: 123 })).toThrow('Task title is required');
      expect(() => new Task({ title: [] })).toThrow('Task title is required');
    });

    it('should throw error if title is empty after trimming', () => {
      expect(() => new Task({ title: '' })).toThrow('Task title is required');
      expect(() => new Task({ title: '   ' })).toThrow('Task title cannot be empty');
    });

    it('should throw error if title exceeds 200 characters', () => {
      const longTitle = 'a'.repeat(201);
      expect(() => new Task({ title: longTitle })).toThrow('Task title must be between 1 and 200 characters');
    });

    it('should accept title with exactly 200 characters', () => {
      const maxTitle = 'a'.repeat(200);
      const task = new Task({ title: maxTitle });
      expect(task.title.length).toBe(200);
    });

    it('should throw error if description exceeds 1000 characters', () => {
      const longDesc = 'a'.repeat(1001);
      expect(() => new Task({ title: 'Valid', description: longDesc }))
        .toThrow('Task description must be 1000 characters or less');
    });

    it('should trim whitespace from description', () => {
      const task = new Task({ title: 'Task', description: '  Spaced description  ' });
      expect(task.description).toBe('Spaced description');
    });

    it('should auto-generate UUID if not provided', () => {
      const task1 = new Task({ title: 'Task 1' });
      const task2 = new Task({ title: 'Task 2' });

      expect(task1.id).toBeDefined();
      expect(task2.id).toBeDefined();
      expect(task1.id).not.toBe(task2.id);
    });

    it('should use provided UUID if given', () => {
      const customId = 'custom-uuid-123';
      const task = new Task({ title: 'Task', id: customId });
      expect(task.id).toBe(customId);
    });
  });

  describe('Static validate method', () => {
    it('should validate valid task data', () => {
      const validData = {
        title: 'Valid task',
        description: 'Valid description',
        dueDate: '2026-12-31'
      };

      expect(() => Task.validate(validData)).not.toThrow();
      expect(Task.validate(validData)).toBe(true);
    });

    it('should reject missing title', () => {
      expect(() => Task.validate({})).toThrow('Task title is required');
    });

    it('should reject empty title', () => {
      expect(() => Task.validate({ title: '' })).toThrow('Task title is required');
      expect(() => Task.validate({ title: '   ' })).toThrow('Task title cannot be empty');
    });

    it('should reject title over 200 characters', () => {
      const longTitle = 'a'.repeat(201);
      expect(() => Task.validate({ title: longTitle }))
        .toThrow('Task title must be between 1 and 200 characters');
    });

    it('should reject description over 1000 characters', () => {
      const longDesc = 'a'.repeat(1001);
      expect(() => Task.validate({ title: 'Valid', description: longDesc }))
        .toThrow('Task description must be 1000 characters or less');
    });

    it('should validate ISO 8601 date format (YYYY-MM-DD)', () => {
      expect(() => Task.validate({ title: 'Valid', dueDate: '2026-12-31' })).not.toThrow();
      expect(() => Task.validate({ title: 'Valid', dueDate: '2026-01-01' })).not.toThrow();
    });

    it('should reject invalid date formats', () => {
      expect(() => Task.validate({ title: 'Valid', dueDate: '12/31/2026' }))
        .toThrow('Invalid due date format');
      expect(() => Task.validate({ title: 'Valid', dueDate: '2026/12/31' }))
        .toThrow('Invalid due date format');
      expect(() => Task.validate({ title: 'Valid', dueDate: 'invalid' }))
        .toThrow('Invalid due date format');
      expect(() => Task.validate({ title: 'Valid', dueDate: 123 }))
        .toThrow('Invalid due date format');
    });

    it('should accept null or undefined dueDate', () => {
      expect(() => Task.validate({ title: 'Valid', dueDate: null })).not.toThrow();
      expect(() => Task.validate({ title: 'Valid', dueDate: undefined })).not.toThrow();
    });
  });

  describe('Serialization', () => {
    it('should convert to JSON', () => {
      const taskData = {
        title: 'Test task',
        description: 'Test description',
        dueDate: '2026-12-31',
        categoryId: 'cat-123',
        completed: true
      };

      const task = new Task(taskData);
      const json = task.toJSON();

      expect(json).toEqual({
        id: task.id,
        title: 'Test task',
        description: 'Test description',
        dueDate: '2026-12-31',
        categoryId: 'cat-123',
        completed: true,
        createdAt: task.createdAt
      });
    });

    it('should create from JSON', () => {
      const json = {
        id: 'task-123',
        title: 'Restored task',
        description: 'Restored description',
        dueDate: '2026-12-31',
        categoryId: 'cat-123',
        completed: true,
        createdAt: '2026-02-16T10:00:00.000Z'
      };

      const task = Task.fromJSON(json);

      expect(task.id).toBe('task-123');
      expect(task.title).toBe('Restored task');
      expect(task.description).toBe('Restored description');
      expect(task.dueDate).toBe('2026-12-31');
      expect(task.categoryId).toBe('cat-123');
      expect(task.completed).toBe(true);
      expect(task.createdAt).toBe('2026-02-16T10:00:00.000Z');
    });

    it('should round-trip through JSON', () => {
      const original = new Task({
        title: 'Original task',
        description: 'Original description',
        dueDate: '2026-12-31'
      });

      const json = original.toJSON();
      const restored = Task.fromJSON(json);

      expect(restored.id).toBe(original.id);
      expect(restored.title).toBe(original.title);
      expect(restored.description).toBe(original.description);
      expect(restored.dueDate).toBe(original.dueDate);
      expect(restored.createdAt).toBe(original.createdAt);
    });
  });
});
