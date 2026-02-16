# Data Model: Daily Task Organizer

**Date**: 2026-02-15
**Feature**: Daily Task Organizer
**Phase**: Phase 1 - Data Model Design

## Overview

This document defines the data entities, their attributes, relationships, validation rules, and state transitions for the Daily Task Organizer application.

---

## Entity Definitions

### 1. Task

**Description**: Represents a single actionable item that a user wants to track and complete.

**Attributes**:

| Attribute | Type | Required | Default | Validation | Description |
|-----------|------|----------|---------|------------|-------------|
| `id` | String (UUID) | Yes | `crypto.randomUUID()` | Must be valid RFC 4122 UUID | Unique identifier for the task |
| `title` | String | Yes | - | 1-200 characters, not empty/whitespace-only | Short description of the task |
| `description` | String | No | `""` | 0-1000 characters | Detailed notes or additional context |
| `dueDate` | String (ISO 8601) | No | `null` | Valid ISO 8601 date string or null | When the task should be completed |
| `categoryId` | String (UUID) | No | `null` | Must reference existing Category or be null | Associated category for organization |
| `completed` | Boolean | Yes | `false` | Boolean only | Whether the task has been completed |
| `createdAt` | String (ISO 8601) | Yes | `new Date().toISOString()` | Valid ISO 8601 timestamp | When the task was created |

**Example**:
```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Buy groceries",
  description: "Milk, eggs, bread, coffee",
  dueDate: "2026-02-15",
  categoryId: "a1b2c3d4-e5f6-4789-0123-456789abcdef",
  completed: false,
  createdAt: "2026-02-15T10:30:00.000Z"
}
```

**State Transitions**:
```
[Created] (completed: false)
    ↓
    ↓ (User marks as complete)
    ↓
[Completed] (completed: true)
    ↓
    ↓ (User marks as incomplete)
    ↓
[Created] (completed: false)
```

**Lifecycle**:
1. **Created**: User creates task via form → Task object instantiated with default values
2. **Updated**: User edits title, description, dueDate, categoryId, or completed status → Task object updated in memory → Saved to localStorage
3. **Deleted**: User clicks delete button → Task removed from tasks array → Array saved to localStorage

---

### 2. Category

**Description**: Represents a grouping mechanism for organizing tasks by context (e.g., Work, Personal, Shopping).

**Attributes**:

| Attribute | Type | Required | Default | Validation | Description |
|-----------|------|----------|---------|------------|-------------|
| `id` | String (UUID) | Yes | `crypto.randomUUID()` | Must be valid RFC 4122 UUID | Unique identifier for the category |
| `name` | String | Yes | - | 1-50 characters, not empty/whitespace-only, unique across categories | Display name of the category |
| `description` | String | No | `""` | 0-200 characters | Optional description of category purpose |

**Example**:
```javascript
{
  id: "a1b2c3d4-e5f6-4789-0123-456789abcdef",
  name: "Work",
  description: "Tasks related to job and professional projects"
}
```

**Default Categories**:
The application initializes with these default categories if none exist:
- Work
- Personal
- Shopping
- Health

**Lifecycle**:
1. **Created**: User creates category via form OR app initializes with defaults → Category object instantiated
2. **Updated**: User edits name or description → Category object updated in memory → Saved to localStorage
3. **Deleted**: User deletes category → All tasks with `categoryId` matching deleted category have their `categoryId` set to `null` (become "Uncategorized") → Category removed from categories array → Array saved to localStorage

---

### 3. Date Group (Virtual Entity)

**Description**: A logical grouping concept (not persisted) used to organize tasks by their due dates for display purposes.

**Groups**:

| Group Name | Condition | Sort Order |
|------------|-----------|------------|
| **Today** | `task.dueDate` equals today's date | 1 |
| **Tomorrow** | `task.dueDate` equals tomorrow's date | 2 |
| **This Week** | `task.dueDate` is between 2-7 days from today | 3 |
| **Future** | `task.dueDate` is more than 7 days from today | 4 |
| **Past** | `task.dueDate` is before today | 5 |
| **Unscheduled** | `task.dueDate` is `null` | 6 |

**Display Behavior**:
- Groups with zero tasks are shown but marked as empty
- Tasks within a group are sorted by:
  1. Completion status (incomplete first)
  2. Due date (earliest first) for groups with dates
  3. Creation time (newest first) for Unscheduled group

**Example Grouping**:
```javascript
{
  today: [
    { id: "...", title: "Finish report", dueDate: "2026-02-15", completed: false },
    { id: "...", title: "Team meeting", dueDate: "2026-02-15", completed: true }
  ],
  tomorrow: [
    { id: "...", title: "Doctor appointment", dueDate: "2026-02-16", completed: false }
  ],
  thisWeek: [],
  future: [
    { id: "...", title: "Conference", dueDate: "2026-02-25", completed: false }
  ],
  past: [
    { id: "...", title: "Old task", dueDate: "2026-02-10", completed: false }
  ],
  unscheduled: [
    { id: "...", title: "Someday maybe", dueDate: null, completed: false }
  ]
}
```

---

## Relationships

### Task → Category (Many-to-One, Optional)

- **Cardinality**: Many tasks can belong to one category
- **Optionality**: A task may have `categoryId: null` (uncategorized)
- **Referential Integrity**: If a category is deleted, all tasks with that `categoryId` have it set to `null`
- **Cascade Behavior**: Delete category → Set tasks' `categoryId` to `null` (preserve tasks)

```
Category (id: "abc123")
    ↑
    │ (categoryId: "abc123")
    │
Task 1 ─── Task 2 ─── Task 3
```

---

## Validation Rules

### Task Validation

| Rule ID | Field | Validation | Error Message |
|---------|-------|------------|---------------|
| VR-001 | `title` | Must be 1-200 characters | "Task title must be between 1 and 200 characters" |
| VR-002 | `title` | Must not be empty or whitespace-only | "Task title cannot be empty" |
| VR-003 | `description` | Must be 0-1000 characters | "Task description must be 1000 characters or less" |
| VR-004 | `dueDate` | If provided, must be valid date string | "Invalid due date format" |
| VR-005 | `categoryId` | If provided, must be null or valid UUID referencing existing category | "Invalid category selected" |

### Category Validation

| Rule ID | Field | Validation | Error Message |
|---------|-------|------------|---------------|
| VR-006 | `name` | Must be 1-50 characters | "Category name must be between 1 and 50 characters" |
| VR-007 | `name` | Must not be empty or whitespace-only | "Category name cannot be empty" |
| VR-008 | `name` | Must be unique across all categories (case-insensitive) | "A category with this name already exists" |
| VR-009 | `description` | Must be 0-200 characters | "Category description must be 200 characters or less" |

---

## Storage Schema

### localStorage Keys

| Key | Type | Description | Example Size |
|-----|------|-------------|--------------|
| `supertodo_tasks` | JSON Array | Serialized array of all Task objects | ~200KB for 1000 tasks |
| `supertodo_categories` | JSON Array | Serialized array of all Category objects | ~2KB for 20 categories |

### Storage Format

```javascript
// localStorage.getItem('supertodo_tasks')
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "dueDate": "2026-02-15",
    "categoryId": "a1b2c3d4-e5f6-4789-0123-456789abcdef",
    "completed": false,
    "createdAt": "2026-02-15T10:30:00.000Z"
  },
  // ... more tasks
]

// localStorage.getItem('supertodo_categories')
[
  {
    "id": "a1b2c3d4-e5f6-4789-0123-456789abcdef",
    "name": "Work",
    "description": "Tasks related to job"
  },
  // ... more categories
]
```

### Data Integrity Considerations

**For Prototype** (Current Scope):
- No concurrent tab synchronization
- No data migration versioning
- No backup/recovery mechanisms
- Basic validation only (empty checks, length limits)

**Deferred to Productionization**:
- localStorage quota exceeded handling
- JSON parse error recovery (corrupted data)
- Cross-tab synchronization via StorageEvent
- Data versioning and migration scripts
- Periodic automatic backups to local file
- Orphaned task cleanup (categoryId references non-existent category)

---

## Data Operations

### Create Operations

**Create Task**:
```javascript
function createTask({ title, description = '', dueDate = null, categoryId = null }) {
  // Validate inputs (VR-001 through VR-005)
  const task = {
    id: crypto.randomUUID(),
    title: title.trim(),
    description: description.trim(),
    dueDate,
    categoryId,
    completed: false,
    createdAt: new Date().toISOString()
  };

  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);

  return task;
}
```

**Create Category**:
```javascript
function createCategory({ name, description = '' }) {
  // Validate inputs (VR-006 through VR-009)
  const category = {
    id: crypto.randomUUID(),
    name: name.trim(),
    description: description.trim()
  };

  const categories = getCategories();

  // Check for duplicate name (VR-008)
  if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    throw new Error('A category with this name already exists');
  }

  categories.push(category);
  saveCategories(categories);

  return category;
}
```

### Read Operations

**Get All Tasks**:
```javascript
function getTasks() {
  const data = localStorage.getItem('supertodo_tasks');
  return data ? JSON.parse(data) : [];
}
```

**Get Task by ID**:
```javascript
function getTaskById(id) {
  const tasks = getTasks();
  return tasks.find(task => task.id === id) || null;
}
```

**Get Tasks by Category**:
```javascript
function getTasksByCategory(categoryId) {
  const tasks = getTasks();
  return tasks.filter(task => task.categoryId === categoryId);
}
```

**Get Tasks Grouped by Date**:
```javascript
function getTasksGroupedByDate() {
  const tasks = getTasks();
  return groupTasksByDate(tasks); // See research.md for implementation
}
```

### Update Operations

**Update Task**:
```javascript
function updateTask(id, updates) {
  // Validate updates (VR-001 through VR-005 for updated fields)
  const tasks = getTasks();
  const index = tasks.findIndex(task => task.id === id);

  if (index === -1) {
    throw new Error('Task not found');
  }

  tasks[index] = { ...tasks[index], ...updates };
  saveTasks(tasks);

  return tasks[index];
}
```

**Toggle Task Completion**:
```javascript
function toggleTaskCompletion(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);

  if (!task) {
    throw new Error('Task not found');
  }

  task.completed = !task.completed;
  saveTasks(tasks);

  return task;
}
```

**Update Category**:
```javascript
function updateCategory(id, updates) {
  // Validate updates (VR-006 through VR-009 for updated fields)
  const categories = getCategories();
  const index = categories.findIndex(category => category.id === id);

  if (index === -1) {
    throw new Error('Category not found');
  }

  // Check for duplicate name if name is being updated
  if (updates.name) {
    const duplicate = categories.find(c =>
      c.id !== id && c.name.toLowerCase() === updates.name.toLowerCase()
    );
    if (duplicate) {
      throw new Error('A category with this name already exists');
    }
  }

  categories[index] = { ...categories[index], ...updates };
  saveCategories(categories);

  return categories[index];
}
```

### Delete Operations

**Delete Task**:
```javascript
function deleteTask(id) {
  const tasks = getTasks();
  const filtered = tasks.filter(task => task.id !== id);

  if (tasks.length === filtered.length) {
    throw new Error('Task not found');
  }

  saveTasks(filtered);
}
```

**Delete Category**:
```javascript
function deleteCategory(id) {
  const categories = getCategories();
  const filtered = categories.filter(category => category.id !== id);

  if (categories.length === filtered.length) {
    throw new Error('Category not found');
  }

  // Set categoryId to null for all tasks using this category (FR-014)
  const tasks = getTasks();
  const updatedTasks = tasks.map(task =>
    task.categoryId === id ? { ...task, categoryId: null } : task
  );

  saveTasks(updatedTasks);
  saveCategories(filtered);
}
```

---

## Query Patterns

### Common Queries

**Get incomplete tasks for today**:
```javascript
const today = new Date().toISOString().split('T')[0];
const tasks = getTasks().filter(t =>
  t.dueDate === today && !t.completed
);
```

**Get all completed tasks**:
```javascript
const completedTasks = getTasks().filter(t => t.completed);
```

**Get tasks without category**:
```javascript
const uncategorizedTasks = getTasks().filter(t => t.categoryId === null);
```

**Get overdue tasks** (tasks with past due date and not completed):
```javascript
const today = new Date().toISOString().split('T')[0];
const overdueTasks = getTasks().filter(t =>
  t.dueDate && t.dueDate < today && !t.completed
);
```

**Get task count by category**:
```javascript
const categories = getCategories();
const tasks = getTasks();
const counts = categories.map(category => ({
  categoryId: category.id,
  categoryName: category.name,
  count: tasks.filter(t => t.categoryId === category.id).length
}));
```

---

## Performance Considerations

### Prototype Scale (Current Implementation)

- **Expected Dataset**: 10-50 tasks, 5-10 categories
- **Read Performance**: O(n) linear scans acceptable (<1ms for 50 tasks)
- **Write Performance**: Full array serialization acceptable (<5ms for 50 tasks)
- **Memory**: <1MB in localStorage, negligible in-memory footprint

### Production Scale (Deferred)

For 1000+ tasks, consider these optimizations:

1. **Indexing**: Build in-memory indexes by categoryId, dueDate for O(1) lookups
2. **Pagination**: Render only visible tasks, lazy-load others
3. **Virtual Scrolling**: Render only tasks in viewport
4. **Debounced Writes**: Batch localStorage updates to reduce write frequency
5. **Incremental Updates**: Update individual tasks instead of full array serialization
6. **Search Index**: Build Lunr.js or Fuse.js index for full-text search

---

**Phase 1 (Data Model) Complete**: All entities, relationships, validation rules, and operations defined. Ready for contracts and quickstart documentation.
