import React,{useState,useRef,useEffect}from'react';
import'./index.css';
import SYSTEM_PROMPT from'./systemPrompt';
const CHIPS=['How do I prepare for a first date?','Give me date ideas',"How do I know if he's the right one?",'What should I talk about?','How many dates before deciding?'];
function fmt(t){return t.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/^- (.*?)$/gm,'<li>$1</li>').replace(/\n\n/g,'<br/><br/>').replace(/\n/g,'<br/>');}
function Dots(){return React.createElement('div',{style:{display:'flex',gap:12,alignItems:'flex-start'}},React.createElement('div',{style:S.ab},'SC'),React.createElement('div',{style:S.dots},[0,1,2].map(i=>React.createElement('div',{key:i,style:{...S.dot,animationDelay:i*.2+'s'}}))));}
export default function App(){
const[msgs,setMsgs]=useState([]);
const[hist,setHist]=useState([]);
const[inp,setInp]=useState('');
const[load,setLoad]=useState(false);
const[err,setErr]=useState(null);
const bot=useRef(null);const ta=useRef(null);
useEffect(()=>{bot.current?.scrollIntoView({behavior:'smooth'});},[msgs,load]);
function resize(){const e=ta.current;if(!e)return;e.style.height='auto';e.style.height=Math.min(e.scrollHeight,120)+'px';}
async function send(text){
const msg=text||inp.trim();if(!msg||load)return;
setInp('');if(ta.current)ta.current.style.height='auto';
setErr(null);setMsgs(p=>[...p,{r:'user',t:msg}]);
const nh=[...hist,{role:'user',content:msg}];setHist(nh);setLoad(true);
try{
const k=process.env.REACT_APP_ANTHROPIC_API_KEY;
if(!k||k==='your_api_key_here')throw new Error('Set REACT_APP_ANTHROPIC_API_KEY in Vercel');
const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':k,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-calls':'true'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:SYSTEM_PROMPT,messages:nh})});
if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e?.error?.message||'API error '+res.status);}
const d=await res.json();const rt=d.content?.[0]?.text||'';
setHist(p=>[...p,{role:'assistant',content:rt}]);
setMsgs(p=>[...p,{r:'bot',t:rt}]);
}catch(e){setErr(e.message);}finally{setLoad(false);}
}
const showChips=msgs.length===0;
return React.createElement('div',{style:S.page},
React.createElement('header',{style:S.hdr},React.createElement('div',{style:S.logo},'SC'),React.createElement('div',null,React.createElement('div',{style:S.ht},'Shidduch Coach'),React.createElement('div',{style:S.hs},'Beis Yaakov Dating Coach')),React.createElement('div',{style:S.badge},'Tznius')),
React.createElement('div',{style:S.scroll},React.createElement('div',{style:S.wrap},
React.createElement('div',{style:S.dv},'All conversations are private'),
React.createElement('div',{style:{display:'flex',gap:12,alignItems:'flex-start'}},React.createElement('div',{style:S.ab},'SC'),React.createElement('div',{style:S.bb},React.createElement('strong',null,'Welcome!'),` I am here to guide you through the shidduch process — date ideas, preparation, conversation help, and more.`,showChips&&React.createElement('div',{style:S.chips},CHIPS.map(c=>React.createElement('button',{key:c,style:S.chip,onClick:()=>send(c),onMouseEnter:e=>Object.assign(e.target.style,S.chiph),onMouseLeave:e=>Object.assign(e.target.style,S.chip)},c))))),
msgs.map((m,i)=>React.createElement('div',{key:i,style:{display:'flex',gap:12,alignItems:'flex-start',flexDirection:m.r==='user'?'row-reverse':'row'}},React.createElement('div',{style:m.r==='user'?S.au:S.ab},m.r==='user'?'YOU':'SC'),React.createElement('div',{style:m.r==='user'?S.bu:S.bb,dangerouslySetInnerHTML:{__html:fmt(m.t)}}))),
load&&React.createElement(Dots,null),
err&&React.createElement('div',{style:S.er},React.createElement('strong',null,'Error: '),err),
React.createElement('div',{ref:bot}))),
React.createElement('div',{style:S.ia},React.createElement('div',{style:S.ir},
React.createElement('textarea',{ref:ta,value:inp,onChange:e=>{setInp(e.target.value);resize();},onKeyDown:e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}},placeholder:'Ask anything about shidduchim...',rows:1,style:S.ta}),
React.createElement('button',{onClick:()=>send(),style:S.btn,disabled:load},React.createElement('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:'white',strokeWidth:2.5,strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('line',{x1:22,y1:2,x2:11,y2:13}),React.createElement('polygon',{points:'22 2 15 22 11 13 2 9 22 2'}))))),
React.createElement('style',null,`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}textarea:focus{outline:none;border-color:#C9A84C!important;background:#fff!important}textarea::placeholder{color:#9A8880}button:disabled{opacity:.6;cursor:not-allowed}`));
}
const S={page:{display:'flex',flexDirection:'column',height:'100vh',background:'#FAF7F2'},hdr:{display:'flex',alignItems:'center',gap:14,padding:'18px 24px',background:'#fff',borderBottom:'1px solid #DDD4C8',position:'sticky',top:0,zIndex:10,flexShrink:0},logo:{width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,#C9A84C,#EDD98A)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff',flexShrink:0},ht:{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:600,color:'#2C2320'},hs:{fontSize:12,color:'#9A8880',fontWeight:300},badge:{marginLeft:'auto',fontSize:11,background:'#F2EDE4',color:'#8B6914',border:'1px solid #EDD98A',borderRadius:20,padding:'4px 12px',fontWeight:700,whiteSpace:'nowrap'},scroll:{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',alignItems:'center',paddingBottom:120},wrap:{width:'100%',maxWidth:760,padding:'24px 16px 16px',display:'flex',flexDirection:'column',gap:18},dv:{textAlign:'center',fontSize:11,color:'#9A8880',padding:'4px 0 8px',fontStyle:'italic'},ab:{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#C9A84C,#EDD98A)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff',flexShrink:0,marginTop:2},au:{width:36,height:36,borderRadius:'50%',background:'#D4B8C4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#8C6E7A',flexShrink:0,marginTop:2},bb:{maxWidth:'82%',padding:'13px 16px',borderRadius:16,borderTopLeftRadius:4,fontSize:15,lineHeight:1.65,background:'#fff',border:'1px solid #DDD4C8',color:'#2C2320'},bu:{maxWidth:'82%',padding:'13px 16px',borderRadius:16,borderTopRightRadius:4,fontSize:15,lineHeight:1.65,background:'#C9A84C',color:'#fff'},chips:{display:'flex',flexWrap:'wrap',gap:8,marginTop:14},chip:{background:'#F2EDE4',border:'1px solid #DDD4C8',color:'#6B5A54',padding:'7px 14px',borderRadius:20,fontSize:13,cursor:'pointer',fontFamily:"'Lato',sans-serif"},chiph:{background:'#C9A84C',border:'1px solid #C9A84C',color:'#fff',padding:'7px 14px',borderRadius:20,fontSize:13,cursor:'pointer',fontFamily:"'Lato',sans-serif"},dots:{display:'flex',gap:5,padding:'14px 18px',background:'#fff',border:'1px solid #DDD4C8',borderRadius:16,borderTopLeftRadius:4},dot:{width:7,height:7,background:'#EDD98A',borderRadius:'50%',animation:'bounce 1.2s infinite'},er:{background:'#FFF0F0',border:'1px solid #ffcccc',borderRadius:10,padding:'12px 16px',fontSize:14,color:'#a00'},ia:{borderTop:'1px solid #DDD4C8',background:'#fff',padding:16,position:'sticky',bottom:0,width:'100%'},ir:{display:'flex',gap:10,alignItems:'flex-end',maxWidth:728,margin:'0 auto'},ta:{flex:1,border:'1px solid #DDD4C8',borderRadius:24,padding:'11px 18px',fontFamily:"'Lato',sans-serif",fontSize:15,color:'#2C2320',background:'#FAF7F2',resize:'none',lineHeight:1.5,maxHeight:120,overflowY:'auto'},btn:{width:44,height:44,borderRadius:'50%',background:'#C9A84C',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}};