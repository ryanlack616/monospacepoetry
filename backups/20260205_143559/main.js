/**
 * Notation Performs — Main
 * The formula is the score / the canvas is the orchestra
 */

document.addEventListener('DOMContentLoaded', () => {
    // Render all KaTeX formulas
    renderFormulas();
    
    // Wire up perform buttons
    wireButtons();
    
    // Wire up reset buttons
    wireResetButtons();
});

/**
 * Render all KaTeX formulas from data-formula attributes
 */
function renderFormulas() {
    const formulas = document.querySelectorAll('.katex-formula');
    
    formulas.forEach(el => {
        const formula = el.dataset.formula;
        if (formula) {
            try {
                katex.render(formula, el, {
                    displayMode: true,
                    throwOnError: false
                });
            } catch (e) {
                console.error('KaTeX error:', e);
                el.textContent = formula;
            }
        }
    });
}

/**
 * Wire up perform buttons to their respective performers
 */
function wireButtons() {
    const buttons = document.querySelectorAll('.perform-btn');
    
    buttons.forEach(btn => {
        const piece = btn.dataset.piece;
        const canvas = document.getElementById(`${piece}-canvas`);
        const resetBtn = document.querySelector(`.reset-btn[data-piece="${piece}"]`);
        
        if (!canvas) {
            console.warn(`No canvas found for piece: ${piece}`);
            return;
        }
        
        btn.addEventListener('click', () => {
            // Get the performer function
            const performer = Performers[piece];
            
            if (!performer) {
                console.warn(`No performer found for piece: ${piece}`);
                return;
            }
            
            // Disable buttons during performance
            btn.disabled = true;
            btn.classList.add('running');
            btn.textContent = 'performing...';
            if (resetBtn) resetBtn.disabled = true;
            
            // Run the performance
            performer(canvas, () => {
                // Re-enable buttons when done
                btn.disabled = false;
                btn.classList.remove('running');
                btn.textContent = 'perform';
                if (resetBtn) resetBtn.disabled = false;
            });
        });
    });
}

/**
 * Wire up reset buttons to clear canvases
 */
function wireResetButtons() {
    const buttons = document.querySelectorAll('.reset-btn');
    
    buttons.forEach(btn => {
        const piece = btn.dataset.piece;
        const canvas = document.getElementById(`${piece}-canvas`);
        const performBtn = document.querySelector(`.perform-btn[data-piece="${piece}"]`);
        
        if (!canvas) {
            console.warn(`No canvas found for piece: ${piece}`);
            return;
        }
        
        btn.addEventListener('click', () => {
            // Clear the canvas
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#08080c';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Reset perform button state if needed
            if (performBtn) {
                performBtn.disabled = false;
                performBtn.classList.remove('running');
                performBtn.textContent = 'perform';
            }
        });
    });
}
