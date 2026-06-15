import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { chatbotService } from '../../services/chatbotService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, assetUrl } from '../../utils/format';
import GeminiIcon from '../ai/GeminiIcon';
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
  text: 'Xin chào! Tôi là trợ lý Gemini của nhà hàng. Tôi có thể giúp bạn tra cứu menu, bàn trống, đơn hàng, doanh thu...',
  suggestions: ['Xem menu', 'Gợi ý món cho khách', 'Còn bàn trống không?', 'Doanh thu hôm nay'],
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

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_HISTORY}_${sessionId}`,
      JSON.stringify(messages.slice(-50)),
    );
  }, [messages, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    if (open && !loading) inputRef.current?.focus();
  }, [loading, open]);

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

  const renderBotData = (data) => {
    if (!data) return null;

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
          <GeminiIcon size={26} color="#fff" />
        )}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <span className={styles.botIcon}><GeminiIcon size={22} /></span>
              <div>
                <strong>Trợ lý Gemini</strong>
                <span className={styles.subtitle}>Hỗ trợ nội bộ nhà hàng</span>
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
                {m.role === 'bot' && (
                  <span className={styles.msgAvatar}><GeminiIcon size={15} /></span>
                )}
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
                <span className={styles.msgAvatar}><GeminiIcon size={15} /></span>
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
