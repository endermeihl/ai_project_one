// 主页面脚本，动态生成网格并支持全屏、编辑等功能

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    
    let currentFullscreen = null; // 当前全屏的格子
    let currentConfig = {
        rows: 3, // 网格行数
        columns: 3, // 网格列数
        urls: [] // 每个格子的URL
    };

    // 加载配置并初始化网格
    async function loadConfig() {
        console.log('Loading configuration...');
        try {
            const response = await fetch('/config');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            currentConfig = await response.json(); // 读取配置
            console.log('Configuration loaded:', currentConfig);
        } catch (error) {
            console.log('No configuration found, using defaults:', error);
            // 默认3x3空网格
            currentConfig = {
                rows: 3,
                columns: 3,
                urls: Array(9).fill('')
            };
        }
        generateGrid();
    }

    // 根据配置生成网格
    function generateGrid() {
        console.log('Generating grid with config:', currentConfig);
        
        const gridContainer = document.getElementById('grid-container');
        if (!gridContainer) {
            console.error('Grid container not found!');
            return;
        }
        // 设置网格的行列数
        gridContainer.style.gridTemplateColumns = `repeat(${currentConfig.columns}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${currentConfig.rows}, 1fr)`;
        
        gridContainer.innerHTML = '';
        
        const totalCells = currentConfig.rows * currentConfig.columns;
        console.log(`Creating ${totalCells} grid items...`);
        
        for (let i = 0; i < totalCells; i++) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.setAttribute('data-index', i + 1);
            
            // 有URL的格子加缩放类
            if (currentConfig.urls[i] && currentConfig.urls[i].trim() !== '') {
                gridItem.classList.add('zoom-view');
            }
            
            // 创建iframe嵌入页面
            const iframe = document.createElement('iframe');
            iframe.src = currentConfig.urls[i] || 'about:blank';
            iframe.frameborder = '0';
            
            gridItem.appendChild(iframe);
            gridContainer.appendChild(gridItem);
        }
        
        console.log('Grid generated successfully');
        
        // 绑定事件
        attachEventListeners();
        updateScaledIFrames();
    }

    // 缩放有zoom-view类的iframe
    function updateScaledIFrames() {
        const scaledItems = document.querySelectorAll('.zoom-view');
        scaledItems.forEach(item => {
            const iframe = item.querySelector('iframe');
            if (!iframe || item.classList.contains('fullscreen')) return;

            const contentWidth = 1920; // 假定内容宽度
            const containerWidth = item.clientWidth;

            if (containerWidth > 0) {
                const scale = containerWidth / contentWidth;
                iframe.style.transform = `scale(${scale})`;
            }
        });
    }

    // 绑定格子的点击事件，实现全屏
    function attachEventListeners() {
        const gridItems = document.querySelectorAll('.grid-item');
        console.log(`Attaching event listeners to ${gridItems.length} grid items`);
        
        gridItems.forEach(item => {
            item.addEventListener('click', () => {
                if (!currentFullscreen) {
                    item.classList.add('fullscreen'); // 进入全屏
                    currentFullscreen = item;
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    }

    // 处理键盘事件：H/ESC退出全屏，E进入编辑
    document.addEventListener('keydown', (e) => {
        if ((e.key.toLowerCase() === 'h' || e.key === 'Escape') && currentFullscreen) {
            currentFullscreen.classList.remove('fullscreen');
            
            if (currentFullscreen.classList.contains('zoom-view')) {
                setTimeout(updateScaledIFrames, 0);
            }

            currentFullscreen = null;
            document.body.style.overflow = '';
        }
        // E键进入编辑页面
        if (e.key.toLowerCase() === 'e') {
            window.location.href = '/edit';
        }
    });

    // 窗口大小变化时重新缩放
    window.addEventListener('resize', updateScaledIFrames);

    // 初始化
    console.log('Starting initialization...');
    loadConfig();
}); 