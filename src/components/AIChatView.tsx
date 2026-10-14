import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  RefreshCw,
  Square,
  Send,
  Paperclip,
  PanelLeftClose,
  PanelLeft,
  X,
  FileText,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { ChatAttachment } from '../types/ai';
import { ImageDisplayCard } from './ImageDisplayCard';
import { LyriaMusicPlayer } from './LyriaMusicPlayer';
import { VeoVideoPlayer } from './VeoVideoPlayer';

export const AIChatView: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    activeConversation,
    startNewChat,
    selectConversation,
    renameConversation,
    deleteConversation,
    sendMessage,
    isProcessing,
    stopGeneration,
    regenerateLastMessage,
    saveCreation,
    errorMessage,
  } = useAI();

  const [inputMessage, setInputMessage] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isProcessing]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() && attachments.length === 0) return;
    const txt = inputMessage.trim();
    const atts = [...attachments];
    setInputMessage('');
    setAttachments([]);
    await sendMessage(txt, activeConversation?.capability || 'chat', atts);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      if (file.type.startsWith('image/')) {
        reader.onload = (event) => {
          setAttachments((prev) => [
            ...prev,
            { name: file.name, type: file.type, size: file.size, dataUrl: event.target?.result as string },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (event) => {
          setAttachments((prev) => [
            ...prev,
            { name: file.name, type: file.type, size: file.size, textContent: (event.target?.result as string)?.slice(0, 15000) },
          ]);
        };
        reader.readAsText(file);
      }
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Render markdown-like text with code blocks
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const firstLineEnd = part.indexOf('\n');
        const lang = part.slice(3, firstLineEnd).trim() || 'code';
        const code = part.slice(firstLineEnd + 1, -3);

        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-white/[0.1] bg-[#0c0e14] font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.08] bg-white/[0.03] text-neutral-400">
              <span className="uppercase text-[10px] tracking-wider">{lang}</span>
              <button
                onClick={() => handleCopy(`code-${index}`, code)}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                {copiedId === `code-${index}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-neutral-200 leading-relaxed scrollbar-thin">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Paragraph formatting
      return (
        <div key={index} className="space-y-2 whitespace-pre-wrap leading-relaxed font-light">
          {part}
        </div>
      );
    });
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden relative">
      {/* Sidebar - Conversation History */}
      <div
        className={`${
          sidebarOpen ? 'w-64 sm:w-72' : 'w-0'
        } transition-all duration-300 border-r border-white/[0.08] bg-[#07080c] flex flex-col overflow-hidden shrink-0 z-20`}
      >
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <button
            onClick={() => startNewChat('chat')}
            className="flex-1 h-10 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-serif tracking-wider uppercase text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-2 text-[10px] font-mono uppercase text-neutral-400 tracking-widest">
            CONVERSATIONS ({conversations.length})
          </div>
          {conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`group px-3 py-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                  isActive
                    ? 'bg-white/[0.08] text-white border border-white/[0.12]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {renamingId === conv.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      renameConversation(conv.id, renameText);
                      setRenamingId(null);
                    }}
                    className="flex-1 mr-2"
                  >
                    <input
                      type="text"
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                      onBlur={() => {
                        renameConversation(conv.id, renameText);
                        setRenamingId(null);
                      }}
                      autoFocus
                      className="w-full bg-black/60 border border-white/20 rounded px-2 py-0.5 text-xs text-white"
                    />
                  </form>
                ) : (
                  <span className="truncate flex-1 mr-2 font-light">{conv.title}</span>
                )}

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingId(conv.id);
                      setRenameText(conv.title);
                    }}
                    title="Rename"
                    className="p-1 hover:text-white text-neutral-400 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    title="Delete"
                    className="p-1 hover:text-red-400 text-neutral-400 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#06070a] relative overflow-hidden">
        {/* Top Chat Bar */}
        <div className="h-12 border-b border-white/[0.08] px-4 flex items-center justify-between shrink-0 bg-[#06070a]/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
            <span className="font-serif text-sm font-medium text-white truncate max-w-xs sm:max-w-md">
              {activeConversation?.title || 'Chat'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-amber-300 uppercase">
              {activeConversation?.capability || 'chat'}
            </span>
          </div>

          <button
            onClick={() => startNewChat('chat')}
            className="sm:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 max-w-4xl mx-auto w-full">
          {activeConversation?.messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
              >
                <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-neutral-400">
                  <span>{isUser ? 'YOU' : 'OTHERWISE AI'}</span>
                </div>

                {/* Attachments if any */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.attachments.map((att, aIdx) => (
                      <div
                        key={aIdx}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-neutral-300 flex items-center gap-1.5"
                      >
                        {att.type.startsWith('image/') ? (
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-sky-400" />
                        )}
                        <span className="truncate max-w-[150px]">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 text-sm sm:text-base ${
                    isUser
                      ? 'bg-neutral-800/90 text-white border border-white/[0.12]'
                      : 'bg-[#090b11] text-neutral-200 border border-white/[0.08] shadow-lg'
                  }`}
                >
                  {msg.content && renderFormattedContent(msg.content)}
                  {msg.image && (
                    <ImageDisplayCard
                      image={msg.image}
                      onRegenerate={(p) => sendMessage(p, 'image')}
                      onVariation={(img) =>
                        sendMessage(`Create a creative visual variation of this image: ${img.prompt}`, 'image', [
                          { name: 'variation-ref.png', type: 'image/png', size: 0, dataUrl: img.url },
                        ])
                      }
                      onEdit={(instruction, img) =>
                        sendMessage(instruction, 'image', [
                          { name: 'edit-ref.png', type: 'image/png', size: 0, dataUrl: img.url },
                        ])
                      }
                      onUseAsReference={(img) =>
                        setAttachments((prev) => [
                          ...prev,
                          { name: 'reference.png', type: 'image/png', size: 0, dataUrl: img.url },
                        ])
                      }
                      onSave={(img) =>
                        saveCreation({
                          type: 'image',
                          title: img.prompt.slice(0, 40) || 'Saved Artwork',
                          preview: img.url,
                          content: img.prompt,
                          metadata: { url: img.url, aspectRatio: img.aspectRatio },
                          tags: ['IMAGE', 'AI ART'],
                        })
                      }
                    />
                  )}
                  {msg.audio && (
                    <div className="mt-4 w-full">
                      <LyriaMusicPlayer
                        song={msg.audio}
                        onSave={() =>
                          saveCreation({
                            type: 'song',
                            title: msg.audio?.title || 'Lyria 3.5 Music Track',
                            preview: `${msg.audio?.genre || 'Music'} (${msg.audio?.bpm || 120} BPM) - ${msg.audio?.mood || 'Full Track'}`,
                            content: msg.content,
                            metadata: msg.audio,
                            tags: ['SONG', 'LYRIA 3.5', 'MUSIC'],
                          })
                        }
                      />
                    </div>
                  )}
                  {msg.video && (
                    <div className="mt-4 w-full">
                      <VeoVideoPlayer
                        video={msg.video}
                        onSave={() =>
                          saveCreation({
                            type: 'video',
                            title: msg.video?.title || 'Google Veo Video',
                            preview: msg.video?.url || '',
                            content: msg.content,
                            metadata: msg.video,
                            tags: ['VIDEO', 'GOOGLE VEO', 'CINEMATIC'],
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Copy action below model message */}
                {!isUser && (
                  <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 text-neutral-400 hover:text-white flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>COPY</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Processing / Generating Pulse */}
          {isProcessing && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-[#090b11] border border-white/[0.08] text-xs font-mono text-neutral-400 flex items-center gap-2">
                <span>OTHERWISE AI is reasoning and synthesizing...</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </div>
            </div>
          )}

          {/* Error notice */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={regenerateLastMessage}
                className="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-white font-mono uppercase text-[10px]"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Field */}
        <div className="p-4 max-w-4xl mx-auto w-full shrink-0">
          {/* Action buttons (Regenerate & Stop) */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {isProcessing ? (
              <button
                onClick={stopGeneration}
                className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3 h-3 text-red-400 fill-current" />
                <span>Stop Generation</span>
              </button>
            ) : (
              activeConversation &&
              activeConversation.messages.length > 1 && (
                <button
                  onClick={regenerateLastMessage}
                  className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate Response</span>
                </button>
              )
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="relative rounded-2xl border border-white/[0.12] bg-[#090b10] p-3 flex flex-col focus-within:border-amber-300/60 transition-colors"
          >
            {/* Attachment Chips */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-white/[0.06]">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/[0.06] text-xs text-neutral-300 font-mono"
                  >
                    <span className="truncate max-w-[120px]">{att.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-neutral-500 hover:text-white ml-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.csv,.json,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
                title="Attach file or image"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask OTHERWISE anything..."
                className="flex-1 bg-transparent text-white text-sm focus:outline-none font-sans font-light"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() && attachments.length === 0}
                className="p-2 rounded-xl bg-white text-black hover:bg-neutral-200 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
