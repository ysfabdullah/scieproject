const { Configuration, OpenAIApi } = require('openai');

module.exports = async (req, res) => {
  // Set CORS headers
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    // Check if API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not set in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'OpenAI API key is not configured'
      });
    }

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
    });

    res.status(200).json(completion.data);
  } catch (error) {
    console.error('Error:', error);
    
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response:', error.response.data);
      return res.status(error.response.status).json({ 
        error: 'API Error',
        details: error.response.data.error?.message || 'Unknown error occurred'
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return res.status(500).json({ 
        error: 'No response from API',
        details: 'The request was made but no response was received'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
      return res.status(500).json({ 
        error: 'Request setup error',
        details: error.message
      });
    }
  }
}; 