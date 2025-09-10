import './assets/css/main.css';
import { backendConfig, externalConfig, targetConfig } from './config.js';

let subUrl = '';

// Theme management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'system';
        this.init();
    }

    init() {
        this.updateTheme();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const themeToggle = document.getElementById('themeToggle');
        const themeDropdown = document.getElementById('themeDropdown');
        const themeButtons = document.querySelectorAll('[data-theme]');

        if (themeToggle && themeDropdown) {
            themeToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                themeDropdown.classList.toggle('hidden');
            });

            document.addEventListener('click', (e) => {
                if (!themeDropdown.contains(e.target) && !themeToggle.contains(e.target)) {
                    themeDropdown.classList.add('hidden');
                }
            });
        }

        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.dataset.theme;
                this.setTheme(theme);
                if (themeDropdown) {
                    themeDropdown.classList.add('hidden');
                }
            });
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.currentTheme === 'system') {
                this.updateTheme();
            }
        });
    }

    setTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        this.updateTheme();
    }

    updateTheme() {
        const html = document.documentElement;
        const themeIcon = document.getElementById('themeIcon');
        const themeText = document.getElementById('themeText');

        let isDark = false;
        
        if (this.currentTheme === 'dark') {
            isDark = true;
        } else if (this.currentTheme === 'system') {
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        if (isDark) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }

        // Update button appearance
        if (themeIcon && themeText) {
            switch (this.currentTheme) {
                case 'light':
                    themeIcon.className = 'fas fa-sun mr-2 text-sm';
                    themeText.textContent = '浅色';
                    break;
                case 'dark':
                    themeIcon.className = 'fas fa-moon mr-2 text-sm';
                    themeText.textContent = '深色';
                    break;
                case 'system':
                    themeIcon.className = 'fas fa-desktop mr-2 text-sm';
                    themeText.textContent = '系统';
                    break;
            }
        }
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    if (!toast || !toastMessage || !toastIcon) return;
    
    // Set message
    toastMessage.textContent = message;
    
    // Set icon and background based on type
    const icons = {
        success: '<i class="fas fa-check-circle text-green-500 text-xl"></i>',
        error: '<i class="fas fa-exclamation-circle text-red-500 text-xl"></i>',
        info: '<i class="fas fa-info-circle text-blue-500 text-xl"></i>',
        warning: '<i class="fas fa-exclamation-triangle text-yellow-500 text-xl"></i>'
    };
    
    // Set toast styling based on type with dark mode support
    toast.firstElementChild.className = `bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-4 flex items-center space-x-4 border border-gray-200/50 dark:border-gray-600/50 ${
        type === 'success' ? 'border-green-200/50 dark:border-green-700/50' :
        type === 'error' ? 'border-red-200/50 dark:border-red-700/50' :
        type === 'warning' ? 'border-yellow-200/50 dark:border-yellow-700/50' :
        'border-blue-200/50 dark:border-blue-700/50'
    }`;
    
    toastIcon.innerHTML = icons[type];
    
    // Update message text color for dark mode
    toastMessage.className = 'text-sm font-semibold text-gray-900 dark:text-gray-100';
    
    // Show toast with animation
    toast.classList.remove('hidden', 'translate-x-full');
    toast.classList.add('animate-slide-up');
    
    // Hide toast after 2.5 seconds (faster)
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        toast.classList.remove('animate-slide-up');
        // Completely hide after animation
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 200); // Reduced from 300 to 200
    }, 2500); // Reduced from 3000 to 2500
}

// Hide toast function for close button
function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.add('translate-x-full');
        toast.classList.remove('animate-slide-up');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 200); // Reduced from 300 to 200
    }
}

// Make hideToast globally available for HTML onclick
window.hideToast = hideToast;

function copyText(copyStr) {
    navigator.clipboard.writeText(copyStr).then(() => {
        showToast('复制成功~', 'success');
    }, () => {
        showToast('复制失败, 请手动选择复制', 'error');
    });
}

function generateSubUrl(data) {
    const backend = data.backend;
    let originUrl = data.url;
    originUrl = encodeURIComponent(originUrl.replace(/(\n|\r|\n\r)/g, '|'));

    let newSubUrl = `${backend}&url=${originUrl}&target=${data.target}`;

    if (data.config) {
        newSubUrl += `&config=${encodeURIComponent(data.config)}`;
    }

    if (data.include) {
        newSubUrl += `&include=${encodeURIComponent(data.include)}`;
    }

    if (data.exclude) {
        newSubUrl += `&exclude=${encodeURIComponent(data.exclude)}`;
    }

    if (data.name) {
        newSubUrl += `&filename=${encodeURIComponent(data.name)}`;
    }

    newSubUrl += `&emoji=${data.emoji || 'false'}&append_type=${data.append_type || 'false'}&append_info=${data.append_info || 'false'}&scv=${data.scv || 'false'}&udp=${data.udp || 'false'}&list=${data.list || 'false'}&sort=${data.sort || 'false'}&fdn=${data.fdn || 'false'}&insert=${data.insert || 'false'}`;
    subUrl = newSubUrl;
    $('#result').val(subUrl);
    
    // Show result section with animation
    const resultSection = document.getElementById('resultSection');
    if (resultSection) {
        resultSection.style.display = 'block';
        setTimeout(() => {
            resultSection.classList.remove('opacity-0', 'translate-y-4');
            resultSection.classList.add('opacity-100', 'translate-y-0');
        }, 100);
    }
    
    // Show copy button
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.style.display = 'inline-flex';
    }
    
    copyText(subUrl);
}

// Initialize form elements
function initializeForm() {
    // Populate target select
    const targetSelect = document.getElementById('target');
    if (targetSelect) {
        targetConfig.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            targetSelect.appendChild(opt);
        });
    }

    // Populate config select
    const configSelect = document.getElementById('config');
    if (configSelect) {
        externalConfig.forEach(group => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = group.label;
            
            group.options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.label;
                
                // Set default selection for "默认版-功能齐全"
                if (option.label === '默认版-功能齐全') {
                    opt.selected = true;
                }
                
                optgroup.appendChild(opt);
            });
            
            configSelect.appendChild(optgroup);
        });
    }

    // Backend select is now handled by initializeBackends function
    
    // Add backend change listener for header selector
    const backendHeaderSelect = document.getElementById('backendHeader');
    if (backendHeaderSelect) {
        backendHeaderSelect.addEventListener('change', handleBackendChange);
    }
}

// Handle backend selection change
function handleBackendChange() {
    // Only handle header backend selector now
    const backendSelect = document.getElementById('backendHeader');
    const customBackendContainer = document.getElementById('customBackendContainerHeader');
    const customBackendInput = document.getElementById('customBackendHeader');
    
    if (!backendSelect) return;
    
    if (backendSelect.value === 'custom') {
        // Show with animation
        if (customBackendContainer) {
            customBackendContainer.style.display = 'block';
            customBackendContainer.classList.remove('hidden');
            // Focus on input after a short delay
            setTimeout(() => {
                if (customBackendInput) customBackendInput.focus();
            }, 300);
        }
        if (customBackendInput) customBackendInput.required = true;
    } else {
        // Hide with animation
        if (customBackendContainer) {
            customBackendContainer.classList.add('hidden');
            setTimeout(() => {
                customBackendContainer.style.display = 'none';
            }, 300);
        }
        if (customBackendInput) {
            customBackendInput.required = false;
            customBackendInput.value = '';
        }
    }
    
    // Update header button text
    updateBackendButtonLabel();
}

// Form submission handler
function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    // Get backend from header selector instead of form
    const backendHeaderSelect = document.getElementById('backendHeader');
    let backend = backendHeaderSelect ? backendHeaderSelect.value : '';
    
    // If custom backend is selected, use the custom input value
    if (backend === 'custom') {
        const customBackendHeader = document.getElementById('customBackendHeader');
        backend = customBackendHeader ? customBackendHeader.value : '';
        // Validate custom backend URL
        if (!backend) {
            showToast('请输入自定义后端地址', 'error');
            return;
        }
        // Ensure URL ends with /sub?
        if (!backend.endsWith('/sub?') && !backend.endsWith('/sub')) {
            backend += '/sub?';
        }
    }
    
    if (!backend) {
        showToast('请选择后端服务', 'error');
        return;
    }
    
    const data = {
        url: formData.get('url'),
        target: formData.get('target'),
        backend: backend,
        config: formData.get('config'),
        include: formData.get('include'),
        exclude: formData.get('exclude'),
        name: formData.get('name'),
        emoji: formData.get('emoji') === 'on' ? 'true' : 'false',
        append_type: formData.get('append_type') === 'on' ? 'true' : 'false',
        append_info: formData.get('append_info') === 'on' ? 'true' : 'false',
        scv: formData.get('scv') === 'on' ? 'true' : 'false',
        udp: formData.get('udp') === 'on' ? 'true' : 'false',
        list: formData.get('list') === 'on' ? 'true' : 'false',
        sort: formData.get('sort') === 'on' ? 'true' : 'false',
        fdn: formData.get('fdn') === 'on' ? 'true' : 'false',
        insert: formData.get('insert') === 'on' ? 'true' : 'false'
    };
    
    generateSubUrl(data);
}

// Import to Clash handler
function handleImportToClash() {
    if (!subUrl) {
        showToast('未生成新的订阅链接', 'error');
        return;
    }
    
    const url = `clash://install-config?url=${encodeURIComponent(subUrl)}`;
    window.open(url);
}

// Copy button handler
function handleCopy() {
    const result = document.getElementById('result');
    if (result && result.value) {
        copyText(result.value);
    }
}

// QR Code button handler
function handleQrCode() {
    const result = document.getElementById('result');
    if (!result || !result.value) {
        showToast('未生成订阅链接', 'error');
        return;
    }
    
    const modal = document.getElementById('qrModal');
    const canvas = document.getElementById('qrCodeCanvas');
    
    if (!modal || !canvas) return;
    
    // Check if QRCode is available
    if (typeof QRCode === 'undefined') {
        showToast('二维码库加载失败，请刷新页面重试', 'error');
        return;
    }
    
    try {
        // Clear previous QR code
        canvas.innerHTML = '';
        
        // Determine colors based on theme
        const isDarkMode = document.documentElement.classList.contains('dark');
        const colorDark = isDarkMode ? '#FFFFFF' : '#1F2937';
        const colorLight = isDarkMode ? '#1F2937' : '#FFFFFF';
        
        // Create QR code using qrcodejs library
        new QRCode(canvas, {
            text: result.value,
            width: 256,
            height: 256,
            colorDark: colorDark,
            colorLight: colorLight,
            correctLevel: QRCode.CorrectLevel.M
        });
        
        // Show modal
        modal.classList.remove('hidden');
        showToast('二维码生成成功', 'success');
    } catch (error) {
        showToast('二维码生成失败', 'error');
    }
}

// Clash QR Code button handler
function handleClashQrCode() {
    // Get form data first
    const form = document.getElementById('optionsForm');
    if (!form) {
        showToast('表单未找到', 'error');
        return;
    }
    
    const formData = new FormData(form);
    
    // Get backend from header selector
    const backendHeaderSelect = document.getElementById('backendHeader');
    let backend = backendHeaderSelect ? backendHeaderSelect.value : '';
    
    // If custom backend is selected, use the custom input value
    if (backend === 'custom') {
        const customBackendHeader = document.getElementById('customBackendHeader');
        backend = customBackendHeader ? customBackendHeader.value : '';
        // Validate custom backend URL
        if (!backend) {
            showToast('请输入自定义后端地址', 'error');
            return;
        }
        // Ensure URL ends with /sub?
        if (!backend.endsWith('/sub?') && !backend.endsWith('/sub')) {
            backend += '/sub?';
        }
    }
    
    if (!backend) {
        showToast('请选择后端服务', 'error');
        return;
    }
    
    const url = formData.get('url');
    const target = formData.get('target');
    
    if (!url || !target) {
        showToast('请填写订阅链接和选择客户端类型', 'error');
        return;
    }
    
    const data = {
        url: url,
        target: target,
        backend: backend,
        config: formData.get('config'),
        include: formData.get('include'),
        exclude: formData.get('exclude'),
        name: formData.get('name'),
        emoji: formData.get('emoji') === 'on' ? 'true' : 'false',
        append_type: formData.get('append_type') === 'on' ? 'true' : 'false',
        append_info: formData.get('append_info') === 'on' ? 'true' : 'false',
        scv: formData.get('scv') === 'on' ? 'true' : 'false',
        udp: formData.get('udp') === 'on' ? 'true' : 'false',
        list: formData.get('list') === 'on' ? 'true' : 'false',
        sort: formData.get('sort') === 'on' ? 'true' : 'false',
        fdn: formData.get('fdn') === 'on' ? 'true' : 'false',
        insert: formData.get('insert') === 'on' ? 'true' : 'false'
    };
    
    // Generate subscription URL
    const backend_url = data.backend;
    let originUrl = data.url;
    originUrl = encodeURIComponent(originUrl.replace(/(\n|\r|\n\r)/g, '|'));

    let newSubUrl = `${backend_url}&url=${originUrl}&target=${data.target}`;

    if (data.config) {
        newSubUrl += `&config=${encodeURIComponent(data.config)}`;
    }

    if (data.include) {
        newSubUrl += `&include=${encodeURIComponent(data.include)}`;
    }

    if (data.exclude) {
        newSubUrl += `&exclude=${encodeURIComponent(data.exclude)}`;
    }

    if (data.name) {
        newSubUrl += `&filename=${encodeURIComponent(data.name)}`;
    }

    newSubUrl += `&emoji=${data.emoji || 'false'}&append_type=${data.append_type || 'false'}&append_info=${data.append_info || 'false'}&scv=${data.scv || 'false'}&udp=${data.udp || 'false'}&list=${data.list || 'false'}&sort=${data.sort || 'false'}&fdn=${data.fdn || 'false'}&insert=${data.insert || 'false'}`;
    
    subUrl = newSubUrl;
    
    const modal = document.getElementById('qrModal');
    const canvas = document.getElementById('qrCodeCanvas');
    
    if (!modal || !canvas) return;
    
    // Check if QRCode is available
    if (typeof QRCode === 'undefined') {
        showToast('二维码库加载失败，请刷新页面重试', 'error');
        return;
    }
    
    // Generate Clash import URL
    const clashUrl = `clash://install-config?url=${encodeURIComponent(subUrl)}`;
    
    try {
        // Clear previous QR code
        canvas.innerHTML = '';
        
        // Determine colors based on theme
        const isDarkMode = document.documentElement.classList.contains('dark');
        const colorDark = isDarkMode ? '#FFFFFF' : '#1F2937';
        const colorLight = isDarkMode ? '#1F2937' : '#FFFFFF';
        
        // Create QR code using qrcodejs library
        new QRCode(canvas, {
            text: clashUrl,
            width: 256,
            height: 256,
            colorDark: colorDark,
            colorLight: colorLight,
            correctLevel: QRCode.CorrectLevel.M
        });
        
        // Show modal
        modal.classList.remove('hidden');
        showToast('Clash导入二维码生成成功', 'success');
    } catch (error) {
        showToast('Clash二维码生成失败', 'error');
    }
}

// Check backend version
async function checkBackendVersion(backend) {
    try {
        // Extract base URL by removing '/sub?' or '/sub' from the end
        const baseUrl = backend.replace(/\/sub\?$/, '').replace(/\/sub$/, '');
        const versionUrl = baseUrl + '/version';
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(versionUrl, {
            method: 'GET',
            mode: 'cors',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.text();
            return data.trim() || 'Unknown';
        }
        return null;
    } catch (error) {
        return null;
    }
}

// Update backend button label
function updateBackendButtonLabel() {
    const backendHeaderSelect = document.getElementById('backendHeader');
    const selectedBackendName = document.getElementById('selectedBackendName');
    
    if (backendHeaderSelect && selectedBackendName) {
        const selectedOption = backendHeaderSelect.options[backendHeaderSelect.selectedIndex];
        if (selectedOption) {
            let label = selectedOption.textContent;
            // Remove special indicators
            label = label.replace(/ ⚡.*$/, '').replace(/ \(\d+ms\)$/, '');
            selectedBackendName.textContent = label;
        }
    }
}

// Initialize and check backends
async function initializeBackends() {
    // Only initialize header selector now
    const backendHeaderSelect = document.getElementById('backendHeader');
    if (!backendHeaderSelect) return;
    
    // Show loading state with icon
    backendHeaderSelect.innerHTML = '<option value="">🔄 正在检测可用后端...</option>';
    backendHeaderSelect.disabled = true;
    
    // Show detection progress
    showToast('开始检测后端服务...', 'info');
    
    // Check all backends in parallel
    const checkPromises = backendConfig.map(async (backend, index) => {
        // Stagger the requests to avoid overwhelming the network
        await new Promise(resolve => setTimeout(resolve, index * 200));
        
        const startTime = Date.now();
        const version = await checkBackendVersion(backend.value);
        const responseTime = Date.now() - startTime;
        
        if (version) {
            return {
                ...backend,
                version: version,
                responseTime: responseTime,
                label: backend.label
            };
        }
        return null;
    });
    
    // Wait for all checks to complete
    const results = await Promise.all(checkPromises);
    
    // Filter out null results
    const validBackends = results.filter(backend => backend !== null);
    
    // Populate header select with sorted backends
    backendHeaderSelect.innerHTML = '';
    
    if (validBackends.length > 0) {
        // Check if Lfree backend is available
        const lfreeBackend = validBackends.find(backend => 
            backend.label.includes('Lfree提供') || backend.value.includes('api.sub.zaoy.cn')
        );
        
        if (lfreeBackend) {
            // Add Lfree backend first and select it
            const lfreeOpt = document.createElement('option');
            lfreeOpt.value = lfreeBackend.value;
            lfreeOpt.textContent = `${lfreeBackend.label} ⚡ 推荐`;
            lfreeOpt.selected = true;
            backendHeaderSelect.appendChild(lfreeOpt);
            
            // Add other backends sorted by response time
            const otherBackends = validBackends
                .filter(backend => backend !== lfreeBackend)
                .sort((a, b) => a.responseTime - b.responseTime);
            
            otherBackends.forEach(backend => {
                const opt = document.createElement('option');
                opt.value = backend.value;
                opt.textContent = backend.label;
                backendHeaderSelect.appendChild(opt);
            });
            
            showToast(`✨ 已自动选择Lfree负载均衡后端，响应时间 ${lfreeBackend.responseTime}ms`, 'success');
        } else {
            // Sort all backends by response time if Lfree is not available
            validBackends.sort((a, b) => a.responseTime - b.responseTime);
            
            validBackends.forEach((backend, index) => {
                const opt = document.createElement('option');
                opt.value = backend.value;
                if (index === 0) {
                    opt.textContent = `${backend.label} ⚡ 最快`;
                    opt.selected = true;
                } else {
                    opt.textContent = backend.label;
                }
                backendHeaderSelect.appendChild(opt);
            });
            
            // Show success message with details
            const avgTime = Math.round(validBackends.reduce((sum, b) => sum + b.responseTime, 0) / validBackends.length);
            showToast(`检测到 ${validBackends.length} 个可用后端，平均响应时间 ${avgTime}ms`, 'success');
        }
    } else {
        // Fallback to original list if no backends respond
        backendConfig.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            backendHeaderSelect.appendChild(opt);
        });
        showToast('未检测到可用的后端服务，请手动选择', 'warning');
    }
    
    // Add custom backend option
    const customOpt = document.createElement('option');
    customOpt.value = 'custom';
    customOpt.textContent = '自建本地服务';
    backendHeaderSelect.appendChild(customOpt);
    
    backendHeaderSelect.disabled = false;
    
    // Update button label after initialization
    updateBackendButtonLabel();
}

// Initialize on document ready
$(document).ready(() => {
    // Initialize form elements
    initializeForm();
    
    // Check backend versions
    initializeBackends();
    
    // Backend dropdown toggle
    const backendToggle = document.getElementById('backendToggle');
    const backendDropdown = document.getElementById('backendDropdown');
    const backendHeaderSelect = document.getElementById('backendHeader');
    
    if (backendToggle && backendDropdown) {
        backendToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            backendDropdown.classList.toggle('hidden');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!backendDropdown.contains(e.target) && !backendToggle.contains(e.target)) {
                backendDropdown.classList.add('hidden');
            }
        });
    }
    
    // Add change listener for header backend selector
    if (backendHeaderSelect) {
        backendHeaderSelect.addEventListener('change', () => {
            syncBackendSelectors('backendHeader');
            // Close dropdown after selection
            if (backendDropdown) {
                backendDropdown.classList.add('hidden');
            }
        });
    }
    
    // Form submission
    const form = document.getElementById('optionsForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Import to Clash button
    const importBtn = document.getElementById('importToClash');
    if (importBtn) {
        importBtn.addEventListener('click', handleImportToClash);
    }
    
    // Copy button
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', handleCopy);
    }
    
    // QR Code button
    const qrBtn = document.getElementById('qrBtn');
    if (qrBtn) {
        qrBtn.addEventListener('click', handleQrCode);
    }
    
    // Clash QR Code button
    const clashQrBtn = document.getElementById('clashQrBtn');
    if (clashQrBtn) {
        clashQrBtn.addEventListener('click', handleClashQrCode);
    }
    
    // QR Modal close buttons
    const closeQrModal = document.getElementById('closeQrModal');
    const qrModal = document.getElementById('qrModal');
    
    if (closeQrModal && qrModal) {
        closeQrModal.addEventListener('click', () => {
            qrModal.classList.add('hidden');
        });
        
        // Close modal when clicking outside
        qrModal.addEventListener('click', (e) => {
            if (e.target === qrModal) {
                qrModal.classList.add('hidden');
            }
        });
    }
    
    // Refresh backends buttons - only header refresh button now
    const refreshBtn = document.getElementById('refreshBackendsHeader');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('animate-spin');
            refreshBtn.disabled = true;
            
            await initializeBackends();
            
            icon.classList.remove('animate-spin');
            refreshBtn.disabled = false;
        });
    }
    
    // Show welcome message
    setTimeout(() => {
        showToast('欢迎使用 Lfree订阅转换工具！', 'info');
    }, 500);
});