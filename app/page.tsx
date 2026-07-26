'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Star, Trophy, BookOpen, Volume2,
  ChevronRight, Home, BarChart2, Play, CheckCircle,
  XCircle, ArrowLeft, Zap, Target
} from 'lucide-react';
import Image from 'next/image';

// ─── Data ────────────────────────────────────────────────────────────────────
const LESSONS = [
  { id: 1, title: 'Short Vowels',  level: 'Beginner',     words: ['cat','bat','hat','mat','sat'],            icon: '🐱', color: '#F5820A', completed: true,  score: 95 },
  { id: 2, title: 'Long Vowels',   level: 'Beginner',     words: ['cake','lake','make','bake','take'],       icon: '🎂', color: '#1A5DB5', completed: true,  score: 88 },
  { id: 3, title: 'Blends',        level: 'Intermediate', words: ['flag','plan','step','frog','grip'],       icon: '🏁', color: '#16A34A', completed: false, score: 0  },
  { id: 4, title: 'Digraphs',      level: 'Intermediate', words: ['ship','chip','shop','thin','then'],       icon: '⚓', color: '#0891B2', completed: false, score: 0  },
  { id: 5, title: 'Sight Words',   level: 'Advanced',     words: ['the','said','was','they','have'],         icon: '👁️', color: '#F59E0B', completed: false, score: 0  },
  { id: 6, title: 'Sentences',     level: 'Advanced',     words: ['The cat sat on the mat.','I can see the big dog.'], icon: '📖', color: '#0C2340', completed: false, score: 0 },
];

const PROFILES = [
  { name: 'Amara', grade: 'Grade 2', avatar: '👧🏾', streak: 7,  points: 1240, done: 2 },
  { name: 'Jamal', grade: 'Grade 1', avatar: '👦🏾', streak: 3,  points: 680,  done: 1 },
];

type Screen = 'splash'|'onboarding'|'home'|'lesson'|'feedback'|'dashboard'|'teacher';
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── Progress Ring ───────────────────────────────────────────────────────────
function Ring({ pct, size=56, stroke=5, color='#F5820A' }: { pct:number; size?:number; stroke?:number; color?:string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EDE0D0" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c*(1-pct/100)}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
    </svg>
  );
}

// ─── Confetti ────────────────────────────────────────────────────────────────
function Confetti() {
  const colors = ['#F5820A','#1A5DB5','#16A34A','#F59E0B','#0891B2'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({length:30},(_,i)=>(
        <motion.div key={i} className="absolute w-3 h-3 rounded-sm"
          style={{left:`${Math.random()*100}%`, background:colors[i%colors.length]}}
          initial={{y:-20,rotate:0,opacity:1}}
          animate={{y:'110vh',rotate:720,opacity:[1,1,0]}}
          transition={{duration:2+Math.random(),delay:Math.random()*0.5}}/>
      ))}
    </div>
  );
}

// ─── Shell: centers on desktop, fills on mobile ───────────────────────────────
function Shell({ children, bg='var(--bg)' }: { children: React.ReactNode; bg?: string }) {
  return (
    <div className="min-h-screen flex items-start justify-center" style={{background:'#e8edf2'}}>
      <div className="w-full max-w-md min-h-screen relative shadow-2xl overflow-hidden"
           style={{background:bg}}>
        {children}
      </div>
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ active, setScreen }: { active: Screen; setScreen:(s:Screen)=>void }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 flex justify-around px-4 py-3 z-40"
         style={{background:'white',borderTop:'1px solid var(--border)'}}>
      {[
        { icon:<Home size={22}/>,    label:'Home',     s:'home'     as Screen },
        { icon:<BarChart2 size={22}/>,label:'Progress', s:'dashboard' as Screen },
        { icon:<Trophy size={22}/>,  label:'Teacher',  s:'teacher'  as Screen },
      ].map(n=>(
        <button key={n.label} onClick={()=>setScreen(n.s as Screen)}
          className="flex flex-col items-center gap-0.5">
          <span style={{color: active===n.s ? 'var(--orange)' : 'var(--muted)'}}>{n.icon}</span>
          <span className="text-xs font-semibold"
                style={{color: active===n.s ? 'var(--orange)' : 'var(--muted)'}}>{n.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,       setScreen]       = useState<Screen>('splash');
  const [childName,    setChildName]    = useState('');
  const [grade,        setGrade]        = useState('Grade 1');
  const [lesson,       setLesson]       = useState(LESSONS[2]);
  const [wordIdx,      setWordIdx]      = useState(0);
  const [recording,    setRecording]    = useState(false);
  const [processing,   setProcessing]   = useState(false);
  const [result,       setResult]       = useState<'correct'|'wrong'|null>(null);
  const [confetti,     setConfetti]     = useState(false);
  const [score,        setScore]        = useState(0);
  const [total,        setTotal]        = useState(0);
  const [ripple,       setRipple]       = useState(false);
  const [audioPlay,    setAudioPlay]    = useState(false);

  useEffect(()=>{ if(screen==='splash') sleep(2000).then(()=>setScreen('onboarding')); },[screen]);

  async function handleRecord() {
    setRecording(true); setRipple(true);
    await sleep(2000);
    setRecording(false); setRipple(false); setProcessing(true);
    await sleep(1500);
    setProcessing(false);
    const ok = Math.random()>0.3;
    setResult(ok?'correct':'wrong');
    setTotal(t=>t+1);
    if(ok){ setScore(s=>s+1); setConfetti(true); setTimeout(()=>setConfetti(false),2200); }
    setScreen('feedback');
  }

  async function handleAudio() { setAudioPlay(true); await sleep(1200); setAudioPlay(false); }

  function nextWord() {
    if(wordIdx < lesson.words.length-1){ setWordIdx(i=>i+1); setResult(null); setScreen('lesson'); }
    else { setScreen('home'); setWordIdx(0); }
  }

  function startLesson(l: typeof LESSONS[0]) {
    setLesson(l); setWordIdx(0); setResult(null); setScore(0); setTotal(0); setScreen('lesson');
  }

  // ── SPLASH ──────────────────────────────────────────────────────────────────
  if(screen==='splash') return (
    <Shell bg="var(--navy)">
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <motion.div initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}}
          transition={{type:'spring',duration:0.8}} className="flex flex-col items-center gap-6">
          <div className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden"
               style={{background:'var(--orange)'}}>
            <Image src="/cheetah-logo.png" alt="CHEETAH" width={100} height={100} className="object-contain"/>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black text-white" style={{fontFamily:'Nunito,sans-serif'}}>
              CHEETAH Learn
            </h1>
            <p className="text-base mt-1 font-medium" style={{color:'var(--orange-light)'}}>
              Adaptive Literacy Platform
            </p>
          </div>
          <motion.div className="flex gap-2" animate={{opacity:[0.3,1,0.3]}}
            transition={{repeat:Infinity,duration:1.2}}>
            {[0,1,2].map(i=>(
              <div key={i} className="w-2 h-2 rounded-full"
                style={{background:'var(--orange)',opacity:i===1?1:0.4}}/>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </Shell>
  );

  // ── ONBOARDING ──────────────────────────────────────────────────────────────
  if(screen==='onboarding') return (
    <Shell>
      <div className="flex flex-col min-h-screen p-6 justify-center">
        <motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.5}}>
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden"
                 style={{background:'var(--orange)'}}>
              <Image src="/cheetah-logo.png" alt="CHEETAH" width={60} height={60} className="object-contain"/>
            </div>
            <h1 className="text-3xl font-black" style={{color:'var(--navy)',fontFamily:'Nunito,sans-serif'}}>
              Welcome! 👋
            </h1>
            <p className="mt-2 text-sm" style={{color:'var(--muted)'}}>
              Start your reading journey with CHEETAH
            </p>
          </div>

          <div className="rounded-2xl p-5 mb-4 shadow-sm" style={{background:'white',border:'1px solid var(--border)'}}>
            <label className="block text-sm font-bold mb-2" style={{color:'var(--navy)'}}>
              Child&apos;s Name
            </label>
            <input value={childName} onChange={e=>setChildName(e.target.value)}
              placeholder="Enter name..."
              className="w-full px-4 py-3 rounded-xl text-base outline-none"
              style={{border:'2px solid var(--border)',color:'var(--text)',fontFamily:'DM Sans,sans-serif',
                      transition:'border-color 0.2s'}}
              onFocus={e=>e.target.style.borderColor='var(--orange)'}
              onBlur={e=>e.target.style.borderColor='var(--border)'}/>

            <label className="block text-sm font-bold mb-2 mt-4" style={{color:'var(--navy)'}}>
              Grade Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Grade 1','Grade 2','Grade 3'].map(g=>(
                <button key={g} onClick={()=>setGrade(g)}
                  className="py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: grade===g ? 'var(--orange)' : 'var(--bg)',
                    color: grade===g ? 'white' : 'var(--muted)',
                    border: `2px solid ${grade===g ? 'var(--orange)' : 'var(--border)'}`
                  }}>{g}</button>
              ))}
            </div>
          </div>

          <button onClick={()=>{ if(childName.trim()) setScreen('home'); }}
            disabled={!childName.trim()}
            className="w-full py-4 rounded-2xl font-black text-lg text-white flex items-center justify-center gap-2 transition-all"
            style={{
              background: childName.trim() ? 'var(--orange)' : '#ccc',
              boxShadow: childName.trim() ? '0 8px 24px rgba(245,130,10,0.35)' : 'none',
              fontFamily:'Nunito,sans-serif'
            }}>
            Let&apos;s Go! <ChevronRight size={22}/>
          </button>

          <p className="text-center text-xs mt-5" style={{color:'var(--muted)'}}>
            A CHEETAH® Toys &amp; More product · FastTrack Literacy
          </p>
        </motion.div>
      </div>
    </Shell>
  );

  // ── HOME ────────────────────────────────────────────────────────────────────
  if(screen==='home') return (
    <Shell>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="px-5 pt-10 pb-6" style={{background:'var(--navy)'}}>
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-xs font-semibold" style={{color:'rgba(255,255,255,0.5)'}}>Welcome back,</p>
              <h2 className="text-2xl font-black text-white" style={{fontFamily:'Nunito,sans-serif'}}>
                {childName || 'Learner'} 👋
              </h2>
              <p className="text-xs mt-0.5" style={{color:'var(--orange-light)'}}>
                {grade} · FastTrack Literacy
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-2 rounded-xl">
              <Zap size={15} className="text-yellow-300"/>
              <span className="font-black text-white text-base">{PROFILES[0].streak}</span>
              <span className="text-xs text-white/50">days</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              {label:'Points', value:'1,240', icon:'⭐'},
              {label:'Lessons', value:`2/${LESSONS.length}`, icon:'📚'},
              {label:'Accuracy', value:'91%', icon:'🎯'},
            ].map(s=>(
              <div key={s.label} className="rounded-xl p-3 text-center" style={{background:'rgba(255,255,255,0.08)'}}>
                <div className="text-lg">{s.icon}</div>
                <div className="font-black text-white text-sm mt-0.5" style={{fontFamily:'Nunito,sans-serif'}}>
                  {s.value}
                </div>
                <div className="text-xs" style={{color:'rgba(255,255,255,0.45)'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 pt-5 pb-4 overflow-y-auto">
          {/* Continue banner */}
          <motion.div whileTap={{scale:0.97}} onClick={()=>startLesson(LESSONS[2])}
            className="rounded-2xl p-4 mb-5 flex items-center gap-4 cursor-pointer"
            style={{background:'var(--orange)',boxShadow:'0 8px 28px rgba(245,130,10,0.3)'}}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                 style={{background:'rgba(255,255,255,0.2)'}}>🏁</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/70">Continue where you left off</p>
              <h3 className="font-black text-white text-lg" style={{fontFamily:'Nunito,sans-serif'}}>Blends</h3>
              <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.25)'}}>
                <div className="h-full rounded-full bg-white" style={{width:'40%'}}/>
              </div>
            </div>
            <Play size={20} className="text-white flex-shrink-0"/>
          </motion.div>

          <h3 className="font-black text-base mb-3" style={{color:'var(--navy)',fontFamily:'Nunito,sans-serif'}}>
            All Lessons
          </h3>
          <div className="flex flex-col gap-3">
            {LESSONS.map((l,idx)=>(
              <motion.div key={l.id} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}}
                transition={{delay:idx*0.05}} onClick={()=>startLesson(l)}
                className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
                style={{background:'white',border:'1px solid var(--border)',boxShadow:'0 2px 6px rgba(0,0,0,0.04)'}}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                     style={{background:l.color+'18'}}>{l.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm truncate" style={{color:'var(--navy)',fontFamily:'Nunito,sans-serif'}}>
                      {l.title}
                    </h4>
                    {l.completed && <CheckCircle size={13} style={{color:'var(--green)',flexShrink:0}}/>}
                  </div>
                  <p className="text-xs" style={{color:'var(--muted)'}}>{l.level} · {l.words.length} words</p>
                  {l.completed && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="h-1 rounded-full flex-1 overflow-hidden" style={{background:'var(--border)'}}>
                        <div className="h-full rounded-full" style={{width:`${l.score}%`,background:'var(--green)'}}/>
                      </div>
                      <span className="text-xs font-bold" style={{color:'var(--green)'}}>{l.score}%</span>
                    </div>
                  )}
                </div>
                <ChevronRight size={16} style={{color:'var(--muted)',flexShrink:0}}/>
              </motion.div>
            ))}
          </div>
        </div>

        <BottomNav active="home" setScreen={setScreen}/>
      </div>
    </Shell>
  );

  // ── LESSON ──────────────────────────────────────────────────────────────────
  if(screen==='lesson') return (
    <Shell bg="var(--navy)">
      <div className="flex flex-col min-h-screen">
        <div className="px-5 pt-10 pb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={()=>setScreen('home')} className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{background:'rgba(255,255,255,0.1)'}}>
              <ArrowLeft size={20} className="text-white"/>
            </button>
            <div className="text-center">
              <p className="text-sm font-bold text-white/80">{lesson.title}</p>
              <p className="text-xs text-white/50">{wordIdx+1} of {lesson.words.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                 style={{background:'rgba(255,255,255,0.1)'}}>
              <span className="text-lg">{lesson.icon}</span>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.15)'}}>
            <motion.div className="h-full rounded-full" style={{background:'var(--orange)'}}
              animate={{width:`${(wordIdx/lesson.words.length)*100}%`}}/>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <motion.div key={wordIdx} initial={{scale:0.85,opacity:0}} animate={{scale:1,opacity:1}}
            className="w-full rounded-3xl p-8 text-center shadow-2xl" style={{background:'white'}}>
            <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{color:'var(--muted)'}}>
              Read this out loud
            </p>
            <h1 className="font-black mb-5"
                style={{fontSize:'clamp(2.5rem,10vw,3.5rem)',color:'var(--navy)',fontFamily:'Nunito,sans-serif',lineHeight:1.1}}>
              {lesson.words[wordIdx]}
            </h1>
            <button onClick={handleAudio}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
              style={{background:audioPlay?'var(--orange)':'var(--bg)',color:audioPlay?'white':'var(--navy)',
                      border:'2px solid var(--border)'}}>
              <Volume2 size={15} className={audioPlay?'animate-pulse':''}/>
              {audioPlay ? 'Playing...' : 'Hear it'}
            </button>
          </motion.div>

          <p className="text-white/60 text-sm">Tap the mic and say the word clearly</p>

          <div className="relative flex items-center justify-center">
            {ripple && (
              <>
                <motion.div className="absolute rounded-full" style={{background:'var(--orange)'}}
                  animate={{width:[80,180],height:[80,180],opacity:[0.25,0]}}
                  transition={{repeat:Infinity,duration:1.4}}/>
                <motion.div className="absolute rounded-full" style={{background:'var(--orange)'}}
                  animate={{width:[80,230],height:[80,230],opacity:[0.15,0]}}
                  transition={{repeat:Infinity,duration:1.4,delay:0.35}}/>
              </>
            )}
            <motion.button whileTap={{scale:0.92}} onClick={handleRecord}
              disabled={recording||processing}
              className="relative w-24 h-24 rounded-full flex items-center justify-center text-white z-10 shadow-2xl"
              style={{
                background: recording ? '#ef4444' : 'var(--orange)',
                boxShadow: recording ? '0 8px 32px rgba(239,68,68,0.45)' : '0 8px 32px rgba(245,130,10,0.45)'
              }}>
              {processing
                ? <motion.div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
                    animate={{rotate:360}} transition={{repeat:Infinity,duration:0.7}}/>
                : recording ? <MicOff size={36}/> : <Mic size={36}/>
              }
            </motion.button>
          </div>

          <p className="text-sm font-semibold"
             style={{color: recording ? '#ef4444' : processing ? 'var(--orange-light)' : 'rgba(255,255,255,0.6)'}}>
            {processing ? 'Analysing...' : recording ? 'Recording — speak now!' : 'Tap to record'}
          </p>
        </div>
      </div>
    </Shell>
  );

  // ── FEEDBACK ─────────────────────────────────────────────────────────────────
  if(screen==='feedback') return (
    <Shell bg={result==='correct' ? '#f0fdf4' : '#fff1f2'}>
      {confetti && <Confetti/>}
      <div className="flex flex-col min-h-screen items-center justify-center p-6">
        <motion.div initial={{scale:0.7,opacity:0}} animate={{scale:1,opacity:1}}
          transition={{type:'spring',duration:0.6}} className="w-full max-w-sm text-center">

          <div className="text-7xl mb-4">{result==='correct' ? '🌟' : '🤔'}</div>

          <h2 className="text-3xl font-black mb-2"
              style={{color: result==='correct' ? '#15803d' : '#b91c1c', fontFamily:'Nunito,sans-serif'}}>
            {result==='correct' ? 'Fantastic!' : 'Almost there!'}
          </h2>

          <p className="text-sm mb-4" style={{color:'#374151'}}>
            {result==='correct'
              ? `You correctly read "${lesson.words[wordIdx]}"!`
              : `Let's try "${lesson.words[wordIdx]}" again.`}
          </p>

          {result==='correct' && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 font-bold text-sm"
              style={{background:'#dcfce7',color:'#15803d'}}>
              <Star size={13} fill="#15803d"/> +10 points earned!
            </motion.div>
          )}

          <div className="rounded-2xl p-4 mb-5 shadow-sm"
               style={{background:'white',border:'1px solid var(--border)'}}>
            <p className="text-xs font-semibold mb-1" style={{color:'var(--muted)'}}>Session Progress</p>
            <p className="text-2xl font-black" style={{color:'var(--navy)',fontFamily:'Nunito,sans-serif'}}>
              {score}/{total}
            </p>
            <p className="text-xs mb-2" style={{color:'var(--muted)'}}>words correct this session</p>
            <div className="h-2 rounded-full overflow-hidden" style={{background:'var(--border)'}}>
              <div className="h-full rounded-full"
                style={{width: total ? `${(score/total)*100}%` : '0%', background:'var(--green)'}}/>
            </div>
          </div>

          <div className="flex gap-3">
            {result==='wrong' && (
              <button onClick={()=>setScreen('lesson')}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm border-2 transition-all"
                style={{borderColor:'var(--border)',color:'var(--navy)'}}>Try Again</button>
            )}
            <button onClick={nextWord}
              className="flex-1 py-3.5 rounded-xl font-black text-sm text-white transition-all"
              style={{background:'var(--orange)',boxShadow:'0 6px 20px rgba(245,130,10,0.3)',fontFamily:'Nunito,sans-serif'}}>
              {wordIdx < lesson.words.length-1 ? 'Next Word →' : 'Finish Lesson 🏆'}
            </button>
          </div>
        </motion.div>
      </div>
    </Shell>
  );

  // ── DASHBOARD ─────────────────────────────────────────────────────────────────
  if(screen==='dashboard') return (
    <Shell>
      <div className="flex flex-col min-h-screen">
        <div className="px-5 pt-10 pb-6" style={{background:'var(--navy)'}}>
          <button onClick={()=>setScreen('home')} className="flex items-center gap-2 mb-4 text-white/60 text-sm">
            <ArrowLeft size={16}/> Back
          </button>
          <h2 className="text-2xl font-black text-white" style={{fontFamily:'Nunito,sans-serif'}}>
            My Progress 📈
          </h2>
          <p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.5)'}}>
            {childName||'Learner'} · {grade}
          </p>
        </div>

        <div className="flex-1 px-5 pt-5 pb-4 overflow-y-auto flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              {label:'Total Points', value:'1,240', icon:<Star size={18}/>,   color:'#F59E0B'},
              {label:'Day Streak',   value:'7 days',icon:<Zap size={18}/>,    color:'#F5820A'},
              {label:'Lessons Done', value:`2/${LESSONS.length}`, icon:<BookOpen size={18}/>, color:'#1A5DB5'},
              {label:'Avg Accuracy', value:'91%',  icon:<Target size={18}/>,  color:'#16A34A'},
            ].map(s=>(
              <div key={s.label} className="rounded-2xl p-4"
                   style={{background:'white',border:'1px solid var(--border)'}}>
                <span style={{color:s.color}}>{s.icon}</span>
                <p className="text-xl font-black mt-1"
                   style={{color:'var(--navy)',fontFamily:'Nunito,sans-serif'}}>{s.value}</p>
                <p className="text-xs" style={{color:'var(--muted)'}}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5" style={{background:'white',border:'1px solid var(--border)'}}>
            <h3 className="font-black mb-4 text-sm" style={{color:'var(--navy)',fontFamily:'Nunito,sans-serif'}}>
              Lesson Scores
            </h3>
            {LESSONS.map(l=>(
              <div key={l.id} className={`flex items-center gap-3 mb-3 ${!l.completed?'opacity-40':''}`}>
                <span className="text-base">{l.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-semibold" style={{color:'var(--navy)'}}>{l.title}</span>
                    <span className="text-xs font-bold" style={{color: l.completed?'var(--green)':'var(--muted)'}}>
                      {l.completed ? `${l.score}%` : 'Not started'}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{background:'var(--border)'}}>
                    <div className="h-full rounded-full"
                      style={{width:`${l.score}%`,background:'var(--green)'}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5" style={{background:'white',border:'1px solid var(--border)'}}>
            <h3 className="font-black mb-3 text-sm" style={{color:'var(--navy)',fontFamily:'Nunito,sans-serif'}}>
              Badges Earned 🏅
            </h3>
            <div className="flex gap-2 flex-wrap">
              {['⭐ First Lesson','🔥 7-Day Streak','📖 Bookworm'].map(b=>(
                <div key={b} className="px-3 py-1.5 rounded-full text-xs font-bold"
                     style={{background:'#fff9f4',border:'2px solid var(--orange)',color:'var(--orange)'}}>
                  {b}
                </div>
              ))}
              <div className="px-3 py-1.5 rounded-full text-xs font-bold opacity-30"
                   style={{background:'var(--border)',color:'var(--muted)'}}>
                🏆 Perfect Score
              </div>
            </div>
          </div>
        </div>

        <BottomNav active="dashboard" setScreen={setScreen}/>
      </div>
    </Shell>
  );

  // ── TEACHER ─────────────────────────────────────────────────────────────────
  if(screen==='teacher') return (
    <Shell>
      <div className="flex flex-col min-h-screen">
        <div className="px-5 pt-10 pb-6" style={{background:'var(--navy)'}}>
          <button onClick={()=>setScreen('home')} className="flex items-center gap-2 mb-4 text-white/60 text-sm">
            <ArrowLeft size={16}/> Back
          </button>
          <h2 className="text-2xl font-black text-white" style={{fontFamily:'Nunito,sans-serif'}}>
            Teacher Dashboard 👩‍🏫
          </h2>
          <p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.5)'}}>
            Class overview &amp; student progress
          </p>
        </div>

        <div className="flex-1 px-5 pt-5 pb-4 overflow-y-auto flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              {label:'Students', value:'2',   icon:'👥'},
              {label:'Avg Score',value:'91%', icon:'📊'},
              {label:'Active',   value:'2',   icon:'✅'},
            ].map(s=>(
              <div key={s.label} className="rounded-2xl p-3 text-center"
                   style={{background:'white',border:'1px solid var(--border)'}}>
                <div className="text-xl">{s.icon}</div>
                <p className="font-black text-base" style={{color:'var(--navy)',fontFamily:'Nunito,sans-serif'}}>
                  {s.value}
                </p>
                <p className="text-xs" style={{color:'var(--muted)'}}>{s.label}</p>
              </div>
            ))}
          </div>

          <h3 className="font-black text-sm" style={{color:'var(--navy)',fontFamily:'Nunito,sans-serif'}}>
            Student Progress
          </h3>
          {PROFILES.map(p=>(
            <div key={p.name} className="rounded-2xl p-4"
                 style={{background:'white',border:'1px solid var(--border)'}}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-2xl"
                     style={{background:'var(--bg)'}}>{p.avatar}</div>
                <div className="flex-1">
                  <h4 className="font-black text-sm" style={{color:'var(--navy)',fontFamily:'Nunito,sans-serif'}}>
                    {p.name}
                  </h4>
                  <p className="text-xs" style={{color:'var(--muted)'}}>
                    {p.grade} · {p.done} lessons done
                  </p>
                </div>
                <Ring pct={Math.round((p.done/LESSONS.length)*100)}/>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  {label:'Points', value:p.points.toLocaleString()},
                  {label:'Streak', value:`${p.streak}d`},
                  {label:'Progress', value:`${Math.round((p.done/LESSONS.length)*100)}%`},
                ].map(s=>(
                  <div key={s.label} className="rounded-xl p-2" style={{background:'var(--bg)'}}>
                    <p className="font-black text-xs" style={{color:'var(--navy)',fontFamily:'Nunito,sans-serif'}}>
                      {s.value}
                    </p>
                    <p className="text-xs" style={{color:'var(--muted)'}}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-2xl p-4" style={{background:'white',border:'1px solid var(--border)'}}>
            <h3 className="font-black text-sm mb-3" style={{color:'var(--navy)',fontFamily:'Nunito,sans-serif'}}>
              Lesson Completion
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{borderBottom:'2px solid var(--border)'}}>
                    <th className="text-left pb-2 font-semibold" style={{color:'var(--muted)'}}>Lesson</th>
                    <th className="text-center pb-2 font-semibold" style={{color:'var(--muted)'}}>Amara</th>
                    <th className="text-center pb-2 font-semibold" style={{color:'var(--muted)'}}>Jamal</th>
                  </tr>
                </thead>
                <tbody>
                  {LESSONS.map(l=>(
                    <tr key={l.id} style={{borderBottom:'1px solid var(--border)'}}>
                      <td className="py-2 font-medium" style={{color:'var(--navy)'}}>{l.icon} {l.title}</td>
                      <td className="text-center py-2">
                        {l.completed
                          ? <CheckCircle size={14} className="inline" style={{color:'var(--green)'}}/>
                          : <XCircle    size={14} className="inline" style={{color:'#e5e7eb'}}/>}
                      </td>
                      <td className="text-center py-2">
                        {l.id<=1
                          ? <CheckCircle size={14} className="inline" style={{color:'var(--green)'}}/>
                          : <XCircle    size={14} className="inline" style={{color:'#e5e7eb'}}/>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <BottomNav active="teacher" setScreen={setScreen}/>
      </div>
    </Shell>
  );

  return null;
}
