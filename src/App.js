import React, { useState, useRef, useEffect } from 'react';
import './index.css';
import SYSTEM_PROMPT from './systemPrompt';

const QUICK_CHIPS = [
  'How do I prepare for a first date?',
  'Give me date ideas',
  "How do I know if he's the right one?",
  'What should I talk about?',
  'How many dates before deciding?',
  'He seems nervous, how do I help?',
];

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*?)$/gm, '<strong style="display:block;margin-top:12px;font-size:15px">$1</strong>')
    .replace(/^## (.*?)$/gm, '<strong style="display:block;margin-top:14px;font-size:16px">$1</strong>')
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul style="margin:8px 0 4px 18px">$1</ul>')
    .replace(/^\d+\. (.*?)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={styles.avatarBot}>✡</div>
      <div style={styles.dots}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ ...styles.dot, animationDelay: i * 0.2 + 's' }} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  async function send(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setError(null);
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    const newHistory = [...history, { role: 'user', content: msg }];
    setHistory(newHistory);
    setLoading(true);
    try {
      const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
      if (!apiKey || apiKey === 'your_api_key_here') throw new Error('Add REACT_APP_ANTHROPIC_API_KEY to your environment variables.');
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-calls': 'true',
        },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: SYSTEM_PROMPT, messages: newHistory }),
      });
      if (!response.ok) { const e = await response.json().catch(() => ({})); throw new Error(e?.error?.message || 'API error ' + response.status); }
      const data = await response.json();
      const replyText = data.content?.[0]?.text || '';
      setHistory(prev => [...prev, { role: 'assistant', content: replyText }]);
      setMessages(prev => [...prev, { role: 'assistant', text: replyText }]);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const showChips = messages.length === 0;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logoMark}>✡</div>
        <div>
          <div style={styles.headerTitle}>Shidduch Coach</div>
          <div style={styles.headerSub}>Guidance rooted in Torah values · Beis Yaakov</div>
        </div>
        <div style={styles.badge}>Tznius · Thoughtful · Practical</div>
      </header>
      <div style={styles.scrollArea}>
        <div style={styles.chatWrapper}>
          <div style={styles.divider}>All conversations are private · Hatzlacha!</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={styles.avatarBot}>✡</div>
            <div style={styles.bubbleBot}>
              <strong>Welcome! I am here to guide you through the shidduch process.</strong>
              <br /><br />
              Whether you are just starting to date, preparing for a specific date, navigating a complicated situation, or looking for meaningful <em style={{ color: '#8B6914' }}>date ideas</em> — I am here to help.
              <br /><br />
              My guidance is rooted in Beis Yaakov values: <em style={{ color: '#8B6914' }}>tznius</em>, thoughtfulness, and genuine growth toward building a <em style={{ color: '#8B6914' }}>bayis neman bYisrael</em>. Ask me anything.
              {showChips && (
                <div style={styles.chips}>
                  {QUICK_CHIPS.map(chip => (
                    <button key={chip} style={styles.chip} onClick={() => send(chip)}
                      onMouseEnter={e => Object.assign(e.target.style, styles.chipHover)}
                      onMouseLeave={e => Object.assign(e.target.style, styles.chip)}>
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={msg.role === 'user' ? styles.avatarUser : styles.avatarBot}>{msg.role === 'user' ? 'YOU' : '✡'}</div>
              <div style={msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot} dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
            </div>
          ))}
          {loading && <TypingDots />}
          {error && <div style={styles.errorBox}><strong>Error:</strong> {error}</div>}
          <div ref={bottomRef} />
        </div>
      </div>
      <div style={styles.inputArea}>
        <div style={styles.inputRow}>
          <textarea ref={textareaRef} value={input} onChange={e => { setInput(e.target.value); autoResize(); }} onKeyDown={handleKeyDown} placeholder="Ask anything about dating, shidduchim, or date ideas..." rows={1} style={styles.textarea} />
          <button onClick={() => send()} style={styles.sendBtn} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        textarea:focus{outline:none;border-color:#C9A84C!important;background:#fff!important}
        textarea::placeholder{color:#9A8880}
        button:disabled{opacity:0.6;cursor:not-allowed}
      `}</style>
    </div>
  );
}

const styles = {
  page:{display:'flex',flexDirection:'column',height:'100vh',background:'#FAF7F2'},
  header:{display:'flex',alignItems:'center',gap:14,padding:'18px 24px',background:'#fff',borderBottom:'1px solid #DDD4C8',position:'sticky',top:0,zIndex:10,flexShrink:0},
  logoMark:{width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,#C9A84C,#EDD98A)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0},
  headerTitle:{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:600,color:'#2C2320',lineHeight:1.2},
  headerSub:{fontSize:12,color:'#9A8880',fontWeight:300,letterSpacing:'0.5px',marginTop:1},
  badge:{marginLeft:'auto',fontSize:11,background:'#F2EDE4',color:'#8B6914',border:'1px solid #EDD98A',borderRadius:20,padding:'4px 12px',fontWeight:700,letterSpacing:'0.3px',whiteSpace:'nowrap'},
  scrollArea:{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',alignItems:'center',paddingBottom:120},
  chatWrapper:{width:'100%',maxWidth:760,padding:'24px 16px 16px',display:'flex',flexDirection:'column',gap:18},
  divider:{textAlign:'center',fontSize:11,color:'#9A8880',letterSpacing:'0.5px',padding:'4px 0 8px',fontStyle:'italic'},
  avatarBot:{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#C9A84C,#EDD98A)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0,marginTop:2},
  avatarUser:{width:36,height:36,borderRadius:'50%',background:'#D4B8C4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#8C6E7A',flexShrink:0,marginTop:2},
  bubbleBot:{maxWidth:'82%',padding:'13px 16px',borderRadius:16,borderTopLeftRadius:4,fontSize:15,lineHeight:1.65,background:'#fff',border:'1px solid #DDD4C8',color:'#2C2320',animation:'fadein 0.3s ease'},
  bubbleUser:{maxWidth:'82%',padding:'13px 16px',borderRadius:16,borderTopRightRadius:4,fontSize:15,lineHeight:1.65,background:'#C9A84C',color:'#fff',animation:'fadein 0.3s ease'},
  chips:{display:'flex',flexWrap:'wrap',gap:8,marginTop:14},
  chip:{background:'#F2EDE4',border:'1px solid #DDD4C8',color:'#6B5A54',padding:'7px 14px',borderRadius:20,fontSize:13,cursor:'pointer',transition:'all 0.2s',fontFamily:"'Lato',sans-serif"},
  chipHover:{background:'#C9A84C',border:'1px solid #C9A84C',color:'#fff',padding:'7px 14px',borderRadius:20,fontSize:13,cursor:'pointer',fontFamily:"'Lato',sans-serif"},
  dots:{display:'flex',gap:5,padding:'14px 18px',background:'#fff',border:'1px solid #DDD4C8',borderRadius:16,borderTopLeftRadius:4},
  dot:{width:7,height:7,background:'#EDD98A',borderRadius:'50%',animation:'bounce 1.2s infinite'},
  errorBox:{background:'#FFF0F0',border:'1px solid #ffcccc',borderRadius:10,padding:'12px 16px',fontSize:14,color:'#a00'},
  inputArea:{borderTop:'1px solid #DDD4C8',background:'#fff',padding:16,position:'sticky',bottom:0,width:'100%'},
  inputRow:{display:'flex',gap:10,alignItems:'flex-end',maxWidth:728,margin:'0 auto'},
  textarea:{flex:1,border:'1px solid #DDD4C8',borderRadius:24,padding:'11px 18px',fontFamily:"'Lato',sans-serif",fontSize:15,color:'#2C2320',background:'#FAF7F2',resize:'none',lineHeight:1.5,maxHeight:120,overflowY:'auto',transition:'border-color 0.2s'},
  sendBtn:{width:44,height:44,borderRadius:'50%',background:'#C9A84C',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'background 0.2s'},
};