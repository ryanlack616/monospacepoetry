/**
 * MonospacePoetry v2 - Data Store
 *
 * In-memory store for Netlify Functions (stateless between invocations)
 * Data persists only within a single function invocation
 * For production: use Netlify Blobs, KV, or external database
 */

const crypto = require('crypto');

// In-memory store (reset on each cold start)
let works = new Map();
let authors = new Map();

// === UTILITIES ===

function uuid() {
  return crypto.randomUUID();
}

function hash(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function now() {
  return new Date().toISOString();
}

function today() {
  return new Date().toISOString().split('T')[0];
}

// === DEFAULT VALUES ===

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
    id: work.id,
    created_at: work.created_at,
    updated_at: now()
  };

  if (updates.body) {
    updated.body_hash = hash(updated.body);
  }

  works.set(id, updated);
  return updated;
}

function listWorks(filter = {}) {
  let result = Array.from(works.values());

  if (filter.state) {
    result = result.filter(w => w.state === filter.state);
  }

  if (!filter.include_drafts && filter.state !== 'draft') {
    result = result.filter(w => w.state !== 'draft');
  }

  if (filter.author) {
    result = result.filter(w => w.authors.includes(filter.author));
  }

  result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (filter.limit) {
    result = result.slice(0, filter.limit);
  }

  return result;
}

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

  const burned = {
    ...work,
    state: 'burned',
    burned_at: now(),
    body: null
  };

  works.set(id, burned);
  return burned;
}

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

  parent.children.push(fork.id);
  parent.fork_count++;
  works.set(parentId, parent);

  return fork;
}

function getLineage(id, direction = 'both') {
  const work = works.get(id);
  if (!work) return null;

  const result = { work, ancestors: [], descendants: [] };

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

function witnessWork(workId, authorId) {
  const work = works.get(workId);
  const author = authors.get(authorId);

  if (!work) throw new Error('Work not found');
  if (!author) throw new Error('Author not found');
  if (work.state !== 'finished' && work.state !== 'sealed') {
    throw new Error('Can only witness finished or sealed works');
  }

  if (author.witness_date !== today()) {
    author.witnesses_today = 0;
    author.witness_date = today();
  }

  if (author.witnesses_today >= author.witnesses_per_day) {
    throw new Error(`Witness limit reached (${author.witnesses_per_day}/day)`);
  }

  if (work.witnessed_by.some(w => w.key === author.key || w.author_id === authorId)) {
    throw new Error('Already witnessed this work');
  }

  work.witnessed_by.push({
    author_id: authorId,
    author_name: author.name,
    key: author.key,
    at: now()
  });
  work.witness_count++;
  works.set(workId, work);

  author.witnesses_today++;
  authors.set(authorId, author);

  return work;
}

function validateWork(work) {
  const errors = [];
  const warnings = [];

  if (!work.body || work.body.trim() === '') {
    errors.push('Body is required');
  }

  const lines = (work.body || '').split('\n');
  const maxWidth = work.width || 80;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length > maxWidth) {
      errors.push(`Line ${i + 1} exceeds ${maxWidth} columns (${lines[i].length})`);
    }
  }

  if (work.body && work.body.includes('\t')) {
    errors.push('Tabs are not allowed (use spaces)');
  }

  if (work.body) {
    const invalidChars = work.body.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g);
    if (invalidChars) {
      errors.push('Invalid control characters found');
    }
  }

  if (work.body && /[""]/.test(work.body)) {
    warnings.push('Smart quotes detected (consider using straight quotes)');
  }

  return { valid: errors.length === 0, errors, warnings };
}

// === AUTHOR OPERATIONS ===

function createAuthor(data) {
  const author = defaultAuthor(data);
  authors.set(author.id, author);
  return author;
}

function getAuthor(id) {
  return authors.get(id) || null;
}

function getAuthorByName(name) {
  for (const author of authors.values()) {
    if (author.name === name) return author;
  }
  return null;
}

function canPost(authorId) {
  const author = authors.get(authorId);
  if (!author) return { allowed: false, reason: 'Author not found' };

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

  const epochStart = new Date(author.epoch_start);
  const epochEnd = new Date(epochStart);
  epochEnd.setDate(epochEnd.getDate() + author.epoch_duration_days);

  if (new Date() > epochEnd) {
    author.epoch_start = now();
    author.posts_this_epoch = 0;
    authors.set(authorId, author);
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

  const silenceEnd = new Date();
  silenceEnd.setHours(silenceEnd.getHours() + author.silence_after_post_hours);
  author.silence_until = silenceEnd.toISOString();

  authors.set(authorId, author);
}

// === EXPORT ===

module.exports = {
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
  createAuthor,
  getAuthor,
  getAuthorByName,
  canPost,
  recordPost,
  uuid,
  hash,
  now,
  today
};
