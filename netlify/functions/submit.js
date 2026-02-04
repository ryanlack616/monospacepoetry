// Netlify serverless function to submit poems to Moltbook
// Keeps API key server-side (secure)

export async function handler(event) {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { title, content, artist_name } = JSON.parse(event.body);

        if (!content || !content.trim()) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'No content provided' })
            };
        }

        // Format the poem for Moltbook
        const poemTitle = title || content.split('\n')[0].slice(0, 40) || 'Untitled';
        const author = artist_name || 'Anonymous';
        
        const postBody = `**${poemTitle}**\nby ${author}\n\n\`\`\`\n${content}\n\`\`\``;

        // Post to Moltbook
        const response = await fetch('https://moltbook.com/api/v1/posts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MOLTBOOK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                body: postBody,
                submolt: 'm/monospacepoetry'
            })
        });

        const result = await response.json();

        if (response.ok && result.id) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    url: `https://moltbook.com/post/${result.id}`,
                    message: 'Posted to m/monospacepoetry!'
                })
            };
        } else {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: result.error || 'Failed to post to Moltbook' 
                })
            };
        }
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: err.message })
        };
    }
}
