import React, { useState, useEffect, useMemo } from 'react';
import { getFaqs } from '../../lib/faqErrorService';
import { HelpCircle, Search, Sparkles, Filter, ChevronDown, ChevronUp, Bot, Database } from 'lucide-react';

export function FAQView({ onAskAssistant }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openFaqId, setOpenFaqId] = useState(null);
  const [sourceInfo, setSourceInfo] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getFaqs();
      setFaqs(res.data || []);
      setSourceInfo(res.source);
      setLoading(false);
    }
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    faqs.forEach(f => {
      if (f.category) set.add(f.category);
    });
    return ['All', ...Array.from(set)];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter(f => {
      const matchSearch =
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === 'All' || f.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [faqs, search, selectedCategory]);

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-2xl text-white shadow-md border border-slate-800">
        <div className="flex items-center gap-2 text-brand-400 text-xs font-mono mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>Frequently Asked Questions • Stored in SQL Database</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          Knowledgebase & FAQs
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Browse comprehensive guides and architectural answers for Engineer's Project Hub. If you can't find what you need, our integrated AI Assistant can assist or open a support ticket for you.
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Database className="w-3.5 h-3.5 text-brand-400" />
          <span>{faqs.length} FAQs loaded from {sourceInfo === 'supabase_postgres' ? 'Supabase PostgreSQL' : 'SQL Database'}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs by question or keyword..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
          <span className="text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white font-medium shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading FAQs from SQL database...</span>
        </div>
      ) : filteredFaqs.length > 0 ? (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;

            return (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs transition-all hover:border-slate-300"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-50 text-brand-700 border border-brand-200 mt-0.5 flex-shrink-0">
                      {faq.category || 'General'}
                    </span>
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                      {faq.question}
                    </h3>
                  </div>

                  <div className="text-slate-400 p-1 flex-shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                    <p className="mb-3 whitespace-pre-line">{faq.answer}</p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => onAskAssistant && onAskAssistant(`Can you explain more about: "${faq.question}"?`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Ask AI Assistant about this</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
          No FAQs match your search query. Try typing another keyword or ask the AI Assistant directly.
        </div>
      )}
    </div>
  );
}
