/**
 * Unit tests for Category model
 * T075: Test category creation, validation, and serialization
 */

import { describe, it, expect } from 'vitest';
import { Category } from '../src/models/category.js';

describe('Category Model', () => {
  describe('Constructor', () => {
    it('should create a category with valid name', () => {
      const category = new Category({ name: 'Work' });

      expect(category.name).toBe('Work');
      expect(category.description).toBe('');
      expect(category.id).toBeDefined();
    });

    it('should trim whitespace from name', () => {
      const category = new Category({ name: '  Spaced name  ' });
      expect(category.name).toBe('Spaced name');
    });

    it('should accept optional description', () => {
      const category = new Category({
        name: 'Personal',
        description: 'Personal tasks and errands'
      });

      expect(category.name).toBe('Personal');
      expect(category.description).toBe('Personal tasks and errands');
    });

    it('should throw error if name is missing', () => {
      expect(() => new Category({})).toThrow('Category name is required');
      expect(() => new Category({ name: null })).toThrow('Category name is required');
    });

    it('should throw error if name is not a string', () => {
      expect(() => new Category({ name: 123 })).toThrow('Category name is required');
      expect(() => new Category({ name: [] })).toThrow('Category name is required');
    });

    it('should throw error if name is empty after trimming', () => {
      expect(() => new Category({ name: '' })).toThrow('Category name is required');
      expect(() => new Category({ name: '   ' })).toThrow('Category name cannot be empty');
    });

    it('should throw error if name exceeds 50 characters', () => {
      const longName = 'a'.repeat(51);
      expect(() => new Category({ name: longName }))
        .toThrow('Category name must be between 1 and 50 characters');
    });

    it('should accept name with exactly 50 characters', () => {
      const maxName = 'a'.repeat(50);
      const category = new Category({ name: maxName });
      expect(category.name.length).toBe(50);
    });

    it('should throw error if description exceeds 200 characters', () => {
      const longDesc = 'a'.repeat(201);
      expect(() => new Category({ name: 'Valid', description: longDesc }))
        .toThrow('Category description must be 200 characters or less');
    });

    it('should accept description with exactly 200 characters', () => {
      const maxDesc = 'a'.repeat(200);
      const category = new Category({ name: 'Valid', description: maxDesc });
      expect(category.description.length).toBe(200);
    });

    it('should trim whitespace from description', () => {
      const category = new Category({
        name: 'Category',
        description: '  Spaced description  '
      });
      expect(category.description).toBe('Spaced description');
    });

    it('should auto-generate UUID if not provided', () => {
      const cat1 = new Category({ name: 'Category 1' });
      const cat2 = new Category({ name: 'Category 2' });

      expect(cat1.id).toBeDefined();
      expect(cat2.id).toBeDefined();
      expect(cat1.id).not.toBe(cat2.id);
    });

    it('should use provided UUID if given', () => {
      const customId = 'custom-uuid-456';
      const category = new Category({ name: 'Category', id: customId });
      expect(category.id).toBe(customId);
    });
  });

  describe('Static validate method', () => {
    it('should validate valid category data', () => {
      const validData = {
        name: 'Valid category',
        description: 'Valid description'
      };

      expect(() => Category.validate(validData)).not.toThrow();
      expect(Category.validate(validData)).toBe(true);
    });

    it('should reject missing name', () => {
      expect(() => Category.validate({})).toThrow('Category name is required');
    });

    it('should reject empty name', () => {
      expect(() => Category.validate({ name: '' })).toThrow('Category name is required');
      expect(() => Category.validate({ name: '   ' })).toThrow('Category name cannot be empty');
    });

    it('should reject name over 50 characters', () => {
      const longName = 'a'.repeat(51);
      expect(() => Category.validate({ name: longName }))
        .toThrow('Category name must be between 1 and 50 characters');
    });

    it('should reject description over 200 characters', () => {
      const longDesc = 'a'.repeat(201);
      expect(() => Category.validate({ name: 'Valid', description: longDesc }))
        .toThrow('Category description must be 200 characters or less');
    });

    it('should accept valid name with special characters', () => {
      expect(() => Category.validate({ name: 'Work/Projects' })).not.toThrow();
      expect(() => Category.validate({ name: 'To-Do List' })).not.toThrow();
      expect(() => Category.validate({ name: 'Shopping (Groceries)' })).not.toThrow();
    });
  });

  describe('Serialization', () => {
    it('should convert to JSON', () => {
      const categoryData = {
        name: 'Health',
        description: 'Health and wellness tasks'
      };

      const category = new Category(categoryData);
      const json = category.toJSON();

      expect(json).toEqual({
        id: category.id,
        name: 'Health',
        description: 'Health and wellness tasks'
      });
    });

    it('should create from JSON', () => {
      const json = {
        id: 'cat-123',
        name: 'Shopping',
        description: 'Shopping lists and purchases'
      };

      const category = Category.fromJSON(json);

      expect(category.id).toBe('cat-123');
      expect(category.name).toBe('Shopping');
      expect(category.description).toBe('Shopping lists and purchases');
    });

    it('should round-trip through JSON', () => {
      const original = new Category({
        name: 'Travel',
        description: 'Travel planning and bookings'
      });

      const json = original.toJSON();
      const restored = Category.fromJSON(json);

      expect(restored.id).toBe(original.id);
      expect(restored.name).toBe(original.name);
      expect(restored.description).toBe(original.description);
    });

    it('should handle missing description in JSON', () => {
      const json = {
        id: 'cat-456',
        name: 'Minimal'
      };

      const category = Category.fromJSON(json);

      expect(category.id).toBe('cat-456');
      expect(category.name).toBe('Minimal');
      expect(category.description).toBe('');
    });
  });
});
