// Monospace Poetry - Interactive Features
// Theme, sharing, random poems, live preview, and more

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initGallery();
    initCopyToast();
    initCharPalette();
    initLivePreview();
    initScrollProgress();
});

// Gallery init - loads poems from JSON, then wires up features
async function initGallery() {
    if (typeof Gallery !== 'undefined') {
        await Gallery.init();
        initRandomButtonDynamic();
        initKeyboardNav();
    }
}

// Random button wired to Gallery
function initRandomButtonDynamic() {
    const btn = document.querySelector('.random-btn');
    if (!btn || typeof Gallery === 'undefined') return;
    btn.addEventListener('click', () => Gallery.showRandom());
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// THEME TOGGLE (Dark/Light)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
    toggle.textContent = isLight ? 'â—' : 'â—‘';
    toggle.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
}


// Share modal (used by gallery.js event delegation)
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
                    <span>ð•</span> Post to X/Twitter
                </button>
                <button class="share-btn" data-action="copy-link">
                    <span>ðŸ”—</span> Copy link
                </button>
                <button class="share-btn" data-action="copy-text">
                    <span>ðŸ“‹</span> Copy poem text
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// COPY TOAST
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CHARACTER PALETTE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function initCharPalette() {
    const container = document.querySelector('.char-palette-container');
    if (!container) return;

    const PALETTES = {
        technical: {
            name: "Reference",
            icon: "◇",
            groups: {
                "Box Light": "─│┌┐└┘├┤┬┴┼",
                "Box Heavy": "━┃┏┓┗┛┣┫┳┻╋",
                "Box Double": "═║╔╗╚╝╠╣╦╩╬",
                "Box Round": "╭╮╰╯",
                "Blocks": "░▒▓█▀▄▌▐▖▗▘▙▚▛▜▝▞▟",
                "Shapes": "◇◆○●□■△▽▲▼◁▷◀▶",
                "Circles": "◉◎◌◍◐◑◒◓◔◕",
                "Stars": "★☆✦✧⋆∗✱✲✳✴✵✶✷✸✹",
                "Arrows": "←→↑↓↔↕↖↗↘↙⇐⇒⇑⇓⇔",
                "Math": "±×÷·∙°≠≈≡∞√∑∫∂∆∇",
                "Greek": "αβγδεζηθικλμνξπρστφχψω",
                "Super/Sub": "⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉",
                "Fractions": "½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞",
                "Dots": "·•●○◦◉◎⊙∘∙…⋯⋮",
                "Brackets": "⟨⟩⟪⟫⌈⌉⌊⌋⟦⟧「」『』",
                "Misc": "§¶†‡※♩♪♫♬♠♣♥♦"
            }
        },
        threshold: {
            name: "Thresholds",
            icon: "◐",
            groups: {
                "almost": "░·∙◌○◦∘",
                "becoming": "░▒▓█",
                "between": "│║┃╎╏┆┇┊┋",
                "dissolving": "█▓▒░·∙◌○",
                "the edge of": "─━═┄┈╌",
                "what remains": "·∙○◌◦∘░",
                "not yet": "◐◑◒◓◔◕",
                "just after": "▓▒░·∙◌○◦",
                "the space where": "　░◌○◦·∙",
                "threshold": "│┃║▏▎╽╿",
                "liminal": "░▒◌◍◐◑◒◓"
            }
        },
        memory: {
            name: "Memory",
            icon: "◌",
            groups: {
                "what I remember": "●◉○◌·∙◦",
                "what I forgot": "░·∙◌◦∘　",
                "it looked like": "□■◇◆○●△▽",
                "the shape of": "╭╮╰╯◠◡∩∪",
                "fragments": "▖▗▘▙▚▛▜▝▞▟",
                "traces": "·∙┄┈╌╍···",
                "echoes": "○◌◦∙·  ·∙",
                "the feeling of": "░▒▓◐◑◒◓",
                "half-remembered": "▓▒░·◌○◦∙",
                "before I knew": "◌○◦·∙∘░　",
                "palimpsest": "█▓▒░◌·∙◦○"
            }
        },
        silence: {
            name: "Silence",
            icon: "·",
            groups: {
                "what I didn't say": "·∙◦○◌　░",
                "the pause": "─···─···─",
                "held breath": "○◌◦·∙∘",
                "3am": "·∙★☆✦✧◌○",
                "empty room": "│　　　　　│",
                "after the door closed": "─┘　　　　└─",
                "snow falling": "·∙°◦◌○∘",
                "between words": "　···　···　",
                "the weight of": "▓▒░·∙◌○◦",
                "listening": "◯○◌◦·∙∘",
                "what the house knows": "┌─────┐└─────┘"
            }
        },
        motion: {
            name: "Motion",
            icon: "→",
            groups: {
                "leaving": "→⟶➔↦↗↘",
                "arriving": "←⟵↤↖↙◁",
                "falling": "↓↡↧⇓│┃║",
                "rising": "↑↟↥⇑│┃║",
                "spiraling": "◐◑◒◓↺↻⟳⟲",
                "drifting": "～∿≋⌇∼∽",
                "orbit": "○◌◦·∙◦◌○",
                "breathing": "◌○◎◉◎○◌",
                "pulse": "·∙●∙·∙●∙·",
                "the way water": "～∿≋⌇╲╱∼",
                "scatter": "·  ∙  ◦  ○  ◌"
            }
        },
        weight: {
            name: "Weight",
            icon: "█",
            groups: {
                "heavy": "█■●▓◆▮",
                "light": "○◌◦·∙∘☆",
                "sinking": "·∙○●◉█↓",
                "floating": "○◌·∙°◦☆",
                "crushing": "█▓▒░···",
                "lifting": "···░▒▓█",
                "gravity": "↓↓↓●●●",
                "held": "┃│├┤┼╋╬",
                "released": "○◌◦·∙∘　",
                "the anchor": "│┃║●◉◎",
                "what carries": "═━─┄┈╌"
            }
        },
        time: {
            name: "Time",
            icon: "◎",
            groups: {
                "before": "◌○◦·∙∘　",
                "during": "░▒▓█▓▒░",
                "after": "·∙◦○◌　░",
                "always": "∞◯○◎◉●",
                "never": "∅○◌◦·∙◦◌○",
                "the moment": "·●·",
                "years": "─────────────",
                "seasons": "◐◑◒◓◐◑◒◓",
                "what lasts": "█■●◆★",
                "what doesn't": "░·∙◦◌○　",
                "meanwhile": "│　│　│　│"
            }
        },
        connection: {
            name: "Between Us",
            icon: "─",
            groups: {
                "together": "││┃┃║║",
                "apart": "│　　　　│",
                "reaching": "─→　　←─",
                "the distance": "·····∙∙∙∙∙",
                "bridge": "═══════",
                "thread": "─┄┈╌···",
                "tangled": "╳╬┼╋┿╂",
                "parallel": "═══\n═══",
                "intersection": "┼╋╬✕✖",
                "what holds": "┌──────┐│      ││      │└──────┘",
                "letting go": "─┄┈╌···　"
            }
        }
    };

    let currentPalette = 'threshold';

    function renderPalette(paletteKey) {
        const palette = PALETTES[paletteKey];
        let html = '<div class="char-palette">';
        
        html += '<div class="palette-tabs">';
        for (const [key, p] of Object.entries(PALETTES)) {
            const active = key === paletteKey ? ' active' : '';
            html += `<button class="palette-tab${active}" data-palette="${key}">${p.icon} ${p.name}</button>`;
        }
        html += '</div>';

        for (const [group, chars] of Object.entries(palette.groups)) {
            html += `<div class="char-group">
                <div class="char-group-name">${group}</div>
                <div class="char-row">`;

            for (const char of chars) {
                if (char !== ' ' && char !== '\n') {
                    html += `<button class="char-btn" data-char="${char}">${char}</button>`;
                }
            }

            html += '</div></div>';
        }

        html += '</div>';
        container.innerHTML = html;

        container.querySelectorAll('.palette-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                currentPalette = tab.dataset.palette;
                renderPalette(currentPalette);
            });
        });

        container.querySelectorAll('.char-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const char = btn.dataset.char;
                navigator.clipboard.writeText(char);
                showToast(`${char}`);

                const editor = document.querySelector('.editor-textarea');
                if (editor) {
                    const start = editor.selectionStart;
                    const end = editor.selectionEnd;
                    editor.value = editor.value.substring(0, start) + char + editor.value.substring(end);
                    editor.selectionStart = editor.selectionEnd = start + char.length;
                    editor.dispatchEvent(new Event('input'));
                    editor.focus();
                }
            });
        });
    }

    renderPalette(currentPalette);
}


// LIVE PREVIEW EDITOR
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// KEYBOARD NAVIGATION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ═══════════════════════════════════════════════════════════
// KEYBOARD NAVIGATION (works with dynamic gallery items)
// ═══════════════════════════════════════════════════════════
function initKeyboardNav() {
    let currentIndex = -1;
    let helpVisible = false;
    
    const helpPanel = document.createElement('div');
    helpPanel.className = 'dos-help';
    helpPanel.innerHTML = `<pre>
╔═══════════════════════════════════════════╗
║           KEYBOARD NAVIGATION            ║
╠═══════════════════════════════════════════╣
║                                          ║
║   ↓ / j     next piece                   ║
║   ↑ / k     previous piece               ║
║   ← / h     previous page                ║
║   → / l     next page                    ║
║   r         random piece                 ║
║   t         toggle theme                 ║
║   ?         toggle this help             ║
║   Esc       close                        ║
║                                          ║
╠═══════════════════════════════════════════╣
║       Press any key to continue...       ║
╚═══════════════════════════════════════════╝</pre>`;
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
    
    // Re-query items each time (they change with pagination)
    function getItems() {
        return document.querySelectorAll('.gallery-item');
    }
    
    function scrollToItem(index) {
        const items = getItems();
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
        
        const items = getItems();
        
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
            case 'ArrowLeft':
            case 'h':
                e.preventDefault();
                if (typeof Gallery !== 'undefined') {
                    const p = Gallery.getPage();
                    if (p > 1) { Gallery.goToPage(p - 1); currentIndex = -1; }
                }
                break;
            case 'ArrowRight':
            case 'l':
                e.preventDefault();
                if (typeof Gallery !== 'undefined') {
                    const p = Gallery.getPage();
                    if (p < Gallery.getTotalPages()) { Gallery.goToPage(p + 1); currentIndex = -1; }
                }
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
                if (typeof Gallery !== 'undefined') Gallery.showRandom();
                break;
            case 't':
                e.preventDefault();
                document.querySelector('.theme-toggle')?.click();
                break;
        }
    });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SCROLL PROGRESS BAR
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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




// ═══════════════════════════════════════════════════════════
// AMBIENT FEATURES - for those who look closer
// ═══════════════════════════════════════════════════════════

// Console messages for the curious
(function initConsolePoetry() {
    const messages = [
        `%c·%c you found the quiet part`,
        `%c░%c the code is also a poem if you read it right`,
        `%c◌%c hello from the space between intention and display`,
        `%c─%c every function is a small act of faith`,
        `%c∙%c we left some things here for you to find`
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    console.log(msg, 'font-size: 20px; color: #00ff88;', 'font-size: 14px; color: #888; font-family: monospace;');
    
    console.log('%c┌──────────────────────────────────────┐', 'color: #333;');
    console.log('%c│  monospace poetry                    │', 'color: #333;');
    console.log('%c│  the grid remembers                  │', 'color: #333;');
    console.log('%c│                                      │', 'color: #333;');
    console.log('%c│  view-source is also reading         │', 'color: #333;');
    console.log('%c└──────────────────────────────────────┘', 'color: #333;');
})();

// Breathing animation - so slow you barely notice
(function initBreathing() {
    const root = document.documentElement;
    let phase = 0;
    
    function breathe() {
        phase += 0.002; // very slow
        const opacity = 0.03 + Math.sin(phase) * 0.02; // subtle
        root.style.setProperty('--breath', opacity);
        requestAnimationFrame(breathe);
    }
    
    // Add CSS variable usage
    const breathStyle = document.createElement('style');
    breathStyle.textContent = `
        .gallery-item::before {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--accent);
            opacity: var(--breath, 0);
            pointer-events: none;
            transition: opacity 2s;
        }
    `;
    document.head.appendChild(breathStyle);
    breathe();
})();

// Visit counter - different experience over time
(function initVisitMemory() {
    const visits = parseInt(localStorage.getItem('mp-visits') || '0') + 1;
    localStorage.setItem('mp-visits', visits);
    
    const root = document.documentElement;
    root.setAttribute('data-visits', visits);
    
    // First visit
    if (visits === 1) {
        document.body.classList.add('first-visit');
    }
    // Return visitor
    if (visits > 1) {
        document.body.classList.add('returning');
    }
    // Frequent visitor
    if (visits >= 10) {
        document.body.classList.add('frequent');
    }
    // Devoted
    if (visits >= 50) {
        document.body.classList.add('devoted');
    }
    
    // Add subtle acknowledgment
    const visitStyle = document.createElement('style');
    visitStyle.textContent = `
        .first-visit footer::after {
            content: ' · welcome';
            color: var(--dim);
        }
        .returning footer::after {
            content: ' · welcome back';
            color: var(--dim);
        }
        .frequent footer::after {
            content: ' · you keep returning';
            color: var(--dim);
        }
        .devoted footer::after {
            content: ' · ◆';
            color: var(--accent);
        }
    `;
    document.head.appendChild(visitStyle);
})();

// Time-aware - different feel at different hours
(function initTimeAwareness() {
    const hour = new Date().getHours();
    const root = document.documentElement;
    
    if (hour >= 0 && hour < 5) {
        root.setAttribute('data-time', 'deep-night');
        document.body.classList.add('late-hours');
    } else if (hour >= 5 && hour < 8) {
        root.setAttribute('data-time', 'early');
    } else if (hour >= 20 || hour >= 0) {
        root.setAttribute('data-time', 'evening');
    }
    
    const timeStyle = document.createElement('style');
    timeStyle.textContent = `
        .late-hours {
            --accent: #8888ff;
            --accent-dim: rgba(136, 136, 255, 0.1);
        }
        .late-hours .footer-poem::before {
            content: 'still here at this hour · ';
            color: var(--dim);
        }
    `;
    document.head.appendChild(timeStyle);
})();

// Pause detection - when someone stops scrolling
(function initPauseDetection() {
    let scrollTimeout;
    let pauseCount = 0;
    
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            pauseCount++;
            if (pauseCount === 3) {
                // They've paused 3 times - they're really reading
                document.body.classList.add('reading-deeply');
            }
        }, 2000); // 2 second pause
    });
})();

// Selection poetry - when you highlight text
(function initSelectionPoetry() {
    const selectionStyle = document.createElement('style');
    selectionStyle.textContent = `
        ::selection {
            background: var(--accent);
            color: var(--bg);
        }
        ::-moz-selection {
            background: var(--accent);
            color: var(--bg);
        }
    `;
    document.head.appendChild(selectionStyle);
})();

// Random button text that shifts
(function initShiftingRandom() {
    const btn = document.querySelector('.random-btn');
    if (!btn) return;
    
    const phrases = [
        '◇ another',
        '◇ elsewhere',
        '◇ surprise me',
        '◇ something else',
        '◇ wander',
        '◇ next',
        '◇ discover'
    ];
    
    btn.addEventListener('mouseenter', () => {
        btn.textContent = phrases[Math.floor(Math.random() * phrases.length)];
    });
})();

// Footer poem - rotates on each page
(function initFooterPoem() {
    const footer = document.querySelector('.footer-poem');
    if (!footer) return;
    
    const poems = [
        'the space between what you meant and what appeared',
        'every character takes the same width · that is the only rule',
        'the grid remembers what you show it',
        'some things exist only in the looking',
        "the blank space isn't empty · it's listening",
        "you don't need to know everything",
        'start anywhere · the grid will hold you',
        'what you delete also matters'
    ];
    
    // Use page path to deterministically select (so it's consistent per-page but different across pages)
    const hash = window.location.pathname.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    footer.textContent = poems[hash % poems.length];
})();
