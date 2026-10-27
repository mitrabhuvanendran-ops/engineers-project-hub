/**
 * Client service to record chat logs and feedback to MongoDB
 * (via /api/chat-logs and /api/feedback serverless endpoints)
 */

export async function logChatInteraction({ sessionId, userMessage, assistantResponse, matchedFaq, matchedErrorCode }) {
  const payload = {
    sessionId,
    userMessage,
    assistantResponse,
    matchedFaq,
    matchedErrorCode,
    timestamp: new Date().toISOString()
  };

  // Local storage cache for offline inspection
  try {
    const existing = JSON.parse(localStorage.getItem('hub_chat_logs') || '[]');
    existing.unshift(payload);
    localStorage.setItem('hub_chat_logs', JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    // Ignore storage quota
  }

  try {
    const res = await fetch('/api/chat-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.warn('Network write to /api/chat-logs failed (local mode cached):', err.message);
    return { success: true, destination: 'client_local_storage' };
  }
}

export async function submitChatFeedback({ messageId, isHelpful, userComment, prompt, response }) {
  const payload = {
    messageId,
    isHelpful,
    userComment,
    prompt,
    response,
    timestamp: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(localStorage.getItem('hub_chat_feedback') || '[]');
    existing.unshift(payload);
    localStorage.setItem('hub_chat_feedback', JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    // Ignore storage quota
  }

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.warn('Network write to /api/feedback failed (local mode cached):', err.message);
    return { success: true, destination: 'client_local_storage' };
  }
}
