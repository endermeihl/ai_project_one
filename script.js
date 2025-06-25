document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    
    let currentFullscreen = null;
    let currentConfig = {
        rows: 3,
        columns: 3,
        urls: []
    };

    // Load configuration and initialize grid
    async function loadConfig() {
        console.log('Loading configuration...');
        try {
            const response = await fetch('/config');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            currentConfig = await response.json();
            console.log('Configuration loaded:', currentConfig);
        } catch (error) {
            console.log('No configuration found, using defaults:', error);
            // Use default 3x3 grid with empty URLs
            currentConfig = {
                rows: 3,
                columns: 3,
                urls: Array(9).fill('')
            };
        }
        generateGrid();
    }

    // Generate grid based on configuration
    function generateGrid() {
        console.log('Generating grid with config:', currentConfig);
        
        const gridContainer = document.getElementById('grid-container');
        if (!gridContainer) {
            console.error('Grid container not found!');
            return;
        }
        
        gridContainer.style.gridTemplateColumns = `repeat(${currentConfig.columns}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${currentConfig.rows}, 1fr)`;
        
        gridContainer.innerHTML = '';
        
        const totalCells = currentConfig.rows * currentConfig.columns;
        console.log(`Creating ${totalCells} grid items...`);
        
        for (let i = 0; i < totalCells; i++) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.setAttribute('data-index', i + 1);
            
            // Add zoom-view class if URL is provided
            if (currentConfig.urls[i] && currentConfig.urls[i].trim() !== '') {
                gridItem.classList.add('zoom-view');
            }
            
            const iframe = document.createElement('iframe');
            iframe.src = currentConfig.urls[i] || 'about:blank';
            iframe.frameborder = '0';
            
            gridItem.appendChild(iframe);
            gridContainer.appendChild(gridItem);
        }
        
        console.log('Grid generated successfully');
        
        // Re-attach event listeners
        attachEventListeners();
        updateScaledIFrames();
    }

    function updateScaledIFrames() {
        const scaledItems = document.querySelectorAll('.zoom-view');
        scaledItems.forEach(item => {
            const iframe = item.querySelector('iframe');
            if (!iframe || item.classList.contains('fullscreen')) return;

            const contentWidth = 1920;
            const containerWidth = item.clientWidth;

            if (containerWidth > 0) {
                const scale = containerWidth / contentWidth;
                iframe.style.transform = `scale(${scale})`;
            }
        });
    }

    function attachEventListeners() {
        const gridItems = document.querySelectorAll('.grid-item');
        console.log(`Attaching event listeners to ${gridItems.length} grid items`);
        
        gridItems.forEach(item => {
            item.addEventListener('click', () => {
                if (!currentFullscreen) {
                    item.classList.add('fullscreen');
                    currentFullscreen = item;
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    }

    // Handle keyboard events
    document.addEventListener('keydown', (e) => {
        if ((e.key.toLowerCase() === 'h' || e.key === 'Escape') && currentFullscreen) {
            currentFullscreen.classList.remove('fullscreen');
            
            if (currentFullscreen.classList.contains('zoom-view')) {
                setTimeout(updateScaledIFrames, 0);
            }

            currentFullscreen = null;
            document.body.style.overflow = '';
        }
        
        // Handle edit mode
        if (e.key.toLowerCase() === 'e') {
            window.location.href = '/edit';
        }
    });

    // Handle window resize
    window.addEventListener('resize', updateScaledIFrames);

    // Initialize
    console.log('Starting initialization...');
    loadConfig();
}); 