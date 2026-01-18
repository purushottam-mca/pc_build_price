// Categories List
const categories = [
    'Processor', 
    'Motherboard', 
    'Graphic Card', 
    'Memory (RAM)',
    'SSD Drive',
    'Hard Disk (HDD)',
    'Power Supply', 
    'Cabinet', 
    'Monitor', 
    'CPU Cooler', 
    'Keyboard', 
    'Mouse', 
    'Mousepad',
    'Headphones',
    'Speaker',
    'Gaming Controller',
    'UPS',              
    'Case Fans',
    'Other'
];

// Category Icon Map
const iconMap = {
    'Processor': 'fa-microchip',
    'Motherboard': 'fa-server',
    'Graphic Card': 'fa-gamepad',
    'Memory (RAM)': 'fa-memory',
    'SSD Drive': 'fa-hdd',
    'Hard Disk (HDD)': 'fa-database',
    'Power Supply': 'fa-plug',
    'Cabinet': 'fa-box',
    'Monitor': 'fa-desktop',
    'CPU Cooler': 'fa-fan',
    'Keyboard': 'fa-keyboard',
    'Mouse': 'fa-mouse',
    'Mousepad': 'fa-scroll',
    'Headphones': 'fa-headphones',
    'Speaker': 'fa-volume-up',
    'Gaming Controller': 'fa-gamepad',
    'UPS': 'fa-battery-full',
    'Case Fans': 'fa-wind',
    'Other': 'fa-cube'
};

document.addEventListener('DOMContentLoaded', () => {
    clearBuild();
    
    // Setup Drag and Drop
    const container = document.getElementById('build-body');
    setupDragDrop(container);

    // Attempt to load 'default_build.json'
    fetch('./default_build.json')
        .then(response => {
            // If file exists (200 OK), parse JSON. If not (404), return null.
            return response.ok ? response.json() : null;
        })
        .then(data => {
            if (data && Array.isArray(data)) {
                data.forEach(item => {
                    addRow(item.category, item.product, item.price, item.source);
                });
                calculateTotal();
            } else {
                // File missing or invalid format: Load defaults silently
                loadStandardDefaults();
            }
        })
        .catch(() => {
            loadStandardDefaults();
        });
});

// Helper function to load the hardcoded list
function loadStandardDefaults() {
    const defaultSet = [
        'Processor', 'Motherboard', 'Graphic Card', 'Memory (RAM)', 
        'SSD Drive', 'Power Supply', 'Cabinet'
    ];
    defaultSet.forEach(comp => addRow(comp));
}

function toggleTheme() {
    const html = document.documentElement;
    html.setAttribute('data-theme', html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

function getIconClass(category) {
    return iconMap[category] || 'fa-cube';
}

function updateIcon(selectElement) {
    const icon = selectElement.previousElementSibling;
    const newClass = getIconClass(selectElement.value);
    icon.className = `fas ${newClass} cat-icon`;
}

function getCategoryOptions(selectedCategory) {
    return categories.map(cat => 
        `<option value="${cat}" ${cat === selectedCategory ? 'selected' : ''}>${cat}</option>`
    ).join('');
}

function addRow(category = 'Processor', product = '', price = '', source = '') {
    const tbody = document.getElementById('build-body');
    const row = document.createElement('tr');
    
    // Make row draggable
    row.classList.add('draggable-row');
    row.setAttribute('draggable', 'true');

    const initialIcon = getIconClass(category);
    
    row.innerHTML = `
        <td class="drag-handle" title="Drag to reorder">
            <i class="fas fa-grip-vertical"></i>
        </td>
        <td>
            <div class="cat-wrapper">
                <i class="fas ${initialIcon} cat-icon"></i>
                <select onchange="updateIcon(this)">
                    ${getCategoryOptions(category)}
                </select>
            </div>
        </td>
        <td>
            <textarea placeholder="Product Name" rows="1" oninput="autoResize(this)">${product}</textarea>
        </td>
        <td>
            <input type="number" placeholder="0" value="${price}" oninput="calculateTotal()">
        </td>
        <td>
            <input type="text" placeholder="Source" value="${source}">
        </td>
        <td>
            <button class="delete-btn" onclick="deleteRow(this)">×</button>
        </td>
    `;
    
    // Add Event Listeners for Dragging to this specific row
    addDragEvents(row);

    tbody.appendChild(row);
    
    const textarea = row.querySelector('textarea');
    autoResize(textarea);
}

// --- Drag and Drop Logic ---

function addDragEvents(row) {
    row.addEventListener('dragstart', () => {
        row.classList.add('dragging');
    });

    row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
    });
}

function setupDragDrop(container) {
    container.addEventListener('dragover', e => {
        e.preventDefault(); // Allow dropping
        
        const afterElement = getDragAfterElement(container, e.clientY);
        const draggable = document.querySelector('.dragging');
        
        if (afterElement == null) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    // Get all draggable elements except the one currently being dragged
    const draggableElements = [...container.querySelectorAll('.draggable-row:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        // We want the element where our mouse is "above" its center (negative offset)
        // but closest to 0
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// --- Standard Functions ---

function deleteRow(btn) {
    btn.closest('tr').remove();
    calculateTotal();
}

function clearBuild() {
    document.getElementById('build-body').innerHTML = '';
    calculateTotal();
}

function calculateTotal() {
    const rows = document.querySelectorAll('#build-body tr');
    let total = 0;
    rows.forEach(row => {
        const price = parseFloat(row.querySelector('td:nth-child(4) input').value) || 0;
        total += price;
    });
    document.getElementById('total-price').textContent = '₹ ' + total.toLocaleString('en-IN');
    return total;
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function saveBuild() {
    const rows = document.querySelectorAll('#build-body tr');
    const data = [];

    rows.forEach(row => {
        data.push({
            category: row.querySelector('td:nth-child(2) select').value,
            product: row.querySelector('td:nth-child(3) textarea').value,
            price: row.querySelector('td:nth-child(4) input').value,
            source: row.querySelector('td:nth-child(5) input').value
        });
    });

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = "pc-build-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadBuild(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (Array.isArray(data)) {
                document.getElementById('build-body').innerHTML = '';
                data.forEach(item => {
                    addRow(item.category, item.product, item.price, item.source);
                });
                calculateTotal();
            } else {
                alert("Invalid JSON format");
            }
        } catch (error) {
            alert("Error parsing JSON file");
        }
    };
    reader.readAsText(file);
    input.value = ''; 
}

function copyRedditMarkup() {
    const rows = document.querySelectorAll('#build-body tr');
    let total = calculateTotal();
    
    let markdown = `[PCPriceTracker Build](https://pcpricetracker.in/b/s/custom)\n\n`;
    markdown += `Category|Selection|Source|Price\n`;
    markdown += `:----|:----|:----|----:\n`;

    rows.forEach(row => {
        const cat = row.querySelector('td:nth-child(2) select').value;
        let prod = row.querySelector('td:nth-child(3) textarea').value.trim().replace(/\n/g, " ");
        const price = row.querySelector('td:nth-child(4) input').value.trim();
        const src = row.querySelector('td:nth-child(5) input').value.trim();

        if (prod || price) {
            markdown += `**${cat}** | ${prod} | ${src} | ${price}\n`;
        }
    });

    markdown += `| | **Grand Total** | **INR ${total.toLocaleString('en-IN')}** |`;

    navigator.clipboard.writeText(markdown).then(() => {
        const btn = document.querySelector('.btn-reddit');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-check"></i> Copied!`;
        setTimeout(() => btn.innerHTML = originalHTML, 2000);
    });
}