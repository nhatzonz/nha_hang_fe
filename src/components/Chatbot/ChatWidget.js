import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { chatbotService } from '../../services/chatbotService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, assetUrl } from '../../utils/format';
import styles from './ChatWidget.module.scss';

const STORAGE_KEY_SESSION = 'chatbot_session_id';
const STORAGE_KEY_HISTORY = 'chatbot_history';

const getOrCreateSessionId = (userId) => {
  const key = `${STORAGE_KEY_SESSION}_${userId || 'anon'}`;
  let sid = localStorage.getItem(key);
  if (!sid) {
    sid = `sess-${userId || 'anon'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(key, sid);
  }
  return sid;
};

const INITIAL_MESSAGE = {
  role: 'bot',
  text: 'Xin chào! Tôi là trợ lý nhà hàng 🤖. Tôi có thể giúp bạn tra cứu menu, bàn trống, đơn hàng, doanh thu...',
  suggestions: ['Xem menu', 'Còn bàn trống không?', 'Doanh thu hôm nay', 'Bạn làm được gì?'],
};

const ChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const sessionId = getOrCreateSessionId(user?.id);

  // Restore history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_HISTORY}_${sessionId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch {}
    }
  }, [sessionId]);

  // Persist messages
  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_HISTORY}_${sessionId}`,
      JSON.stringify(messages.slice(-50)),
    );
  }, [messages, sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((m) => [...m, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await chatbotService.sendMessage(trimmed, sessionId);
      setMessages((m) => [
        ...m,
        {
          role: 'bot',
          text: data.reply,
          intent: data.intent,
          data: data.data,
          suggestions: data.suggestions,
        },
      ]);
    } catch (err) {
      toast.error('Không kết nối được chatbot');
      setMessages((m) => [
        ...m,
        { role: 'bot', text: 'Lỗi kết nối. Vui lòng thử lại.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [sessionId, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  const clearHistory = () => {
    if (!window.confirm('Xoá toàn bộ cuộc trò chuyện?')) return;
    setMessages([INITIAL_MESSAGE]);
    localStorage.removeItem(`${STORAGE_KEY_HISTORY}_${sessionId}`);
  };

  // Render rich data from bot
  const renderBotData = (data) => {
    if (!data) return null;

    // List món từ view_menu / top_items / search_menu
    if (data.items && Array.isArray(data.items)) {
      return (
        <div className={styles.dataList}>
          {data.items.slice(0, 6).map((item) => (
            <div key={item.id} className={styles.dataItem}>
              {item.image ? (
                <img src={assetUrl(item.image)} alt={item.name} className={styles.dataItemImg} />
              ) : (
                <div className={styles.dataItemImgPlaceholder}>🍽</div>
              )}
              <div className={styles.dataItemInfo}>
                <strong>{item.name}</strong>
                <span>{formatCurrency(item.price || item.revenue || 0)}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Toggle button */}
      <button
        className={`${styles.toggleBtn} ${open ? styles.toggleOpen : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Đóng chatbot' : 'Mở chatbot'}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <span className={styles.botIcon}>🤖</span>
              <div>
                <strong>Trợ lý nhà hàng</strong>
                <span className={styles.subtitle}>Rule-based · hỗ trợ nội bộ</span>
              </div>
            </div>
            <button className={styles.clearBtn} onClick={clearHistory} title="Xoá trò chuyện">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.message} ${styles[m.role]}`}>
                <div className={styles.bubble}>
                  <div className={styles.text}>{m.text}</div>
                  {m.role === 'bot' && renderBotData(m.data)}
                  {m.role === 'bot' && m.suggestions && m.suggestions.length > 0 && i === messages.length - 1 && (
                    <div className={styles.suggestions}>
                      {m.suggestions.map((s, j) => (
                        <button
                          key={j}
                          className={styles.suggestion}
                          onClick={() => send(s)}
                          disabled={loading}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className={`${styles.message} ${styles.bot}`}>
                <div className={styles.bubble}>
                  <div className={styles.typing}>
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className={styles.inputWrap} onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder="Hỏi tôi điều gì..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              disabled={loading}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={loading || !input.trim()}
              aria-label="Gửi"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
