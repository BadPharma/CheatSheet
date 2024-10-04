document.addEventListener('DOMContentLoaded', () => {
    const sectionList = document.getElementById('section-list');
    const sectionSelect = document.getElementById('section-select');
    const commandInput = document.getElementById('command');
    const descriptionInput = document.getElementById('description');
    const sectionNameInput = document.getElementById('section-name');
    const sectionColorInput = document.getElementById('section-color');
    const configList = document.getElementById('config-list');
    const downloadBtn = document.getElementById('download-btn');
    const uploadXlsx = document.getElementById('upload-xlsx');
    const sidebar = document.getElementById('sidebar');
    const sidebarTab = document.getElementById('sidebar-tab');
    const toggleButton = document.getElementById('toggle-section-button');
    const sectionHeader = document.getElementById('section-header');
    const reloadWarningModal = document.getElementById('reloadWarningModal');
    const editModal = document.getElementById('editModal');
    const editSectionSelect = document.getElementById('edit-section-select');
    const editCommandInput = document.getElementById('edit-command');
    const editDescriptionInput = document.getElementById('edit-description');
    let isWarningModalVisible = false; // Flag to track modal visibility
    let modalResponse = false;
    let sections = {}; // Store sections with their colors and entries
    let currentTile = null; // Reference to the currently edited tile

    // Function to toggle the section list visibility
    function toggleSectionList() {
        sectionList.classList.toggle('collapsed');
        toggleButton.classList.toggle('collapsed'); // Toggle triangle direction
    }

    // Function to open the modal for editing a tile
    function openEditModal(tile, sectionName, command, description) {
        currentTile = tile; // Store reference to the tile being edited

        // Pre-fill modal fields with the current tile data
        editCommandInput.value = command;
        editDescriptionInput.value = description;

        // Populate the section dropdown and set the current section
        editSectionSelect.innerHTML = ''; // Clear the dropdown
        for (const section in sections) {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            if (section === sectionName) {
                option.selected = true;
            }
            editSectionSelect.appendChild(option);
        }

        // Show the modal
        editModal.style.display = 'block';
    }

    // Function to save the edits made in the modal
    document.getElementById('save-edit-btn').onclick = function () {
        const newSectionName = editSectionSelect.value;
        const newCommand = editCommandInput.value;
        const newDescription = editDescriptionInput.value;

        // Update the tile's content
        currentTile.querySelector('strong').textContent = newCommand;
        currentTile.querySelector('p:nth-of-type(2)').textContent = newDescription;

        // If the section was changed, update the tile's section data and color
        if (currentTile.dataset.section !== newSectionName) {
            currentTile.dataset.section = newSectionName;
            currentTile.querySelector('p:nth-of-type(1)').textContent = newSectionName;
            currentTile.style.backgroundColor = sections[newSectionName].color;
            configList.removeChild(currentTile);
            bringTilesToTop(newSectionName);
            configList.appendChild(currentTile);
        }

        // Close the modal after saving
        editModal.style.display = 'none';
    };

    // Close the modal when the user clicks the 'x'
    document.getElementById('closeEditModal').onclick = function () {
        editModal.style.display = 'none';
    };

    // Function to show the feedback popup
    function showFeedback(message, type = 'success') {
        const feedbackPopup = document.getElementById('feedback-popup');
        const feedbackMessage = document.getElementById('feedback-message');

        // Set the feedback message and style based on type
        feedbackMessage.textContent = message;
        feedbackPopup.className = 'feedback-popup show'; // Reset classes
        if (type) feedbackPopup.classList.add(type); // Add feedback type (success, error, etc.)

        // Auto-close after 3 seconds
        setTimeout(() => {
            feedbackPopup.classList.remove('show');
        }, 3000);
    }

    // Function to toggle the sidebar visibility
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        configList.classList.toggle('open');
    }

    // Event listeners for toggling sidebar and sections
    toggleButton.addEventListener('click', toggleSectionList);
    sectionHeader.addEventListener('click', toggleSectionList);
    sidebarTab.addEventListener('click', toggleSidebar);

    // Function to create a new section
    function createSection(sectionName, color) {
        const li = document.createElement('li');
        li.textContent = sectionName;
        li.style.backgroundColor = color;
        sectionList.appendChild(li);
        sections[sectionName] = { color: color, entries: [] };

        li.addEventListener('click', () => bringTilesToTop(sectionName));
        populateSectionDropdown();
    }

    // Function to add an entry to a section
    function addEntryToSection(sectionName, command, description) {
        if (sections[sectionName]) {
            sections[sectionName].entries.push({ command, description });
            createTile(sectionName, command, description, sections[sectionName].color);
        }
    }

    // Function to bring all tiles of a section to the top
    function bringTilesToTop(sectionName) {
        const allTiles = Array.from(document.querySelectorAll('.tile'));
        const sectionTiles = allTiles.filter(tile => tile.dataset.section === sectionName);
        const otherTiles = allTiles.filter(tile => tile.dataset.section !== sectionName);
        configList.innerHTML = '';
        sectionTiles.forEach(tile => configList.appendChild(tile));
        otherTiles.forEach(tile => configList.appendChild(tile));
    }

    // Drag-and-drop functionality
    function enableDragAndDrop() {
        let draggedTile = null;

        document.querySelectorAll('.tile').forEach(tile => {
            tile.setAttribute('draggable', 'true');

            tile.addEventListener('dragstart', function () {
                draggedTile = tile;
                tile.classList.add('dragging');
            });

            tile.addEventListener('dragend', function () {
                draggedTile = null;
                tile.classList.remove('dragging');
            });
        });

        configList.addEventListener('dragover', function (e) {
            e.preventDefault();
            const afterElement = getDragAfterElement(configList, e.clientY);
            if (afterElement == null) {
                configList.appendChild(draggedTile);
            } else {
                configList.insertBefore(draggedTile, afterElement);
            }
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.tile:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Function to create a new tile
    function createTile(sectionName, command, description, color) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.section = sectionName;
        tile.style.backgroundColor = color;
        tile.innerHTML = `
            <p>${sectionName}</p>
            <strong>${command}</strong>
            <p>${description}</p>
            <button class="edit-button">✏️</button>
            <button class="delete-button">🗑️</button>
        `;
        configList.appendChild(tile);

        // Delete functionality
        tile.querySelector('.delete-button').addEventListener('click', () => {
            configList.removeChild(tile);
            showFeedback("Entry deleted successfully!", "error");
        });

        // Open the modal to edit the tile
        tile.querySelector('.edit-button').addEventListener('click', () => {
            openEditModal(tile, sectionName, command, description);
        });

        enableDragAndDrop(); // Ensure new tiles are draggable
    }

    // Function to download XLSX
    function downloadXLSX() {
        const workbook = XLSX.utils.book_new();
        const data = [];

        for (const sectionName in sections) {
            const section = sections[sectionName];
            section.entries.forEach(entry => {
                data.push([sectionName, entry.command, entry.description, section.color]);
            });
        }

        data.unshift(["Section", "Command", "Description", "Color"]);
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cheatsheet");
        XLSX.writeFile(workbook, "cheatsheet.xlsx");
    }

    // Function to handle XLSX upload
    async function handleXLSXUpload(file) {
        const userResponse = await showConfirmationDialog("Do you want to clear the current list or merge it with the uploaded file?");
        
        if (userResponse) {
            configList.innerHTML = '';
            sectionList.innerHTML = '';
            sections = {};
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            processWorkbook(workbook);
        };
        reader.readAsArrayBuffer(file);
    }

    // Function to process the uploaded workbook
    function processWorkbook(workbook) {
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        sheetData.forEach((row, index) => {
            if (index > 0 && row.length === 4) {
                const section = row[0];
                const command = row[1];
                const description = row[2];
                const color = row[3];

                if (!sections[section]) {
                    createSection(section, color);
                }
                addEntryToSection(section, command, description);
            }
        });
    }

    // Example function to load templates into the dropdown
    function populateTemplateDropdown(templates) {
        const templateSelect = document.getElementById('template-select');
        templateSelect.innerHTML = ''; // Clear any existing options

        // Add a default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a Template';
        templateSelect.appendChild(defaultOption);

        // Populate the dropdown with template options
        templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.file; // Assuming `file` is the path to the template
            option.textContent = template.name; // Assuming `name` is the display name
            templateSelect.appendChild(option);
        });
    }

    // Sample templates array (you can modify this based on your actual template data)
    const templates = [
        { name: 'Photoshop Shortcuts', file: 'test_sheets/psd-shortcuts.xlsx' },
        { name: 'Cisco OS', file: 'test_sheets/cisco-test.xlsx' },
        { name: 'Git Bash', file: 'test_sheets/Git-test.xlsx' },
        { name: 'UNIX', file: 'test_sheets/unix_cli.xlsx' },
        { name: 'Excel Shortcuts', file: 'test_sheets/excel-shortcuts.xlsx' },
        { name: 'SQL', file: 'test_sheets/sql.xlsx' },
    ];

    // Event listener for template loading button
    document.getElementById('load-template-btn').addEventListener('click', () => {
        const templateSelect = document.getElementById('template-select');
        const selectedTemplate = templateSelect.value;

        if (selectedTemplate) {
            loadTemplate(selectedTemplate); // This function should already exist in your code
        } else {
            showFeedback("Please select a template to load.", "warning");
        }
    });

    // Function to load template
    async function loadTemplate(templateFile) {
        const userResponse = await showConfirmationDialog("Do you want to clear the current sheet or merge it with the selected template?");
        
        if (userResponse) {
            configList.innerHTML = '';
            sectionList.innerHTML = '';
            sections = {};
        }

        try {
            const response = await fetch(templateFile);
            const data = await response.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            processWorkbook(workbook);
        } catch (error) {
            console.error('Error loading template:', error);
        }
    }

    // Function to show custom confirmation dialog
    function showConfirmationDialog(message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('customModal');
            const modalMessage = document.getElementById('modalMessage');
            const confirmBtn = document.getElementById('confirmBtn');
            const cancelBtn = document.getElementById('cancelBtn');
            const closeModal = document.getElementById('closeModal');

            // Set the modal message
            modalMessage.textContent = message;
            modal.style.display = "block";

            // Confirm button
            confirmBtn.onclick = function() {
                modalResponse = true;
                modal.style.display = "none";
                resolve(modalResponse);
            };

            // Cancel button
            cancelBtn.onclick = function() {
                modalResponse = false;
                modal.style.display = "none";
                resolve(modalResponse);
            };

            // Close modal on clicking (x)
            closeModal.onclick = function() {
                modalResponse = false;
                modal.style.display = "none";
                resolve(modalResponse);
            };

            // Close modal on outside click
            window.onclick = function(event) {
                if (event.target === modal) {
                    modalResponse = false;
                    modal.style.display = "none";
                    resolve(modalResponse);
                }
            };
        });
    }

    // Event listeners for buttons
    document.getElementById('add-section').addEventListener('click', () => {
        const sectionName = sectionNameInput.value;
        const sectionColor = sectionColorInput.value;
        createSection(sectionName, sectionColor);
        sectionNameInput.value = '';
    });

    document.getElementById('add-entry').addEventListener('click', () => {
        const selectedSection = sectionSelect.value;
        const command = commandInput.value;
        const description = descriptionInput.value;

        addEntryToSection(selectedSection, command, description);
        commandInput.value = '';
        descriptionInput.value = '';

        // Show feedback popup
        showFeedback("New entry added successfully!", "success");
    });

    // Event listener for XLSX file uploads
    uploadXlsx.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            handleXLSXUpload(file);
        }
    });

    // Populate the section dropdown
    function populateSectionDropdown() {
        sectionSelect.innerHTML = '';
        for (const sectionName in sections) {
            const option = document.createElement('option');
            option.value = sectionName;
            option.textContent = sectionName;
            sectionSelect.appendChild(option);
        }
    }

    // Function to show the reload warning modal
    function showReloadWarning() {
        reloadWarningModal.style.display = 'block';
        isWarningModalVisible = true; // Set the flag to true
    }

    // Event listener for the leave button (proceed with reload)
    document.getElementById('leave-button').addEventListener('click', () => {
        reloadWarningModal.style.display = 'none';
        window.location.reload(); // Proceed with the reload
    });

    // Event listener for the stay button (cancel reload)
    document.getElementById('stay-button').addEventListener('click', () => {
        reloadWarningModal.style.display = 'none'; // Close the modal
        isWarningModalVisible = false; // Reset the flag
    });

    // Close the modal when the user clicks the 'x'
    document.getElementById('closeReloadWarningModal').onclick = function () {
        reloadWarningModal.style.display = 'none';
        isWarningModalVisible = false; // Reset the flag
    };

    // Prevent the default reload behavior
    window.addEventListener('beforeunload', (event) => {
        if (!isWarningModalVisible) {
            showReloadWarning(); // Show the custom modal
            // Prevent default action and show confirmation dialog
            event.preventDefault(); // Prevent default action
            event.returnValue = ''; // Chrome requires this
        }
    });

    // Function to clear the entire sheet
    function clearSheet() {
        const confirmation = confirm("Are you sure you want to clear the entire sheet?");
        if (confirmation) {
            configList.innerHTML = ''; // Clear the tile grid
            sectionList.innerHTML = ''; // Clear the section list
            sections = {}; // Reset the sections object
            populateSectionDropdown(); // Refresh the dropdown
        }
    }

    // Attach the clear sheet function to the button
    document.getElementById('clear-sheet-btn').addEventListener('click', clearSheet);

    // Enable drag-and-drop on page load
    enableDragAndDrop();

    // Populate the template dropdown on page load
    populateTemplateDropdown(templates);

});
