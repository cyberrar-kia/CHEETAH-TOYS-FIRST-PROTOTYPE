'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mic, MicOff, Star, Trophy, BookOpen, Volume2,
  ChevronRight, Home, BarChart2, Play, CheckCircle,
  XCircle, ArrowLeft, Zap, Target
} from 'lucide-react';
import Image from 'next/image';

const LESSONS = [
  { id:1, title:'Short Vowels',  level:'Beginner',     words:['cat','bat','hat','mat','sat'],                       icon:'🐱', color:'#F5820A', completed:true,  score:95 },
  { id:2, title:'Long Vowels',   level:'Beginner',     words:['cake','lake','make','bake','take'],                  icon:'🎂', color:'#1A5DB5', completed:true,  score:88 },
  { id:3, title:'Blends',        level:'Intermediate', words:['flag','plan','step','frog','grip'],                  icon:'🏁', color:'#16A34A', completed:false, score:0  },
  { id:4, title:'Digraphs',      level:'Intermediate', words:['ship','chip','shop','thin','then'],                  icon:'⚓', color:'#0891B2', completed:false, score:0  },
  { id:5, title:'Sight Words',   level:'Advanced',     words:['the','said','was','they','have'],                    icon:'👁️', color:'#F59E0B', completed:false, score:0  },
  { id:6, title:'Sentences',     level:'Advanced',     words:['The cat sat on the mat.','I can see the big dog.'], icon:'📖', color:'#0C2340', completed:false, score:0  },
];

const PROFILES = [
  { name:'Amara', grade:'Grade 2', avatar:'👧🏾', streak:7,  points:1240, done:2 },
  { name:'Jamal', grade:'Grade 1', avatar:'👦🏾', streak:3,  points:680,  done:1 },
];

type Screen = 'splash'|'onboarding'|'home'|'lesson'|'feedback'|'dashboard'|'teacher';
const sleep = (ms:number) => new Promise(r=>setTimeout(r,ms));

function Ring({pct,size=52,stroke=5,color='#F5820A'}:{pct:number;size?:number;stroke?:number;color?:string}) {
  const r=(size-stroke)/2, c=2*Math.PI*r;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EDE0D0" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c*(1-pct/100)} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
    </svg>
  );
}

function Confetti() {
  const colors=['#F5820A','#1A5DB5','#16A34A','#F59E0B','#0891B2'];
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:50,overflow:'hidden'}}>
      {Array.from({length:30},(_,i)=>(
        <motion.div key={i} style={{position:'absolute',width:12,height:12,borderRadius:2,
          left:`${Math.random()*100}%`,background:colors[i%colors.length]}}
          initial={{y:-20,rotate:0,opacity:1}}
          animate={{y:'110vh',rotate:720,opacity:[1,1,0]}}
          transition={{duration:2+Math.random(),delay:Math.random()*0.5}}/>
      ))}
    </div>
  );
}

function NavBar({active,go}:{active:Screen;go:(s:Screen)=>void}) {
  return (
    <div className="nav-bar">
      {[
        {icon:<Home size={22}/>,     label:'Home',     s:'home'      as Screen},
        {icon:<BarChart2 size={22}/>,label:'Progress', s:'dashboard' as Screen},
        {icon:<Trophy size={22}/>,   label:'Teacher',  s:'teacher'   as Screen},
      ].map(n=>(
        <button key={n.label} onClick={()=>go(n.s as Screen)}
          style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,border:'none',background:'none',cursor:'pointer',padding:'4px 16px'}}>
          <span style={{color: active===n.s?'var(--orange)':'var(--muted)'}}>{n.icon}</span>
          <span style={{fontSize:11,fontWeight:600,color:active===n.s?'var(--orange)':'var(--muted)'}}>{n.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [screen,     setScreen]     = useState<Screen>('splash');
  const [childName,  setChildName]  = useState('');
  const [grade,      setGrade]      = useState('Grade 1');
  const [lesson,     setLesson]     = useState(LESSONS[2]);
  const [wordIdx,    setWordIdx]    = useState(0);
  const [recording,  setRecording]  = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result,     setResult]     = useState<'correct'|'wrong'|null>(null);
  const [confetti,   setConfetti]   = useState(false);
  const [score,      setScore]      = useState(0);
  const [total,      setTotal]      = useState(0);
  const [ripple,     setRipple]     = useState(false);
  const [audioPlay,  setAudioPlay]  = useState(false);

  useEffect(()=>{if(screen==='splash')sleep(2000).then(()=>setScreen('onboarding'));},[screen]);

  async function handleRecord(){
    setRecording(true);setRipple(true);
    await sleep(2000);
    setRecording(false);setRipple(false);setProcessing(true);
    await sleep(1500);
    setProcessing(false);
    const ok=Math.random()>0.3;
    setResult(ok?'correct':'wrong');
    setTotal(t=>t+1);
    if(ok){setScore(s=>s+1);setConfetti(true);setTimeout(()=>setConfetti(false),2200);}
    setScreen('feedback');
  }

  async function handleAudio(){setAudioPlay(true);await sleep(1200);setAudioPlay(false);}

  function nextWord(){
    if(wordIdx<lesson.words.length-1){setWordIdx(i=>i+1);setResult(null);setScreen('lesson');}
    else{setScreen('home');setWordIdx(0);}
  }

  function startLesson(l:typeof LESSONS[0]){
    setLesson(l);setWordIdx(0);setResult(null);setScore(0);setTotal(0);setScreen('lesson');
  }

  // shared card style
  const card:React.CSSProperties={background:'white',border:'1px solid var(--border)',borderRadius:16,boxShadow:'0 2px 8px rgba(0,0,0,0.05)'};

  // ── SPLASH ──────────────────────────────────────────────────────────────────
  if(screen==='splash') return (
    <div className="app-shell">
      <div className="app-frame" style={{background:'var(--navy)',justifyContent:'center',alignItems:'center'}}>
        <motion.div initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}}
          transition={{type:'spring',duration:0.8}}
          style={{display:'flex',flexDirection:'column',alignItems:'center',gap:24}}>
          <div style={{width:120,height:120,borderRadius:28,background:'var(--orange)',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 20px 40px rgba(0,0,0,0.3)',overflow:'hidden'}}>
            <Image src="/cheetah-logo.png" alt="CHEETAH" width={96} height={96} style={{objectFit:'contain'}}/>
          </div>
          <div style={{textAlign:'center'}}>
            <h1 style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:36,color:'white',margin:0}}>
              CHEETAH Learn
            </h1>
            <p style={{color:'var(--orange-light)',marginTop:4,fontSize:15,fontWeight:500}}>
              Adaptive Literacy Platform
            </p>
          </div>
          <motion.div style={{display:'flex',gap:8}} animate={{opacity:[0.3,1,0.3]}}
            transition={{repeat:Infinity,duration:1.2}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{width:8,height:8,borderRadius:'50%',
                background:'var(--orange)',opacity:i===1?1:0.4}}/>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );

  // ── ONBOARDING ──────────────────────────────────────────────────────────────
  if(screen==='onboarding') return (
    <div className="app-shell">
      <div className="app-frame" style={{background:'var(--bg)'}}>
        <div className="screen-scroll" style={{display:'flex',flexDirection:'column',justifyContent:'center',padding:'40px 24px'}}>
          <motion.div initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.45}}>

            {/* Logo + heading */}
            <div style={{textAlign:'center',marginBottom:32}}>
              <div style={{width:80,height:80,borderRadius:20,background:'var(--orange)',
                display:'flex',alignItems:'center',justifyContent:'center',
                margin:'0 auto 16px',boxShadow:'0 8px 24px rgba(245,130,10,0.35)',overflow:'hidden'}}>
                <Image src="/cheetah-logo.png" alt="CHEETAH" width={60} height={60} style={{objectFit:'contain'}}/>
              </div>
              <h1 style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:30,color:'var(--navy)',margin:0}}>
                Welcome! 👋
              </h1>
              <p style={{color:'var(--muted)',marginTop:6,fontSize:13}}>
                Start your reading journey with CHEETAH
              </p>
            </div>

            {/* Form */}
            <div style={{...card,padding:20,marginBottom:16}}>
              <label style={{display:'block',fontSize:13,fontWeight:700,color:'var(--navy)',marginBottom:8}}>
                Child&apos;s Name
              </label>
              <input value={childName} onChange={e=>setChildName(e.target.value)}
                placeholder="Enter name..."
                style={{width:'100%',padding:'12px 16px',borderRadius:12,fontSize:15,outline:'none',
                  border:`2px solid var(--border)`,color:'var(--text)',
                  fontFamily:'DM Sans,sans-serif',boxSizing:'border-box',transition:'border-color 0.2s'}}
                onFocus={e=>e.target.style.borderColor='var(--orange)'}
                onBlur={e=>e.target.style.borderColor='var(--border)'}/>

              <label style={{display:'block',fontSize:13,fontWeight:700,color:'var(--navy)',margin:'16px 0 8px'}}>
                Grade Level
              </label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                {['Grade 1','Grade 2','Grade 3'].map(g=>(
                  <button key={g} onClick={()=>setGrade(g)}
                    style={{padding:'10px 4px',borderRadius:12,fontSize:13,fontWeight:700,cursor:'pointer',
                      transition:'all 0.15s',
                      background: grade===g?'var(--orange)':'var(--bg)',
                      color: grade===g?'white':'var(--muted)',
                      border:`2px solid ${grade===g?'var(--orange)':'var(--border)'}`}}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={()=>{if(childName.trim())setScreen('home');}}
              disabled={!childName.trim()}
              style={{width:'100%',padding:'16px',borderRadius:16,fontSize:17,fontWeight:900,
                color:'white',border:'none',cursor:childName.trim()?'pointer':'default',
                fontFamily:'Nunito,sans-serif',
                background:childName.trim()?'var(--orange)':'#ccc',
                boxShadow:childName.trim()?'0 8px 24px rgba(245,130,10,0.35)':'none',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              Let&apos;s Go! <ChevronRight size={22}/>
            </button>

            <p style={{textAlign:'center',fontSize:11,color:'var(--muted)',marginTop:16}}>
              A CHEETAH® Toys &amp; More product · FastTrack Literacy
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );

  // ── HOME ────────────────────────────────────────────────────────────────────
  if(screen==='home') return (
    <div className="app-shell">
      <div className="app-frame" style={{background:'var(--bg)'}}>

        {/* Sticky header */}
        <div style={{background:'var(--navy)',padding:'40px 20px 20px',flexShrink:0}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
            <div>
              <p style={{fontSize:11,color:'rgba(255,255,255,0.5)',fontWeight:600}}>Welcome back,</p>
              <h2 style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:22,color:'white',margin:'2px 0'}}>
                {childName||'Learner'} 👋
              </h2>
              <p style={{fontSize:11,color:'var(--orange-light)',fontWeight:500}}>{grade} · FastTrack Literacy</p>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.1)',
              padding:'8px 12px',borderRadius:12}}>
              <Zap size={14} color="#FCD34D"/><span style={{fontWeight:900,color:'white',fontSize:15}}>
              {PROFILES[0].streak}</span><span style={{fontSize:10,color:'rgba(255,255,255,0.5)'}}>days</span>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
            {[{label:'Points',value:'1,240',icon:'⭐'},{label:'Lessons',value:`2/${LESSONS.length}`,icon:'📚'},{label:'Accuracy',value:'91%',icon:'🎯'}].map(s=>(
              <div key={s.label} style={{background:'rgba(255,255,255,0.08)',borderRadius:12,padding:'10px 8px',textAlign:'center'}}>
                <div style={{fontSize:18}}>{s.icon}</div>
                <div style={{fontFamily:'Nunito,sans-serif',fontWeight:900,color:'white',fontSize:13,marginTop:2}}>{s.value}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.45)'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="screen-scroll" style={{padding:'20px 20px 8px'}}>

          {/* Continue banner */}
          <motion.div whileTap={{scale:0.97}} onClick={()=>startLesson(LESSONS[2])}
            style={{background:'var(--orange)',borderRadius:20,padding:'16px',
              display:'flex',alignItems:'center',gap:14,cursor:'pointer',marginBottom:20,
              boxShadow:'0 8px 28px rgba(245,130,10,0.3)'}}>
            <div style={{width:52,height:52,borderRadius:14,background:'rgba(255,255,255,0.2)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>🏁</div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.7)',margin:0}}>Continue where you left off</p>
              <h3 style={{fontFamily:'Nunito,sans-serif',fontWeight:900,color:'white',fontSize:17,margin:'2px 0'}}>Blends</h3>
              <div style={{height:5,borderRadius:99,background:'rgba(255,255,255,0.25)',marginTop:6,overflow:'hidden'}}>
                <div style={{width:'40%',height:'100%',background:'white',borderRadius:99}}/>
              </div>
            </div>
            <Play size={20} color="white" style={{flexShrink:0}}/>
          </motion.div>

          <h3 style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:15,color:'var(--navy)',marginBottom:12}}>
            All Lessons
          </h3>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {LESSONS.map((l,idx)=>(
              <motion.div key={l.id} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}}
                transition={{delay:idx*0.05}} onClick={()=>startLesson(l)}
                style={{...card,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
                <div style={{width:44,height:44,borderRadius:12,background:l.color+'18',
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                  {l.icon}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <h4 style={{fontFamily:'Nunito,sans-serif',fontWeight:700,fontSize:14,
                      color:'var(--navy)',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {l.title}
                    </h4>
                    {l.completed&&<CheckCircle size={13} color="var(--green)" style={{flexShrink:0}}/>}
                  </div>
                  <p style={{fontSize:11,color:'var(--muted)',margin:'2px 0 0'}}>{l.level} · {l.words.length} words</p>
                  {l.completed&&(
                    <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4}}>
                      <div style={{flex:1,height:4,borderRadius:99,background:'var(--border)',overflow:'hidden'}}>
                        <div style={{width:`${l.score}%`,height:'100%',background:'var(--green)',borderRadius:99}}/>
                      </div>
                      <span style={{fontSize:11,fontWeight:700,color:'var(--green)'}}>{l.score}%</span>
                    </div>
                  )}
                </div>
                <ChevronRight size={15} color="var(--muted)" style={{flexShrink:0}}/>
              </motion.div>
            ))}
          </div>
          <div style={{height:16}}/>
        </div>

        <NavBar active="home" go={setScreen}/>
      </div>
    </div>
  );

  // ── LESSON ──────────────────────────────────────────────────────────────────
  if(screen==='lesson') return (
    <div className="app-shell">
      <div className="app-frame" style={{background:'var(--navy)'}}>
        {/* Header */}
        <div style={{padding:'40px 20px 16px',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <button onClick={()=>setScreen('home')}
              style={{width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.1)',
                border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <ArrowLeft size={20} color="white"/>
            </button>
            <div style={{textAlign:'center'}}>
              <p style={{fontSize:14,fontWeight:700,color:'rgba(255,255,255,0.8)',margin:0}}>{lesson.title}</p>
              <p style={{fontSize:11,color:'rgba(255,255,255,0.5)',margin:0}}>{wordIdx+1} of {lesson.words.length}</p>
            </div>
            <div style={{width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.1)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
              {lesson.icon}
            </div>
          </div>
          <div style={{height:6,borderRadius:99,background:'rgba(255,255,255,0.15)',overflow:'hidden'}}>
            <motion.div style={{height:'100%',borderRadius:99,background:'var(--orange)'}}
              animate={{width:`${(wordIdx/lesson.words.length)*100}%`}}/>
          </div>
        </div>

        {/* Body */}
        <div className="screen-scroll" style={{display:'flex',flexDirection:'column',alignItems:'center',
          justifyContent:'center',padding:'0 24px 40px',gap:24}}>

          <motion.div key={wordIdx} initial={{scale:0.85,opacity:0}} animate={{scale:1,opacity:1}}
            style={{width:'100%',background:'white',borderRadius:28,padding:'32px 24px',textAlign:'center',
              boxShadow:'0 20px 50px rgba(0,0,0,0.25)'}}>
            <p style={{fontSize:11,fontWeight:600,color:'var(--muted)',letterSpacing:'0.08em',
              textTransform:'uppercase',marginBottom:12}}>Read this out loud</p>
            <h1 style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:'clamp(2.5rem,12vw,3.8rem)',
              color:'var(--navy)',lineHeight:1.05,marginBottom:20}}>
              {lesson.words[wordIdx]}
            </h1>
            <button onClick={handleAudio}
              style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',
                borderRadius:99,fontSize:13,fontWeight:700,cursor:'pointer',border:'2px solid var(--border)',
                background:audioPlay?'var(--orange)':'var(--bg)',color:audioPlay?'white':'var(--navy)',
                transition:'all 0.2s'}}>
              <Volume2 size={14}/>{audioPlay?'Playing...':'Hear it'}
            </button>
          </motion.div>

          <p style={{color:'rgba(255,255,255,0.6)',fontSize:13}}>Tap the mic and say the word clearly</p>

          {/* Mic */}
          <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
            {ripple&&(
              <>
                <motion.div style={{position:'absolute',borderRadius:'50%',background:'var(--orange)'}}
                  animate={{width:[80,180],height:[80,180],opacity:[0.25,0]}}
                  transition={{repeat:Infinity,duration:1.4}}/>
                <motion.div style={{position:'absolute',borderRadius:'50%',background:'var(--orange)'}}
                  animate={{width:[80,240],height:[80,240],opacity:[0.15,0]}}
                  transition={{repeat:Infinity,duration:1.4,delay:0.35}}/>
              </>
            )}
            <motion.button whileTap={{scale:0.9}} onClick={handleRecord}
              disabled={recording||processing}
              style={{width:96,height:96,borderRadius:'50%',border:'none',cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',position:'relative',zIndex:1,
                background:recording?'#ef4444':'var(--orange)',color:'white',
                boxShadow:recording?'0 8px 32px rgba(239,68,68,0.5)':'0 8px 32px rgba(245,130,10,0.5)'}}>
              {processing
                ? <motion.div style={{width:32,height:32,borderRadius:'50%',border:'4px solid white',
                    borderTopColor:'transparent'}} animate={{rotate:360}} transition={{repeat:Infinity,duration:0.7}}/>
                : recording?<MicOff size={36}/>:<Mic size={36}/>
              }
            </motion.button>
          </div>

          <p style={{fontSize:13,fontWeight:600,color:recording?'#ef4444':processing?'var(--orange-light)':'rgba(255,255,255,0.6)'}}>
            {processing?'Analysing...':recording?'Recording — speak now!':'Tap to record'}
          </p>
        </div>
      </div>
    </div>
  );

  // ── FEEDBACK ─────────────────────────────────────────────────────────────────
  if(screen==='feedback') return (
    <div className="app-shell">
      {confetti&&<Confetti/>}
      <div className="app-frame" style={{background:result==='correct'?'#f0fdf4':'#fff1f2',
        justifyContent:'center',alignItems:'center',padding:'32px 24px'}}>
        <motion.div initial={{scale:0.7,opacity:0}} animate={{scale:1,opacity:1}}
          transition={{type:'spring',duration:0.6}}
          style={{width:'100%',maxWidth:380,textAlign:'center'}}>

          <div style={{fontSize:72,marginBottom:16}}>{result==='correct'?'🌟':'🤔'}</div>

          <h2 style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:30,marginBottom:8,
            color:result==='correct'?'#15803d':'#b91c1c'}}>
            {result==='correct'?'Fantastic!':'Almost there!'}
          </h2>
          <p style={{fontSize:14,color:'#374151',marginBottom:12}}>
            {result==='correct'
              ?`You correctly read "${lesson.words[wordIdx]}"!`
              :`Let's try "${lesson.words[wordIdx]}" again.`}
          </p>

          {result==='correct'&&(
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
              style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',
                borderRadius:99,background:'#dcfce7',color:'#15803d',
                fontWeight:700,fontSize:13,marginBottom:20}}>
              <Star size={13} fill="#15803d"/> +10 points earned!
            </motion.div>
          )}

          <div style={{...card,padding:16,marginBottom:20}}>
            <p style={{fontSize:11,fontWeight:600,color:'var(--muted)',marginBottom:4}}>Session Progress</p>
            <p style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:28,color:'var(--navy)',margin:0}}>
              {score}/{total}
            </p>
            <p style={{fontSize:11,color:'var(--muted)',marginBottom:8}}>words correct this session</p>
            <div style={{height:6,borderRadius:99,background:'var(--border)',overflow:'hidden'}}>
              <div style={{width:total?`${(score/total)*100}%`:'0%',height:'100%',
                background:'var(--green)',borderRadius:99}}/>
            </div>
          </div>

          <div style={{display:'flex',gap:10}}>
            {result==='wrong'&&(
              <button onClick={()=>setScreen('lesson')}
                style={{flex:1,padding:'14px',borderRadius:14,fontSize:14,fontWeight:700,cursor:'pointer',
                  border:'2px solid var(--border)',background:'white',color:'var(--navy)'}}>
                Try Again
              </button>
            )}
            <button onClick={nextWord}
              style={{flex:1,padding:'14px',borderRadius:14,fontSize:14,fontWeight:900,cursor:'pointer',
                border:'none',background:'var(--orange)',color:'white',fontFamily:'Nunito,sans-serif',
                boxShadow:'0 6px 20px rgba(245,130,10,0.3)'}}>
              {wordIdx<lesson.words.length-1?'Next Word →':'Finish Lesson 🏆'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // ── DASHBOARD ─────────────────────────────────────────────────────────────────
  if(screen==='dashboard') return (
    <div className="app-shell">
      <div className="app-frame" style={{background:'var(--bg)'}}>
        <div style={{background:'var(--navy)',padding:'40px 20px 20px',flexShrink:0}}>
          <button onClick={()=>setScreen('home')}
            style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'rgba(255,255,255,0.6)',
              border:'none',background:'none',cursor:'pointer',marginBottom:12}}>
            <ArrowLeft size={16}/> Back
          </button>
          <h2 style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:24,color:'white',margin:0}}>
            My Progress 📈
          </h2>
          <p style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginTop:2}}>{childName||'Learner'} · {grade}</p>
        </div>

        <div className="screen-scroll" style={{padding:'20px',display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[
              {label:'Total Points',value:'1,240',icon:<Star size={18}/>,color:'#F59E0B'},
              {label:'Day Streak',value:'7 days',icon:<Zap size={18}/>,color:'#F5820A'},
              {label:'Lessons Done',value:`2/${LESSONS.length}`,icon:<BookOpen size={18}/>,color:'#1A5DB5'},
              {label:'Avg Accuracy',value:'91%',icon:<Target size={18}/>,color:'#16A34A'},
            ].map(s=>(
              <div key={s.label} style={{...card,padding:14}}>
                <span style={{color:s.color}}>{s.icon}</span>
                <p style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:20,
                  color:'var(--navy)',margin:'4px 0 0'}}>{s.value}</p>
                <p style={{fontSize:11,color:'var(--muted)',margin:0}}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{...card,padding:18}}>
            <h3 style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:14,
              color:'var(--navy)',marginBottom:14}}>Lesson Scores</h3>
            {LESSONS.map(l=>(
              <div key={l.id} style={{display:'flex',alignItems:'center',gap:10,marginBottom:12,
                opacity:l.completed?1:0.4}}>
                <span style={{fontSize:16}}>{l.icon}</span>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:600,color:'var(--navy)'}}>{l.title}</span>
                    <span style={{fontSize:12,fontWeight:700,color:l.completed?'var(--green)':'var(--muted)'}}>
                      {l.completed?`${l.score}%`:'Not started'}
                    </span>
                  </div>
                  <div style={{height:4,borderRadius:99,background:'var(--border)',overflow:'hidden'}}>
                    <div style={{width:`${l.score}%`,height:'100%',background:'var(--green)',borderRadius:99}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{...card,padding:18}}>
            <h3 style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:14,
              color:'var(--navy)',marginBottom:12}}>Badges Earned 🏅</h3>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {['⭐ First Lesson','🔥 7-Day Streak','📖 Bookworm'].map(b=>(
                <div key={b} style={{padding:'6px 12px',borderRadius:99,fontSize:12,fontWeight:700,
                  background:'#fff9f4',border:'2px solid var(--orange)',color:'var(--orange)'}}>{b}</div>
              ))}
              <div style={{padding:'6px 12px',borderRadius:99,fontSize:12,fontWeight:700,opacity:0.3,
                background:'var(--border)',color:'var(--muted)'}}>🏆 Perfect Score</div>
            </div>
          </div>
          <div style={{height:8}}/>
        </div>
        <NavBar active="dashboard" go={setScreen}/>
      </div>
    </div>
  );

  // ── TEACHER ─────────────────────────────────────────────────────────────────
  if(screen==='teacher') return (
    <div className="app-shell">
      <div className="app-frame" style={{background:'var(--bg)'}}>
        <div style={{background:'var(--navy)',padding:'40px 20px 20px',flexShrink:0}}>
          <button onClick={()=>setScreen('home')}
            style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'rgba(255,255,255,0.6)',
              border:'none',background:'none',cursor:'pointer',marginBottom:12}}>
            <ArrowLeft size={16}/> Back
          </button>
          <h2 style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:24,color:'white',margin:0}}>
            Teacher Dashboard 👩‍🏫
          </h2>
          <p style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginTop:2}}>
            Class overview &amp; student progress
          </p>
        </div>

        <div className="screen-scroll" style={{padding:'20px',display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
            {[{label:'Students',value:'2',icon:'👥'},{label:'Avg Score',value:'91%',icon:'📊'},{label:'Active',value:'2',icon:'✅'}].map(s=>(
              <div key={s.label} style={{...card,padding:'12px 8px',textAlign:'center'}}>
                <div style={{fontSize:22}}>{s.icon}</div>
                <p style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:16,color:'var(--navy)',margin:'4px 0 0'}}>{s.value}</p>
                <p style={{fontSize:11,color:'var(--muted)',margin:0}}>{s.label}</p>
              </div>
            ))}
          </div>

          <h3 style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:14,color:'var(--navy)',margin:0}}>
            Student Progress
          </h3>
          {PROFILES.map(p=>(
            <div key={p.name} style={{...card,padding:16}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:'var(--bg)',
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{p.avatar}</div>
                <div style={{flex:1}}>
                  <h4 style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:15,color:'var(--navy)',margin:0}}>
                    {p.name}
                  </h4>
                  <p style={{fontSize:11,color:'var(--muted)',margin:0}}>{p.grade} · {p.done} lessons done</p>
                </div>
                <Ring pct={Math.round((p.done/LESSONS.length)*100)}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                {[{label:'Points',value:p.points.toLocaleString()},{label:'Streak',value:`${p.streak}d`},{label:'Progress',value:`${Math.round((p.done/LESSONS.length)*100)}%`}].map(s=>(
                  <div key={s.label} style={{background:'var(--bg)',borderRadius:10,padding:'8px',textAlign:'center'}}>
                    <p style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:13,color:'var(--navy)',margin:0}}>{s.value}</p>
                    <p style={{fontSize:10,color:'var(--muted)',margin:0}}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{...card,padding:16}}>
            <h3 style={{fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:14,color:'var(--navy)',marginBottom:12}}>
              Lesson Completion
            </h3>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',fontSize:12,borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'2px solid var(--border)'}}>
                    <th style={{textAlign:'left',paddingBottom:8,fontWeight:600,color:'var(--muted)'}}>Lesson</th>
                    <th style={{textAlign:'center',paddingBottom:8,fontWeight:600,color:'var(--muted)'}}>Amara</th>
                    <th style={{textAlign:'center',paddingBottom:8,fontWeight:600,color:'var(--muted)'}}>Jamal</th>
                  </tr>
                </thead>
                <tbody>
                  {LESSONS.map(l=>(
                    <tr key={l.id} style={{borderBottom:'1px solid var(--border)'}}>
                      <td style={{padding:'8px 0',fontWeight:500,color:'var(--navy)'}}>{l.icon} {l.title}</td>
                      <td style={{textAlign:'center',padding:'8px 0'}}>
                        {l.completed?<CheckCircle size={14} color="var(--green)"/>:<XCircle size={14} color="#e5e7eb"/>}
                      </td>
                      <td style={{textAlign:'center',padding:'8px 0'}}>
                        {l.id<=1?<CheckCircle size={14} color="var(--green)"/>:<XCircle size={14} color="#e5e7eb"/>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{height:8}}/>
        </div>
        <NavBar active="teacher" go={setScreen}/>
      </div>
    </div>
  );

  return null;
}
