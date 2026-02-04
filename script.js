// Monospace Poetry - Interactive Features
// Theme, sharing, random poems, live preview, and more

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initRandomButton();
    initShareButtons();
    initCopyToast();
    initCharPalette();
    initLivePreview();
    initKeyboardNav();
    initScrollProgress();
});

// ═══════════════════════════════════════════════════════════
// THEME TOGGLE (Dark/Light)
// ═══════════════════════════════════════════════════════════
function initThemeToggle() {
    const saved = localStorage.getItem('theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    }
    
    let toggle = document.querySelector('.theme-toggle');
    if (!toggle) {
        toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', 'Toggle theme');
        document.body.appendChild(toggle);
    }
    
    updateToggleIcon(toggle);
    
    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateToggleIcon(toggle);
    });
}

function updateToggleIcon(toggle) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    toggle.textContent = isLight ? '◐' : '◑';
    toggle.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
}

// ═══════════════════════════════════════════════════════════
// RANDOM POEM BUTTON
// ═══════════════════════════════════════════════════════════
function initRandomButton() {
    const btn = document.querySelector('.random-btn');
    if (!btn) return;

    const items = Array.from(document.querySelectorAll('.gallery-item'));
    if (items.length === 0) return;

    const VISIBLE_COUNT = 8;

    // Shuffle and show initial 8
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function showRandomSet() {
        // Hide all
        items.forEach(item => item.style.display = 'none');
        
        // Shuffle and show 8
        const shuffled = shuffle([...items]);
        shuffled.slice(0, VISIBLE_COUNT).forEach(item => {
            item.style.display = 'block';
        });
        
        // Scroll to top of gallery
        document.querySelector('.gallery-controls')?.scrollIntoView({ behavior: 'smooth' });
    }

    // Show initial set on page load
    showRandomSet();

    // Random button shows new set
    btn.addEventListener('click', showRandomSet);
}

// ═══════════════════════════════════════════════════════════
// SHARE BUTTONS
// ═══════════════════════════════════════════════════════════
function initShareButtons() {
    document.querySelectorAll('.share-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const poemEl = btn.closest('.gallery-item');
            const poemText = poemEl?.querySelector('pre')?.textContent || '';
            const poemTitle = poemEl?.dataset.title || 'Monospace Poetry';
            showShareModal(poemTitle, poemText);
        });
    });
}

function showShareModal(title, content) {
    const url = window.location.href;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <button class="modal-close">&times;</button>
            <h3>Share this poem</h3>
            <div class="share-options">
                <button class="share-btn" data-action="twitter">
                    <span>𝕏</span> Post to X/Twitter
                </button>
                <button class="share-btn" data-action="copy-link">
                    <span>🔗</span> Copy link
                </button>
                <button class="share-btn" data-action="copy-text">
                    <span>📋</span> Copy poem text
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('show'));
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    });
    
    modal.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            
            if (action === 'twitter') {
                const text = `${title}\n\n${url}\n\n#MonospacePoetry`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
            } else if (action === 'copy-link') {
                navigator.clipboard.writeText(url);
                showToast('Link copied!');
            } else if (action === 'copy-text') {
                navigator.clipboard.writeText(content);
                showToast('Poem copied!');
            }
            
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });
    });
}

// ═══════════════════════════════════════════════════════════
// COPY TOAST
// ═══════════════════════════════════════════════════════════
let toastEl = null;

function initCopyToast() {
    toastEl = document.createElement('div');
    toastEl.className = 'copy-toast';
    document.body.appendChild(toastEl);
}

function showToast(message) {
    if (!toastEl) initCopyToast();
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2000);
}

// ═══════════════════════════════════════════════════════════
// CHARACTER PALETTE
// ═══════════════════════════════════════════════════════════
function initCharPalette() {
    const container = document.querySelector('.char-palette-container');
    if (!container) return;
    
    const CHAR_PALETTE = {
        "Blocks": "░▒▓█▀▄▌▐",
        "Box Light": "─│┌┐└┘├┤┬┴┼",
        "Box Heavy": "━┃┏┓┗┛┣┫┳┻╋",
        "Box Double": "═║╔╗╚╝╠╣╦╩╬",
        "Arrows": "←→↑↓↔↕⇐⇒⇑⇓",
        "Shapes": "◇◆○●□■△▽▲▼◁▷◀▶",
        "Stars": "★☆✦✧⋆∗✱✲✳",
        "Symbols": "◈⊕⊗⊙⧫§¶†‡※",
        "Dots": "·•●○◦◉◎⊙",
        "Misc": "∞≈≠±×÷√∑"
    };
    
    let html = '<div class="char-palette"><h3>░▒▓ Character Palette ▓▒░</h3>';
    
    for (const [group, chars] of Object.entries(CHAR_PALETTE)) {
        html += `<div class="char-group">
            <div class="char-group-name">${group}</div>
            <div class="char-row">`;
        
        for (const char of chars) {
            if (char !== ' ') {
                html += `<button class="char-btn" data-char="${char}">${char}</button>`;
            }
        }
        
        html += '</div></div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    container.querySelectorAll('.char-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const char = btn.dataset.char;
            navigator.clipboard.writeText(char);
            showToast(`Copied: ${char}`);
            
            const editor = document.querySelector('.editor-textarea:focus');
            if (editor) {
                const start = editor.selectionStart;
                const end = editor.selectionEnd;
                editor.value = editor.value.substring(0, start) + char + editor.value.substring(end);
                editor.selectionStart = editor.selectionEnd = start + char.length;
                editor.dispatchEvent(new Event('input'));
            }
        });
    });
}

// ═══════════════════════════════════════════════════════════
// LIVE PREVIEW EDITOR
// ═══════════════════════════════════════════════════════════
function initLivePreview() {
    const textarea = document.querySelector('.editor-textarea');
    const preview = document.querySelector('.editor-preview');
    const gridToggle = document.querySelector('.grid-toggle');
    
    if (!textarea || !preview) return;
    
    textarea.addEventListener('input', () => {
        preview.textContent = textarea.value;
    });
    
    if (gridToggle) {
        gridToggle.addEventListener('click', () => {
            preview.classList.toggle('show-grid');
            preview.classList.toggle('grid-overlay');
            gridToggle.classList.toggle('active');
        });
    }
    
    if (textarea.value) {
        preview.textContent = textarea.value;
    }
}

// ═══════════════════════════════════════════════════════════
// KEYBOARD NAVIGATION
// ═══════════════════════════════════════════════════════════
function initKeyboardNav() {
    const items = document.querySelectorAll('.gallery-item');
    if (items.length === 0) return;
    
    let currentIndex = -1;
    let helpVisible = false;
    
    const helpPanel = document.createElement('div');
    helpPanel.className = 'dos-help';
    helpPanel.innerHTML = `<pre>
╔══════════════════════════════════════════╗
║           KEYBOARD NAVIGATION            ║
╠══════════════════════════════════════════╣
║                                          ║
║   ↓ / j     next piece                   ║
║   ↑ / k     previous piece               ║
║   Home      first piece                  ║
║   End       last piece                   ║
║   r         random piece                 ║
║   t         toggle theme                 ║
║   ?         toggle this help             ║
║   Esc       close                        ║
║                                          ║
╠══════════════════════════════════════════╣
║       Press any key to continue...       ║
╚══════════════════════════════════════════╝</pre>`;
    document.body.appendChild(helpPanel);
    
    const hint = document.createElement('div');
    hint.className = 'help-hint';
    hint.innerHTML = 'Press <span>?</span> for keyboard shortcuts';
    document.body.appendChild(hint);
    setTimeout(() => hint.classList.add('visible'), 1000);
    setTimeout(() => hint.classList.remove('visible'), 5000);
    
    function toggleHelp() {
        helpVisible = !helpVisible;
        helpPanel.classList.toggle('visible', helpVisible);
    }
    
    function scrollToItem(index) {
        if (index >= 0 && index < items.length) {
            currentIndex = index;
            items[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            items.forEach(item => item.classList.remove('focused'));
            items[index].classList.add('focused');
        }
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (helpVisible && e.key !== '?') {
            toggleHelp();
            if (e.key === 'Escape') return;
        }
        
        switch(e.key) {
            case '?':
                e.preventDefault();
                toggleHelp();
                break;
            case 'ArrowDown':
            case 'j':
                e.preventDefault();
                scrollToItem(Math.min(currentIndex + 1, items.length - 1));
                break;
            case 'ArrowUp':
            case 'k':
                e.preventDefault();
                scrollToItem(Math.max(currentIndex - 1, 0));
                break;
            case 'Home':
                e.preventDefault();
                scrollToItem(0);
                break;
            case 'End':
                e.preventDefault();
                scrollToItem(items.length - 1);
                break;
            case 'r':
                e.preventDefault();
                scrollToItem(Math.floor(Math.random() * items.length));
                break;
            case 't':
                e.preventDefault();
                document.querySelector('.theme-toggle')?.click();
                break;
        }
    });
}

// ═══════════════════════════════════════════════════════════
// SCROLL PROGRESS BAR
// ═══════════════════════════════════════════════════════════
function initScrollProgress() {
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    progress.innerHTML = '<div class="scroll-progress-bar"></div>';
    document.body.appendChild(progress);
    
    const bar = progress.querySelector('.scroll-progress-bar');
    
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        bar.style.width = Math.min(scrollPercent, 100) + '%';
    });
}

// Add dynamic styles
const styles = document.createElement('style');
styles.textContent = `
.dos-help { 
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
    z-index: 9999; background: var(--bg, #0a0a0a); border: 2px solid var(--accent, #00ff88); 
    opacity: 0; visibility: hidden; transition: all 0.15s; 
    box-shadow: 0 0 40px var(--accent-dim, rgba(0, 255, 136, 0.3)); 
}
.dos-help.visible { opacity: 1; visibility: visible; }
.dos-help pre { margin: 0; padding: 0; color: var(--accent, #00ff88); font-size: 14px; line-height: 1.4; }
.help-hint { 
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px); 
    background: var(--bg-card, rgba(10, 10, 10, 0.95)); border: 1px solid var(--border, #333); 
    padding: 12px 24px; color: var(--dim, #888); font-size: 13px; 
    opacity: 0; visibility: hidden; transition: all 0.3s; z-index: 100; 
}
.help-hint.visible { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
.help-hint span { color: var(--accent, #00ff88); background: var(--accent-dim, rgba(0, 255, 136, 0.1)); padding: 2px 8px; border-radius: 3px; }
.gallery-item.focused { border-color: var(--accent, #00ff88) !important; box-shadow: 0 0 30px var(--accent-dim, rgba(0, 255, 136, 0.15)); }
`;
document.head.appendChild(styles);
