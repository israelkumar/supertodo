/**
 * Date Groups Utility
 * Provides utility functions for organizing tasks by date groups
 * (Today, Tomorrow, This Week, Future, Past, Unscheduled)
 */

/**
 * Groups tasks by date categories
 * @param {Array<Object>} tasks - Array of task objects
 * @returns {Object} Tasks grouped by date (today, tomorrow, thisWeek, future, past, unscheduled)
 */
export function groupTasksByDate(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const groups = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    future: [],
    past: [],
    unscheduled: []
  };

  tasks.forEach(task => {
    if (!task.dueDate) {
      groups.unscheduled.push(task);
      return;
    }

    const dueDate = new Date(task.dueDate + 'T00:00:00');
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      groups.past.push(task);
    } else if (dueDate.getTime() === today.getTime()) {
      groups.today.push(task);
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      groups.tomorrow.push(task);
    } else if (dueDate < endOfWeek) {
      groups.thisWeek.push(task);
    } else {
      groups.future.push(task);
    }
  });

  // Sort tasks within each group
  // Incomplete first, then by due date (earliest first), then by creation time (newest first)
  const sortTasks = (a, b) => {
    // Sort by completion status (incomplete tasks first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Sort by due date (earliest first) for groups with dates
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }

    // Sort by creation time (newest first) for unscheduled tasks
    return new Date(b.createdAt) - new Date(a.createdAt);
  };

  // Apply sorting to all groups
  Object.keys(groups).forEach(key => {
    groups[key].sort(sortTasks);
  });

  return groups;
}

/**
 * Gets the display name for a date group
 * @param {string} groupKey - The group key (today, tomorrow, thisWeek, etc.)
 * @returns {string} Display name for the group
 */
export function getGroupDisplayName(groupKey) {
  const displayNames = {
    today: 'Today',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    future: 'Future',
    past: 'Past',
    unscheduled: 'Unscheduled'
  };

  return displayNames[groupKey] || groupKey;
}

/**
 * Gets the sort order for date groups
 * @returns {Array<string>} Array of group keys in display order
 */
export function getGroupOrder() {
  return ['today', 'tomorrow', 'thisWeek', 'future', 'past', 'unscheduled'];
}
