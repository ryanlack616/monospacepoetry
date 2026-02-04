/**
 * MonospacePoetry v2 - Render API
 * 
 * Endpoints:
 *   GET /api/render/:id?format=txt|svg|ansi|html
 * 
 * Renders a work in various formats for embedding/sharing
 */

const store = require('./store');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

// === SVG RENDERER ===
function renderSVG(work) {
  const lines = (work.body || '').split('\n');
  const charWidth = 9.6;    // monospace character width
  const lineHeight = 20;    // line height in pixels
  const padding = 20;
  
  const width = (work.width || 80) * charWidth + padding * 2;
  const height = lines.length * lineHeight + padding * 2;
  
  // Escape XML special characters
  const escape = (str) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  
  const textLines = lines.map((line, i) => 
    `<tspan x="${padding}" dy="${i === 0 ? 0 : lineHeight}">${escape(line)}</tspan>`
  ).join('\n');
  
  // State-based styling
  let bgColor = '#1a1a2e';
  let textColor = '#e0e0e0';
  let borderColor = '#333';
  
  if (work.state === 'burned') {
    bgColor = '#1a1a1a';
    textColor = '#555';
    borderColor = '#333';
  } else if (work.state === 'sealed') {
    borderColor = '#4a9eff';
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height + 60}" viewBox="0 0 ${width} ${height + 60}">
  <defs>
    <style>
      .mono { 
        font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace; 
        font-size: 14px;
        fill: ${textColor};
      }
      .title {
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        fill: #888;
      }
      .state {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        fill: ${work.state === 'sealed' ? '#4a9eff' : work.state === 'burned' ? '#ff4444' : '#666'};
      }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="${bgColor}"/>
  
  <!-- Border -->
  <rect x="1" y="1" width="${width - 2}" height="${height + 58}" 
        fill="none" stroke="${borderColor}" stroke-width="1"/>
  
  <!-- Header -->
  <text x="${padding}" y="20" class="title">${escape(work.title || 'Untitled')}</text>
  <text x="${width - padding}" y="20" class="state" text-anchor="end">${work.state.toUpperCase()}</text>
  
  <!-- Divider -->
  <line x1="${padding}" y1="30" x2="${width - padding}" y2="30" stroke="${borderColor}"/>
  
  <!-- Body -->
  <text x="${padding}" y="${45 + lineHeight}" class="mono">
    ${work.state === 'burned' ? 
      '<tspan x="' + padding + '" dy="0">[BURNED]</tspan><tspan x="' + padding + '" dy="' + lineHeight + '">Hash: ' + (work.body_hash || '').substring(0, 32) + '...</tspan>' :
      textLines
    }
  </text>
  
  <!-- Footer -->
  <text x="${padding}" y="${height + 50}" class="title">
    ${work.authors?.join(', ') || 'Anonymous'} · ${work.created_at?.split('T')[0] || ''}
  </text>
  ${work.witness_count > 0 ? 
    `<text x="${width - padding}" y="${height + 50}" class="title" text-anchor="end">👁 ${work.witness_count}</text>` : 
    ''
  }
</svg>`;
}

// === ANSI RENDERER ===
function renderANSI(work) {
  const lines = (work.body || '').split('\n');
  const width = work.width || 80;
  
  // ANSI escape codes
  const RESET = '\x1b[0m';
  const DIM = '\x1b[2m';
  const BOLD = '\x1b[1m';
  const CYAN = '\x1b[36m';
  const RED = '\x1b[31m';
  const BLUE = '\x1b[34m';
  
  let stateColor = DIM;
  if (work.state === 'sealed') stateColor = BLUE;
  if (work.state === 'burned') stateColor = RED;
  
  const topBorder = '┌' + '─'.repeat(width + 2) + '┐';
  const bottomBorder = '└' + '─'.repeat(width + 2) + '┘';
  const divider = '├' + '─'.repeat(width + 2) + '┤';
  
  const pad = (str, len) => str + ' '.repeat(Math.max(0, len - str.length));
  
  let output = [];
  
  // Header
  output.push(topBorder);
  const title = (work.title || 'Untitled').substring(0, width - 10);
  const stateStr = `[${work.state.toUpperCase()}]`;
  output.push(`│ ${BOLD}${pad(title, width - stateStr.length)}${RESET}${stateColor}${stateStr}${RESET} │`);
  output.push(divider);
  
  // Body
  if (work.state === 'burned') {
    output.push(`│ ${RED}[BURNED]${RESET}${' '.repeat(width - 8)} │`);
    output.push(`│ ${DIM}Hash: ${(work.body_hash || '').substring(0, width - 7)}${RESET} │`);
  } else {
    for (const line of lines) {
      output.push(`│ ${pad(line, width)} │`);
    }
  }
  
  // Footer
  output.push(divider);
  const author = (work.authors?.join(', ') || 'Anonymous').substring(0, width / 2);
  const date = work.created_at?.split('T')[0] || '';
  const witnesses = work.witness_count > 0 ? `👁 ${work.witness_count}` : '';
  const footer = `${author} · ${date}`;
  output.push(`│ ${DIM}${pad(footer, width - witnesses.length)}${witnesses}${RESET} │`);
  output.push(bottomBorder);
  
  return output.join('\n');
}

// === TXT RENDERER ===
function renderTXT(work) {
  const lines = (work.body || '').split('\n');
  const width = work.width || 80;
  
  let output = [];
  
  output.push('='.repeat(width));
  output.push(work.title || 'Untitled');
  output.push(`State: ${work.state.toUpperCase()}`);
  output.push('-'.repeat(width));
  
  if (work.state === 'burned') {
    output.push('[BURNED]');
    output.push(`Hash: ${work.body_hash || 'unknown'}`);
  } else {
    output.push(...lines);
  }
  
  output.push('-'.repeat(width));
  output.push(`Author: ${work.authors?.join(', ') || 'Anonymous'}`);
  output.push(`Created: ${work.created_at || 'unknown'}`);
  if (work.witness_count > 0) {
    output.push(`Witnesses: ${work.witness_count}`);
  }
  if (work.confidence !== null) {
    output.push(`Confidence: ${work.confidence}`);
  }
  if (work.epistemic_mode) {
    output.push(`Mode: ${work.epistemic_mode}`);
  }
  output.push(`Hash: ${work.body_hash || 'unknown'}`);
  output.push('='.repeat(width));
  
  return output.join('\n');
}

// === HTML RENDERER ===
function renderHTML(work) {
  const escape = (str) => (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  const stateClass = work.state === 'burned' ? 'burned' : work.state === 'sealed' ? 'sealed' : '';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(work.title)} - MonospacePoetry</title>
  <meta property="og:title" content="${escape(work.title)}">
  <meta property="og:description" content="${escape((work.body || '').substring(0, 200))}...">
  <meta property="og:type" content="article">
  <style>
    body {
      background: #1a1a2e;
      color: #e0e0e0;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      padding: 2rem;
      margin: 0;
    }
    .work {
      max-width: ${(work.width || 80) + 4}ch;
      margin: 0 auto;
      border: 1px solid #333;
      padding: 1rem;
    }
    .work.sealed { border-color: #4a9eff; }
    .work.burned { opacity: 0.5; }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #333;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
    .title { font-weight: bold; }
    .state { color: #666; font-size: 0.8em; }
    .state.sealed { color: #4a9eff; }
    .state.burned { color: #ff4444; }
    .body {
      white-space: pre;
      line-height: 1.5;
    }
    .footer {
      border-top: 1px solid #333;
      padding-top: 0.5rem;
      margin-top: 1rem;
      color: #666;
      font-size: 0.8em;
      display: flex;
      justify-content: space-between;
    }
    .meta { margin-top: 1rem; color: #555; font-size: 0.7em; }
  </style>
</head>
<body>
  <div class="work ${stateClass}">
    <div class="header">
      <span class="title">${escape(work.title)}</span>
      <span class="state ${stateClass}">${work.state.toUpperCase()}</span>
    </div>
    <div class="body">${work.state === 'burned' ? 
      `[BURNED]\nHash: ${work.body_hash}` : 
      escape(work.body)
    }</div>
    <div class="footer">
      <span>${escape(work.authors?.join(', ') || 'Anonymous')} · ${work.created_at?.split('T')[0]}</span>
      ${work.witness_count > 0 ? `<span>👁 ${work.witness_count}</span>` : ''}
    </div>
    <div class="meta">
      ${work.confidence !== null ? `Confidence: ${work.confidence} · ` : ''}
      ${work.epistemic_mode ? `Mode: ${work.epistemic_mode} · ` : ''}
      Hash: ${(work.body_hash || '').substring(0, 16)}...
    </div>
  </div>
</body>
</html>`;
}

// === HANDLER ===
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  
  if (event.httpMethod !== 'GET') {
    return { 
      statusCode: 405, 
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  // Parse ID from path
  const pathParts = event.path.split('/').filter(Boolean);
  const id = pathParts[pathParts.length - 1];
  
  if (!id || id === 'render') {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Work ID required' })
    };
  }
  
  const work = store.getWork(id);
  if (!work) {
    return {
      statusCode: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Work not found' })
    };
  }
  
  // Don't render drafts
  if (work.state === 'draft') {
    return {
      statusCode: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Work not found' })
    };
  }
  
  const format = event.queryStringParameters?.format || 'txt';
  
  switch (format) {
    case 'svg':
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'image/svg+xml' },
        body: renderSVG(work)
      };
    
    case 'ansi':
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' },
        body: renderANSI(work)
      };
    
    case 'html':
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' },
        body: renderHTML(work)
      };
    
    case 'txt':
    default:
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' },
        body: renderTXT(work)
      };
  }
};
