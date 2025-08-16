import { Editor } from 'https://esm.sh/@tiptap/core';
import Document from 'https://esm.sh/@tiptap/extension-document';
import Paragraph from 'https://esm.sh/@tiptap/extension-paragraph';
import Text from 'https://esm.sh/@tiptap/extension-text';
import Link from 'https://esm.sh/@tiptap/extension-link';
import Bold from 'https://esm.sh/@tiptap/extension-bold';
import Italic from 'https://esm.sh/@tiptap/extension-italic';
import Underline from 'https://esm.sh/@tiptap/extension-underline';
import BulletList from 'https://esm.sh/@tiptap/extension-bullet-list';
import OrderedList from 'https://esm.sh/@tiptap/extension-ordered-list';
import ListItem from 'https://esm.sh/@tiptap/extension-list-item';

document.addEventListener('DOMContentLoaded', () => {
    const sectionList = document.getElementById('section-list');           
    const sectionSelect = document.getElementById('section-select');
    const commandInput = document.getElementById('command');
    const configList = document.getElementById('config-list');
    const downloadBtn = document.getElementById('download-btn');
    const saveod = document.getElementById('save-btn');
    const uploadXlsx = document.getElementById('upload-xlsx');
    const sidebar = document.getElementById('sidebar');
    const scrollable = document.querySelector('.scrollable');
    const sidebarTab = document.getElementById('sidebar-tab');
    const toggleButton = document.getElementById('toggle-section-button');
    const toggleAddEntryButton = document.getElementById('toggle-add-form-button');
    const sectionHeader = document.getElementById('sections-header');
    const reloadWarningModal = document.getElementById('reloadWarningModal');
    const copyToggle = document.getElementById('copy-toggle');
    const dblClickToggle = document.getElementById('dblclick-toggle');
    const editModal = document.getElementById('editModal');
    const editSectionSelect = document.getElementById('edit-section-select');
    const editCommandInput = document.getElementById('edit-command');
    const editUrlInput = document.getElementById('edit-url-input');
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
    const newcatInput = document.getElementById('section-name');
    const Hideall =  document.getElementById('hide-all-tiles-btn')
    const urlInput = document.getElementById('url');
    let currentOneDriveFile = null;
    let currentGoogleDriveFile = null;
    let isDarkMode = false;
    let isWarningModalVisible = false; 
    let sections = {}; 
    let currentTile = null; 
    let draggedSectionName = null; 
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip); 
    const elements = document.querySelectorAll('[data-step]');
    let currentStep = 1;
    let tourRunning = true; 
    newcatInput.maxLength = 45; 
    sectionList.style.display = 'none';
    
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

   async function loadTemplate(templateFile) {
    const currentConfigList = document.getElementById('config-list');
    const hasContent = currentConfigList.children.length > 0;

    if (!templateFile) {
        showFeedback("No template specified.", "warning");
        return;
    }

    if (hasContent) {
        const userResponse = await showConfirmationDialog(
            "Do you want to clear the current data and load the new template, or merge it with the existing data?",
            "Clear",
            "Merge"
        );

        if (userResponse === null || userResponse === undefined) {
            showFeedback("Template load operation cancelled.", "info");
            return;
        }

        if (userResponse) {
            clearUI();
            showFeedback("Existing data cleared. Loading template...", "info");
        } else {
            showFeedback("Merging template with existing data...", "info");
        }
    } else {
        clearUI();
        showFeedback("Loading template...", "info");
    }

    try {
        const data = await fetchTemplate(templateFile);
        const workbook = await parseWorkbook(data);
        processWorkbook(workbook);
        refreshMasonry();// Ensure this is optimized
        showFeedback("Template loaded successfully!", "success");
    } catch (error) {
        console.error('Error loading template:', error);
        showFeedback("Failed to load template.", "error");
    }
}
    function clearUI() {
    configList.innerHTML = '';
    sectionList.innerHTML = '';
    sectionList.style.display = 'block';
    sections = {};
}

async function fetchTemplate(templateFile) {
    const response = await fetch(templateFile);
    return response.arrayBuffer();
}

async function parseWorkbook(arrayBuffer) {
    return XLSX.read(arrayBuffer, { type: 'array' });
}


    function sanitizeInput(input) {
        return DOMPurify.sanitize(input);
    }


    //Copy function toggle
    copyToggle.addEventListener('change', () => {
        if (copyToggle.checked) {
            showFeedback("Copying command is now enabled!", "warning");
        } else {
            
            showFeedback("Copying description is now enabled!", "success");
        }
    });

        function handleDoubleClickToggle() {
        if (dblClickToggle.checked) {
            showFeedback("Double-click is now enabled!", "success");
        } else {
            showFeedback("Double-click is now disabled!", "error");
        }
        }

        dblClickToggle.addEventListener('change', handleDoubleClickToggle);

    const observer = new MutationObserver(mutations => {
        if (!isDarkMode) return;
    
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Only element nodes
                    // Check if it's a Choices element or contains one
                    const inner = node.matches('.choices__inner') ? node : node.querySelector('.choices__inner');
                    const dropdown = node.matches('.choices__list--dropdown') ? node : node.querySelector('.choices__list--dropdown');
    
                    if (inner) inner.classList.add('darkmode');
                    if (dropdown) dropdown.classList.add('darkmode');
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
    
    
    // Check if the tour has already been completed
    if (localStorage.getItem('tourCompleted')) {
        tourRunning = false; // Prevent the tour from running if completed
    }


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


// === Google API Initialization ===
const GOOGLE_CLIENT_ID = "";
const GOOGLE_API_KEY = "";
let pickerApiLoaded = false;

let accessToken = null;
let tokenClient;

function onGAPILoad() {
    gapi.load('client:picker', async () => {
        await gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
        });

        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive',
            callback: (tokenResponse) => {
                if (tokenResponse.error) {
                    console.error(tokenResponse);
                    showFeedback("Failed to authenticate with Google.", "error");
                    return;
                }
                accessToken = tokenResponse.access_token;
                pickerApiLoaded = true;
            }
        });

        // Prompt for login + get token
        tokenClient.requestAccessToken();
    });
}


window.onload = () => {
    gapi.load('client:picker', () => {
        gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
        });

        gapi.load('picker', () => {
            pickerApiLoaded = true;
        });

        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive',
            callback: (tokenResponse) => {
                if (tokenResponse.error) {
                    console.error(tokenResponse);
                    showFeedback("Failed to authenticate with Google.", "error");
                    return;
                }
                accessToken = tokenResponse.access_token;
                pickerApiLoaded = true;
                launchGooglePicker();
            }
        });
    });
};

function launchGooglePicker() {
    if (!accessToken) {
        showFeedback("Google access token not available.", "error");
        return;
    }

    const picker = new google.picker.PickerBuilder()
        .addView(google.picker.ViewId.DOCS)
        .setOAuthToken(accessToken)
        .setDeveloperKey(GOOGLE_API_KEY)
        .setCallback(async (data) => {
            if (data.action === google.picker.Action.PICKED) {
                const file = data.docs[0];
                const fileId = file.id;
                const fileName = file.name;

                try {
                    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    });
                    const arrayBuffer = await res.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

                    const userResponse = await showConfirmationDialog("Clear or merge data?", "Clear", "Merge");
                    if (userResponse) {
                        configList.innerHTML = '';
                        sectionList.innerHTML = '';
                        sections = {};
                    }

                    processWorkbook(workbook);
                    refreshMasonry();
                    WorkbookManager.setGoogleDriveFile({ id: fileId, name: fileName });
                    showFeedback("Google Drive file loaded!", "success");
                } catch (err) {
                    console.error(err);
                    showFeedback("Failed to load file.", "error");
                }
            }
        })
        .build();

    picker.setVisible(true);
}



    // SVG's 
    // Function to create the pencil (edit) SVG
    function createPencilSvg() {
        const pencilSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        pencilSvg.setAttribute("viewBox", "-20 -20 117.16 123.49");
        pencilSvg.setAttribute("width", "20");
        pencilSvg.setAttribute("height", "20");

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
        copySvg.setAttribute("width", "16");
        copySvg.setAttribute("height", "16");
        
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
        svgIcon.setAttribute("width", "18");
        svgIcon.setAttribute("height", "18");

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

    const eyeButton = document.createElement('button');
    eyeButton.className = 'eye-button';
    eyeButton.style.cursor = 'pointer';
    eyeButton.style.background = 'none';
    eyeButton.style.border = 'none';

    // Append the SVG to the button
    const eyeSvg = createEyeSvg(); // assuming this returns an <svg> element
    eyeButton.appendChild(eyeSvg);

    // Append the button to the container
    Hideall.appendChild(eyeButton);

    // 🔥 Function to create the Trash SVG
    function createTrashSvg() {
        const trashSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        trashSvg.setAttribute("viewBox", "-20 -20 117.16 123.49");
        trashSvg.setAttribute("width", "24");
        trashSvg.setAttribute("height", "24");

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("class", "cls-1");
        rect.setAttribute("x", "2.5");
        rect.setAttribute("y", "10.4");
        rect.setAttribute("width", "72.16");
        rect.setAttribute("height", "4.78");
        rect.setAttribute("rx", ".49");
        rect.setAttribute("ry", ".49");
        trashSvg.appendChild(rect);

        const topPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        topPath.setAttribute("class", "cls-3");
        topPath.setAttribute("d", "M45.76,11.06c.49-4.57-3.04-8.44-7.07-8.56-4.18-.12-8,3.82-7.51,8.56h14.58Z");
        trashSvg.appendChild(topPath);

        const bodyPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        bodyPath.setAttribute("class", "cls-2");
        bodyPath.setAttribute("d", "M72.55,15.19l-12.17,64.57c-.15.8-.57,1.48-1.16,1.97-.9.74-1.88.78-2.15.78-6.18.48-12.85.76-19.95.74-6.52-.02-12.66-.29-18.4-.74-1.58,0-2.93-1.15-3.18-2.71L5.14,15.19h67.41ZM40.34,73.28V26.19c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5,1.5v47.09c0,.83.67,1.5,1.5,1.5s1.5-.67,1.5-1.5ZM53.43,73.46l6.47-46.85c.11-.82-.46-1.58-1.28-1.69-.82-.12-1.58.46-1.69,1.28l-6.47,46.85c-.11.82.46,1.58,1.28,1.69.07,0,.14.01.21.01.74,0,1.38-.54,1.48-1.29ZM24.91,74.76c.82-.09,1.42-.83,1.33-1.65l-5.01-46.95c-.09-.82-.82-1.41-1.65-1.33-.82.09-1.42.83-1.33,1.65l5.01,46.95c.08.77.73,1.34,1.49,1.34.05,0,.11,0,.16,0Z");
        trashSvg.appendChild(bodyPath);

        return trashSvg;
    }

    
   

    // Function to hide all tiles and gray out the eye buttons
    function toggleAllTiles() {
        const tiles = document.querySelectorAll('.tile');
        const eyeButtons = document.querySelectorAll('.eye-button');
    
        // Check if all tiles are currently hidden
        const allHidden = Array.from(tiles).every(tile => tile.style.display === 'none');
    
        tiles.forEach(tile => {
            tile.style.display = allHidden ? '' : 'none'; // Show or hide based on current state
        });
    
        eyeButtons.forEach(eyeButton => {
            eyeButton.style.fill = allHidden ? 'black' : 'gray'; // Set color based on state
        });
    
        showFeedback(allHidden ? "All tiles shown!" : "All tiles hidden!", "info");
    }

// Event listener for the "Hide All Tiles" button
    document.getElementById('hide-all-tiles-btn').addEventListener('click', toggleAllTiles);

  function createSection(sectionName, color) {
    sectionList.style.display = 'block'; 
    

    const sidebarScroll = document.querySelector('.scrollable');
    
    const li = document.createElement('li');
    li.style.backgroundColor = sanitizeInput(color);
    li.dataset.sectionName = sanitizeInput(sectionName);
    li.draggable = true;
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.justifyContent = 'space-between';
    li.style.position = 'relative';

    // Section name span
    const sectionNameSpan = document.createElement('span');
    sectionNameSpan.textContent = sanitizeInput(sectionName);

    // Title container
    const titleContainer = document.createElement('div');
    titleContainer.className = 'title-container';
    titleContainer.style.display = 'flex';
    titleContainer.style.alignItems = 'center';
    titleContainer.style.marginLeft = '12px';
    titleContainer.appendChild(sectionNameSpan);

    // Ellipsis button
    const ellipsisButton = document.createElement('button');
    ellipsisButton.innerHTML = '&#x22EE;'; // vertical ellipsis
    ellipsisButton.className = 'ellipsis-button';
    ellipsisButton.style.background = 'none';
    ellipsisButton.style.border = 'none';
    ellipsisButton.style.cursor = 'pointer';
    ellipsisButton.style.fontSize = '18px';
    ellipsisButton.style.opacity = '0';
    ellipsisButton.style.transition = 'opacity 0.2s ease';

    // Submenu
    const submenu = document.createElement('div');
    submenu.className = 'section-submenu';
    submenu.style.position = 'absolute';
   
    submenu.style.display = 'none';
    submenu.style.gap = '4px';
    submenu.style.zIndex = '9999';
    submenu.style.flexDirection = 'column';
    submenu.style.background = color;

    // Eye button
    const eyeButton = document.createElement('button');
    eyeButton.className = 'eye-button';
    eyeButton.title = 'Toggle Section Visibility';
    eyeButton.style.background = 'none';
    eyeButton.style.border = 'none';
    eyeButton.style.cursor = 'pointer';
    eyeButton.appendChild(createEyeSvg());

    // Pencil button
    const pencilButton = document.createElement('button');
    pencilButton.className = 'edit-button';
    pencilButton.title = 'Edit Section Title';
    pencilButton.style.background = 'none';
    pencilButton.style.border = 'none';
    pencilButton.style.cursor = 'pointer';
    pencilButton.appendChild(createPencilSvg());

    // Trash button
    const trashButton = document.createElement('button');
    trashButton.title = 'Delete Section';
    trashButton.className = 'delete-button';
    trashButton.style.background = 'none';
    trashButton.style.border = 'none';
    trashButton.style.cursor = 'pointer';
    trashButton.appendChild(createTrashSvg());

    // Append buttons to submenu
    submenu.appendChild(eyeButton);
    submenu.appendChild(pencilButton);
    submenu.appendChild(trashButton);

    // Append submenu to body instead of li or sidebar
   // Append submenu to the li
// Append submenu to li (keeps it logically with the section)
    sidebar.appendChild(submenu);

    

    ellipsisButton.addEventListener('click', (e) => {
        e.stopPropagation();

        // Close all other submenus first
        document.querySelectorAll('.section-submenu').forEach(menu => {
            if (menu !== submenu) {
                menu.style.display = 'none';
            }
        });

        // Toggle this submenu
        submenu.style.display = submenu.style.display === 'none' ? 'flex' : 'none';

        if (submenu.style.display === 'flex') {
            submenu.style.position = 'absolute';
            submenu.style.zIndex = '9999';
             positionSubmenu(); // Position submenu next to the li
        }
    });

    
        // Helper to place submenu next to the li
        function positionSubmenu() {
        const liRect = li.getBoundingClientRect();
        const sidebarRect = sidebar.getBoundingClientRect();

        // Align top with the li, place to the right of the sidebar
        submenu.style.top  = `${liRect.top - sidebarRect.top + 5 }px`;
        submenu.style.left = `89%`; // Align left with the sidebar

       
        }

                    // Keep submenu aligned if the sidebar scrolls
        sidebarScroll.addEventListener('scroll', () => {
        if (submenu.style.display === 'flex') positionSubmenu();
        });


    // Hide submenu when clicking outside
   // Hide submenu ONLY when clicking outside (not on mouseleave)
        document.addEventListener('click', (e) => {
            if (!submenu.contains(e.target) && !ellipsisButton.contains(e.target)) {
                submenu.style.display = 'none';
            }
        });


    // Hover behavior for ellipsis
    li.addEventListener('mouseenter', () => {
        ellipsisButton.style.opacity = '1';
    });
    li.addEventListener('mouseleave', () => {
        ellipsisButton.style.opacity = '0';
        // submenu stays if clicked
    });

    // Delete section
    trashButton.addEventListener('click', async (event) => {
        event.stopPropagation();
        const confirmed = await showConfirmationDialog(
            `Are you sure you want to permanently delete the section "${sectionName}" and all of its associated tiles?`, 
            "Delete", 
            "Cancel"
        );
        if (confirmed) {
            deleteSection(sectionName, li);
            showFeedback(`Section "${sectionName}" deleted successfully.`, "success");
            submenu.remove(); // remove submenu from DOM
        }
    });

    // Toggle visibility
    eyeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleSectionVisibility(sectionName, eyeButton);
    });

    // Edit section
    pencilButton.addEventListener('click', (event) => {
        event.stopPropagation();
        editSectionTitle(sectionNameSpan, li);
    });

    // Bring tiles to top when clicking li
    li.addEventListener('click', () => bringTilesToTop(sectionName));

    // Drag & drop
    li.addEventListener("dragstart", handleSectionDragStart);
    li.addEventListener("dragover", handleSectionDragOver);
    li.addEventListener("drop", handleSectionDrop);

    // Assemble UI
    const actionsContainer = document.createElement('div');
    actionsContainer.appendChild(ellipsisButton);

    li.appendChild(titleContainer);
    li.appendChild(actionsContainer);
    sectionList.appendChild(li);

    // Store section data
    sections[sanitizeInput(sectionName)] = { color: color, entries: [] };
    populateSectionDropdown();
    enhanceSectionDropdown();
}




    
   
    function createTile(sectionName, command, description, color, url) {
        
    
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.section = sanitizeInput(sectionName);
        tile.style.backgroundColor = sanitizeInput(color);
    
        // Create a container div for buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        // Create the edit button
        const pencilButton = document.createElement('button');
        pencilButton.className = 'edit-button';
        pencilButton.style.background = 'none';
        pencilButton.style.border = 'none';
        pencilButton.style.cursor = 'pointer';
        pencilButton.appendChild(createPencilSvg());
        buttonContainer.appendChild(pencilButton);
    
        pencilButton.addEventListener('click', () => {
            currentTile = tile;
            openEditModal(tile);
        });
    
        // Create the copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.style.background = 'none';
        copyButton.style.border = 'none';
        copyButton.style.cursor = 'pointer';
        copyButton.appendChild(createCopySvg());
        buttonContainer.appendChild(copyButton);
    
            // Shared copy handler
        function handleCopy() {
            if (copyToggle.checked) {
                navigator.clipboard.writeText(command);
                showFeedback("Command copied to clipboard!", "success");
            } else {
                navigator.clipboard.writeText(description);
                showFeedback("Description copied to clipboard!", "success");
            }
        }

        // Click copy button
        copyButton.addEventListener('click', handleCopy);


     
        function handleDoubleClick(e) {
        if (dblClickToggle.checked && !e.target.closest('button')) {
            handleCopy();
        }
        }

        tile.addEventListener('dblclick', handleDoubleClick);
            
    
        // Create the delete button
        const trashButton = document.createElement('button');
        trashButton.className = 'delete-button';
        trashButton.style.background = 'none';
        trashButton.style.border = 'none';
        trashButton.style.cursor = 'pointer';
        trashButton.appendChild(createTrashSvg());
        buttonContainer.appendChild(trashButton);
    
        trashButton.addEventListener('click', () => {
            configList.removeChild(tile);
            const index = sections[sectionName].entries.findIndex(e => e.command === command);
            if (index > -1) sections[sectionName].entries.splice(index, 1);
            showFeedback("Entry deleted successfully!", "error");
        });
    
        
        tile.appendChild(buttonContainer);
    
        
        const header = document.createElement('p');
        header.className = 'tile-header';
        header.textContent = sanitizeInput(sectionName);
    
        const strongText = document.createElement('strong');
        strongText.textContent = sanitizeInput(command);
    
        const descriptionText = document.createElement('p');
        descriptionText.className = 'description-text';
        descriptionText.innerHTML = sanitizeInput(description);
    
        
    
        tile.appendChild(header);
        tile.appendChild(strongText);
        tile.appendChild(descriptionText);

        // Only show the URL if it exists
        if (url && url.trim() !== '') {
            const urlLink = document.createElement('a');
            urlLink.className = 'url-link';
            urlLink.href = sanitizeInput(url);
            urlLink.textContent = 'Link';
            urlLink.target = '_blank'; // Open in new tab
            descriptionText.style.marginBottom = '8px'; // Remove margin from description text
            tile.appendChild(urlLink);
        }

        
    
        // Add the tile to the config list
        configList.appendChild(tile);
        refreshMasonry();

    }
    
    

    // 🔹 Create a global object to track section visibility
    const sectionVisibility = {};

    function updateSection(oldName, newName, newColor) {
        if (!sections[oldName]) return; // Ensure the section exists

        // Get the section element in the sidebar
        const li = document.querySelector(`li[data-section-name='${oldName}']`);
        if (!li) return;

        // Get all tiles associated with the section
        const sectionTiles = document.querySelectorAll(`.tile[data-section="${oldName}"]`);
        const isHidden = [...sectionTiles].every(tile => tile.style.display === "none");

        // 🚨 **Step 1: If no changes were made, exit early**
        if (newName === oldName && sections[oldName].color === newColor) {
            showFeedback("No changes detected.", "info");
            return;
        }

        // 🚨 **Step 2: Only update the color if the name remains unchanged**
        if (newName === oldName) {
            sections[oldName].color = newColor;
            li.style.backgroundColor = newColor;

            // Update tile colors
            sectionTiles.forEach(tile => {
                tile.style.backgroundColor = newColor;
            });

            showFeedback(`Section color updated successfully!`, "success");
            return; // 🚀 Exit early to avoid unnecessary updates
        }

        // 🚨 **Step 3: If the section name changed, rename it properly**
        sections[newName] = { ...sections[oldName], color: newColor };
        delete sections[oldName];

        // ✅ Update the sidebar section name and attributes
        li.dataset.sectionName = sanitizeInput(newName);
        li.style.backgroundColor = newColor;
        li.querySelector('span').textContent = newName;

        // ✅ Update tiles to reflect new section name
        sectionTiles.forEach((tile) => {
            tile.dataset.section = newName;
            tile.style.backgroundColor = newColor;

            const tileHeader = tile.querySelector('.tile-header');
            if (tileHeader) {
                tileHeader.textContent = newName;
            }
        });

        // 🚨 **Step 4: REMOVE and REASSIGN Eye Button Listener**
        const eyeButton = li.querySelector('.eye-button');
        if (eyeButton) {
            // ✅ First, REMOVE any existing event listener
            eyeButton.replaceWith(eyeButton.cloneNode(true));
            const newEyeButton = li.querySelector('.eye-button');

            // ✅ Now, REATTACH the event listener to always reference the correct section name
            newEyeButton.onclick = (event) => {
                event.stopPropagation();
                toggleSectionVisibility(newName, newEyeButton);
            };

            // ✅ Keep eye icon color consistent with visibility state
            newEyeButton.style.fill = isHidden ? "gray" : "black";
        }

        // 🚨 **Step 5: REMOVE and REASSIGN Trash Button Listener**
        const trashButton = li.querySelector('.delete-button');
        if (trashButton) {
            trashButton.replaceWith(trashButton.cloneNode(true));
            const newTrashButton = li.querySelector('.delete-button');

            newTrashButton.onclick = async (event) => {
                event.stopPropagation();
                const confirmed = await showConfirmationDialog(
                    `Are you sure you want to delete the section "${newName}" and all its associated tiles?`,
                    "Yes, Delete Section",
                    "Cancel"
                );
                if (confirmed) {
                    deleteSection(newName, li);
                    showFeedback(`Section "${newName}" deleted successfully.`, "success");
                }
            };
        }

        // 🔹 Update dropdowns to reflect the new section name
        populateSectionDropdown();
        enhanceSectionDropdown(); // <-- Add this to refresh the Choices dropdown  

        // 🔹 Provide feedback to the user
        showFeedback(`Section "${newName}" updated successfully!`, "success");
    }


  
    function deleteSection(sectionName, sectionElement) {
        // 1. Remove the section element from the sidebar
        sectionList.removeChild(sectionElement);
    
        // 2. Remove all tiles associated with this section
        const sectionTiles = document.querySelectorAll(`.tile[data-section="${sectionName}"]`);
        sectionTiles.forEach(tile => tile.remove());
    
        // 3. Remove section data from the sections object
        delete sections[sectionName];
    
        // 4. Update the dropdown to reflect deletion
        populateSectionDropdown();
        enhanceSectionDropdown(); 
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
                    li.addEventListener('click', () => bringTilesToTop(newName));
                    populateSectionDropdown(); // Update dropdowns to reflect the new section name
                    enhanceSectionDropdown(); // <-- Add this to refresh the Choices dropdown
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
            const description = tile.querySelector('p:nth-of-type(2)').innerHTML;
            const url = tile.querySelector('a')?.href || '';
            

    
            // Pre-fill the modal inputs with the current tile data
            editCommandInput.value = command;
            editor2.commands.setContent(description);
            editUrlInput.value = url;
    
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
        const newDescription = sanitizeInput(editor2.getHTML());
        const newUrl = sanitizeInput(editUrlInput.value);
        const urlElement = currentTile.querySelector('a');
        // Update the tile's content
        currentTile.querySelector('strong').textContent = newCommand;
        currentTile.querySelector('p:nth-of-type(2)').innerHTML = newDescription;
         // Update newDescription;

        
        if (urlElement) {
            urlElement.href = newUrl;
        } else {
            const newUrlElement = document.createElement('a');
            newUrlElement.href = newUrl;
            newUrlElement.textContent = 'Visit Link';
            newUrlElement.target = '_blank'; // Open in new tab
            currentTile.appendChild(newUrlElement);
        }

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

    const configdiv = document.getElementById('config');
    // Function to toggle the sidebar visibility
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
       
        configdiv.classList.toggle('open');
        refreshMasonry();
    }

    function handleSectionDragStart(event) {
        const li = event.target.closest("li[data-section-name]");
        if (!li) return;
        
        draggedSectionName = li.dataset.sectionName;
        // Store the name of the dragged section
    }

    function handleSectionDragOver(event) {
    event.preventDefault(); // Allow dropping
    }

    function handleSectionDrop(event) {
    event.preventDefault(); // Prevent default behavior
    const targetLi = event.target.closest("li[data-section-name]");
    if (!targetLi) return;
    
    const targetSectionName = targetLi.dataset.sectionName;
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
        const tiles = document.querySelectorAll(`.tile[data-section="${sectionName}"]`);
        let allHidden = [...tiles].every(tile => tile.style.display === "none");
    
        tiles.forEach(tile => {
            tile.style.display = allHidden ? "" : "none"; // Toggle visibility
        });
    
        // 🔹 Update the eye button color based on visibility state
        eyeIcon.style.fill = allHidden ? "black" : "gray";
    }

    const editor = new Editor({
        element: document.querySelector('#editor'),
        extensions: [
        Document,
        Paragraph,
        Text,
        Link,
        Bold,
        Italic,
        Underline,
        BulletList,
        OrderedList,
        ListItem,
        ],
       
      });

      const editor2 = new Editor({
        element: document.querySelector('#editmodaleditor'),
        extensions: [
        Document,
        Paragraph,
        Text,
        Link,
        Bold,   
        Italic,
        Underline,
        BulletList,
        OrderedList,
        ListItem,       
        ],
       
      });
        

    document.getElementById('add-entry').addEventListener('click', () => {
        const selectedSection = sectionSelect.value;
        const command = commandInput.value.trim(); // Trim whitespace
        const description =  editor.getHTML().trim();
        const url = urlInput.value.trim(); // Trim whitespace
    
        if (!selectedSection) {
            showFeedback("Please select a section to add the entry.", "error");
            return;
        }
    
        if (!command || !description) {
            showFeedback("Command and description cannot be empty!", "error");
            return;
        }
    
        addEntryToSection(selectedSection, command, description,url);
        commandInput.value = '';
        editor.commands.clearContent();
        urlInput.value = ''; // Clear URL input field after adding
        populateSectionDropdown(); // Refresh the dropdown
        enhanceSectionDropdown(); // Refresh the Choices dropdown
        refreshMasonry();
    
        // Show feedback popup
        showFeedback("New entry added successfully!", "success");
    });
    

    function addEntryToSection(sectionName, command, description, url) {
    
    
        if (sections[sectionName]) {
            // Add the entry to the section's entries
            sections[sectionName].entries.push({ command, description, url });
    
            // Call the function to create the tile for the section
            createTile(sectionName, command, description, sections[sectionName].color, url);
        } else {
            console.error('Section does not exist:', sectionName); // Debugging log
        }
    
        // Update dropdowns after adding entry
        populateSectionDropdown();
        enhanceSectionDropdown();
        refreshMasonry();
    }
    

    // Function to bring all tiles of a section to the top
    function bringTilesToTop(sectionName) {
        const allTiles = Array.from(document.querySelectorAll('.tile'));
        const sectionTiles = allTiles.filter(tile => tile.dataset.section === sectionName);
        const otherTiles = allTiles.filter(tile => tile.dataset.section !== sectionName);
        configList.innerHTML = '';
        sectionTiles.forEach(tile => configList.appendChild(tile));
        otherTiles.forEach(tile => configList.appendChild(tile));
        refreshMasonry();
    }
   
    const WorkbookManager = {
        async createWorkbookBlob(formState) {
    const wb = XLSX.utils.book_new();

    const wsData = [['Section', 'Command', 'Description', 'Colour', 'URL']];

    for (const [sectionName, section] of Object.entries(formState)) {
        const color = section.color || '';
        for (const entry of section.entries) {
            wsData.push([
                sectionName,
                entry.command || '',
                entry.description || '',
                color,
                entry.url || ''
            ]);
        }
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Cheatsheet");

    const uint8array = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([uint8array], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
}
,
    
        async downloadLocally(blob, filename = 'cheatsheet.xlsx') {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
    
        async uploadToOneDrive(blob) {
            if (!currentOneDriveFile?.id) {
                console.warn("No OneDrive file selected for upload.");
                return;
            }
    
            try {
                const accessToken = await getAccessToken(); // Always get a fresh token
                const updateUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${currentOneDriveFile.id}/content`;
    
                const response = await fetch(updateUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': blob.type,
                    },
                    body: blob,
                });
    
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Upload failed:", errorText);
                    throw new Error("Upload to OneDrive failed.");
                }
    
                showFeedback("File updated on OneDrive successfully!", "success");
            } catch (err) {
                console.error("Upload error:", err);
                showFeedback("Failed to update file on OneDrive.", "error");
            }
        },
    
        async exportWorkbook(sections, filename = 'cheatsheet.xlsx') {
    try {
        const blob = await this.createWorkbookBlob(sections);

        if (currentOneDriveFile?.id) {
            await this.uploadToOneDrive(blob);
        } else {
            await this.downloadLocally(blob, filename);
        }
    } catch (err) {
        console.error("Export failed:", err);
        showFeedback("An error occurred during export.", "error");
    }
        },        
    
        setOneDriveFile(file) {
            currentOneDriveFile = file;
        },
    
        clearOneDriveFile() {
            currentOneDriveFile = null;
        }
    };

    // Add these to WorkbookManager:
        WorkbookManager.uploadToGoogleDrive = async function (blob) {
            if (!currentGoogleDriveFile?.id) {
                console.warn("No Google Drive file selected for upload.");
                showFeedback("No Google Drive file selected.", "error");
                return;
            }

            try {
                const token = accessToken;
        if (!token) {
            showFeedback("Google Drive not authenticated.", "error");
            return;
        }
                const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${currentGoogleDriveFile.id}?uploadType=media`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': blob.type,
                    },
                    body: blob
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Google Drive upload failed:", errorText);
                    showFeedback("Failed to upload to Google Drive.", "error");
                } else {
                    showFeedback("File updated on Google Drive successfully!", "success");
                }
            } catch (error) {
                console.error("Google Drive upload error:", error);
                showFeedback("Upload to Google Drive failed.", "error");
            }
        };

        WorkbookManager.setGoogleDriveFile = function(file) {
            currentGoogleDriveFile = file;
        };

    
let lastBlobHash = null;

// Hashing utility to detect changes
async function hashBlob(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Download locally
downloadBtn.addEventListener('click', async () => {
    try {
        const blob = await WorkbookManager.createWorkbookBlob(sections);
        const filename = currentOneDriveFile?.name || 'cheatsheet.xlsx';
        await WorkbookManager.downloadLocally(blob, filename);
    } catch (err) {
        console.error("Download failed:", err);
        showFeedback("Failed to download file.", "error");
    }
});

// Save to OneDrive
saveod.addEventListener('click', async () => {
    try {
        const blob = await WorkbookManager.createWorkbookBlob(sections);
        const hash = await hashBlob(blob);

        if (hash === lastBlobHash) {
            console.log("No changes detected, skipping upload.");
            return;
        }

        lastBlobHash = hash;

        if (currentOneDriveFile?.id) {
            await WorkbookManager.uploadToOneDrive(blob);
        } else {
            showFeedback("No OneDrive file selected.", "error");
        }
    } catch (err) {
        console.error("Upload failed:", err);
        showFeedback("Failed to upload to OneDrive.", "error");
    }
});




// Load from Google Drive (requires gapi picker)
// === Google Drive Load Button Handler ===
document.getElementById('load-google-btn').addEventListener('click', () => {
    if (!pickerApiLoaded || !tokenClient) {
        showFeedback("Google Picker not ready.", "error");
        return;
    }

    tokenClient.callback = (tokenResponse) => {
        if (tokenResponse.error) {
            console.error(tokenResponse);
            showFeedback("Failed to authenticate with Google.", "error");
            return;
        }
        accessToken = tokenResponse.access_token;
        launchGooglePicker();
    };

    tokenClient.requestAccessToken();
});

// === Google Drive Save Button Handler ===
document.getElementById('save-google-btn').addEventListener('click', async () => {
    try {
        const blob = await WorkbookManager.createWorkbookBlob(sections);

        if (currentGoogleDriveFile?.id) {
            await WorkbookManager.uploadToGoogleDrive(blob);
        } else {
            showFeedback("No Google Drive file selected.", "error");
        }
    } catch (err) {
        console.error("Google Drive upload failed:", err);
        showFeedback("Upload to Google Drive failed.", "error");
    }
});

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
        const userResponse = await showConfirmationDialog("Do you want to clear the current list or merge it with the uploaded file?",
            "Clear", "Merge"
        );
        
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
    

    
    
    
    // Microsoft Graph Integration
const msalInstance = new msal.PublicClientApplication({
    auth: {
        clientId: "47ef338a-be5e-42dd-b185-9a1a75215908",
        redirectUri: "https://badpharma.github.io/CheatSheet/"
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (!containsPii) console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Info,
        }
    }
});

// Ensure we handle redirect properly (especially if loginRedirect is ever used)
msalInstance.handleRedirectPromise()
    .then((response) => {
        if (response !== null) {
            console.log("Redirect login success:", response.account);
        }
    })
    .catch((error) => {
        console.error("Redirect handling error:", error);
    });

const loginRequest = {
    scopes: ["Files.ReadWrite", "User.Read"]
};

// Optional: manual sign-in
async function signIn() {
    try {
        const loginResponse = await msalInstance.loginPopup(loginRequest);
        console.log("User signed in:", loginResponse.account);
        return loginResponse.account;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

// Use this to get accessToken (handles silent or fallback to login)
async function getAccessToken() {
    let accounts = msalInstance.getAllAccounts();

    if (accounts.length === 0) {
        // No account, trigger login
        await signIn();
        accounts = msalInstance.getAllAccounts();

        if (accounts.length === 0) {
            throw new Error("Login failed. No account found.");
        }
    }

    try {
        const response = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
        });

        return response.accessToken;
    } catch (error) {
        console.warn("Silent token acquisition failed, trying popup:", error);

        // Fallback to interactive login
        const response = await msalInstance.acquireTokenPopup({
            ...loginRequest,
            account: accounts[0],
        });

        return response.accessToken;
    }
}



  
document.getElementById('load-excel-btn').addEventListener('click', () => {
        OneDrive.open({
            clientId: "47ef338a-be5e-42dd-b185-9a1a75215908",
            action: "download",
            multiSelect: false,
            advanced: { redirectUri: "https://badpharma.github.io/CheatSheet/" },
            success: async (files) => {
                const fileUrl = files.value[0]?.['@microsoft.graph.downloadUrl'];
                if (!fileUrl) {
                    showFeedback("No file selected or download URL unavailable.", "error");
                    return;
                }
            
                // ✅ Store selected file metadata so we can save back later
                WorkbookManager.setOneDriveFile(files.value[0]);
            
                try {
                    const userResponse = await showConfirmationDialog(
                        "Do you want to clear the current list or merge it with the uploaded OneDrive file?",
                        "Clear",
                        "Merge"
                    );
            
                    if (userResponse) {
                        configList.innerHTML = '';
                        sectionList.innerHTML = '';
                        sectionList.style.display = 'block';
                        sections = {};
                        showFeedback("Data cleared. Loading file...", "info");
                    } else {
                        showFeedback("Merging file with existing data...", "info");
                    }
            
                    const response = await fetch(fileUrl);
                    const arrayBuffer = await response.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
                    processWorkbook(workbook);
                    showFeedback("OneDrive file loaded successfully!", "success");
            
                } catch (error) {
                    console.error('OneDrive load error:', error);
                    showFeedback("Failed to load file from OneDrive.", "error");
                }
            }
            ,
            cancel: () => {
                showFeedback("OneDrive file selection cancelled.", "info");
            },
            error: (e) => {
                console.error("OneDrive Picker Error:", e);
                showFeedback("An error occurred with the OneDrive picker.", "error");
            }
        });
});



    // Function to process the uploaded workbook
    function processWorkbook(workbook) {
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
        sheetData.forEach((row, index) => {
            if ((index > 0 && row.length === 4) || index > 0 && row.length === 5) {
                const section = sanitizeInput(row[0]); // Sanitize input for section row[0];
                const command = sanitizeInput(row[1]); // Sanitize input for row[1];
                const description = sanitizeInput(row[2]); // Sanitize input for row[2];
                const color = sanitizeInput(row[3]); // Sanitize input for row[3];
                const url = sanitizeInput(row[4] || ''); // Sanitize input for row[4] (empty string for blank URLs)
    
              
                if (!sections[section]) {
                    createSection(section, color);
                }
    
                addEntryToSection(section, command, description, url); // Add entry to section
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

        populateSectionDropdown();
        enhanceSectionDropdown(); // <-- Add this to refresh the Choices dropdown

       

    }
    
    let templateDropdown;

    function enhanceTemplateDropdown() {
        const element = document.getElementById('template-select');
        if (templateDropdown) {
            templateDropdown.destroy();
        }
    
        templateDropdown = new Choices(element, {
            searchEnabled: true,
            itemSelectText: '',
            shouldSort: true,
            allowHTML: true
        });
    
        // Reapply dark mode if it's active
        if (document.body.classList.contains('darkmode')) {
            const choicesInner = document.querySelector('#template-select + .choices .choices__inner');
            if (choicesInner) choicesInner.classList.add('darkmode');
    
            const dropdown = document.querySelector('.choices__list--dropdown');
            if (dropdown) dropdown.classList.add('darkmode');
        }
    }
    

    let sectionDropdown;

    function enhanceSectionDropdown() {
        const element = document.getElementById('section-select');
        if (sectionDropdown) {
            sectionDropdown.destroy();
        }
    
        sectionDropdown = new Choices(element, {
            searchEnabled: false,
            itemSelectText: '',
            shouldSort: true,
            allowHTML: false
        });
    
        if (document.body.classList.contains('darkmode')) {
            const choicesInner = document.querySelector('#section-select+ .choices .choices__inner');
            if (choicesInner) choicesInner.classList.add('darkmode');

            const dropdown = document.querySelector('.choices__list--dropdown');
            if (dropdown) dropdown.classList.add('darkmode');
        }
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
    // ✅ Enhanced Confirmation Dialog with Custom Button Text
    function showConfirmationDialog(message, confirmText = "Confirm", cancelText = "Cancel") {
    return new Promise((resolve) => {
        const modal = document.getElementById('customModal');
        const modalMessage = document.getElementById('modalMessage');
        const confirmBtn = document.getElementById('confirmBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const closeModal = document.getElementById('closeModal');

        // Set the modal message and button text
        modalMessage.textContent = message;
        confirmBtn.textContent = confirmText;
        cancelBtn.textContent = cancelText;
        
        modal.style.display = "block";

        // Confirm action
        confirmBtn.onclick = function() {
            modal.style.display = "none";
            resolve(true);
        };

        // Cancel action
        cancelBtn.onclick = function() {
            modal.style.display = "none";
            resolve(false);
        };

        // Close modal on clicking (x)
        closeModal.onclick = function() {
            modal.style.display = "none";
            resolve(false);
        };

        // Close modal on outside click
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
                resolve(null);
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
        populateSectionDropdown(); // Refresh the dropdown
        enhanceSectionDropdown(); // Refresh the Choices dropdown
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

    document.getElementById("settings-btn").addEventListener("click", () => {
        document.getElementById("settingsModal").style.display = "block";
    });
    
    document.getElementById("closeSettingsModal").addEventListener("click", () => {
        document.getElementById("settingsModal").style.display = "none";
    });
    
    window.addEventListener("click", (event) => {
        if (event.target === document.getElementById("settingsModal")) {
            document.getElementById("settingsModal").style.display = "none";
        }
    });

      window.addEventListener("click", (event) => {
        if (event.target === document.getElementById("editModal")) {
            document.getElementById("editModal").style.display = "none";
        }
    });

    document.getElementById("helpbtn").addEventListener("click", () => {
        document.getElementById("helpModal").style.display = "block";
    });

    document.getElementById("closeHelpModal").addEventListener("click", () => {
        document.getElementById("helpModal").style.display = "none";
    });
   
    window.addEventListener("click", (event) => {
        if (event.target === document.getElementById("helpModal")) {
            document.getElementById("helpModal").style.display = "none";
        }
    });

    

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
            enhanceSectionDropdown(); // Refresh the Choices dropdown
            showFeedback("Sheet cleared successfully. Go on to create anew...", "success");
        }
    }

    // Scroll to top on space bar
    document.addEventListener('keydown', function(event) {
        const activeElement = document.activeElement;
        const isTyping = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable;

        if (!isTyping && event.code === 'Space') {
            event.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
            

        let msnry;
        const gutterWidth = configList.parentElement.offsetWidth * 0.01; // 2% of parent width
        function initMasonry() {
            if (msnry) msnry.destroy();

            msnry = new Masonry(configList, {
                itemSelector: '.tile',
                columnWidth: '.tile', // detect width from first tile
                gutter: gutterWidth,
                fitWidth: true,
                resize: true,
                horizontalOrder: true
            });
        }

        function refreshMasonry() {
            if (!msnry) {
                initMasonry();
            } else {
                msnry.reloadItems();
                msnry.layout();
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
    enhanceTemplateDropdown();
    // Initialize the section dropdown with Choices.js
    

    
});
