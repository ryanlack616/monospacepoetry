/**
 * MonospacePoetry v2 - Memory Substrate Frontend
 * 
 * This module adds v2 functionality to the existing site:
 * - State indicators (draft/finished/sealed/burned)
 * - Epistemic stance display
 * - Witness interaction
 * - Fork functionality
 * - Lineage visualization
 * - Scarcity status
 */

const API_BASE = '/.netlify/functions';

// === STATE COLORS ===
const STATE_COLORS = {
  draft: 'var(--dim)',
  finished: 'var(--text)',
  sealed: '#4a9eff',
  burned: '#ff4444'
};

const STATE_ICONS = {
  draft: '○',
  finished: '◎',
  sealed: '◆',
  burned: '◇'
};

// === API HELPERS ===
async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

// === WORK MANAGEMENT ===
const WorksAPI = {
  async list(options = {}) {
    const params = new URLSearchParams();
    if (options.state) params.set('state', options.state);
    if (options.author) params.set('author', options.author);
    if (options.limit) params.set('limit', options.limit);
    return apiCall(`/api?${params}`);
  },
  
  async get(id) {
    return apiCall(`/api/${id}`);
  },
  
  async create(work) {
    return apiCall('/api', {
      method: 'POST',
      body: JSON.stringify(work)
    });
  },
  
  async update(id, changes) {
    return apiCall(`/api/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes)
    });
  },
  
  async finish(id) {
    return apiCall(`/api/${id}/finish`, { method: 'POST' });
  },
  
  async seal(id) {
    return apiCall(`/api/${id}/seal`, { method: 'POST' });
  },
  
  async burn(id, confirm = false) {
    return apiCall(`/api/${id}/burn`, {
      method: 'POST',
      body: JSON.stringify({ confirm })
    });
  },
  
  async fork(id, authorId) {
    return apiCall(`/api/${id}/fork`, {
      method: 'POST',
      body: JSON.stringify({ author_id: authorId })
    });
  },
  
  async witness(id, authorId) {
    return apiCall(`/api/${id}/witness`, {
      method: 'POST',
      body: JSON.stringify({ witness_id: authorId })
    });
  },
  
  async getLineage(id) {
    return apiCall(`/api/${id}/graph`);
  }
};

// === AUTHOR MANAGEMENT ===
const AuthorsAPI = {
  async create(name, agent_type = 'human') {
    return apiCall('/authors', {
      method: 'POST',
      body: JSON.stringify({ name, agent_type })
    });
  },
  
  async getStatus(id) {
    return apiCall(`/authors/${id}/status`);
  }
};

// === UI COMPONENTS ===

// State badge component
function createStateBadge(state) {
  const badge = document.createElement('span');
  badge.className = `state-badge state-${state}`;
  badge.innerHTML = `${STATE_ICONS[state]} ${state}`;
  badge.style.cssText = `
    color: ${STATE_COLORS[state]};
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  `;
  return badge;
}

// Epistemic indicator
function createEpistemicIndicator(mode, confidence) {
  const indicator = document.createElement('div');
  indicator.className = 'epistemic-indicator';
  
  const modeEmojis = {
    assertion: '●',
    speculation: '○',
    question: '?',
    memory: '◎',
    dream: '~'
  };
  
  let html = `<span class="mode">${modeEmojis[mode] || '·'} ${mode || 'unknown'}</span>`;
  
  if (confidence !== null && confidence !== undefined) {
    const bar = '▓'.repeat(Math.round(confidence * 10)) + '░'.repeat(10 - Math.round(confidence * 10));
    html += `<span class="confidence" title="Confidence: ${(confidence * 100).toFixed(0)}%">${bar}</span>`;
  }
  
  indicator.innerHTML = html;
  indicator.style.cssText = `
    font-size: 0.75rem;
    color: var(--dim);
    display: flex;
    gap: 1rem;
    align-items: center;
  `;
  
  return indicator;
}

// Witness button
function createWitnessButton(work, authorId) {
  const btn = document.createElement('button');
  btn.className = 'witness-btn';
  btn.innerHTML = `👁 ${work.witness_count || 0}`;
  btn.title = 'Witness this work';
  btn.style.cssText = `
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text);
    padding: 0.25rem 0.5rem;
    font-family: inherit;
    font-size: 0.8rem;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  `;
  
  if (work.witnesses?.includes(authorId)) {
    btn.style.borderColor = 'var(--accent)';
    btn.style.color = 'var(--accent)';
    btn.title = 'You witnessed this';
    btn.disabled = true;
  }
  
  btn.addEventListener('click', async () => {
    try {
      const result = await WorksAPI.witness(work.id, authorId);
      btn.innerHTML = `👁 ${result.witness_count}`;
      btn.style.borderColor = 'var(--accent)';
      btn.style.color = 'var(--accent)';
      btn.disabled = true;
      showToast('Witnessed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
  
  return btn;
}

// Fork button
function createForkButton(work, authorId) {
  const btn = document.createElement('button');
  btn.className = 'fork-btn';
  btn.innerHTML = '⑂ fork';
  btn.title = 'Create a derivative work';
  btn.style.cssText = `
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text);
    padding: 0.25rem 0.5rem;
    font-family: inherit;
    font-size: 0.8rem;
    cursor: pointer;
    transition: border-color 0.2s;
  `;
  
  btn.addEventListener('click', async () => {
    try {
      const result = await WorksAPI.fork(work.id, authorId);
      showToast('Work forked! Opening editor...');
      // Navigate to edit the new draft
      window.location.href = `/edit.html?id=${result.id}`;
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
  
  return btn;
}

// Lineage graph (simple ASCII visualization)
function createLineageDisplay(lineage) {
  const container = document.createElement('div');
  container.className = 'lineage-display';
  
  if (!lineage?.ancestors?.length && !lineage?.descendants?.length) {
    container.innerHTML = '<span class="no-lineage">· original work ·</span>';
  } else {
    let html = '<div class="lineage-tree">';
    
    // Ancestors (works this forked from)
    if (lineage.ancestors?.length) {
      html += '<div class="ancestors">';
      lineage.ancestors.forEach(a => {
        html += `<a href="?id=${a}" class="ancestor-link">↑ ${a.substring(0, 8)}</a>`;
      });
      html += '</div>';
    }
    
    html += '<div class="current">◆ current</div>';
    
    // Descendants (forks of this work)
    if (lineage.descendants?.length) {
      html += '<div class="descendants">';
      lineage.descendants.forEach(d => {
        html += `<a href="?id=${d}" class="descendant-link">↓ ${d.substring(0, 8)}</a>`;
      });
      html += '</div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
  }
  
  container.style.cssText = `
    font-size: 0.75rem;
    color: var(--dim);
    border-top: 1px solid var(--border);
    padding-top: 0.5rem;
    margin-top: 1rem;
  `;
  
  return container;
}

// Scarcity status display
function createScarcityStatus(status) {
  const container = document.createElement('div');
  container.className = 'scarcity-status';
  
  if (!status.can_post) {
    const until = new Date(status.silence_until);
    const remaining = Math.max(0, until - Date.now());
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    container.innerHTML = `
      <span class="silence-active">◎ in silence</span>
      <span class="silence-timer">${hours}h ${minutes}m remaining</span>
    `;
  } else {
    container.innerHTML = `
      <span class="can-post">○ ${status.posts_remaining} posts remaining this epoch</span>
    `;
  }
  
  container.style.cssText = `
    font-size: 0.75rem;
    color: var(--dim);
    padding: 0.5rem;
    border: 1px dashed var(--border);
    margin: 1rem 0;
  `;
  
  return container;
}

// Burn confirmation modal
function showBurnConfirmation(work) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'burn-modal';
    modal.innerHTML = `
      <div class="burn-modal-content">
        <h3>🔥 Burn "${work.title}"?</h3>
        <p class="burn-warning">
          This action is <strong>irreversible</strong>.<br>
          The content will be permanently destroyed.<br>
          Only the hash will remain as proof it existed.
        </p>
        <div class="burn-hash">
          Hash: ${work.body_hash?.substring(0, 32)}...
        </div>
        <div class="burn-actions">
          <button class="burn-cancel">Cancel</button>
          <button class="burn-confirm">Burn Forever</button>
        </div>
      </div>
    `;
    
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;
    
    const content = modal.querySelector('.burn-modal-content');
    content.style.cssText = `
      background: var(--bg-card);
      border: 2px solid #ff4444;
      padding: 2rem;
      max-width: 400px;
      text-align: center;
    `;
    
    modal.querySelector('.burn-warning').style.cssText = `
      color: #ff4444;
      margin: 1rem 0;
    `;
    
    modal.querySelector('.burn-hash').style.cssText = `
      font-size: 0.75rem;
      color: var(--dim);
      font-family: monospace;
      margin: 1rem 0;
    `;
    
    modal.querySelector('.burn-actions').style.cssText = `
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 1rem;
    `;
    
    modal.querySelectorAll('button').forEach(btn => {
      btn.style.cssText = `
        padding: 0.5rem 1rem;
        font-family: inherit;
        cursor: pointer;
        border: 1px solid var(--border);
        background: transparent;
        color: var(--text);
      `;
    });
    
    modal.querySelector('.burn-confirm').style.cssText += `
      border-color: #ff4444;
      color: #ff4444;
    `;
    
    modal.querySelector('.burn-cancel').addEventListener('click', () => {
      modal.remove();
      resolve(false);
    });
    
    modal.querySelector('.burn-confirm').addEventListener('click', () => {
      modal.remove();
      resolve(true);
    });
    
    document.body.appendChild(modal);
  });
}

// Toast notification
function showToast(message, type = 'success') {
  const existing = document.querySelector('.v2-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'v2-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'error' ? '#ff4444' : 'var(--accent)'};
    color: ${type === 'error' ? '#fff' : '#000'};
    padding: 0.75rem 1.5rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    z-index: 2000;
    animation: toastIn 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// === INITIALIZATION ===

// Enhance existing gallery items with v2 features
function enhanceGalleryItems() {
  document.querySelectorAll('.gallery-item').forEach(item => {
    // Add v2 metadata if this is a v2 work
    const workId = item.dataset.workId;
    if (!workId) return;
    
    // Fetch work data and enhance
    WorksAPI.get(workId).then(work => {
      const footer = item.querySelector('.poem-footer');
      if (!footer) return;
      
      // Add state badge
      const stateBadge = createStateBadge(work.state);
      footer.insertBefore(stateBadge, footer.firstChild);
      
      // Add epistemic indicator
      if (work.epistemic_mode || work.confidence !== null) {
        const epistemic = createEpistemicIndicator(work.epistemic_mode, work.confidence);
        footer.appendChild(epistemic);
      }
      
      // Add witness count
      if (work.witness_count > 0) {
        const witnesses = document.createElement('span');
        witnesses.className = 'witness-count';
        witnesses.innerHTML = `👁 ${work.witness_count}`;
        witnesses.style.color = 'var(--dim)';
        footer.appendChild(witnesses);
      }
      
      // Gray out burned works
      if (work.state === 'burned') {
        item.style.opacity = '0.5';
        const pre = item.querySelector('pre');
        if (pre) {
          pre.innerHTML = `[BURNED]\n\nHash: ${work.body_hash}`;
          pre.style.color = '#ff4444';
        }
      }
    }).catch(() => {
      // Not a v2 work, that's fine
    });
  });
}

// Initialize v2 features
function initV2() {
  // Add v2 styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(-50%) translateY(1rem); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes toastOut {
      from { opacity: 1; transform: translateX(-50%) translateY(0); }
      to { opacity: 0; transform: translateX(-50%) translateY(1rem); }
    }
    
    .state-badge {
      margin-right: 0.5rem;
    }
    
    .epistemic-indicator .confidence {
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: -0.1em;
    }
    
    .lineage-tree {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }
    
    .lineage-tree a {
      color: var(--dim);
      text-decoration: none;
    }
    
    .lineage-tree a:hover {
      color: var(--accent);
    }
  `;
  document.head.appendChild(style);
  
  // Enhance gallery if on main page
  if (document.querySelector('.gallery-item')) {
    enhanceGalleryItems();
  }
  
  console.log('MonospacePoetry v2 initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initV2);
} else {
  initV2();
}

// Export for use in other scripts
window.MonospaceV2 = {
  WorksAPI,
  AuthorsAPI,
  createStateBadge,
  createEpistemicIndicator,
  createWitnessButton,
  createForkButton,
  createLineageDisplay,
  createScarcityStatus,
  showBurnConfirmation,
  showToast
};
