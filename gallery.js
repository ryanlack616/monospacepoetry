// Monospace Poetry - Dynamic Gallery with Pagination
// Single source of truth: poems.json

const Gallery = (function() {
    const PER_PAGE = 12;
    let allPoems = [];
    let currentPage = 1;
    let totalPages = 1;

    // === FETCH & INIT ===
    async function init() {
        const container = document.getElementById('gallery');
        if (!container) return;

        try {
            const response = await fetch('/poems.json');
            if (!response.ok) throw new Error('Failed to load poems');
            const data = await response.json();
            allPoems = data.poems || [];
            totalPages = Math.ceil(allPoems.length / PER_PAGE);

            // Check URL for page param
            const params = new URLSearchParams(window.location.search);
            const urlPage = parseInt(params.get('page'));
            if (urlPage && urlPage >= 1 && urlPage <= totalPages) {
                currentPage = urlPage;
            }

            renderPage(currentPage);
            renderControls();
            updateCount();

            // Re-init features that depend on gallery items
            if (typeof initShareButtons === 'function') initShareButtons();
            if (typeof initKeyboardNav === 'function') initKeyboardNav();

        } catch (err) {
            container.innerHTML = `<p class="gallery-error">could not load poems · ${err.message}</p>`;
        }
    }

    // === RENDER A PAGE OF POEMS ===
    function renderPage(page) {
        const container = document.getElementById('gallery');
        if (!container) return;

        currentPage = page;
        const start = (page - 1) * PER_PAGE;
        const end = start + PER_PAGE;
        const pagePoems = allPoems.slice(start, end);

        container.innerHTML = pagePoems.map(poem => renderPoem(poem)).join('');

        // Smooth scroll to top of gallery on page change
        const controls = document.querySelector('.gallery-controls');
        if (controls && page > 1) {
            controls.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Update URL without reload
        const url = new URL(window.location);
        if (page === 1) {
            url.searchParams.delete('page');
        } else {
            url.searchParams.set('page', page);
        }
        history.replaceState({}, '', url);

        // Re-init share buttons for new DOM
        initDynamicShareButtons();
    }

    // === RENDER SINGLE POEM ===
    function renderPoem(poem) {
        const title = (poem.title || '').toLowerCase();
        const id = poem.id || '';
        const body = escapeHtml(poem.body || '');
        const author = escapeHtml(poem.author || 'Anonymous');

        return `<section class="gallery-item" data-title="${escapeAttr(title)}" data-id="${escapeAttr(id)}">
<div class="poem-actions"><button class="share-trigger" title="Share">share</button></div>
<pre>${body}</pre>
<div class="poem-footer"><span class="artist-link">${author}</span></div>
</section>`;
    }

    // === PAGINATION CONTROLS ===
    function renderControls() {
        const existing = document.querySelector('.pagination');
        if (existing) existing.remove();

        if (totalPages <= 1) return;

        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        pagination.innerHTML = `
            <button class="page-btn page-prev" ${currentPage <= 1 ? 'disabled' : ''}>← prev</button>
            <span class="page-info">page ${currentPage} of ${totalPages}</span>
            <button class="page-btn page-next" ${currentPage >= totalPages ? 'disabled' : ''}>next →</button>
        `;

        const gallery = document.getElementById('gallery');
        gallery.after(pagination);

        pagination.querySelector('.page-prev').addEventListener('click', () => {
            if (currentPage > 1) {
                renderPage(currentPage - 1);
                renderControls();
            }
        });

        pagination.querySelector('.page-next').addEventListener('click', () => {
            if (currentPage < totalPages) {
                renderPage(currentPage + 1);
                renderControls();
            }
        });
    }

    // === RANDOM POEM ===
    function showRandom() {
        if (allPoems.length === 0) return;

        const poem = allPoems[Math.floor(Math.random() * allPoems.length)];
        const container = document.getElementById('gallery');
        if (!container) return;

        // Show single random poem with a "back to gallery" link
        container.innerHTML = renderPoem(poem);

        // Update pagination to show "random" state
        const existing = document.querySelector('.pagination');
        if (existing) existing.remove();

        const nav = document.createElement('div');
        nav.className = 'pagination';
        nav.innerHTML = `
            <button class="page-btn page-back">← back to gallery</button>
            <span class="page-info">random · 1 of ${allPoems.length}</span>
            <button class="page-btn page-another">another →</button>
        `;

        container.after(nav);

        nav.querySelector('.page-back').addEventListener('click', () => {
            renderPage(currentPage);
            renderControls();
        });

        nav.querySelector('.page-another').addEventListener('click', () => {
            showRandom();
        });

        initDynamicShareButtons();

        // Scroll to the poem
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // === UPDATE POEM COUNT ===
    function updateCount() {
        const subtitle = document.querySelector('.modal-subtitle');
        if (subtitle) {
            subtitle.textContent = `join ${allPoems.length} poems in the collection`;
        }
    }

    // === SHARE BUTTONS (event delegation for dynamic content) ===
    function initDynamicShareButtons() {
        // Use event delegation on gallery container
        const container = document.getElementById('gallery');
        if (!container || container.dataset.shareInit) return;
        container.dataset.shareInit = 'true';

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.share-trigger');
            if (!btn) return;

            const poemEl = btn.closest('.gallery-item');
            const poemText = poemEl?.querySelector('pre')?.textContent || '';
            const poemTitle = poemEl?.dataset.title || 'Monospace Poetry';
            if (typeof showShareModal === 'function') {
                showShareModal(poemTitle, poemText);
            }
        });
    }

    // === HELPERS ===
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // === PUBLIC API ===
    return {
        init,
        showRandom,
        getPoems: () => allPoems,
        getPage: () => currentPage,
        getTotalPages: () => totalPages,
        goToPage: (p) => { renderPage(p); renderControls(); }
    };
})();
