/**
 * MonospacePoetry - Poems API
 * 
 * Simple read-only API for the poem archive.
 * 
 * Endpoints:
 *   GET /api/poems              - List all poems (with filters)
 *   GET /api/poems/random       - Get a random poem
 *   GET /api/poems/random/:n    - Get n random poems
 *   GET /api/poems/:id          - Get poem by ID
 *   GET /api/poems/collection/:name - Get poems from a collection
 *   GET /api/poems/search?q=    - Search poems by text
 */

// Load poems from JSON (fetched at runtime from the public URL)
async function loadPoems() {
  const response = await fetch('https://monospacepoetry.com/poems.json');
  if (!response.ok) {
    throw new Error('Failed to load poems.json');
  }
  return response.json();
}

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

const json = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body, null, 2)
});

const ok = (data) => json(200, data);
const error = (statusCode, message) => json(statusCode, { error: message });

// Get random items from array
function getRandomItems(arr, n = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

// Parse path segments after /api/poems
function parsePath(path) {
  const clean = path.replace(/^\/?(\.netlify\/functions\/)?poems\/?/, '');
  return clean.split('/').filter(Boolean);
}

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  
  if (event.httpMethod !== 'GET') {
    return error(405, 'Method not allowed');
  }
  
  try {
    const { poems, meta } = await loadPoems();
    const segments = parsePath(event.path);
    const params = event.queryStringParameters || {};
    
    // GET /api/poems - List all (with optional filters)
    if (segments.length === 0) {
      let result = [...poems];
      
      // Filter by origin/collection
      if (params.origin) {
        result = result.filter(p => p.origin === params.origin);
      }
      
      // Filter by visual
      if (params.visual === 'true') {
        result = result.filter(p => p.visual === true);
      } else if (params.visual === 'false') {
        result = result.filter(p => p.visual !== true);
      }
      
      // Filter by model
      if (params.model) {
        result = result.filter(p => p.model === params.model);
      }
      
      // Limit
      const limit = parseInt(params.limit) || result.length;
      result = result.slice(0, limit);
      
      return ok({
        poems: result,
        count: result.length,
        total: poems.length,
        meta
      });
    }
    
    // GET /api/poems/random or /api/poems/random/:n
    if (segments[0] === 'random') {
      const count = parseInt(segments[1]) || 1;
      
      // Optional origin filter for random
      let pool = poems;
      if (params.origin) {
        pool = poems.filter(p => p.origin === params.origin);
      }
      if (params.visual === 'true') {
        pool = pool.filter(p => p.visual === true);
      }
      
      if (pool.length === 0) {
        return error(404, 'No poems match filters');
      }
      
      const selected = getRandomItems(pool, count);
      
      return ok({
        poems: count === 1 ? undefined : selected,
        poem: count === 1 ? selected[0] : undefined,
        count: selected.length
      });
    }
    
    // GET /api/poems/collections - List collections
    if (segments[0] === 'collections') {
      return ok({
        collections: meta.collections
      });
    }
    
    // GET /api/poems/collection/:name
    if (segments[0] === 'collection' && segments[1]) {
      const collectionName = segments[1];
      const collection = meta.collections[collectionName];
      
      if (!collection) {
        return error(404, `Collection '${collectionName}' not found`);
      }
      
      const collectionPoems = poems.filter(p => p.origin === collectionName);
      
      return ok({
        collection: {
          id: collectionName,
          ...collection
        },
        poems: collectionPoems,
        count: collectionPoems.length
      });
    }
    
    // GET /api/poems/search?q=
    if (segments[0] === 'search') {
      const query = (params.q || '').toLowerCase();
      
      if (!query) {
        return error(400, 'Search query required: ?q=...');
      }
      
      const results = poems.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.body?.toLowerCase().includes(query) ||
        p.context?.toLowerCase().includes(query)
      );
      
      return ok({
        query,
        poems: results,
        count: results.length
      });
    }
    
    // GET /api/poems/:id - Get by ID
    const id = segments[0];
    const poem = poems.find(p => p.id === id);
    
    if (!poem) {
      return error(404, `Poem '${id}' not found`);
    }
    
    return ok({ poem });
    
  } catch (err) {
    console.error(err);
    return error(500, err.message || 'Internal server error');
  }
};
