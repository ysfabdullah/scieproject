module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://scieproject-alpha.vercel.app/',
        'X-Title': 'AI Education Platform'
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content: "You are an educational AI assistant specializing in explaining how AI is transforming education. Keep responses concise (2-3 sentences) and focused on educational topics. Use simple language and practical examples."
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get response from AI');
    }

    return res.status(200).json({
      choices: [{
        message: data.choices[0].message
      }]
    });

  } catch (error) {
    console.error('Error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}; 