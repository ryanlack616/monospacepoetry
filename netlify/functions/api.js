/**
 * MonospacePoetry v2 - Works API
 * 
 * Endpoints:
 *   GET    /api/works           - List works
 *   POST   /api/works           - Create work (draft)
 *   GET    /api/works/:id       - Get single work
 *   PATCH  /api/works/:id       - Update draft
 *   POST   /api/works/:id/finish - Finish draft
 *   POST   /api/works/:id/seal   - Seal finished work
 *   POST   /api/works/:id/burn   - Burn finished work
 *   POST   /api/works/:id/fork   - Fork work
 *   POST   /api/works/:id/witness - Witness work
 *   GET    /api/works/:id/graph  - Get lineage graph
 */

const store = require('./store');

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Author-Id',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

// Response helpers
const json = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body)
});

const error = (statusCode, message) => json(statusCode, { error: message });
const ok = (data) => json(200, data);
const created = (data) => json(201, data);

// Parse path to get ID and action
function parsePath(path) {
  // /api/works -> { id: null, action: null }
  // /api/works/123 -> { id: '123', action: null }
  // /api/works/123/fork -> { id: '123', action: 'fork' }
  
  const parts = path.replace(/^\/?(\.netlify\/functions\/)?api\/?/, '').split('/').filter(Boolean);
  
  if (parts[0] === 'works') {
    return {
      id: parts[1] || null,
      action: parts[2] || null
    };
  }
  
  return { id: null, action: null };
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  
  const { id, action } = parsePath(event.path);
  const method = event.httpMethod;
  const authorId = event.headers['x-author-id'] || null;
  
  try {
    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        return error(400, 'Invalid JSON body');
      }
    }
    
    // === LIST WORKS ===
    if (method === 'GET' && !id) {
      const filter = {
        state: event.queryStringParameters?.state,
        author: event.queryStringParameters?.author,
        limit: parseInt(event.queryStringParameters?.limit) || 50,
        include_drafts: event.queryStringParameters?.include_drafts === 'true'
      };
      
      const works = store.listWorks(filter);
      return ok({ works, count: works.length });
    }
    
    // === CREATE WORK ===
    if (method === 'POST' && !id) {
      // Check if author can post
      if (authorId) {
        const canPost = store.canPost(authorId);
        if (!canPost.allowed) {
          return error(429, canPost.reason);
        }
      }
      
      // Validate
      const validation = store.validateWork(body);
      if (!validation.valid) {
        return error(400, { message: 'Validation failed', errors: validation.errors });
      }
      
      // Create
      const work = store.createWork({
        ...body,
        authors: body.authors || (authorId ? [authorId] : ['Anonymous'])
      });
      
      return created({ work, warnings: validation.warnings });
    }
    
    // === GET SINGLE WORK ===
    if (method === 'GET' && id && !action) {
      const work = store.getWork(id);
      if (!work) return error(404, 'Work not found');
      
      // Don't return drafts to non-authors
      if (work.state === 'draft' && !work.authors.includes(authorId)) {
        return error(404, 'Work not found');
      }
      
      return ok({ work });
    }
    
    // === UPDATE DRAFT ===
    if (method === 'PATCH' && id && !action) {
      const work = store.getWork(id);
      if (!work) return error(404, 'Work not found');
      if (work.state !== 'draft') return error(400, 'Can only update drafts');
      if (!work.authors.includes(authorId)) return error(403, 'Not authorized');
      
      // Validate new body if provided
      if (body.body) {
        const validation = store.validateWork({ ...work, ...body });
        if (!validation.valid) {
          return error(400, { message: 'Validation failed', errors: validation.errors });
        }
      }
      
      const updated = store.updateWork(id, body);
      return ok({ work: updated });
    }
    
    // === FINISH DRAFT ===
    if (method === 'POST' && id && action === 'finish') {
      const work = store.getWork(id);
      if (!work) return error(404, 'Work not found');
      if (!work.authors.includes(authorId)) return error(403, 'Not authorized');
      
      const finished = store.finishWork(id);
      
      // Record post for scarcity
      if (authorId) {
        store.recordPost(authorId);
      }
      
      return ok({ work: finished, message: 'Work finished. Silence period begins.' });
    }
    
    // === SEAL WORK ===
    if (method === 'POST' && id && action === 'seal') {
      const work = store.getWork(id);
      if (!work) return error(404, 'Work not found');
      if (!work.authors.includes(authorId)) return error(403, 'Not authorized');
      
      const sealed = store.sealWork(id);
      return ok({ work: sealed, message: 'Work sealed. It is now immutable and permanent.' });
    }
    
    // === BURN WORK ===
    if (method === 'POST' && id && action === 'burn') {
      const work = store.getWork(id);
      if (!work) return error(404, 'Work not found');
      if (!work.authors.includes(authorId)) return error(403, 'Not authorized');
      
      // Require confirmation
      if (body.confirm !== true) {
        return error(400, 'Burning is irreversible. Send { "confirm": true } to proceed.');
      }
      
      const burned = store.burnWork(id);
      return ok({ 
        work: burned, 
        message: 'Work burned. The body is gone. Only the hash remains.',
        hash: burned.body_hash
      });
    }
    
    // === FORK WORK ===
    if (method === 'POST' && id && action === 'fork') {
      const authorName = body.author || 'Anonymous';
      
      const fork = store.forkWork(id, authorName);
      return created({ 
        work: fork, 
        message: 'Fork created as draft. Edit and finish when ready.' 
      });
    }
    
    // === WITNESS WORK ===
    if (method === 'POST' && id && action === 'witness') {
      if (!authorId) return error(401, 'Author ID required to witness');
      
      const work = store.witnessWork(id, authorId);
      return ok({ 
        work, 
        message: 'Witnessed.',
        your_witnesses_remaining: store.getAuthor(authorId)?.witnesses_per_day - store.getAuthor(authorId)?.witnesses_today
      });
    }
    
    // === GET LINEAGE GRAPH ===
    if (method === 'GET' && id && action === 'graph') {
      const graph = store.getLineage(id);
      if (!graph) return error(404, 'Work not found');
      
      return ok({
        work: graph.work,
        ancestors: graph.ancestors.map(w => ({ id: w.id, title: w.title, state: w.state })),
        descendants: graph.descendants.map(w => ({ id: w.id, title: w.title, state: w.state }))
      });
    }
    
    // === VALIDATE (no save) ===
    if (method === 'POST' && action === 'validate') {
      const validation = store.validateWork(body);
      return ok(validation);
    }
    
    return error(404, 'Endpoint not found');
    
  } catch (err) {
    console.error(err);
    return error(500, err.message || 'Internal server error');
  }
};
