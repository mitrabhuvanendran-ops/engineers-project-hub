// Vercel Serverless Function: AI Chat Feedback to MongoDB
export default async function handler(req, res) {
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
    const { messageId, isHelpful, userComment, prompt, response, timestamp } = req.body || {};

    const feedbackEntry = {
      messageId: messageId || Date.now().toString(),
      isHelpful: Boolean(isHelpful),
      userComment: userComment || '',
      prompt: prompt || '',
      response: response || '',
      timestamp: timestamp || new Date().toISOString()
    };

    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri && typeof mongoUri === 'string' && mongoUri.startsWith('mongodb')) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(mongoUri);
        await client.connect();
        const db = client.db('engineers_hub');
        const collection = db.collection('chat_feedback');
        const result = await collection.insertOne(feedbackEntry);
        await client.close();
        return res.status(200).json({ success: true, id: result.insertedId, destination: 'mongodb' });
      } catch (mongoErr) {
        console.warn('MongoDB Atlas feedback error:', mongoErr.message);
        return res.status(200).json({
          success: true,
          destination: 'serverless_log',
          note: 'MongoDB connection error; feedback logged to Vercel runtime logs',
          error: mongoErr.message
        });
      }
    }

    console.log('[AI CHAT FEEDBACK]', JSON.stringify(feedbackEntry));
    return res.status(200).json({
      success: true,
      destination: 'serverless_log',
      message: 'Feedback recorded successfully'
    });
  } catch (error) {
    console.error('Feedback handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
