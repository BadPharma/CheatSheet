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
    let sections = {}; // Store sections with their colors and entries
    let currentTile = null; // Reference to the currently edited tile
    let draggedSectionName = null; // Variable to store the name of the dragged section

    // Function to sanitize user input
    function sanitizeInput(input) {
        return DOMPurify.sanitize(input);
    }
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip); // Append tooltip to the body

    const elements = document.querySelectorAll('[data-step]');
    let currentStep = 1;
    let tourRunning = true; // Track whether the tour is currently running

    // Check if the tour has already been completed
    if (localStorage.getItem('tourCompleted')) {
        tourRunning = false; // Prevent the tour from running if completed
    }


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
                { name: 'Lightroom Shortcuts', file: 'test_sheets/design/lightroom-windows.xlsx' },
                { name: 'Unreal Engine Shortcuts', file: 'test_sheets/design/ue-shortcuts-windows.xlsx' },
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
                { name: 'SQL', file: 'test_sheets/devtools/sql.xlsx' },
                { name: 'CSS', file: 'test_sheets/devtools/css.xlsx' },
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
                { name: 'Excel Functions', file: 'test_sheets/microsoft/excel-functions-windows.xlsx' },
                { name: 'Word Shortcuts', file: 'test_sheets/microsoft/word-shortcuts-windows..xlsx' }
            ]
        }
        
    ];


          // Function to show tooltip
    function showTooltip(element) {
        const introText = element.getAttribute('data-intro');
        const rect = element.getBoundingClientRect();
        const sidebarWidth = sidebar.offsetWidth;

        tooltip.innerHTML = introText;
        tooltip.style.display = 'block';
        tooltip.style.left = `${sidebarWidth + 20}px`; // Position to the right of sidebar
        tooltip.style.top = `${rect.top + window.scrollY}px`; // Align vertically with the element
    }

    // Function to highlight the current step
    function highlightElement(step) {
        elements.forEach(el => el.classList.remove('highlight')); // Remove previous highlights
        const currentElement = document.querySelector(`[data-step="${step + 1}"]`);
        if (currentElement) {
            currentElement.classList.add('highlight'); // Highlight current element
            showTooltip(currentElement); // Show tooltip
        }
    }

    // Function to proceed to the next step
    function nextStep() {
        if (tourRunning && currentStep < elements.length) {
            highlightElement(currentStep);
            currentStep++;
        } else if (tourRunning && currentStep >= elements.length) {
            endTour(); // End the tour when all steps are completed
        }
    }

    // Function to end the tour
    function endTour() {
        tooltip.style.display = 'none'; // Hide tooltip
        elements.forEach(el => el.classList.remove('highlight')); // Remove all highlights
        localStorage.setItem('tourCompleted', 'true'); // Mark tour as completed
        tourRunning = false; // Stop the tour from running again
        currentStep = 0; // Reset steps for future use (if needed)
    }

    // Start the tour on page load, only if it hasn't already been completed
    if (tourRunning) {
        nextStep();
    }

    // Click event to proceed to the next step
    document.addEventListener('click', () => {
        if (tourRunning) {
            tooltip.style.display = 'none'; // Hide tooltip
            nextStep(); // Go to the next step
        }
    });

    // Stop tour when the user presses Enter
    document.addEventListener('keydown', (e) => {
        if (tourRunning && e.key === 'Escape' ) {
            endTour(); // End the tour when Enter is pressed
        }
    });

    // SVG's 
    // Function to create the pencil (edit) SVG
    function createPencilSvg() {
        const pencilSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        pencilSvg.setAttribute("viewBox", "-20 -20 117.16 123.49");
        pencilSvg.setAttribute("width", "25");
        pencilSvg.setAttribute("height", "25");

        const paths = [
            { class: "cls-1", d: "M1.71,80.23l17.94-3.11c.58-.1.84-.79.47-1.25l-11.31-14.04c-.62-.78-1.85-.58-2.2.36L.45,78.71c-.31.83.4,1.68,1.27,1.53Z" },
            { class: "cls-2", d: "M65.5,11.75l13.35,16.57-54.06,45.27c-.91.76-2.26.63-3.01-.3l-10.24-12.71c-.97-1.2-.79-2.97.38-3.95L65.5,11.75Z" },
            { class: "cls-2", d: "M70.48,8.72l12.45,15.46c.25.31.2.76-.11,1.02l-1.37,1.15c-.31.26-.75.21-1-.09l-12.45-15.46c-.25-.31-.2-.76.11-1.02l1.37-1.15c.31-.26.75-.21,1,.09Z" },
            { class: "cls-2", d: "M81.73,1.22c1.95,1.38,1.83,3.12,3.74,6.52,1.53,2.73,2.29,4.09,3.75,4.71.58.24,2.07.74,3.4,1.74.26.2.96.74.92,1.34-.03.36-.24.7-.24.7-.08.13-.18.24-.31.35l-7.42,6.21c-.2.16-.49.14-.65-.06l-12.76-15.84c1.42-1.32,7.08-6.59,7.18-6.62.04-.01.08-.02.08-.02.03,0,.07,0,.1,0,.54.12,1.37.38,2.21.97Z" }
        ];

        paths.forEach(({ class: cls, d }) => {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("class", cls);
            path.setAttribute("d", d);
            pencilSvg.appendChild(path);
        });

        return pencilSvg;
    }


    function createCopySvg() {
        const copySvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        copySvg.setAttribute("viewBox", "0 0 454 625");
        copySvg.setAttribute("width", "25");
        copySvg.setAttribute("height", "25");
        
        const paths = [
            { d: "M557.54,146H277.72A55.72,55.72,0,0,0,222,201.72V681.28A56,56,0,0,0,223.46,694h-2.74A55.72,55.72,0,0,1,165,638.28V158.72A55.72,55.72,0,0,1,220.72,103H503.28A55.76,55.76,0,0,1,557.54,146Z", transform: "translate(-165 -103)" }
        ];
        
        const rects = [
            { x: "72", y: "56", width: "382", height: "569", rx: "55.72" }
        ];
        
        paths.forEach(({ d, transform }) => {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", d);
            if (transform) path.setAttribute("transform", transform);
            copySvg.appendChild(path);
        });
        
        rects.forEach(({ x, y, width, height, rx }) => {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", x);
            rect.setAttribute("y", y);
            rect.setAttribute("width", width);
            rect.setAttribute("height", height);
            rect.setAttribute("rx", rx);
            copySvg.appendChild(rect);
        });
        
        return copySvg;
    }
    
    

    // Function to create the eye SVG
    function createEyeSvg() {
        const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgIcon.setAttribute("viewBox", "0 0 93 50.77");
        svgIcon.setAttribute("width", "24");
        svgIcon.setAttribute("height", "24");

        const paths = [
            { d: "M0,24.88C9.8,9.24,27.81-.28,47.08,0c30.17.44,45.28,24.67,45.92,25.73-.71,1.14-16.08,24.86-45.92,25.03-19.46.11-37.53-9.84-47.08-25.88ZM46.5,9.06c-9.02,0-16.33,7.31-16.33,16.33s7.31,16.33,16.33,16.33,16.33-7.31,16.33-16.33-7.31-16.33-16.33-16.33Z" },
            { d: "M56.06,25.38c0-5.28-4.28-9.56-9.56-9.56s-9.56,4.28-9.56,9.56,4.28,9.56,9.56,9.56c1.79,0,3.47-.49,4.9-1.35-.82-.16-1.44-.89-1.44-1.76,0-.99.8-1.8,1.79-1.8s1.8.81,1.8,1.8h0c1.56-1.69,2.51-3.96,2.51-6.45Z" }
        ];

        paths.forEach(({ d }) => {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", d);
            svgIcon.appendChild(path);
        });

        return svgIcon;
    }




    // Function to hide all tiles and gray out the eye buttons
    function hideAllTiles() {
            const tiles = document.querySelectorAll('.tile'); // Select all tiles
            const eyeButtons = document.querySelectorAll('.eye-button'); // Select all eye buttons
            
            // Hide each tile
            tiles.forEach(tile => {
                tile.style.display = 'none'; // Hide each tile
            });
            
            // Gray out each eye button to indicate hidden state
            eyeButtons.forEach(eyeButton => {
                eyeButton.style.fill = 'gray'; // Gray out the eye button
            });

            showFeedback("All tiles hidden!", "info"); // Optional feedback
       }

// Event listener for the "Hide All Tiles" button
    document.getElementById('hide-all-tiles-btn').addEventListener('click', hideAllTiles);

    function createSection(sectionName, color) {
        const li = document.createElement('li');
        li.style.backgroundColor = sanitizeInput(color);
        li.dataset.sectionName = sanitizeInput(sectionName); // Store the section name
        li.draggable = true; // Make the section draggable
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        
        // Create a span for the section name
        const sectionNameSpan = document.createElement('span');
        sectionNameSpan.textContent = sanitizeInput(sectionName);
    
        // Create a container to hold the section title
        const titleContainer = document.createElement('div');
        titleContainer.className = 'title-container';
        titleContainer.style.display = 'flex';
        titleContainer.style.alignItems = 'center';
        titleContainer.style.marginLeft = '18px';
        
        // Append the section name to the title container
        titleContainer.appendChild(sectionNameSpan);
        
        // Create a container for the action buttons (eye and pencil)
        const actionsContainer = document.createElement('div');
        actionsContainer.style.display = 'flex';
        actionsContainer.style.alignItems = 'center';
        
        // Create the SVG for the pencil (edit) button
        const pencilButton = document.createElement('button');
        pencilButton.className = 'edit-button';
        pencilButton.style.background = 'none';
        pencilButton.style.border = 'none';
        pencilButton.style.cursor = 'pointer';
        pencilButton.appendChild(createPencilSvg());
        
        // Create the eye button for toggling section visibility
        const eyeButton = document.createElement('button');
        eyeButton.className = 'eye-button';
        eyeButton.style.cursor = 'pointer';
        eyeButton.style.background = 'none';
        eyeButton.style.border = 'none';
        eyeButton.appendChild(createEyeSvg());
        
        // Append both the eye and pencil buttons to the actions container
        actionsContainer.appendChild(eyeButton);
        actionsContainer.appendChild(pencilButton);
        
        // Add the title and action buttons to the section
        li.appendChild(titleContainer);
        li.appendChild(actionsContainer);
        
        // Append the section to the section list
        sectionList.appendChild(li);
        
        // Store the section data
        sections[sanitizeInput(sectionName)] = { color: color, entries: [] };
        
        // Add drag event listeners
        li.addEventListener('dragstart', handleSectionDragStart);
        li.addEventListener('dragover', handleSectionDragOver);
        li.addEventListener('drop', handleSectionDrop);
        
        // Eye button functionality for toggling visibility
        eyeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleSectionVisibility(sectionName, eyeButton);
        });
        
        // Pencil button functionality for editing section name
        pencilButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering the 'bring to top' click event
            editSectionTitle(sectionNameSpan, li);
        });
        
        // Bring tiles to top functionality
        li.addEventListener('click', () => bringTilesToTop(sectionName));
        
        // Update dropdown menu
        populateSectionDropdown();
    }

    
        // Function to create a new tile with pencil and trash can icons
    function createTile(sectionName, command, description, color) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.section = sanitizeInput(sectionName);
        tile.style.backgroundColor = sanitizeInput(color);
    
        tile.innerHTML = `
            <p class="tile-header">${sanitizeInput(sectionName)}</p>
            <strong>${sanitizeInput(command)}</strong>
            <p class="description-text">${sanitizeInput(description)}</p>
        `;
    

        // Create the copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.style.background = 'none';
        copyButton.style.border = 'none';
        copyButton.style.cursor = 'pointer';
        copyButton.appendChild(createCopySvg());
        tile.appendChild(copyButton);

        // Add event listener to copy the command to clipboard
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(description);
            showFeedback("Description copied to clipboard!", "success");
        });


        // Create the SVG for the trash can
        const trashButton = document.createElement('button');
        trashButton.className = 'delete-button';
        trashButton.style.background = 'none';
        trashButton.style.border = 'none';
        trashButton.style.cursor = 'pointer';
    
        const trashSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        trashSvg.setAttribute("viewBox", "-20 -20 117.16 123.49");
        trashSvg.setAttribute("width", "25");
        trashSvg.setAttribute("height", "25");
    
        // Create the rectangle part of the trash can
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("class", "cls-1");
        rect.setAttribute("x", "2.5");
        rect.setAttribute("y", "10.4");
        rect.setAttribute("width", "72.16");
        rect.setAttribute("height", "4.78");
        rect.setAttribute("rx", ".49");
        rect.setAttribute("ry", ".49");
        trashSvg.appendChild(rect);
    
        // Create the top part of the trash can
        const topPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        topPath.setAttribute("class", "cls-3");
        topPath.setAttribute("d", "M45.76,11.06c.49-4.57-3.04-8.44-7.07-8.56-4.18-.12-8,3.82-7.51,8.56h14.58Z");
        trashSvg.appendChild(topPath);
    
        // Create the main body of the trash can
        const bodyPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        bodyPath.setAttribute("class", "cls-2");
        bodyPath.setAttribute("d", "M72.55,15.19l-12.17,64.57c-.15.8-.57,1.48-1.16,1.97-.9.74-1.88.78-2.15.78-6.18.48-12.85.76-19.95.74-6.52-.02-12.66-.29-18.4-.74-1.58,0-2.93-1.15-3.18-2.71L5.14,15.19h67.41ZM40.34,73.28V26.19c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5,1.5v47.09c0,.83.67,1.5,1.5,1.5s1.5-.67,1.5-1.5ZM53.43,73.46l6.47-46.85c.11-.82-.46-1.58-1.28-1.69-.82-.12-1.58.46-1.69,1.28l-6.47,46.85c-.11.82.46,1.58,1.28,1.69.07,0,.14.01.21.01.74,0,1.38-.54,1.48-1.29ZM24.91,74.76c.82-.09,1.42-.83,1.33-1.65l-5.01-46.95c-.09-.82-.82-1.41-1.65-1.33-.82.09-1.42.83-1.33,1.65l5.01,46.95c.08.77.73,1.34,1.49,1.34.05,0,.11,0,.16,0Z");
        trashSvg.appendChild(bodyPath);
    
        trashButton.appendChild(trashSvg);
        tile.appendChild(trashButton);
    
        // Create the SVG for the pencil (edit) button
        const pencilButton = document.createElement('button');
        pencilButton.className = 'edit-button';
        pencilButton.style.background = 'none';
        pencilButton.style.border = 'none';
        pencilButton.style.cursor = 'pointer';  
        pencilButton.appendChild(createPencilSvg());
        tile.appendChild(pencilButton);
    
        // Edit functionality remains the same
        pencilButton.addEventListener('click', () => {
            currentTile = tile;
            openEditModal(tile);
        });
    
        // Delete functionality
        trashButton.addEventListener('click', () => {
            configList.removeChild(tile);
            const index = sections[sectionName].entries.findIndex(e => e.command === command);
            if (index > -1) sections[sectionName].entries.splice(index, 1);
            showFeedback("Entry deleted successfully!", "error");
        });
    
        configList.appendChild(tile);
    }
    
    
    function updateSection(oldName, newName, newColor) {
            if (newName !== oldName) {
                sections[newName] = { ...sections[oldName], color: newColor };
                delete sections[oldName];
            } else {
                sections[oldName].color = newColor;
            }
        
            const li = document.querySelector(`li[data-section-name='${oldName}']`);
            if (li) {
                li.dataset.sectionName = sanitizeInput(newName);
                li.style.backgroundColor = newColor;
                const sectionNameSpan = li.querySelector('span');
                sectionNameSpan.textContent = newName;
            }
        
            // Update all the tiles associated with the section
            const tiles = document.querySelectorAll(`[data-section='${oldName}']`);
            tiles.forEach((tile) => {
                tile.dataset.section = newName;
                tile.style.backgroundColor = newColor;
                const tileHeader = tile.querySelector('.tile-header');
                if (tileHeader) tileHeader.textContent = newName; // Update the tile header with the new section name
            });
        
            // Rebind event listeners to updated sections
            const eyeButton = li.querySelector('.eye-button');
            const pencilButton = li.querySelector('.edit-button');
            
            // Reattach event listeners for the eye and pencil buttons
            eyeButton.onclick = (event) => {
                event.stopPropagation();
                toggleSectionVisibility(newName, eyeButton);
            };
            pencilButton.onclick = (event) => {
                event.stopPropagation();
                editSectionTitle(sectionNameSpan, li);
            };
        
            // Update the dropdown and provide feedback
            populateSectionDropdown();
    }
        
    function editSectionTitle(sectionNameSpan, li) {
            const currentName = sectionNameSpan.textContent.trim();
            const modal = document.getElementById('editSectionModal');
            const sectionTitleInput = document.getElementById('sectionTitleInput');
            const editSectionColorInput = document.getElementById('editSectionColorInput');
            const saveButton = document.getElementById('saveSectionTitleBtn');
            const closeModal = document.getElementById('closeEditSectionModal');
            const colorDisplay = document.getElementById('editColorDisplay'); // Color preview span
        
            // Extract initial color from section or default to white
            const initialColor = sections[currentName]?.color || '#FFFFFF';
        
            // Set initial modal values
            sectionTitleInput.value = currentName;
            editSectionColorInput.value = initialColor;
            colorDisplay.style.backgroundColor = initialColor;
        
            // Open the modal
            modal.style.display = 'block';
        
            // Update the color preview on input change
            editSectionColorInput.addEventListener('input', (event) => {
                colorDisplay.style.backgroundColor = event.target.value;
            });
        
            // Close modal when clicking the 'X'
            closeModal.onclick = function () {
                modal.style.display = 'none';
            };
        
            // Close modal when clicking outside the modal content
            window.onclick = function (event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };
        
            // Save changes when the save button is clicked
            saveButton.onclick = function () {
                const newName = sanitizeInput(sectionTitleInput.value.trim());
                const newColor = editSectionColorInput.value;
        
                if (!newName) {
                    showFeedback("Category title cannot be empty!", "error");
                    return;
                }
        
                if (newName !== currentName || newColor !== initialColor) {
                    // If the name is changed, update the name and associated tiles
                    updateSection(currentName, newName, newColor);
                    
                    // Provide feedback
                    showFeedback("Category updated successfully!", "success");
                }
        
                modal.style.display = 'none'; // Close the modal
            };
    }
        
    function openEditModal(tile) {
            // Get the current values from the tile
            const sectionName = sanitizeInput(tile.dataset.section);
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
    document.getElementById('save-edit-btn').onclick = function () {[]
        if (!currentTile) {
            console.error("No tile is currently being edited.");
            return; // Exit the function early if no tile is set
        }

        const newSectionName = editSectionSelect.value;
        const newCommand = sanitizeInput(editCommandInput.value);
        const newDescription = sanitizeInput(editDescriptionInput.value);

        // Update the tile's content
        currentTile.querySelector('strong').textContent = newCommand;
        currentTile.querySelector('p:nth-of-type(2)').textContent = newDescription; // Update newDescription;

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





    function toggleSectionVisibility(sectionName, eyeIcon) {
        const tiles = Array.from(document.querySelectorAll('.tile'));
        const sectionTiles = tiles.filter(tile => tile.dataset.section === sectionName);
    
        sectionTiles.forEach(tile => {
            if (tile.style.display === 'none') {
                tile.style.display = ''; // Show the tile
                eyeIcon.style.fill = 'black'; // Change icon color to indicate visibility
            } else {
                tile.style.display = 'none'; // Hide the tile
                eyeIcon.style.fill = 'gray'; // Change icon color to indicate hidden
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
        // Validate file type (only .xlsx allowed)
        if (!file.name.endsWith('.xlsx')) {
            showFeedback("Invalid file type. Please upload an XLSX file.", "error");
            return;
        }
    
        // Limit file size (e.g., 5MB limit)
        const MAX_FILE_SIZE_MB = 5;
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            showFeedback(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`, "error");
            return;
        }
    
        // Show confirmation dialog to user
        const userResponse = await showConfirmationDialog("Do you want to clear the current list or merge it with the uploaded file?");
        
        if (userResponse) {
            // Clear existing list if user confirms
            configList.innerHTML = '';
            sectionList.innerHTML = '';
            sections = {};
        }
    
        // Read the file securely
        const reader = new FileReader();
        
        reader.onerror = () => {
            showFeedback("Error reading the file. Please try again.", "error");
        };
    
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
    
                // Validate workbook structure (optional, depends on your file format)
                if (!workbook || !workbook.SheetNames.length) {
                    throw new Error("Invalid XLSX structure.");
                }
    
                processWorkbook(workbook);  // Process the workbook data
            } catch (error) {
                showFeedback(`Failed to process file: ${error.message}`, "error");
            }
        };
    
        // Safely read the file as an ArrayBuffer
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
                const section = sanitizeInput(row[0]); // Sanitize input for section row[0];
                const command = sanitizeInput(row[1]); // Sanitize input for row[1];
                const description = sanitizeInput(row[2]); // Sanitize input for row[2];
                const color = sanitizeInput(row[3]); // Sanitize input for row[3];

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

    document.getElementById('section-color').addEventListener('input', (event) => {
        // Get the selected color
        const selectedColor = event.target.value;
    
        // Update the color display span's background color to show the sselected color
        const colorDisplay = document.querySelector('.color-display');
        colorDisplay.style.backgroundColor = selectedColor;
    });
    
    document.getElementById('add-section').addEventListener('click', () => {
        const sectionNameInput = document.getElementById('section-name');
        const sectionColorInput = document.getElementById('section-color');
        
        const sectionName = sanitizeInput(sectionNameInput.value.trim()); // Trim whitespace
        const sectionColor = sectionColorInput.value;
    
        // Show the selected color in the color preview span
        const colorDisplay = document.querySelector('.color-display'); 
        colorDisplay.style.backgroundColor = sectionColor; // Update the preview with the selected color
        
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

    // Event listeners for toggling sidebar and sections
    toggleButton.addEventListener('click', toggleSectionList);
    sectionHeader.addEventListener('click', toggleSectionList);

    sidebarTab.addEventListener('click', toggleSidebar);

    addEntryHeader.addEventListener('click', toggleFormInputs);
    toggleAddEntryButton.addEventListener('click', toggleFormInputs); 
    
    downUpHeader.addEventListener('click', toggleDownUp);

    templatesHeader.addEventListener('click', toggleTemplateSection);
    

    // Attach the clear sheet function to the button
    document.getElementById('clear-sheet-btn').addEventListener('click', clearSheet);

    // Populate the template dropdown on page load
    populateTemplateDropdown(templates);

    
});
