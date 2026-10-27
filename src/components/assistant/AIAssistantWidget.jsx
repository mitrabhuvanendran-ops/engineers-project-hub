import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  Ticket, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2,
  RefreshCw,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { getFaqs, getErrorCodes, submitSupportTicket } from '../../lib/faqErrorService';
import { logChatInteraction, submitChatFeedback } from '../../lib/mongoService';
import { useAuth } from '../../context/AuthContext';

export function AIAssistantWidget({ initialPrompt = null, onClearInitialPrompt = null }) {
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your Engineering Hub AI Assistant. I can answer frequently asked questions about projects, calculations, and files, or explain error codes (e.g., 400, 403, 404, 480, 500). How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      canTicket: false
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [errorCodes, setErrorCodes] = useState([]);
  const [showTicketForm, setShowTicketForm] = useState(false);

  // Ticket form state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketErrorCode, setTicketErrorCode] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(null);

  const [feedbackGiven, setFeedbackGiven] = useState({}); // messageId -> boolean
  const messagesEndRef = useRef(null);

  // Load FAQs and Error Codes into assistant memory
  useEffect(() => {
    async function loadKnowledge() {
      const [faqRes, errRes] = await Promise.all([getFaqs(), getErrorCodes()]);
      setFaqs(faqRes.data || []);
      setErrorCodes(errRes.data || []);
    }
    loadKnowledge();
  }, []);

  // Listen for external trigger (e.g. from 404 page or 500 page)
  useEffect(() => {
    if (initialPrompt) {
      setIsOpen(true);
      setIsMinimized(false);
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // Set user email in ticket form if logged in
  useEffect(() => {
    if (user?.email) {
      setTicketEmail(user.email);
    }
  }, [user]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Intelligent Answer Resolver
  const findAnswer = (query) => {
    const qLower = query.toLowerCase().trim();

    // 1. Check for error code patterns (e.g. "404", "error 403", "code 480", "500")
    const codeMatch = qLower.match(/\b(400|401|403|404|429|480|500|503)\b/);
    if (codeMatch) {
      const codeNum = parseInt(codeMatch[1], 10);
      const err = errorCodes.find(e => e.code === codeNum);
      if (err) {
        return {
          text: `**Error ${err.code}: ${err.name}**\n\n${err.description}\n\n**Common Cause:** ${err.cause}\n\n**How to Fix:** ${err.solution}`,
          matchedErrorCode: err.code,
          canTicket: false
        };
      }
    }

    // 2. Check for explicit support ticket request
    if (
      qLower.includes('ticket') || 
      qLower.includes('contact support') || 
      qLower.includes('human') || 
      qLower.includes('complaint')
    ) {
      return {
        text: "I can open a support ticket for you right away. Fill out the brief details below and it will be saved directly into our SQL database.",
        openTicketForm: true,
        canTicket: false
      };
    }

    // 3. Match against FAQs with score ranking
    let bestFaq = null;
    let highestScore = 0;

    for (const faq of faqs) {
      const words = faq.question.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      let matchCount = 0;
      for (const w of words) {
        if (qLower.includes(w)) matchCount++;
      }
      if (matchCount > highestScore) {
        highestScore = matchCount;
        bestFaq = faq;
      }
    }

    if (bestFaq && highestScore >= 1) {
      return {
        text: `**${bestFaq.question}**\n\n${bestFaq.answer}`,
        matchedFaq: bestFaq.id,
        canTicket: false
      };
    }

    // 4. Default: Cannot answer from FAQs -> Escalation to Support Ticket
    return {
      text: "I could not find a verified answer in the current FAQ database or error code directory.\n\nWould you like to **create a support ticket** for our engineering team? Click the button below to submit your question directly to our SQL database.",
      canTicket: true,
      openTicketForm: false
    };
  };

  const handleSendMessage = (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(async () => {
      const answer = findAnswer(text);
      const assistantMsg = {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        text: answer.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        canTicket: answer.canTicket,
        matchedFaq: answer.matchedFaq,
        matchedErrorCode: answer.matchedErrorCode
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);

      if (answer.openTicketForm) {
        setShowTicketForm(true);
        setTicketSubject(text.slice(0, 60));
        setTicketDesc(text);
      }

      // Log interaction to MongoDB via Serverless API
      await logChatInteraction({
        sessionId: user?.id || 'guest-session',
        userMessage: text,
        assistantResponse: answer.text,
        matchedFaq: answer.matchedFaq || null,
        matchedErrorCode: answer.matchedErrorCode || null
      });
    }, 600);
  };

  const handleFeedback = async (msgId, isHelpful) => {
    setFeedbackGiven(prev => ({ ...prev, [msgId]: isHelpful ? 'up' : 'down' }));
    const msg = messages.find(m => m.id === msgId);
    await submitChatFeedback({
      messageId: msgId,
      isHelpful,
      response: msg?.text || '',
      timestamp: new Date().toISOString()
    });
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim() || !ticketEmail.trim()) return;

    setTicketSubmitting(true);
    setTicketSuccess(null);

    const res = await submitSupportTicket({
      userEmail: ticketEmail,
      subject: ticketSubject,
      description: ticketDesc,
      errorCode: ticketErrorCode || null,
      userId: user?.id || null
    });

    setTicketSubmitting(false);

    if (res?.success) {
      setTicketSuccess(res.data?.id || 'Ticket Created');
      setShowTicketForm(false);
      setTicketSubject('');
      setTicketDesc('');
      setTicketErrorCode('');

      // Add confirmation to chat
      const confirmMsg = {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        text: `Support ticket **#${res.data?.id || 'TICKET-OK'}** has been successfully recorded in the SQL database! Our engineering support team will review your inquiry.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        canTicket: false
      };
      setMessages(prev => [...prev, confirmMsg]);
    }
  };

  const handleQuickQuestion = (q) => {
    handleSendMessage(q);
  };

  return (
    <>
      {/* Floating Action Button (Visible on Every Page) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-r from-brand-600 to-cyan-600 text-white rounded-full shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
          aria-label="Open AI Assistant"
        >
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="hidden sm:inline text-xs font-semibold pr-1">Ask AI Assistant</span>
        </button>
      )}

      {/* Floating Assistant Chat Panel */}
      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-200 overflow-hidden ${
            isMinimized
              ? 'w-80 h-14'
              : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-cyan-400 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                  <span>AI Support Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h4>
                <p className="text-[10px] text-slate-400">FAQ & Error Code Knowledgebase</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body when expanded */}
          {!isMinimized && (
            <>
              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 text-xs">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const feedback = feedbackGiven[msg.id];

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs whitespace-pre-wrap leading-relaxed ${
                          isUser
                            ? 'bg-brand-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Assistant Actions: Feedback & Escalation Ticket Button */}
                      {!isUser && (
                        <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-slate-400">
                          <span>{msg.timestamp}</span>

                          {/* Thumbs up / down feedback */}
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleFeedback(msg.id, true)}
                              disabled={Boolean(feedback)}
                              className={`p-1 rounded hover:bg-slate-200 transition-colors ${
                                feedback === 'up' ? 'text-emerald-600 font-bold' : ''
                              }`}
                              title="Helpful (Logs to MongoDB)"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(msg.id, false)}
                              disabled={Boolean(feedback)}
                              className={`p-1 rounded hover:bg-slate-200 transition-colors ${
                                feedback === 'down' ? 'text-red-600 font-bold' : ''
                              }`}
                              title="Not helpful (Logs to MongoDB)"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Escalation Button if answer not found */}
                          {msg.canTicket && (
                            <button
                              onClick={() => {
                                setShowTicketForm(true);
                                setTicketSubject('Inquiry via AI Assistant');
                              }}
                              className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full"
                            >
                              <Ticket className="w-3 h-3" />
                              <span>Create Support Ticket</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-1 text-slate-400 text-xs px-2 py-1">
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}

                {/* Inline Support Ticket Form */}
                {showTicketForm && (
                  <div className="p-3.5 bg-white rounded-xl border border-brand-200 shadow-sm space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <Ticket className="w-3.5 h-3.5 text-brand-600" />
                        <span>Create Support Ticket (Stored in SQL)</span>
                      </div>
                      <button
                        onClick={() => setShowTicketForm(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleTicketSubmit} className="space-y-2 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
                          Your Email
                        </label>
                        <input
                          type="email"
                          required
                          value={ticketEmail}
                          onChange={(e) => setTicketEmail(e.target.value)}
                          placeholder="engineer@domain.com"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
                          Subject
                        </label>
                        <input
                          type="text"
                          required
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          placeholder="Brief summary of issue"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
                            Related Error Code
                          </label>
                          <select
                            value={ticketErrorCode}
                            onChange={(e) => setTicketErrorCode(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                          >
                            <option value="">None / Other</option>
                            {errorCodes.map((ec) => (
                              <option key={ec.code} value={ec.code}>
                                {ec.code} - {ec.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={ticketDesc}
                          onChange={(e) => setTicketDesc(e.target.value)}
                          placeholder="Describe the problem in detail..."
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={ticketSubmitting}
                        className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {ticketSubmitting && <RefreshCw className="w-3 h-3 animate-spin" />}
                        <span>Submit Ticket to SQL Database</span>
                      </button>
                    </form>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Bar */}
              <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
                <span className="text-slate-400 font-medium">Try:</span>
                <button
                  onClick={() => handleQuickQuestion('Explain error 403')}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50"
                >
                  Error 403?
                </button>
                <button
                  onClick={() => handleQuickQuestion('What is error code 480?')}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50"
                >
                  Code 480?
                </button>
                <button
                  onClick={() => handleQuickQuestion('How do I calculate formulas?')}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50"
                >
                  Calculations FAQ
                </button>
                <button
                  onClick={() => handleQuickQuestion('Open support ticket')}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded text-brand-600 font-medium hover:bg-brand-50"
                >
                  + New Ticket
                </button>
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask about FAQs or error codes (e.g. 404, 500)..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors disabled:opacity-40"
                    aria-label="Send query"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

