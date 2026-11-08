import { useEffect, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import Avatar from './Avatar.jsx';

const AUTO_REPLIES = [
  '¡Claro! Cuéntame más detalles.',
  'Perfecto, me parece bien. ¿Cuándo te viene mejor?',
  'Gracias por escribir, te respondo en un momento.',
  '¡Con gusto te ayudo! ¿Dónde nos encontramos?',
  'Listo, quedamos así entonces 👍',
];

const formatTime = (date) =>
  date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

export default function ChatModal({ vecino, onClose }) {
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      from: 'vecino',
      text: `Hola, soy ${vecino.nombre}. ¿En qué te puedo ayudar?`,
      time: formatTime(new Date()),
    },
  ]);
  const [text, setText] = useState('');
  const [pending, setPending] = useState(0);

  const nextId = useRef(2);
  const timers = useRef([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Enfocar input, bloquear scroll del fondo y cerrar con Escape
  useEffect(() => {
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      timers.current.forEach(clearTimeout);
    };
  }, [onClose]);

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pending]);

  const handleSend = (e) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return;

    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, from: 'me', text: clean, time: formatTime(new Date()) },
    ]);
    setText('');
    setPending((p) => p + 1);

    const timer = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          from: 'vecino',
          text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
          time: formatTime(new Date()),
        },
      ]);
      setPending((p) => p - 1);
    }, 1200 + Math.random() * 800);

    timers.current.push(timer);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Chat con ${vecino.nombre} ${vecino.apellido}`}
        className="flex h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:h-[600px] sm:max-w-md sm:rounded-2xl"
      >
        {/* Cabecera */}
        <header className="flex items-center gap-3 bg-brand-600 px-4 py-3 text-white">
          <Avatar nombre={vecino.nombre} apellido={vecino.apellido} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              {vecino.nombre} {vecino.apellido}
            </p>
            <p className="text-xs text-brand-100">
              {pending > 0 ? 'escribiendo…' : 'en línea · chat simulado'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar chat"
            className="rounded-lg p-1.5 text-white/90 transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {/* Mensajes */}
        <div className="flex-1 space-y-2 overflow-y-auto bg-[#efeae2] px-4 py-4" aria-live="polite">
          {messages.map((m) => {
            const mine = m.from === 'me';
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                    mine
                      ? 'rounded-br-sm bg-[#d9fdd3] text-gray-900'
                      : 'rounded-bl-sm bg-white text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{m.text}</p>
                  <p className="mt-0.5 text-right text-[10px] text-gray-500">{m.time}</p>
                </div>
              </div>
            );
          })}

          {pending > 0 && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 shadow-sm" aria-label="El vecino está escribiendo">
                <span className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 bg-gray-100 px-3 py-3">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            placeholder="Escribe un mensaje"
            aria-label="Escribe un mensaje"
            className="input !rounded-full"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            aria-label="Enviar mensaje"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}