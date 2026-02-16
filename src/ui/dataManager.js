/**
 * DataManagerUI - Data export/import component
 * T096, T097: Handles backup and restore functionality
 */
export class DataManagerUI {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.onExport = null; // Callback for export
    this.onImport = null; // Callback for import
  }

  /**
   * Renders the data management UI with export/import buttons
   */
  render() {
    this.container.innerHTML = `
      <div class="data-manager">
        <h3 class="data-manager__title">Backup & Restore</h3>
        <p class="data-manager__description">
          Export your data as JSON for backup, or import from a previous backup file.
        </p>

        <div class="data-manager__actions">
          <button class="data-manager__export" id="export-data" aria-label="Export data as JSON">
            📥 Export Data
          </button>

          <label class="data-manager__import-label" for="import-data">
            <input
              type="file"
              id="import-data"
              class="data-manager__import-input"
              accept=".json"
              aria-label="Import data from JSON file"
            />
            <span class="data-manager__import-button">📤 Import Data</span>
          </label>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for export/import actions
   */
  setupEventListeners() {
    const exportButton = document.getElementById('export-data');
    const importInput = document.getElementById('import-data');

    // Handle export
    if (exportButton) {
      exportButton.addEventListener('click', () => {
        if (this.onExport) {
          this.onExport();
        }
      });
    }

    // Handle import
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (this.onImport) {
              this.onImport(data);
            }
          } catch (error) {
            console.error('Failed to parse import file:', error);
            alert('Error: Invalid JSON file. Please select a valid backup file.');
          }

          // Reset input so the same file can be selected again
          importInput.value = '';
        };

        reader.onerror = () => {
          alert('Error: Failed to read file. Please try again.');
          importInput.value = '';
        };

        reader.readAsText(file);
      });
    }
  }
}
