import { useState, useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';

// Single shared socket for the dashboard's live message feed.
const socket = io();

const PLATFORM_META = {
  facebook: { label: 'Facebook', color: '#1877F2' },
  direct: { label: 'Direct', color: '#D4F53C' },
};

function platformMeta(platform) {
  return PLATFORM_META[platform] || { label: platform || 'Unknown', color: '#9FCEBE' };
}

function initials(name = '') {
  return name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || '??';
}

function timeAgo(ts) {
  if (!ts) return '';
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function ConversationsPanel() {
  // userId -> { userId, platform, updatedAt, lastMessage, messages: [] | null }
  // messages stays null until history has been fetched/loaded for that thread.
  const [conversations, setConversations] = useState({});
  const [selected, setSelected] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const scrollRef = useRef(null);
  const selectedRef = useRef(null);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Seed the conversation list on mount.
  useEffect(() => {
    fetch('/api/messages')
      .then((r) => r.json())
      .then((data) => {
        const map = {};
        (data.conversations || []).forEach((c) => {
          map[c.userId] = {
            userId: c.userId,
            platform: c.platform,
            updatedAt: c.updatedAt,
            lastMessage: c.lastMessage,
            messages: null,
          };
        });
        setConversations(map);
        const first = (data.conversations || [])[0];
        if (first) setSelected(first.userId);
      })
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, []);

  // Live updates over Socket.IO.
  useEffect(() => {
    const handleNewMessage = (msg) => {
      setConversations((prev) => {
        const existing = prev[msg.senderId];
        const nextMessages =
          existing && Array.isArray(existing.messages)
            ? [...existing.messages, { role: msg.role, content: msg.text }]
            : existing
              ? existing.messages
              : null;

        return {
          ...prev,
          [msg.senderId]: {
            userId: msg.senderId,
            platform: msg.platform || existing?.platform || 'direct',
            updatedAt: Date.now(),
            lastMessage: { role: msg.role, content: msg.text },
            messages: nextMessages,
          },
        };
      });

      setSelected((current) => current || msg.senderId);
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, []);

  // Lazily load full history the first time a conversation is opened.
  useEffect(() => {
    if (!selected) return;
    const conv = conversations[selected];
    if (!conv || conv.messages !== null) return;

    fetch(`/api/messages/${encodeURIComponent(selected)}/history`)
      .then((r) => r.json())
      .then((data) => {
        setConversations((prev) => {
          const current = prev[selected];
          if (!current) return prev;
          return {
            ...prev,
            [selected]: {
              ...current,
              platform: data.platform || current.platform,
              messages: data.history || [],
            },
          };
        });
      })
      .catch(() => {
        setConversations((prev) => {
          const current = prev[selected];
          if (!current) return prev;
          return { ...prev, [selected]: { ...current, messages: [] } };
        });
      });
  }, [selected, conversations]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [selected, conversations[selected]?.messages?.length]);

  const list = useMemo(
    () => Object.values(conversations).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)),
    [conversations],
  );

  const active = selected ? conversations[selected] : null;
  const activeMeta = active ? platformMeta(active.platform) : null;

  return (
    <div className="flex flex-col md:flex-row rounded-2xl border border-border bg-surface-panel backdrop-blur-lg overflow-hidden h-[520px]">
      {/* Conversation list */}
      <div className="w-full md:w-[300px] flex-shrink-0 border-b md:border-b-0 md:border-r border-border/60 flex flex-col">
        <div className="px-5 py-4 border-b border-border/60">
          <h2 className="text-sm font-semibold text-frost">Conversations</h2>
          <p className="text-[11px] text-mist/70 mt-0.5">Live messages from every connected page</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="p-5 text-center text-xs text-mist/50">Loading conversations…</div>
          ) : list.length === 0 ? (
            <div className="p-5 text-center text-xs text-mist/50 leading-relaxed">
              No conversations yet.
              <br />
              Messages from connected pages will show up here as they arrive.
            </div>
          ) : (
            list.map((c) => {
              const meta = platformMeta(c.platform);
              const preview = c.lastMessage
                ? `${c.lastMessage.role === 'assistant' ? 'You: ' : ''}${c.lastMessage.content}`
                : '';
              return (
                <button
                  key={c.userId}
                  onClick={() => setSelected(c.userId)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-border/30 transition-colors ${
                    selected === c.userId ? 'bg-lime/10' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-forest flex-shrink-0"
                    style={{ backgroundColor: meta.color }}
                  >
                    {initials(c.userId)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-frost truncate">{c.userId}</span>
                      <span className="text-[10px] text-mist/50 flex-shrink-0">{timeAgo(c.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <p className="text-[11px] text-mist/60 truncate">{preview}</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Thread view */}
      <div className="flex-1 flex flex-col min-w-0">
        {active ? (
          <>
            <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-frost">{active.userId}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeMeta.color }} />
                  <p className="text-[11px] text-mist/60">{activeMeta.label}</p>
                </div>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5">
              {active.messages === null ? (
                <p className="text-xs text-mist/40 text-center mt-8">Loading messages…</p>
              ) : active.messages.length === 0 ? (
                <p className="text-xs text-mist/40 text-center mt-8">No messages in this conversation yet.</p>
              ) : (
                active.messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed animate-msg-in ${
                      m.role === 'assistant'
                        ? 'self-end bg-lime text-forest font-medium rounded-br-sm'
                        : 'self-start bg-white/[0.06] text-frost border border-border rounded-bl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-mist/40">
            {loadingList ? 'Loading…' : 'Select a conversation to view its messages'}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversationsPanel;
