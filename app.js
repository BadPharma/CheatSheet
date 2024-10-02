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
    const toggleButton = document.getElementById('toggle-section-button'); // Updated toggle button
    const sectionHeader = document.getElementById('section-header');
    let modalResponse = false;
    const sections = {}; // Store sections with their colors


    
    // Function to toggle the section list visibility
    function toggleSectionList() {
        sectionList.classList.toggle('collapsed');
        toggleButton.classList.toggle('collapsed'); // Toggle triangle direction
    }

    // Function to toggle the sidebar visibility
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed'); // Toggle sidebar visibility
        configList.classList.toggle('open');
    }

    // Event listener for the toggle button
    toggleButton.addEventListener('click', toggleSectionList);

    // Optionally: Click on the section header to toggle
    sectionHeader.addEventListener('click', toggleSectionList);

    // Event listener for the sidebar tab
   
    sidebarTab.addEventListener('click', toggleSidebar);

    // Function to create a section
    function createSection(name, color) {
        if (sections[name]) {
            alert("Section already exists!");
            return;
        }
        sections[name] = { color: color, entries: [] }; // Store color with entries
        addSectionToSidebar(name, color);
    }

    // Function to add an entry to a section
    function addEntryToSection(sectionName, command, description) {
        if (sections[sectionName]) {
            sections[sectionName].entries.push({ command, description });
            createTile(sectionName, command, description, sections[sectionName].color);
        }
    }

    // Function to add section to the sidebar
    function addSectionToSidebar(name, color) {
        const li = document.createElement('li');
        li.textContent = name;
        li.style.color = color;
        sectionList.appendChild(li);

        // Event listener to bring all tiles from this section to the top
        li.addEventListener('click', () => {
            bringTilesToTop(name);
        });

        populateSectionDropdown(); // Update dropdown
    }

    // Function to bring all tiles from a section to the top
    function bringTilesToTop(sectionName) {
        const allTiles = Array.from(document.querySelectorAll('.tile'));

        // Separate tiles by section
        const sectionTiles = allTiles.filter(tile => tile.dataset.section === sectionName);
        const otherTiles = allTiles.filter(tile => tile.dataset.section !== sectionName);

        // Clear the configList (the tile grid)
        configList.innerHTML = '';

        // Append section tiles first, followed by other tiles
        sectionTiles.forEach(tile => configList.appendChild(tile));
        otherTiles.forEach(tile => configList.appendChild(tile));
    }

    // Modify the tile creation to store section name in a data attribute
    function createTile(sectionName, command, description, color) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.section = sectionName; // Store the section name in the tile
        tile.style.backgroundColor = color;
        tile.innerHTML = `
            <p>${sectionName}</p>
            <strong>${command}</strong>
            <p>${description}</p>
            <button class="edit-button">✏️</button>
            <button class="delete-button">🗑️</button>
        `;
        configList.appendChild(tile);

        // Add delete functionality
        tile.querySelector('.delete-button').addEventListener('click', () => {
            configList.removeChild(tile);
        });
        
        tile.querySelector('.edit-button').addEventListener('click', () => {
            commandInput.value = command;
            descriptionInput.value = description;
            // Optionally set section dropdown to the relevant section
            sectionSelect.value = sectionName;
            // Remove tile after editing (optional)
            configList.removeChild(tile);
        });

        // Drag-and-drop functionality
        tile.addEventListener('dragstart', () => {
            tile.classList.add('dragging');
        });

        tile.addEventListener('dragend', () => {
            tile.classList.remove('dragging');
        });
    }

    // Enable dragging within the configList
    configList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingTile = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(configList, e.clientY);
        if (afterElement == null) {
            configList.appendChild(draggingTile);
        } else {
            configList.insertBefore(draggingTile, afterElement);
        }
    });

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

    // Function to download XLSX
    function downloadXLSX() {
        const workbook = XLSX.utils.book_new();
        const data = [];

        // Prepare data for the workbook
        for (const sectionName in sections) {
            const section = sections[sectionName];

            section.entries.forEach(entry => {
                data.push([sectionName, entry.command, entry.description, section.color]);
            });
        }

        // Add headers
        data.unshift(["Section", "Command", "Description", "Color"]);

        // Create a worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cheatsheet");

        // Export the workbook
        XLSX.writeFile(workbook, "cheatsheet.xlsx");
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

    // Function to handle XLSX upload
async function handleXLSXUpload(file) {
    const userResponse = await showConfirmationDialog("Do you want to clear the current list or merge it with the uploaded file?");
    if (userResponse) {
        configList.innerHTML = ''; // Clear the current list
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        json.forEach((row, index) => {
            if (index > 0 && row.length === 4) { // Skip header
                const section = row[0];
                const command = row[1];
                const description = row[2];
                const color = row[3];

                // Create section if it doesn't exist
                if (!sections[section]) {
                    createSection(section, color);
                }

                // Add the entry to the respective section
                addEntryToSection(section, command, description);
            }
        });
    };
    reader.readAsArrayBuffer(file);
}

// Function to load template
async function loadTemplate(templateFile) {
    const userResponse = await showConfirmationDialog("Do you want to clear the current sheet or merge it with the selected template?");
    if (userResponse) {
        configList.innerHTML = ''; // Clear the current list
    }

    fetch(`${templateFile}`)
        .then(response => response.arrayBuffer()) // Read the file as binary data
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' }); // Read the binary data into XLSX
            processWorkbook(workbook); // Call your existing logic to process the workbook
        })
        .catch(error => console.error('Error loading template:', error));
}
    
    function processWorkbook(workbook) {
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
        sheetData.forEach((row, index) => {
            if (index > 0 && row.length === 4) { // Skip header
                const section = row[0];
                const command = row[1];
                const description = row[2];
                const color = row[3];
    
                // Create section if it doesn't exist
                if (!sections[section]) {
                    createSection(section, color);
                }
    
                // Add the entry to the respective section
                addEntryToSection(section, command, description);
            }
        });
    }


    // Attach event listener to the template list
    document.querySelectorAll('#template-List li').forEach(item => {
    item.addEventListener('click', () => {
        const templateFile = item.getAttribute('data-template');
        loadTemplate(templateFile);
    });
    });

    // Add event listeners
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
    });

    downloadBtn.addEventListener('click', downloadXLSX);
    uploadXlsx.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            handleXLSXUpload(file);
        }
    });


    // Populate section dropdown
    function populateSectionDropdown() {
        sectionSelect.innerHTML = '';
        for (const sectionName in sections) {
            const option = document.createElement('option');
            option.value = sectionName;
            option.textContent = sectionName;
            sectionSelect.appendChild(option);
        }
    }

    

    window.addEventListener('beforeunload', (event) => {
        const warningMessage = "Warning: Reloading the page will lose any unsaved data. Please save your configurations.";
        event.preventDefault();
        event.returnValue = warningMessage; // Chrome requires this to be set
        return warningMessage; // Some browsers will display this message
    });


});
