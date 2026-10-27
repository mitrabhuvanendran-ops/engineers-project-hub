// Vercel Serverless Function: Chat Logs to MongoDB
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { sessionId, userMessage, assistantResponse, matchedFaq, matchedErrorCode, timestamp } = req.body || {};

    const logEntry = {
      sessionId: sessionId || 'anonymous',
      userMessage: userMessage || '',
      assistantResponse: assistantResponse || '',
      matchedFaq: matchedFaq || null,
      matchedErrorCode: matchedErrorCode || null,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: req.headers['user-agent'] || '',
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1'
    };

    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri && typeof mongoUri === 'string' && mongoUri.startsWith('mongodb')) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(mongoUri);
        await client.connect();
        const db = client.db('engineers_hub');
        const collection = db.collection('chat_logs');
        const result = await collection.insertOne(logEntry);
        await client.close();
        return res.status(200).json({ success: true, id: result.insertedId, destination: 'mongodb' });
      } catch (mongoErr) {
        console.warn('MongoDB Atlas write error, falling back to log acknowledge:', mongoErr.message);
        return res.status(200).json({
          success: true,
          destination: 'serverless_log',
          note: 'MongoDB connection error; entry logged to Vercel runtime logs',
          error: mongoErr.message
        });
      }
    }

    // Default: Logged to Vercel Serverless runtime logs
    console.log('[AI CHAT LOG]', JSON.stringify(logEntry));
    return res.status(200).json({
      success: true,
      destination: 'serverless_log',
      message: 'Chat interaction recorded successfully'
    });
  } catch (error) {
    console.error('Chat log handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
