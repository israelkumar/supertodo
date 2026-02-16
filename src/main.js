/**
 * SuperTodo - Daily Task Organizer
 * Main application entry point
 */

import { StorageService } from './services/storage.js';

// Initialize storage service
const storage = new StorageService();

// Log initialization status
console.log('SuperTodo initialized');
console.log('Phase 1: Setup ✓');
console.log('Phase 2: Foundational ✓');

// Initialize default categories if none exist
const categories = storage.getCategories();
console.log(`Loaded ${categories.length} categories`);

// Load existing tasks
const tasks = storage.getTasks();
console.log(`Loaded ${tasks.length} tasks`);

// Get app container
const app = document.querySelector('#app');

// Temporary status message
app.innerHTML = `
  <div style="text-align: center; padding: 2rem; font-family: system-ui, -apple-system, sans-serif;">
    <h1 style="color: #1f2937; margin-bottom: 0.5rem;">SuperTodo</h1>
    <p style="color: #6b7280; margin-bottom: 2rem;">Daily Task Organizer</p>

    <div style="display: inline-block; text-align: left; background: #f3f4f6; padding: 1.5rem; border-radius: 0.5rem;">
      <p style="color: #10b981; font-weight: 600; margin: 0.5rem 0;">✓ Phase 1: Setup Complete</p>
      <p style="color: #10b981; font-weight: 600; margin: 0.5rem 0;">✓ Phase 2: Foundational Complete</p>
      <p style="color: #6b7280; font-size: 0.875rem; margin: 1rem 0 0.5rem 0;">Storage initialized with:</p>
      <ul style="color: #6b7280; font-size: 0.875rem; margin: 0; padding-left: 1.5rem;">
        <li>${categories.length} categories loaded</li>
        <li>${tasks.length} tasks loaded</li>
      </ul>
      <p style="color: #6b7280; font-size: 0.875rem; margin: 1.5rem 0 0 0;">Next: Phase 3 - User Story 1 (Create & View Tasks)</p>
    </div>
  </div>
`;

// Export storage instance for use in other modules
export { storage };
