/**
 * MonospacePoetry v2 - Authors API
 * 
 * Endpoints:
 *   POST   /api/authors         - Create author
 *   GET    /api/authors/:id     - Get author (public info)
 *   GET    /api/authors/:id/status - Get posting/witness status
 */

const store = require('./store');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Author-Id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const json = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body)
});

const error = (statusCode, message) => json(statusCode, { error: message });
const ok = (data) => json(200, data);
const created = (data) => json(201, data);

function parsePath(path) {
  const parts = path.replace(/^\/?(\.netlify\/functions\/)?authors\/?/, '').split('/').filter(Boolean);
  return {
    id: parts[0] || null,
    action: parts[1] || null
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  
  const { id, action } = parsePath(event.path);
  const method = event.httpMethod;
  
  try {
    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        return error(400, 'Invalid JSON body');
      }
    }
    
    // === CREATE AUTHOR ===
    if (method === 'POST' && !id) {
      if (!body.name) {
        return error(400, 'Name is required');
      }
      
      // Check if name exists
      const existing = store.getAuthorByName(body.name);
      if (existing) {
        return error(409, 'Author name already exists');
      }
      
      const author = store.createAuthor({
        name: body.name,
        key: body.key || null
      });
      
      return created({
        author: {
          id: author.id,
          name: author.name,
          created_at: author.created_at
        },
        message: 'Author created. Save your ID - you will need it to post.'
      });
    }
    
    // === GET AUTHOR (public) ===
    if (method === 'GET' && id && !action) {
      const author = store.getAuthor(id) || store.getAuthorByName(id);
      if (!author) return error(404, 'Author not found');
      
      // Public info only
      return ok({
        author: {
          id: author.id,
          name: author.name,
          created_at: author.created_at,
          key: author.key ? `${author.key.substring(0, 16)}...` : null
        }
      });
    }
    
    // === GET AUTHOR STATUS ===
    if (method === 'GET' && id && action === 'status') {
      const author = store.getAuthor(id);
      if (!author) return error(404, 'Author not found');
      
      const canPost = store.canPost(id);
      
      // Reset witness count if new day
      if (author.witness_date !== store.today()) {
        author.witnesses_today = 0;
        author.witness_date = store.today();
      }
      
      return ok({
        author_id: author.id,
        name: author.name,
        
        posting: {
          can_post: canPost.allowed,
          reason: canPost.reason || null,
          posts_this_epoch: author.posts_this_epoch,
          posts_per_epoch: author.posts_per_epoch,
          epoch_days: author.epoch_duration_days,
          silence_until: author.silence_until,
          silence_hours: author.silence_after_post_hours
        },
        
        witnessing: {
          witnesses_today: author.witnesses_today,
          witnesses_per_day: author.witnesses_per_day,
          remaining: author.witnesses_per_day - author.witnesses_today
        }
      });
    }
    
    return error(404, 'Endpoint not found');
    
  } catch (err) {
    console.error(err);
    return error(500, err.message || 'Internal server error');
  }
};
