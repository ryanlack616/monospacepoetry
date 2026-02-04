// Netlify serverless function to submit poems
// Posts to Moltbook AND stores in v2 Memory Substrate

const store = require('./store');

exports.handler = async function(event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
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

        const poemTitle = title || content.split('\n')[0].slice(0, 40) || 'Untitled';
        const author = artist_name || 'Anonymous';

        // === Store in v2 Memory Substrate ===
        let work = null;
        try {
            work = store.createWork({
                title: poemTitle,
                body: content,
                authors: [author],
                state: 'finished',
                epistemic_mode: 'submission'
            });
        } catch (storeErr) {
            console.error('Store error (non-fatal):', storeErr.message);
        }

        // === Post to Moltbook ===
        let moltbookUrl = null;
        try {
            const postBody = `**${poemTitle}**\nby ${author}\n\n\`\`\`\n${content}\n\`\`\``;

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
                moltbookUrl = `https://moltbook.com/post/${result.id}`;
            }
        } catch (moltErr) {
            console.error('Moltbook error (non-fatal):', moltErr.message);
        }

        // Success if either worked
        if (work || moltbookUrl) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    work_id: work ? work.id : null,
                    moltbook_url: moltbookUrl,
                    message: moltbookUrl 
                        ? 'Posted to m/monospacepoetry!' 
                        : 'Saved to gallery (Moltbook unavailable)'
                })
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'Could not save poem' })
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: err.message })
        };
    }
};
