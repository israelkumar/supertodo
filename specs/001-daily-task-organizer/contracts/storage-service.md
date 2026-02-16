# Storage Service Contract

**Version**: 1.0.0
**Date**: 2026-02-15
**Type**: Internal Service Interface

## Overview

The Storage Service provides a consistent interface for persisting and retrieving tasks and categories using browser localStorage. This contract defines the methods, parameters, return types, and error behaviors.

---

## Service: StorageService

### Constructor

```typescript
constructor(namespace: string = 'supertodo')
```

**Parameters**:
- `namespace` (optional): String prefix for localStorage keys to avoid collisions (default: `'supertodo'`)

**Example**:
```javascript
const storage = new StorageService(); // Uses default namespace
const storage = new StorageService('myapp'); // Custom namespace
```

---

## Task Operations

### getTasks()

Retrieves all tasks from localStorage.

**Signature**:
```typescript
getTasks(): Task[]
```

**Returns**: Array of Task objects (may be empty)

**Behavior**:
- If no tasks exist in localStorage, returns `[]`
- Always returns a valid array, never null/undefined

**Throws**: None (catches and returns `[]` on parse errors in prototype; logging added in production)

**Example**:
```javascript
const tasks = storage.getTasks();
// Returns: [{ id: "...", title: "Buy milk", ... }, ...]
```

---

### getTaskById(id)

Retrieves a single task by its UUID.

**Signature**:
```typescript
getTaskById(id: string): Task | null
```

**Parameters**:
- `id`: UUID string of the task to retrieve

**Returns**:
- Task object if found
- `null` if not found

**Throws**: None

**Example**:
```javascript
const task = storage.getTaskById("550e8400-e29b-41d4-a716-446655440000");
// Returns: { id: "550e8400...", title: "Buy milk", ... } or null
```

---

### saveTasks(tasks)

Persists an array of tasks to localStorage, replacing existing data.

**Signature**:
```typescript
saveTasks(tasks: Task[]): void
```

**Parameters**:
- `tasks`: Array of Task objects to persist

**Returns**: void

**Throws**:
- Prototype: No error handling (will crash if localStorage is full)
- Production: Should throw `QuotaExceededError` with user-friendly message

**Behavior**:
- Overwrites existing `supertodo_tasks` key completely
- Serializes tasks array to JSON

**Example**:
```javascript
const tasks = storage.getTasks();
tasks.push(newTask);
storage.saveTasks(tasks);
```

---

### createTask(data)

Creates a new task and persists it.

**Signature**:
```typescript
createTask(data: {
  title: string,
  description?: string,
  dueDate?: string | null,
  categoryId?: string | null
}): Task
```

**Parameters**:
- `data.title` (required): Task title (1-200 characters, not empty)
- `data.description` (optional): Task description (0-1000 characters, default: `""`)
- `data.dueDate` (optional): ISO 8601 date string or null (default: `null`)
- `data.categoryId` (optional): UUID of associated category or null (default: `null`)

**Returns**: Newly created Task object with generated `id`, `completed: false`, and `createdAt` timestamp

**Throws**:
- `Error` if validation fails (VR-001 through VR-005)

**Example**:
```javascript
const task = storage.createTask({
  title: "Buy groceries",
  description: "Milk, eggs, bread",
  dueDate: "2026-02-15",
  categoryId: "a1b2c3d4-e5f6-4789-0123-456789abcdef"
});
// Returns: { id: "550e8400...", title: "Buy groceries", ..., createdAt: "2026-02-15T10:30:00.000Z" }
```

---

### updateTask(id, updates)

Updates an existing task and persists changes.

**Signature**:
```typescript
updateTask(id: string, updates: Partial<Task>): Task
```

**Parameters**:
- `id`: UUID of task to update
- `updates`: Object containing fields to update (only provided fields are updated)

**Returns**: Updated Task object

**Throws**:
- `Error('Task not found')` if task with given ID doesn't exist
- `Error` if validation fails for updated fields

**Example**:
```javascript
const updatedTask = storage.updateTask("550e8400-...", {
  title: "Buy groceries and coffee",
  completed: true
});
```

---

### toggleTaskCompletion(id)

Toggles a task's completion status.

**Signature**:
```typescript
toggleTaskCompletion(id: string): Task
```

**Parameters**:
- `id`: UUID of task to toggle

**Returns**: Updated Task object with toggled `completed` status

**Throws**:
- `Error('Task not found')` if task with given ID doesn't exist

**Example**:
```javascript
const task = storage.toggleTaskCompletion("550e8400-...");
// If task.completed was false, now it's true (and vice versa)
```

---

### deleteTask(id)

Deletes a task permanently.

**Signature**:
```typescript
deleteTask(id: string): void
```

**Parameters**:
- `id`: UUID of task to delete

**Returns**: void

**Throws**:
- `Error('Task not found')` if task with given ID doesn't exist

**Example**:
```javascript
storage.deleteTask("550e8400-...");
```

---

## Category Operations

### getCategories()

Retrieves all categories from localStorage.

**Signature**:
```typescript
getCategories(): Category[]
```

**Returns**: Array of Category objects

**Behavior**:
- If no categories exist, returns default categories (Work, Personal, Shopping, Health)
- Always returns a valid array, never null/undefined

**Throws**: None

**Example**:
```javascript
const categories = storage.getCategories();
// Returns: [{ id: "...", name: "Work", ... }, ...]
```

---

### getCategoryById(id)

Retrieves a single category by its UUID.

**Signature**:
```typescript
getCategoryById(id: string): Category | null
```

**Parameters**:
- `id`: UUID string of the category to retrieve

**Returns**:
- Category object if found
- `null` if not found

**Throws**: None

**Example**:
```javascript
const category = storage.getCategoryById("a1b2c3d4-...");
// Returns: { id: "a1b2c3d4...", name: "Work", ... } or null
```

---

### saveCategories(categories)

Persists an array of categories to localStorage, replacing existing data.

**Signature**:
```typescript
saveCategories(categories: Category[]): void
```

**Parameters**:
- `categories`: Array of Category objects to persist

**Returns**: void

**Throws**:
- Prototype: No error handling (will crash if localStorage is full)
- Production: Should throw `QuotaExceededError` with user-friendly message

**Behavior**:
- Overwrites existing `supertodo_categories` key completely
- Serializes categories array to JSON

**Example**:
```javascript
const categories = storage.getCategories();
categories.push(newCategory);
storage.saveCategories(categories);
```

---

### createCategory(data)

Creates a new category and persists it.

**Signature**:
```typescript
createCategory(data: {
  name: string,
  description?: string
}): Category
```

**Parameters**:
- `data.name` (required): Category name (1-50 characters, not empty, unique)
- `data.description` (optional): Category description (0-200 characters, default: `""`)

**Returns**: Newly created Category object with generated `id`

**Throws**:
- `Error` if validation fails (VR-006 through VR-009)
- `Error('A category with this name already exists')` if duplicate name (case-insensitive)

**Example**:
```javascript
const category = storage.createCategory({
  name: "Urgent",
  description: "High-priority tasks"
});
// Returns: { id: "a1b2c3d4...", name: "Urgent", description: "High-priority tasks" }
```

---

### updateCategory(id, updates)

Updates an existing category and persists changes.

**Signature**:
```typescript
updateCategory(id: string, updates: Partial<Category>): Category
```

**Parameters**:
- `id`: UUID of category to update
- `updates`: Object containing fields to update (only provided fields are updated)

**Returns**: Updated Category object

**Throws**:
- `Error('Category not found')` if category with given ID doesn't exist
- `Error('A category with this name already exists')` if updated name conflicts with existing category
- `Error` if validation fails for updated fields

**Example**:
```javascript
const updatedCategory = storage.updateCategory("a1b2c3d4-...", {
  name: "Work Projects",
  description: "Professional tasks and deliverables"
});
```

---

### deleteCategory(id)

Deletes a category and reassigns all associated tasks to "Uncategorized".

**Signature**:
```typescript
deleteCategory(id: string): void
```

**Parameters**:
- `id`: UUID of category to delete

**Returns**: void

**Throws**:
- `Error('Category not found')` if category with given ID doesn't exist

**Behavior** (per FR-014):
1. Find all tasks with `categoryId === id`
2. Set those tasks' `categoryId` to `null`
3. Save updated tasks array
4. Remove category from categories array
5. Save updated categories array

**Example**:
```javascript
storage.deleteCategory("a1b2c3d4-...");
// All tasks with categoryId "a1b2c3d4..." now have categoryId: null
```

---

## Query Operations

### getTasksByCategory(categoryId)

Retrieves all tasks belonging to a specific category.

**Signature**:
```typescript
getTasksByCategory(categoryId: string | null): Task[]
```

**Parameters**:
- `categoryId`: UUID of category to filter by, or `null` for uncategorized tasks

**Returns**: Array of Task objects matching the category filter (may be empty)

**Throws**: None

**Example**:
```javascript
const workTasks = storage.getTasksByCategory("a1b2c3d4-...");
const uncategorizedTasks = storage.getTasksByCategory(null);
```

---

### getTasksGroupedByDate()

Retrieves all tasks organized into date-based groups.

**Signature**:
```typescript
getTasksGroupedByDate(): {
  today: Task[],
  tomorrow: Task[],
  thisWeek: Task[],
  future: Task[],
  past: Task[],
  unscheduled: Task[]
}
```

**Returns**: Object with six arrays, one for each date group

**Behavior**:
- Calculates groups based on current date at time of call
- Each group array may be empty

**Throws**: None

**Example**:
```javascript
const groups = storage.getTasksGroupedByDate();
console.log(`You have ${groups.today.length} tasks due today`);
```

---

## Internal Helper Methods

### getDefaultCategories() (Private)

Generates the default categories for initial app state.

**Returns**: Array of 4 default Category objects (Work, Personal, Shopping, Health)

**Usage**: Called internally by `getCategories()` when no categories exist

---

## Data Types

### Task Interface

```typescript
interface Task {
  id: string;              // UUID
  title: string;           // 1-200 chars
  description: string;     // 0-1000 chars
  dueDate: string | null;  // ISO 8601 date or null
  categoryId: string | null; // UUID or null
  completed: boolean;      // true/false
  createdAt: string;       // ISO 8601 timestamp
}
```

### Category Interface

```typescript
interface Category {
  id: string;           // UUID
  name: string;         // 1-50 chars, unique
  description: string;  // 0-200 chars
}
```

---

## Error Handling

### Prototype Phase (Current)

- **Validation errors**: Throw descriptive `Error` objects with user-friendly messages
- **Not found errors**: Throw `Error('Task not found')` or `Error('Category not found')`
- **Storage errors**: No handling (will crash if localStorage quota exceeded)
- **Parse errors**: Silently return `[]` and log to console

### Production Phase (Deferred)

- Add try/catch blocks for all localStorage operations
- Throw custom error types: `StorageQuotaError`, `DataCorruptionError`, `ValidationError`
- Implement graceful degradation (in-memory only mode if localStorage unavailable)
- Add error recovery strategies (clear corrupted data, restore from backup)

---

## localStorage Schema

**Keys**:
- `supertodo_tasks`: JSON-serialized array of Task objects
- `supertodo_categories`: JSON-serialized array of Category objects

**Size Estimates**:
- Single task: ~200 bytes
- Single category: ~100 bytes
- 1000 tasks: ~200 KB
- 50 categories: ~5 KB
- **Total for 1000 tasks + 50 categories**: ~205 KB (well within 5-10 MB localStorage limit)

---

## Thread Safety & Concurrency

### Prototype Phase (Current)

- **No multi-tab synchronization**: Changes in one tab don't reflect in other tabs
- **Race conditions**: Last write wins if multiple operations happen quickly

### Production Phase (Deferred)

- Listen for `storage` events to sync changes across tabs
- Implement optimistic locking (version numbers) to detect conflicts
- Add debouncing to reduce write frequency

---

## Testing Considerations

### Prototype Phase

- Manual testing only (create, read, update, delete operations)
- Verify validation rules throw errors as expected

### Production Phase

- Unit tests for each method (mock localStorage)
- Integration tests for data flow (create → read → update → delete)
- Edge case tests (quota exceeded, parse errors, concurrent tabs)
- Performance tests (1000+ tasks read/write times)

---

**Contract Version**: 1.0.0 | **Status**: Prototype | **Last Updated**: 2026-02-15
