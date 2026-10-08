import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  X,
  User,
  Factory,
  ShieldCheck,
  Check,
  CheckCheck,
  Clock,
  RefreshCw,
  AlertCircle,
  Paperclip,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function QuotationChatModal({ quotation, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const fetchMessages = async (silent = false) => {
    if (!quotation?._id) return;
    try {
      if (!silent) setLoading(true);
      const res = await api.get(`/quotations/${quotation._id}/messages`);
      setMessages(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      console.error('Failed to load chat messages:', err);
      if (!silent) {
        setError(err.response?.data?.message || 'Unable to load private quotation messages');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [quotation?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await api.post(`/quotations/${quotation._id}/messages`, {
        message: messageText,
      });
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Admin
        </span>
      );
    }
    if (role === 'manufacturer') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
          <Factory className="w-3 h-3" /> Manufacturer
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
        <User className="w-3 h-3" /> Fundraiser
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full h-[600px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  Direct Production Chat
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  Quotation #{quotation?._id?.slice(-6) || 'Q-CHAT'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {quotation?.projectName || quotation?.designSpec?.garment?.style || 'Custom Apparel Quote'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchMessages(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Refresh messages"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Access Security Banner */}
        <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Private Channel: <strong>Fundraiser ↔ Assigned Factory</strong></span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">
            {quotation?.assignedManufacturer?.name || 'Verified Manufacturer'}
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-slate-950/40">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Loading encrypted conversation...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No messages yet</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Discuss specs, fabric weights, sample lead times, or print dimensions directly between the fundraiser and assigned factory.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine =
                user && (msg.senderId?._id || msg.senderId)?.toString() === user._id?.toString();

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300">{msg.senderName}</span>
                    {getRoleBadge(msg.senderRole)}
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMine
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs shadow-md shadow-cyan-600/10'
                        : msg.senderRole === 'admin'
                        ? 'bg-amber-950/70 border border-amber-500/30 text-amber-100 rounded-tl-xs'
                        : 'bg-slate-800/90 border border-slate-700 text-slate-200 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    {msg.attachmentUrl && (
                      <a
                        href={msg.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block text-[11px] underline text-cyan-200"
                      >
                        View Attachment
                      </a>
                    )}
                  </div>

                  {isMine && (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 pr-1">
                      {msg.isRead ? (
                        <CheckCheck className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      <span>{msg.isRead ? 'Read' : 'Delivered'}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Footer */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/90 flex items-center gap-2"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message to discuss specs, sample timeline..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer transition"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
