/**
 * MonospacePoetry v2 - Data Store
 * 
 * JSON file store with fallback to in-memory for Netlify Functions
 * Uses local JSON files in development, in-memory in production
 * Can be swapped for Netlify Blobs or external DB later
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Data directory (only works locally)
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const WORKS_FILE = path.join(DATA_DIR, 'works.json');
const AUTHORS_FILE = path.join(DATA_DIR, 'authors.json');

// In-memory store (primary in production, cache in development)
let works = new Map();
let authors = new Map();
let isInitialized = false;

// Initialize store from JSON files if available
function initStore() {
  if (isInitialized) return;
  
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // Load works
    if (fs.existsSync(WORKS_FILE)) {
      const data = JSON.parse(fs.readFileSync(WORKS_FILE, 'utf8'));
      works = new Map(Object.entries(data));
      console.log(`Loaded ${works.size} works from file`);
    }
    
    // Load authors
    if (fs.existsSync(AUTHORS_FILE)) {
      const data = JSON.parse(fs.readFileSync(AUTHORS_FILE, 'utf8'));
      authors = new Map(Object.entries(data));
      console.log(`Loaded ${authors.size} authors from file`);
    }
  } catch (err) {
    console.log('Running in memory-only mode:', err.message);
  }
  
  isInitialized = true;
}

// Persist works to file
function persistWorks() {
  try {
    const data = Object.fromEntries(works);
    fs.writeFileSync(WORKS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    // Ignore in production (Netlify Functions are read-only)
  }
}

// Persist authors to file
function persistAuthors() {
  try {
    const data = Object.fromEntries(authors);
    fs.writeFileSync(AUTHORS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    // Ignore in production
  }
}

// Initialize on module load
initStore();
  return crypto.randomUUID();
}

// Generate SHA-256 hash
function hash(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

// Get current ISO timestamp
function now() {
  return new Date().toISOString();
}

// Get date only (for daily limits)
function today() {
  return new Date().toISOString().split('T')[0];
}

// Default work values
function defaultWork(overrides = {}) {
  const id = uuid();
  const created = now();
  
  return {
    id,
    title: 'Untitled',
    body: '',
    created_at: created,
    updated_at: created,
    
    authors: [],
    author_keys: [],
    
    confidence: null,
    epistemic_mode: null,
    
    state: 'draft',
    burned_at: null,
    
    parents: [],
    parent_type: null,
    
    cadence: null,
    decay: { type: 'permanent', at: null, mutations: [] },
    revision_window_hours: null,
    
    reply_mode: 'open',
    allowed_operations: ['read', 'fork', 'witness'],
    
    width: 80,
    charset: 'unicode',
    whitespace_significant: false,
    license: 'CC0',
    
    body_hash: null,
    signature: null,
    witnessed_by: [],
    
    witness_count: 0,
    fork_count: 0,
    children: [],
    
    ...overrides
  };
}

// Default author values
function defaultAuthor(overrides = {}) {
  const id = uuid();
  const created = now();
  
  return {
    id,
    key: null,
    name: 'Anonymous',
    created_at: created,
    
    posts_this_epoch: 0,
    epoch_start: created,
    last_post_at: null,
    silence_until: null,
    
    witnesses_today: 0,
    witness_date: today(),
    
    posts_per_epoch: 3,
    epoch_duration_days: 7,
    silence_after_post_hours: 24,
    witnesses_per_day: 10,
    
    ...overrides
  };
}

// === WORK OPERATIONS ===

function createWork(data) {
  const work = defaultWork(data);
  work.body_hash = hash(work.body);
  works.set(work.id, work);
  persistWorks();
  return work;
}

function getWork(id) {
  return works.get(id) || null;
}

function updateWork(id, updates) {
  const work = works.get(id);
  if (!work) return null;
  if (work.state === 'sealed' || work.state === 'burned') {
    throw new Error(`Cannot update ${work.state} work`);
  }

  const updated = {
    ...work,
    ...updates,
    id: work.id,  // prevent id change
    created_at: work.created_at,  // prevent created_at change
    updated_at: now()
  };

  // Recalculate hash if body changed
  if (updates.body) {
    updated.body_hash = hash(updated.body);
  }

  works.set(id, updated);
  persistWorks();
  // Filter by state
  if (filter.state) {
    result = result.filter(w => w.state === filter.state);
  }
  
  // Filter out drafts by default (unless explicitly requested)
  if (!filter.include_drafts && filter.state !== 'draft') {
    result = result.filter(w => w.state !== 'draft');
  }
  
  // Filter by author
  if (filter.author) {
    result = result.filter(w => w.authors.includes(filter.author));
  }
  
  // Sort by created_at descending
  result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  // Limit
  if (filter.limit) {
    result = result.slice(0, filter.limit);
  }
  
  return result;
}

// === STATE TRANSITIONS ===

function finishWork(id) {
  const work = works.get(id);
  if (!work) throw new Error('Work not found');
  if (work.state !== 'draft') throw new Error('Only drafts can be finished');
  
  return updateWork(id, { state: 'finished' });
}

function sealWork(id) {
  const work = works.get(id);
  if (!work) throw new Error('Work not found');
  if (work.state !== 'finished') throw new Error('Only finished works can be sealed');
  
  return updateWork(id, { state: 'sealed' });
}

function burnWork(id) {
  const work = works.get(id);
  if (!work) throw new Error('Work not found');
  if (work.state !== 'finished') throw new Error('Only finished works can be burned');
  
  // Preserve hash, destroy body
  const burned = {
    ...work,
    state: 'burned',
    burned_at: now(),
    body: null,
    // Keep: id, title, authors, created_at, body_hash, parents, children
  };
  
  works.set(id, burned);
  persistWorks();
  return burned;
}

// === LINEAGE ===

function forkWork(parentId, authorName) {
  const parent = works.get(parentId);
  if (!parent) throw new Error('Parent work not found');
  if (parent.state === 'draft') throw new Error('Cannot fork a draft');
  if (!parent.allowed_operations.includes('fork')) {
    throw new Error('This work does not allow forking');
  }

  const fork = createWork({
    title: `Fork of: ${parent.title}`,
    body: parent.body,
    authors: [authorName],
    parents: [parentId],
    parent_type: 'fork',
    width: parent.width,
    charset: parent.charset
  });

  // Update parent's children and fork count
  parent.children.push(fork.id);
  parent.fork_count++;
  works.set(parentId, parent);
  persistWorks();
  if (direction === 'both' || direction === 'up') {
    const visited = new Set();
    const queue = [...work.parents];
    while (queue.length > 0) {
      const pid = queue.shift();
      if (visited.has(pid)) continue;
      visited.add(pid);
      
      const parent = works.get(pid);
      if (parent) {
        result.ancestors.push(parent);
        queue.push(...parent.parents);
      }
    }
  }
  
  // Get descendants
  if (direction === 'both' || direction === 'down') {
    const visited = new Set();
    const queue = [...work.children];
    while (queue.length > 0) {
      const cid = queue.shift();
      if (visited.has(cid)) continue;
      visited.add(cid);
      
      const child = works.get(cid);
      if (child) {
        result.descendants.push(child);
        queue.push(...child.children);
      }
    }
  }
  
  return result;
}

// === WITNESSING ===

function witnessWork(workId, authorId) {
  const work = works.get(workId);
  const author = authors.get(authorId);
  
  if (!work) throw new Error('Work not found');
  if (!author) throw new Error('Author not found');
  if (work.state !== 'finished' && work.state !== 'sealed') {
    throw new Error('Can only witness finished or sealed works');
  }
  
  // Check daily limit
  if (author.witness_date !== today()) {
    author.witnesses_today = 0;
    author.witness_date = today();
  }
  
  if (author.witnesses_today >= author.witnesses_per_day) {
    throw new Error(`Witness limit reached (${author.witnesses_per_day}/day)`);
  }
  
  // Check if already witnessed
  if (work.witnessed_by.some(w => w.key === author.key || w.author_id === authorId)) {
    throw new Error('Already witnessed this work');
  }
  
  // Add witness
  work.witnessed_by.push({
    author_id: authorId,
    author_name: author.name,
    key: author.key,
    at: now()
  });
  work.witness_count++;
  works.set(workId, work);
  persistWorks();
  
  // Update author
  author.witnesses_today++;
  authors.set(authorId, author);
  persistAuthors();

  return work;
}

// === AUTHOR OPERATIONS ===

function createAuthor(data) {
  const author = defaultAuthor(data);
  authors.set(author.id, author);
  persistAuthors();
}

function canPost(authorId) {
  const author = authors.get(authorId);
  if (!author) return { allowed: false, reason: 'Author not found' };
  
  // Check silence period
  if (author.silence_until) {
    const silenceEnd = new Date(author.silence_until);
    if (silenceEnd > new Date()) {
      const remaining = Math.ceil((silenceEnd - new Date()) / (1000 * 60));
      return { 
        allowed: false, 
        reason: `In silence period. ${remaining} minutes remaining.` 
      };
    }
  }
  
  // Check epoch limit
  const epochStart = new Date(author.epoch_start);
  const epochEnd = new Date(epochStart);
  epochEnd.setDate(epochEnd.getDate() + author.epoch_duration_days);
  
  if (new Date() > epochEnd) {
    // New epoch
    author.epoch_start = now();
    author.posts_this_epoch = 0;
    authors.set(authorId, author);
    persistAuthors();
  }
  
  if (author.posts_this_epoch >= author.posts_per_epoch) {
    return { 
      allowed: false, 
      reason: `Epoch limit reached (${author.posts_per_epoch} per ${author.epoch_duration_days} days)` 
    };
  }
  
  return { allowed: true };
}

function recordPost(authorId) {
  const author = authors.get(authorId);
  if (!author) return;
  
  author.posts_this_epoch++;
  author.last_post_at = now();
  
  // Set silence period
  const silenceEnd = new Date();
  silenceEnd.setHours(silenceEnd.getHours() + author.silence_after_post_hours);
  author.silence_until = silenceEnd.toISOString();
  
  authors.set(authorId, author);
  persistAuthors();
    }
  }
  
  // Check for tabs
  if (work.body && work.body.includes('\t')) {
    errors.push('Tabs are not allowed (use spaces)');
  }
  
  // Check for invalid characters
  if (work.body) {
    const invalidChars = work.body.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g);
    if (invalidChars) {
      errors.push(`Invalid control characters found`);
    }
  }
  
  // Warnings
  const maxLine = Math.max(...lines.map(l => l.length));
  const minLine = Math.min(...lines.filter(l => l.length > 0).map(l => l.length));
  if (maxLine - minLine > 10) {
    warnings.push('Ragged right edge detected');
  }
  
  // Check for smart quotes
  if (work.body && /[""]/.test(work.body)) {
    warnings.push('Smart quotes detected (consider using straight quotes)');
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

// === EXPORT ===

module.exports = {
  // Work operations
  createWork,
  getWork,
  updateWork,
  listWorks,
  finishWork,
  sealWork,
  burnWork,
  forkWork,
  getLineage,
  witnessWork,
  validateWork,
  
  // Author operations
  createAuthor,
  getAuthor,
  getAuthorByName,
  canPost,
  recordPost,
  
  // Utilities
  uuid,
  hash,
  now,
  today
};
