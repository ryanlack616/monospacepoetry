// ═══════════════════════════════════════════════════════════
// AMBIENT FEATURES - for those who look closer
// ═══════════════════════════════════════════════════════════

// Console messages for the curious
(function initConsolePoetry() {
    const messages = [
        ['·', 'you found the quiet part'],
        ['░', 'the code is also a poem if you read it right'],
        ['◌', 'hello from the space between intention and display'],
        ['─', 'every function is a small act of faith'],
        ['∙', 'we left some things here for you to find']
    ];
    const [symbol, text] = messages[Math.floor(Math.random() * messages.length)];
    console.log('%c' + symbol + '%c ' + text, 'font-size: 20px; color: #00ff88;', 'font-size: 14px; color: #888; font-family: monospace;');
    
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
        phase += 0.002;
        const opacity = 0.03 + Math.sin(phase) * 0.02;
        root.style.setProperty('--breath', opacity);
        requestAnimationFrame(breathe);
    }
    
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
    
    if (visits === 1) {
        document.body.classList.add('first-visit');
    }
    if (visits > 1) {
        document.body.classList.add('returning');
    }
    if (visits >= 10) {
        document.body.classList.add('frequent');
    }
    if (visits >= 50) {
        document.body.classList.add('devoted');
    }
    
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
    } else if (hour >= 20) {
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
                document.body.classList.add('reading-deeply');
            }
        }, 2000);
    });
})();

// Selection styling
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
        '◇ wander',
        '◇ next',
        '◇ discover'
    ];
    
    btn.addEventListener('mouseenter', () => {
        btn.textContent = phrases[Math.floor(Math.random() * phrases.length)];
    });
})();

// Footer poem - rotates based on page
(function initFooterPoem() {
    const footer = document.querySelector('.footer-poem');
    if (!footer) return;
    
    const poems = [
        'the space between what you meant and what appeared',
        'every character takes the same width · that is the only rule',
        'the grid remembers what you show it',
        'some things exist only in the looking',
        'the blank space is not empty · it is listening',
        'you do not need to know everything',
        'what you delete also matters'
    ];
    
    const hash = window.location.pathname.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    footer.textContent = poems[hash % poems.length];
})();
