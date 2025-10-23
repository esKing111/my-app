"use client";

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CourtRoomPage() {
  const searchParams = useSearchParams();
  const testMode = searchParams.get('test') === '1' || process.env.NEXT_PUBLIC_TEST_MODE === '1';

  // Timer state (seconds)
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate clock hands
  const now = new Date(seconds * 1000);
  const sec = now.getUTCSeconds();
  const min = now.getUTCMinutes();
  const hour = now.getUTCHours() % 12;
  const secAngle = sec * 6;
  const minAngle = min * 6 + sec * 0.1;
  const hourAngle = hour * 30 + min * 0.5;

  // Categories and messages (Boss, Family, Agile)
  type Category = 'Boss' | 'Family' | 'Agile';

  const catalog: Record<Category, string[]> = {
    Boss: [
      'Are you done with sprint 1?',
      'Status on the release notes?',
      'Fix the title colour to Red',
    ],
    Family: [
      'Can you pick up the kids after work?',
      'Don\'t forget to call your mother',
    ],
    Agile: [
      'Fix alt in img1',
      'Fix input validation',
      'Refactor the login form spacing',
      'Fix User login',
      'Fix Secure Database',
    ],
  };

  // Message model with escalation support
  type MessageStatus = 'normal' | 'urgent' | 'resolved' | 'fined' | 'denied';
  interface Message {
    id: number;
    category: Category;
    text: string;
    status: MessageStatus;
    createdAt: number; // epoch ms
    // Escalation metadata for special items
    escalatable?: boolean;
    lawBroken?: string; // e.g., 'Disability Act' or 'Laws of Tort'
    reason?: string; // human readable reason shown in court overlay
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const idCounter = useRef(1);

  // Track timers per message to upgrade to urgent and to show court overlay
  const timersRef = useRef<
    Map<number, { toUrgent?: number; toCourt?: number }>
  >(new Map());

  // Court overlay state
  const [courtVisible, setCourtVisible] = useState(false);
  const [courtInfo, setCourtInfo] = useState<{ law: string; reason: string } | null>(null);

  // Helpers to persist to API
  const apiCreateMessage = async (payload: Omit<Message, 'id' | 'createdAt'> & { createdAt?: number }) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: payload.category,
          text: payload.text,
          status: payload.status,
          escalatable: payload.escalatable ?? false,
          lawBroken: payload.lawBroken ?? null,
          reason: payload.reason ?? null,
        }),
      });
      if (!res.ok) throw new Error('Failed to create message');
      const created = await res.json();
      return created as { id: number; createdAt: string };
    } catch {
      return null;
    }
  };

  const apiUpdateMessage = async (id: number, data: Partial<{ text: string; status: MessageStatus }>) => {
    try {
      await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      // noop
    }
  };

  const apiLoadMessages = async (): Promise<Message[]> => {
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) return [];
      const list = (await res.json()) as Array<{ id: number; category: Category; text: string; status: MessageStatus; escalatable?: boolean; lawBroken?: string | null; reason?: string | null; createdAt: string }>
      // Show only active (not resolved) in inbox
      return list
        .filter((m) => m.status !== 'resolved' && m.status !== 'fined')
        .map((m) => {
          // Fallback: infer law/reason from text if missing
          let lawBroken = m.lawBroken || undefined;
          let reason = m.reason || undefined;
          const lower = m.text.toLowerCase();
          if (!lawBroken) {
            if (lower.includes('fix alt')) {
              lawBroken = 'Disability Act';
              reason = 'Missing alt text impacts accessibility';
            } else if (lower.includes('input validation')) {
              lawBroken = 'Laws of Tort';
              reason = 'Known input validation flaw led to breach';
            } else if (lower.includes('user login')) {
              lawBroken = 'Bankruptcy Court';
              reason = 'Declared bankruptcy: critical login broken — no users, no revenue';
            } else if (lower.includes('secure database')) {
              lawBroken = 'Laws of Tort';
              reason = 'You got hacked: insecure database led to damages';
            }
          }

          return {
            id: m.id,
            category: m.category,
            text: m.text,
            status: m.status,
            createdAt: new Date(m.createdAt).getTime(),
            escalatable: m.escalatable,
            lawBroken,
            reason,
          } as Message;
        });
    } catch {
      return [];
    }
  };

  // Timings (shorter in test mode)
  const URGENT_DELAY_MS = testMode ? 2000 : 2 * 60 * 1000;
  const COURT_DELAY_MS = testMode ? 4000 : 4 * 60 * 1000;
  const ARRIVAL_BASE_MS = testMode ? 400 : 20000;
  const ARRIVAL_RANDOM_MS = testMode ? 400 : 10000;

  // Utility: schedule escalating timeouts for a message
  const scheduleEscalation = (msg: Message) => {
    if (!msg.escalatable) return;
    // After 2 minutes -> urgent
    const urgentId = window.setTimeout(() => {
      // persist escalation
      void apiUpdateMessage(msg.id, { status: 'urgent', text: `URGENT: ${msg.text}` });
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === msg.id);
        if (exists) {
          return prev.map((m) => (m.id === msg.id ? { ...m, status: 'urgent', text: `URGENT: ${m.text}` } : m));
        }
        // Re-introduce as urgent if user ignored/dismissed it
        return [
          ...prev,
          { ...msg, status: 'urgent', text: `URGENT: ${msg.text}` },
        ];
      });
    }, URGENT_DELAY_MS);

    // After 4 minutes -> court overlay
    const courtId = window.setTimeout(() => {
      // mark as fined in DB
      void apiUpdateMessage(msg.id, { status: 'fined' });
      setCourtInfo({
        law: msg.lawBroken || 'General Negligence',
        reason: msg.reason || 'Ignoring repeated critical issues',
      });
      setCourtVisible(true);
    }, COURT_DELAY_MS);

    timersRef.current.set(msg.id, { toUrgent: urgentId, toCourt: courtId });
  };

  // Clear timers for a message
  const clearTimers = (id: number) => {
    const t = timersRef.current.get(id);
    if (t?.toUrgent) window.clearTimeout(t.toUrgent);
    if (t?.toCourt) window.clearTimeout(t.toCourt);
    timersRef.current.delete(id);
  };

  // Load existing messages on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const existing = await apiLoadMessages();
      if (!mounted) return;
      setMessages(existing);
      // Re-arm escalations for active escalatable items
      existing.forEach((m) => {
        if (m.escalatable && m.status !== 'fined' && m.status !== 'resolved') {
          scheduleEscalation(m);
        }
      });
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Schedule incoming messages every X ms (shorter in test mode)
  useEffect(() => {
    let alive = true;
    const scheduleNext = () => {
      if (!alive) return;
      const delay = ARRIVAL_BASE_MS + Math.floor(Math.random() * ARRIVAL_RANDOM_MS);
      const t = window.setTimeout(() => {
        // pick a random category
        const categories: Category[] = ['Boss', 'Family', 'Agile'];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const texts = catalog[category];
        const text = texts[Math.floor(Math.random() * texts.length)];

  const id = idCounter.current++;
        // Detect special, escalatable items
        let escalatable = false;
        let lawBroken: string | undefined;
        let reason: string | undefined;
        if (text.toLowerCase().includes('fix alt')) {
          escalatable = true;
          lawBroken = 'Disability Act';
          reason = 'Missing alt text impacts accessibility';
        } else if (text.toLowerCase().includes('input validation')) {
          escalatable = true;
          lawBroken = 'Laws of Tort';
          reason = 'Known input validation flaw led to breach';
        } else if (text.toLowerCase().includes('user login')) {
          escalatable = true;
          lawBroken = 'Bankruptcy Court';
          reason = 'Declared bankruptcy: critical login broken — no users, no revenue';
        } else if (text.toLowerCase().includes('secure database')) {
          escalatable = true;
          lawBroken = 'Laws of Tort';
          reason = 'You got hacked: insecure database led to damages';
        }

        const msg: Message = {
          id,
          category,
          text,
          status: 'normal',
          createdAt: Date.now(),
          escalatable,
          lawBroken,
          reason,
        };

        // Persist then use DB id if available
        apiCreateMessage(msg).then((created) => {
          const finalMsg: Message = {
            ...msg,
            id: created?.id ?? msg.id,
          };
          setMessages((prev) => [...prev, finalMsg]);
          scheduleEscalation(finalMsg);
        });

        scheduleNext(); // chain next message
      }, delay);
      // store the scheduler id on a special key - not strictly needed beyond cleanup
      timersRef.current.set(-1, { toCourt: t });
    };
    scheduleNext();
    return () => {
      alive = false;
      // cleanup any pending scheduler timeout
      const sched = timersRef.current.get(-1)?.toCourt;
      if (sched) window.clearTimeout(sched);
    };
  }, []);

  // Resolve or ignore actions
  const handleAction = (action: 'accept' | 'ignore', message: Message) => {
    if (action === 'accept') {
      // resolve: remove and clear timers
      clearTimers(message.id);
      void apiUpdateMessage(message.id, { status: 'resolved' });
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
    } else {
      // ignore: remove now, but timers will still re-add urgency/courtroom via scheduleEscalation
      // To simulate "it comes back in 2 min as urgent", we keep the timers running and drop the message from inbox for now
      void apiUpdateMessage(message.id, { status: 'denied' });
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
    }
  };

  // Integrate game logic with courtroom page
  return (
    <main
      style={{
        height: '100vh',
        width: '100vw',
        backgroundImage: 'url(/courtroom-bg.jpg)',
        backgroundSize: '100vw 100vh',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
      aria-label="Court Room Page"
    >
      {/* Timer and Lady Justice emblem */}
      <div
        style={{
          position: 'absolute',
          top: '19%',
          left: '16.5%',
          zIndex: 2,
          width: 120,
          height: 120,
          background: 'radial-gradient(circle at 60% 40%, #fffbe9 70%, #e7d3b1 100%)',
          borderRadius: '50%',
          boxShadow: '0 4px 16px 2px rgba(120, 80, 30, 0.18), 0 0 0 10px #e7d3b1, 0 0 0 16px #b48a5a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '5px solid #b48a5a',
          fontFamily: 'monospace',
          transition: 'box-shadow 0.2s',
          boxSizing: 'border-box',
        }}
        aria-label="Wall digital clock timer"
      >
        <span
          style={{
            fontSize: '2.8rem',
            color: '#7a5c2e',
            letterSpacing: '2px',
            fontWeight: 700,
            textShadow: '0 1px 2px #fffbe9',
            userSelect: 'none',
            width: '100%',
            textAlign: 'center',
            lineHeight: 1,
          }}
        >
          {String(Math.floor((seconds / 60) % 60)).padStart(2, '0')}
          :
          {String(seconds % 60).padStart(2, '0')}
        </span>
      </div>

      <div style={{ position: 'absolute', right: '8%', top: '14%', zIndex: 10 }}>
        <Image
          src="/lady-justice.jpg"
          alt="Lady Justice emblem"
          width={120}
          height={120}
          style={{ borderRadius: '50%' }}
          priority
        />
      </div>

      {/* Court overlay */}
      {courtVisible && courtInfo && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '1.25rem 1.5rem',
              borderRadius: 8,
              width: 'min(520px, 92vw)',
              boxShadow: '0 12px 28px rgba(0,0,0,0.35)',
              textAlign: 'center',
            }}
          >
            <h2 style={{ margin: '0 0 0.5rem' }}>Courtroom Ruling</h2>
            <p style={{ margin: '0.25rem 0' }}>
              Law broken: <strong>{courtInfo.law}</strong>
            </p>
            <p style={{ margin: '0.25rem 0 1rem' }}>{courtInfo.reason}</p>
            <button
              onClick={() => {
                setCourtVisible(false);
                setCourtInfo(null);
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#7a5c2e',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* Inbox UI */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '15%',
          width: '70%',
          height: '30%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          overflowY: 'auto',
          padding: '1rem',
        }}
      >
        <h3 style={{ marginBottom: '1rem' }}>Inbox</h3>
        {messages.map((message) => (
          <div
            key={message.id}
            data-testid="inbox-row"
            data-message-id={message.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
              padding: '0.5rem',
              backgroundColor: message.status === 'urgent' ? '#ffe9e9' : '#f9f9f9',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div>
              <span style={{ fontWeight: 600 }}>[{message.category}] </span>
              <span style={{ color: message.status === 'urgent' ? '#b00020' : '#222' }}>
                {message.text}
              </span>
            </div>
            <div>
              <button
                onClick={() => handleAction('accept', message)}
                data-testid="do-it"
                style={{
                  marginRight: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Do it
              </button>
              <button
                onClick={() => handleAction('ignore', message)}
                data-testid="deny-it"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Deny it
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
