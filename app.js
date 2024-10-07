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
    const toggleAddEntryButton = document.getElementById('toggle-add-form-button');
    const sectionHeader = document.getElementById('section-header');
    const reloadWarningModal = document.getElementById('reloadWarningModal');
    const editModal = document.getElementById('editModal');
    const editSectionSelect = document.getElementById('edit-section-select');
    const editCommandInput = document.getElementById('edit-command');
    const editDescriptionInput = document.getElementById('edit-description');
    const addEntryHeader = document.getElementById('add-entry-header');
    const addEntryButton = document.getElementById('add-entry');
    const formInputs = document.getElementById('form-inputs');
    const newSection = document.getElementById('newSection'); 
    const toggleDownUpload = document.getElementById('toggle-down-up-button');
    const downUpHeader =document.getElementById('down-up-header');
    const downUpButtons = document.getElementById('down-up-buttons');
    const templatesHeader = document.getElementById('templates-header');
    const templatesButton = document.getElementById('toggle-templates-button');
    const templateForm = document.getElementById('template-form');
    let isWarningModalVisible = false; // Flag to track modal visibility
    let modalResponse = false;
    let sections = {}; // Store sections with their colors and entries
    let currentTile = null; // Reference to the currently edited tile
     
    let draggedSectionName = null; // Variable to store the name of the dragged section

    const templates = [
        {
            category: 'Audio Editing',
            templates: [
                { name: 'Ableton Live 12 ', file: 'test_sheets/audio/al12-shortcuts-macosx.xlsx' },
                { name: 'Ableton Live 12', file: 'test_sheets/audio/al12-shortcuts-windows.xlsx' }
            ]
        },
        {
            category: 'Design Tools',
            templates: [
                { name: 'Photoshop Shortcuts', file: 'test_sheets/design/psd-shortcuts-windows.xlsx' },
                { name: 'Photoshop Shortcuts', file: 'test_sheets/design/psd-shortcuts-macosx.xlsx' },
                { name: 'Canva Shortcuts', file: 'test_sheets/design/canva.-windows.xlsx' },
                { name: 'Illustrator Shortcuts', file: 'test_sheets/design/ai-shortcuts-windows.xlsx' },
                { name: 'Illustrator Shortcuts', file: 'test_sheets/design/ai-shortcuts-macosx.xlsx' },
                { name: 'Lightroom Shortcuts', file: 'test_sheets/design/lightroom-macosx.xlsx' },
                { name: 'Lightroom Shortcuts', file: 'test_sheets/design/lightroom-windows.xlsx' }
            ]
        },
        {
            category: 'Video Editing',
            templates: [
                { name: 'Davinci Resolve', file: 'test_sheets/video/dvrosx-shortcuts-macos.xlsx' },
                { name: 'Davinci Resolve ', file: 'test_sheets/video/dvr-shortcuts-windows.xlsx' },
                { name: 'Premiere Pro', file: 'test_sheets/video/premierepro-shortcuts-macosx.xlsx' },
                { name: 'Premiere Pro', file: 'test_sheets/video/premierepro-shortcuts-windows.xlsx'},  
            ]
        },
        {
            category: 'Developer Tools',
            templates: [
                { name: 'Git', file: 'test_sheets/devtools/Git-test.xlsx' },
                { name: 'SQL', file: 'test_sheets/devtools/sql.xlsx' }
            ]
        },
        {
            category: 'Operating Systems',
            templates: [
                { name: 'Cisco OS', file: 'test_sheets/os/cisco-test.xlsx' },
                { name: 'UNIX', file: 'test_sheets/os/unix_cli.xlsx' }
            ]
        },
        {
            category: 'MS Office',
            templates: [
                { name: 'Excel Shortcuts', file: 'test_sheets/microsoft/excel-shortcuts-windows.xlsx' },
                { name: 'Excel Functions', file: 'test_sheets/microsoft/excel-functions-windows.xlsx' }
            ]
        }
        
    ];


    // Function to hide all tiles
    function hideAllTiles() {
    const tiles = document.querySelectorAll('.tile'); // Select all tiles
    tiles.forEach(tile => {
        tile.style.display = 'none'; // Hide each tile
    });
    showFeedback("All tiles hidden!", "info"); // Optional feedback
    }

// Event listener for the "Hide All Tiles" button
    document.getElementById('hide-all-tiles-btn').addEventListener('click', hideAllTiles);

    // Function to toggle the section list visibility
    function toggleSectionList() {
        sectionList.classList.toggle('collapsed');
        toggleButton.classList.toggle('collapsed'); // Toggle triangle direction
        newSection.classList.toggle('collapsed');
        }
    
    // Function to toggle the add-entry form inputs
    function toggleFormInputs() {
        formInputs.classList.toggle('collapsed');
        toggleAddEntryButton.classList.toggle('collapsed');
        addEntryButton.classList.toggle('collapsed');
        }
  // FUcntion to toggle the down-up section
    function toggleDownUp() {
        downUpButtons.classList.toggle('collapsed');
        toggleDownUpload.classList.toggle('collapsed');
    }

    function toggleTemplateSection () {
        templateForm.classList.toggle('collapsed');
        templatesButton.classList.toggle('collapsed');
    }

    function openEditModal(tile) {
        // Get the current values from the tile
        const sectionName = tile.dataset.section;
        const command = tile.querySelector('strong').textContent;
        const description = tile.querySelector('p:nth-of-type(2)').textContent;

        // Pre-fill the modal inputs with the current tile data
        editCommandInput.value = command;
        editDescriptionInput.value = description;

        // Populate the section dropdown with the current section selected
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
        if (!currentTile) {
            console.error("No tile is currently being edited.");
            return; // Exit the function early if no tile is set
        }

        const newSectionName = editSectionSelect.value;
        const newCommand = editCommandInput.value;
        const newDescription = editDescriptionInput.value;

        // Update the tile's content
        currentTile.querySelector('strong').textContent = newCommand;
        currentTile.querySelector('p:nth-of-type(2)').textContent = newDescription;

        // If the section has changed, update it
        if (currentTile.dataset.section !== newSectionName) {
            currentTile.dataset.section = newSectionName;
            currentTile.querySelector('p:nth-of-type(1)').textContent = newSectionName;
            currentTile.style.backgroundColor = sections[newSectionName].color; // Update the tile color
            bringTilesToTop(newSectionName); // Optional: Re-arrange the tiles by section
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

    addEntryHeader.addEventListener('click', toggleFormInputs);
    toggleAddEntryButton.addEventListener('click', toggleFormInputs); 
    
    downUpHeader.addEventListener('click', toggleDownUp);

    templatesHeader.addEventListener('click', toggleTemplateSection);
    

    function createSection(sectionName, color) {
        const li = document.createElement('li');
        li.style.backgroundColor = color;
        li.dataset.sectionName = sectionName; // Store the section name
        li.draggable = true; // Make the section draggable
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
    
        const sectionNameSpan = document.createElement('span');
        sectionNameSpan.textContent = sectionName;
    
        const eyeButton = document.createElement('button');
        eyeButton.textContent = '👁️';
        eyeButton.className = 'eye-button';
        eyeButton.style.cursor = 'pointer';
        eyeButton.style.background = 'none';
        eyeButton.style.border = 'none';
    
        li.appendChild(sectionNameSpan);
        li.appendChild(eyeButton);
        sectionList.appendChild(li);
        sections[sectionName] = { color: color, entries: [] }; // Store the section data
    
        // Add drag event listeners
        li.addEventListener('dragstart', handleSectionDragStart);
        li.addEventListener('dragover', handleSectionDragOver);
        li.addEventListener('drop', handleSectionDrop);
    
        // Eye button functionality
        eyeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleSectionVisibility(sectionName, eyeButton);
        });
    
        // Bring tiles to top functionality
        li.addEventListener('click', () => bringTilesToTop(sectionName));
        
        populateSectionDropdown(); // Populate the dropdown as before
    }
    
   

    function handleSectionDragStart(event) {
    draggedSectionName = event.target.dataset.sectionName; // Store the name of the dragged section
    }

    function handleSectionDragOver(event) {
    event.preventDefault(); // Allow dropping
    }

    function handleSectionDrop(event) {
    event.preventDefault(); // Prevent default behavior

    const targetSectionName = event.target.dataset.sectionName; // Get the target section name
    if (draggedSectionName && targetSectionName && draggedSectionName !== targetSectionName) {
        // Swap the section data in the sections object
        const draggedSectionData = sections[draggedSectionName];
        const targetSectionData = sections[targetSectionName];

        // Swap the section data in the object
        sections[draggedSectionName] = targetSectionData;
        sections[targetSectionName] = draggedSectionData;

        // Update the UI: swap the elements in the DOM
        const draggedSectionLi = Array.from(sectionList.children).find(li => li.dataset.sectionName === draggedSectionName);
        const targetSectionLi = Array.from(sectionList.children).find(li => li.dataset.sectionName === targetSectionName);

        // Change their order in the DOM
        sectionList.insertBefore(draggedSectionLi, targetSectionLi.nextSibling); // Place dragged after target
        sectionList.insertBefore(targetSectionLi, draggedSectionLi); // Move target before dragged
    }

    draggedSectionName = null; // Reset the dragged section name
    }



    function rebuildSectionList() {
    sectionList.innerHTML = ''; // Clear the current section list

    Object.keys(sections).forEach(sectionName => {
        createSection(sectionName, sections[sectionName].color); // Recreate each section with its color
    });
    }


    function toggleSectionVisibility(sectionName, eyeIcon) {
        const tiles = Array.from(document.querySelectorAll('.tile'));
        const sectionTiles = tiles.filter(tile => tile.dataset.section === sectionName);
    
        sectionTiles.forEach(tile => {
            if (tile.style.display === 'none') {
                tile.style.display = ''; // Show the tile
                eyeIcon.style.color = 'black'; // Change icon color to indicate visibility
            } else {
                tile.style.display = 'none'; // Hide the tile
                eyeIcon.style.color = 'gray'; // Change icon color to indicate hidden
            }
        });
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

    // Function to create a new tile
    function createTile(sectionName, command, description, color) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.section = sectionName;
        tile.style.backgroundColor = color;
    
        tile.innerHTML = `
            <p class="tile-header">${sectionName}</p>
            <strong>${command}</strong>
            <p class="description-text">${description}</p>
            <button class="edit-button">✏️</button>
            <button class="delete-button">🗑️</button>
        `;
        configList.appendChild(tile);
    
        // Delete functionality remains
        tile.querySelector('.delete-button').addEventListener('click', () => {
            configList.removeChild(tile);
            const index = sections[sectionName].entries.findIndex(e => e.command === command);
            if (index > -1) sections[sectionName].entries.splice(index, 1);
            showFeedback("Entry deleted successfully!", "error");
        });
    
        // Editing functionality remains
        tile.querySelector('.edit-button').addEventListener('click', () => {
            currentTile = tile;
            openEditModal(tile);
        });
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

    downloadBtn.addEventListener('click', downloadXLSX);

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

    function populateTemplateDropdown(templateGroups) {
        const templateSelect = document.getElementById('template-select');
        templateSelect.innerHTML = ''; // Clear existing options
    
        // Add default 'Select a Template' option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a Template';
        templateSelect.appendChild(defaultOption);
    
        // Helper function to add subcategory optgroup
        function createOptgroupWithSubcategory(templates, label) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = label; // Set the label as the subcategory (Mac/Windows)
            
            templates.forEach(template => {
                const option = document.createElement('option');
                option.value = template.file;
                option.textContent = template.name;
                optgroup.appendChild(option);
            });
    
            return optgroup;
        }
    
        // Loop through each category and its templates
        templateGroups.forEach(group => {
            const windowsTemplates = group.templates.filter(template => template.file.toLowerCase().includes('windows'));
            const macTemplates = group.templates.filter(template => template.file.toLowerCase().includes('mac'));
            const otherTemplates = group.templates.filter(template => !template.file.toLowerCase().includes('windows') && !template.file.toLowerCase().includes('mac'));
    
            // If there are Windows templates, create an optgroup for Windows
            if (windowsTemplates.length > 0) {
                const windowsOptgroup = createOptgroupWithSubcategory(windowsTemplates, `${group.category} - Windows`);
                templateSelect.appendChild(windowsOptgroup);
            }
    
            // If there are Mac templates, create an optgroup for Mac
            if (macTemplates.length > 0) {
                const macOptgroup = createOptgroupWithSubcategory(macTemplates, `${group.category} - MAC OSX`);
                templateSelect.appendChild(macOptgroup);
            }
    
            // If there are templates that don't belong to Windows or Mac, just list them under the main category
            if (otherTemplates.length > 0) {
                const otherOptgroup = createOptgroupWithSubcategory(otherTemplates, group.category);
                templateSelect.appendChild(otherOptgroup);
            }
        });
    }
    
    


    document.getElementById('load-template-btn').addEventListener('click', () => {
        const templateSelect = document.getElementById('template-select');
        const selectedTemplate = templateSelect.value;
    
        if (selectedTemplate) {
            loadTemplate(selectedTemplate); // Load the selected template
        } else {
            showFeedback("Please select a template to load.", "warning");
        }
    });
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
                modal.style.display = "none";
                resolve(true);  // Resolve with true on confirmation
            };
    
            // Cancel button
            cancelBtn.onclick = function() {
                modal.style.display = "none";
                resolve(false);  // Resolve with false on cancellation
            };
    
            // Close modal on clicking (x)
            closeModal.onclick = function() {
                modal.style.display = "none";
                resolve(false);  // Resolve with false on close
            };
    
            // Close modal on outside click
            window.onclick = function(event) {
                if (event.target === modal) {
                    modal.style.display = "none";
                    resolve(false);  // Resolve with false on outside click
                }
            };
        });
    }

    document.getElementById('add-section').addEventListener('click', () => {
        const sectionName = sectionNameInput.value.trim(); // Trim whitespace
        const sectionColor = sectionColorInput.value;
    
        if (!sectionName) {
            showFeedback("Section name cannot be empty!", "error");
            return;
        }
    
        createSection(sectionName, sectionColor);
        sectionNameInput.value = ''; // Clear input field after adding
    });

    document.getElementById('add-entry').addEventListener('click', () => {
    const selectedSection = sectionSelect.value;
    const command = commandInput.value.trim(); // Trim whitespace
    const description = descriptionInput.value.trim();

    if (!selectedSection) {
        showFeedback("Please select a section to add the entry.", "error");
        return;
    }

    if (!command || !description) {
        showFeedback("Command and description cannot be empty!", "error");
        return;
    }

    addEntryToSection(selectedSection, command, description);
    commandInput.value = '';
    descriptionInput.value = '';

    // Show feedback popup
    showFeedback("New entry added successfully!", "success");
});


uploadXlsx.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (!file) {
        showFeedback("No file selected. Please upload an XLSX file.", "error");
        return;
    }

    // Ensure the uploaded file is of type .xlsx
    if (!file.name.endsWith('.xlsx')) {
        showFeedback("Invalid file type. Please upload an XLSX file.", "error");
        return;
    }

    handleXLSXUpload(file); // Process the file
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
            event.preventDefault(); // Prevent default action
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

    // Populate the template dropdown on page load
    populateTemplateDropdown(templates);
});
