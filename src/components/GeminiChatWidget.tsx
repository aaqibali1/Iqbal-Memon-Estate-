import { useEffect, useRef, useState } from 'react';
import {
  Compass,
  ExternalLink,
  Globe,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/businessInfo';

type ChatMode = 'advisor' | 'search' | 'maps';

interface GroundingSource {
  type: 'web' | 'maps';
  title: string;
  uri: string;
  snippets?: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
  groundingNote?: string;
  isError?: boolean;
}

const STARTER_PROMPTS: Array<{ label: string; text: string; mode: ChatMode }> = [
  {
    label: '500 Gaz Phase 8 Options',
    text: 'Which 500 Sq. Yds bungalows or plots do you currently have in DHA Phase 8?',
    mode: 'advisor',
  },
  {
    label: 'Live DHA Market News',
    text: 'What are the latest real estate market trends in DHA Phase 8 Karachi?',
    mode: 'search',
  },
  {
    label: 'Nearby Schools & Parks',
    text: 'What reputable schools, mosques, and parks are near Murtaza Commercial Lane 1 in DHA Phase 8?',
    mode: 'maps',
  },
];

export function GeminiChatWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('advisor');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Assalam-o-Alaikum! Welcome to Iqbal Memon Estate. I can help you compare our DHA Karachi listings, estimate transfer budgets, search live market trends, or explore nearby places around DHA Phase 8.',
    },
  ]);

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, loading]);

  const sendMessage = async (textOverride?: string, modeOverride?: ChatMode) => {
    const content = (textOverride ?? input).trim();
    if (!content || loading) return;

    const activeMode = modeOverride ?? mode;
    if (modeOverride) setMode(modeOverride);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: content,
    };

    const nextThread = [...messages, userMsg];
    setMessages(nextThread);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = nextThread
        .filter((m) => !m.isError)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          mode: activeMode,
          location: BUSINESS_INFO.hqCoordinates,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Could not reach the advisory assistant.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text: data.reply || 'Please let me know how else I can assist with DHA Karachi.',
          sources: Array.isArray(data.sources) ? data.sources : [],
          groundingNote: typeof data.groundingNote === 'string' ? data.groundingNote : undefined,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'model',
          text:
            err?.message ||
            'Unable to connect right now. You can also reach our Phase 8 desk directly on WhatsApp at +92 321 8228626.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button (Bottom-Right, stacked neatly above WhatsApp CTA) */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="AI Property Advisor"
          aria-label="Open Iqbal Memon Estate AI Property Advisor"
          className="fixed bottom-[4.25rem] sm:bottom-[4.5rem] right-3 sm:right-5 z-40 inline-flex items-center justify-center gap-2 w-11 h-11 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white border border-[#C5A059]/60 shadow-lg transition-colors text-xs sm:text-sm font-semibold cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">AI Advisor</span>
        </button>
      )}

      {/* Multi-Turn Chat Drawer */}
      {open && (
        <aside
          role="dialog"
          aria-label="Iqbal Memon Estate AI Property Concierge"
          className="fixed bottom-4 right-4 sm:right-6 z-50 w-[min(410px,calc(100vw-2rem))] h-[min(580px,calc(100vh-5rem))] bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#0F172A] text-white px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-[#E2C68B]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold truncate">
                  DHA Property Advisor
                </p>
                <p className="text-[11px] text-slate-300 truncate">
                  Iqbal Memon Estate &middot; Gemini 4
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close AI Property Advisor"
              className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Grounding Mode Bar */}
          <div className="bg-[#F8FAFC] px-3 py-2 border-b border-[#E2E8F0] grid grid-cols-3 gap-1">
            {(
              [
                { id: 'advisor', label: 'Advisor', icon: Sparkles },
                { id: 'search', label: 'Web Search', icon: Globe },
                { id: 'maps', label: 'Maps Data', icon: Compass },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMode(tab.id)}
                  aria-pressed={active}
                  className={`inline-flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#0F172A] text-white'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-white'
                  }`}
                >
                  <Icon className="w-3 h-3" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#0F172A] text-white'
                      : msg.isError
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0]'
                  }`}
                >
                  {msg.text}

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] space-y-1">
                      <p className="text-[10px] font-semibold text-[#475569]">Sources</p>
                      {msg.sources.map((src) => (
                        <a
                          key={src.uri}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-medium text-[#9A7835] hover:underline"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{src.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                  {msg.groundingNote && (
                    <p className="mt-2 pt-1.5 border-t border-[#E2E8F0] text-[10px] text-[#64748B]">
                      {msg.groundingNote}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#475569] pl-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A059]" />
                <span>Consulting DHA Karachi insights...</span>
              </div>
            )}
            <div ref={threadEndRef} />
          </div>

          {/* Starter Prompt Chips (shown when thread only has welcome) */}
          {messages.length === 1 && !loading && (
            <div className="px-3 py-2 border-t border-[#F1F5F9] bg-[#F8FAFC] flex flex-wrap gap-1.5">
              {STARTER_PROMPTS.map((starter) => (
                <button
                  key={starter.label}
                  type="button"
                  onClick={() => sendMessage(starter.text, starter.mode)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#C5A059] hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  {starter.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 border-t border-[#E2E8F0] bg-white flex items-center gap-2"
          >
            <label htmlFor="gemini-chat-input" className="sr-only">
              Ask Iqbal Memon Estate AI Advisor
            </label>
            <input
              id="gemini-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about DHA Phase 8 plots, pricing, or nearby places..."
              className="flex-1 h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="w-10 h-10 rounded-lg bg-[#C5A059] hover:bg-[#B08D46] disabled:opacity-50 text-[#0F172A] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
