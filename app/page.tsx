'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Star, Trophy, BookOpen, Volume2, ChevronRight, Home, BarChart2, Settings, Play, CheckCircle, XCircle, ArrowLeft, Zap, Award, Target } from 'lucide-react';
import Image from 'next/image';

// ─── Data ────────────────────────────────────────────────────────────────────
const LESSONS = [
  { id: 1, title: 'Short Vowels', level: 'Beginner', words: ['cat','bat','hat','mat','sat'], icon: '🐱', color: '#F5820A', completed: true, score: 95 },
  { id: 2, title: 'Long Vowels',  level: 'Beginner', words: ['cake','lake','make','bake','take'], icon: '🎂', color: '#1A5DB5', completed: true, score: 88 },
  { id: 3, title: 'Blends',       level: 'Intermediate', words: ['flag','plan','step','frog','grip'], icon: '🏁', color: '#16A34A', completed: false, score: 0 },
  { id: 4, title: 'Digraphs',     level: 'Intermediate', words: ['ship','chip','shop','thin','then'], icon: '⚓', color: '#0891B2', completed: false, score: 0 },
  { id: 5, title: 'Sight Words',  level: 'Advanced', words: ['the','said','was','they','have'], icon: '👁️', color: '#F59E0B', completed: false, score: 0 },
  { id: 6, title: 'Sentences',    level: 'Advanced', words: ['The cat sat on the mat.','I can see the big dog.'], icon: '📖', color: '#0C2340', completed: false, score: 0 },
];

const CHILD_PROFILES = [
  { name: 'Amara', grade: 'Grade 2', avatar: '👧🏾', streak: 7, points: 1240, lessonsCompleted: 2 },
  { name: 'Jamal', grade: 'Grade 1', avatar: '👦🏾', streak: 3, points: 680, lessonsCompleted: 1 },
];

type Screen = 'splash' | 'onboarding' | 'home' | 'lesson' | 'recording' | 'feedback' | 'dashboard' | 'teacher';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function ProgressRing({ pct, size = 56, stroke = 5, color = '#F5820A' }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EDE0D0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  const colors = ['#F5820A','#1A5DB5','#16A34A','#F59E0B','#0891B2','#0C2340'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(i => (
        <motion.div key={i} className="absolute w-3 h-3 rounded-sm"
          style={{ left: `${Math.random()*100}%`, background: colors[i % colors.length] }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: '110vh', rotate: 720, opacity: [1,1,0] }}
          transition={{ duration: 2 + Math.random(), delay: Math.random() * 0.5 }} />
      ))}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [childName, setChildName] = useState('');
  const [grade, setGrade] = useState('Grade 1');
  const [activeLesson, setActiveLesson] = useState(LESSONS[2]);
  const [wordIndex, setWordIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<'correct'|'wrong'|null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [ripple, setRipple] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [profile, setProfile] = useState(CHILD_PROFILES[0]);

  // Splash
  useEffect(() => {
    if (screen === 'splash') sleep(2200).then(() => setScreen('onboarding'));
  }, [screen]);

  async function handleRecord() {
    setRecording(true);
    setRipple(true);
    await sleep(2200);
    setRecording(false);
    setRipple(false);
    setProcessing(true);
    await sleep(1600);
    setProcessing(false);
    const correct = Math.random() > 0.3;
    setFeedbackResult(correct ? 'correct' : 'wrong');
    setSessionTotal(t => t + 1);
    if (correct) {
      setSessionScore(s => s + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2200);
    }
    setScreen('feedback');
  }

  async function handlePlayAudio() {
    setPlayingAudio(true);
    await sleep(1200);
    setPlayingAudio(false);
  }

  function nextWord() {
    if (wordIndex < activeLesson.words.length - 1) {
      setWordIndex(i => i + 1);
      setFeedbackResult(null);
      setScreen('lesson');
    } else {
      setScreen('home');
      setWordIndex(0);
    }
  }

  function startLesson(lesson: typeof LESSONS[0]) {
    setActiveLesson(lesson);
    setWordIndex(0);
    setFeedbackResult(null);
    setSessionScore(0);
    setSessionTotal(0);
    setScreen('lesson');
  }

  // ── SPLASH ──────────────────────────────────────────────────────────────────
  if (screen === 'splash') return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--navy)' }}>
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.8 }}
        className="flex flex-col items-center gap-6">
        <div className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden" style={{ background: 'var(--orange)' }}>
          <Image src="/cheetah-logo.png" alt="CHEETAH" width={96} height={96} className="object-contain" />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>CHEETAH Learn</h1>
          <p className="text-lg mt-1" style={{ color: 'var(--orange-light)' }}>Adaptive Literacy Platform</p>
        </div>
        <motion.div className="flex gap-2 mt-4" animate={{ opacity: [0.4,1,0.4] }} transition={{ repeat: Infinity, duration: 1.2 }}>
          {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full" style={{ background: 'var(--orange)', opacity: i === 1 ? 1 : 0.5 }} />)}
        </motion.div>
      </motion.div>
    </div>
  );

  // ── ONBOARDING ──────────────────────────────────────────────────────────────
  if (screen === 'onboarding') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-lg" style={{ background: 'var(--orange)' }}>
            <Image src="/cheetah-logo.png" alt="CHEETAH" width={64} height={64} className="object-contain" />
          </div>
          <h1 className="text-3xl font-black" style={{ color: 'var(--navy)', fontFamily: 'Nunito, sans-serif' }}>Welcome! 👋</h1>
          <p className="mt-2" style={{ color: 'var(--muted)' }}>Let's get you started on your reading journey</p>
        </div>

        <div className="rounded-2xl p-6 shadow-sm mb-4" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--navy)' }}>Child's Name</label>
          <input value={childName} onChange={e => setChildName(e.target.value)} placeholder="Enter name..."
            className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all"
            style={{ border: '2px solid var(--border)', fontFamily: 'DM Sans, sans-serif', color: 'var(--text)' }}
            onFocus={e => e.target.style.borderColor = 'var(--orange)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />

          <label className="block text-sm font-semibold mb-2 mt-4" style={{ color: 'var(--navy)' }}>Grade Level</label>
          <div className="grid grid-cols-3 gap-2">
            {['Grade 1','Grade 2','Grade 3'].map(g => (
              <button key={g} onClick={() => setGrade(g)}
                className="py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: grade === g ? 'var(--orange)' : 'var(--bg)', color: grade === g ? 'white' : 'var(--muted)', border: `2px solid ${grade === g ? 'var(--orange)' : 'var(--border)'}` }}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => { if(childName.trim()) setScreen('home'); }}
          disabled={!childName.trim()}
          className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all flex items-center justify-center gap-2"
          style={{ background: childName.trim() ? 'var(--orange)' : '#ccc', boxShadow: childName.trim() ? '0 8px 24px rgba(245,130,10,0.35)' : 'none', fontFamily: 'Nunito, sans-serif' }}>
          Let's Go! <ChevronRight size={22} />
        </button>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--muted)' }}>
          A CHEETAH® Toys & More product
        </p>
      </motion.div>
    </div>
  );

  // ── HOME ────────────────────────────────────────────────────────────────────
  if (screen === 'home') return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-6" style={{ background: 'var(--navy)' }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Welcome back,</p>
            <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>{childName || 'Learner'} 👋</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--orange-light)' }}>{grade} · FastTrack Literacy</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Zap size={16} className="text-yellow-400" />
              <span className="font-black text-white text-lg">{profile.streak}</span>
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>day streak</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Points', value: profile.points.toLocaleString(), icon: '⭐' },
            { label: 'Lessons', value: `${profile.lessonsCompleted}/${LESSONS.length}`, icon: '📚' },
            { label: 'Accuracy', value: '91%', icon: '🎯' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="text-lg">{s.icon}</div>
              <div className="font-black text-white text-sm mt-0.5" style={{ fontFamily: 'Nunito, sans-serif' }}>{s.value}</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-6">
        {/* Continue banner */}
        <motion.div whileTap={{ scale: 0.98 }} onClick={() => startLesson(LESSONS[2])}
          className="rounded-2xl p-4 mb-6 flex items-center gap-4 cursor-pointer"
          style={{ background: 'var(--orange)', boxShadow: '0 8px 28px rgba(245,130,10,0.35)' }}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
            🏁
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-white/70">Continue where you left off</p>
            <h3 className="font-black text-white text-lg" style={{ fontFamily: 'Nunito, sans-serif' }}>Blends</h3>
            <div className="mt-1.5 h-1.5 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full rounded-full bg-white" style={{ width: '40%' }} />
            </div>
          </div>
          <Play size={22} className="text-white flex-shrink-0" />
        </motion.div>

        {/* Lessons */}
        <h3 className="font-black text-lg mb-3" style={{ color: 'var(--navy)', fontFamily: 'Nunito, sans-serif' }}>All Lessons</h3>
        <div className="flex flex-col gap-3">
          {LESSONS.map((lesson, idx) => (
            <motion.div key={lesson.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }}
              onClick={() => startLesson(lesson)}
              className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all active:scale-98"
              style={{ background: 'white', border: `1px solid var(--border)`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: lesson.color + '18' }}>
                {lesson.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base truncate" style={{ color: 'var(--navy)', fontFamily: 'Nunito, sans-serif' }}>{lesson.title}</h4>
                  {lesson.completed && <CheckCircle size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />}
                </div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{lesson.level} · {lesson.words.length} words</p>
                {lesson.completed && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="h-1 rounded-full flex-1 overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${lesson.score}%`, background: 'var(--green)' }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: 'var(--green)' }}>{lesson.score}%</span>
                  </div>
                )}
              </div>
              <ChevronRight size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-3 flex justify-around" style={{ background: 'white', borderTop: '1px solid var(--border)' }}>
        {[
          { icon: <Home size={22} />, label: 'Home', active: true, action: () => setScreen('home') },
          { icon: <BarChart2 size={22} />, label: 'Progress', active: false, action: () => setScreen('dashboard') },
          { icon: <Trophy size={22} />, label: 'Teacher', active: false, action: () => setScreen('teacher') },
        ].map(n => (
          <button key={n.label} onClick={n.action} className="flex flex-col items-center gap-0.5 transition-all">
            <span style={{ color: n.active ? 'var(--orange)' : 'var(--muted)' }}>{n.icon}</span>
            <span className="text-xs font-semibold" style={{ color: n.active ? 'var(--orange)' : 'var(--muted)' }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // ── LESSON ──────────────────────────────────────────────────────────────────
  if (screen === 'lesson') return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--navy)' }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setScreen('home')} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/70">{activeLesson.title}</p>
            <p className="text-xs text-white/50">{wordIndex + 1} of {activeLesson.words.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <span className="text-lg">{activeLesson.icon}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <motion.div className="h-full rounded-full" style={{ background: 'var(--orange)' }}
            animate={{ width: `${((wordIndex) / activeLesson.words.length) * 100}%` }} />
        </div>
      </div>

      {/* Word card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div key={wordIndex} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-full rounded-3xl p-10 text-center shadow-2xl mb-8"
          style={{ background: 'white' }}>
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--muted)' }}>Read this word out loud</p>
          <h1 className="font-black mb-6" style={{ fontSize: '3.5rem', color: 'var(--navy)', fontFamily: 'Nunito, sans-serif', lineHeight: 1.1 }}>
            {activeLesson.words[wordIndex]}
          </h1>
          <button onClick={handlePlayAudio}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
            style={{ background: playingAudio ? 'var(--orange)' : 'var(--bg)', color: playingAudio ? 'white' : 'var(--navy)', border: '2px solid var(--border)' }}>
            <Volume2 size={16} className={playingAudio ? 'animate-pulse' : ''} />
            {playingAudio ? 'Playing...' : 'Hear it'}
          </button>
        </motion.div>

        <p className="text-white/70 text-sm mb-6">Tap the mic and say the word clearly</p>

        {/* Mic button */}
        <div className="relative flex items-center justify-center">
          {ripple && (
            <>
              <motion.div className="absolute rounded-full" style={{ background: 'var(--orange)', opacity: 0.15 }}
                animate={{ width: [80, 180], height: [80, 180], opacity: [0.3, 0] }} transition={{ repeat: Infinity, duration: 1.4 }} />
              <motion.div className="absolute rounded-full" style={{ background: 'var(--orange)', opacity: 0.1 }}
                animate={{ width: [80, 220], height: [80, 220], opacity: [0.2, 0] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.3 }} />
            </>
          )}
          <motion.button whileTap={{ scale: 0.92 }} onClick={handleRecord} disabled={recording || processing}
            className="relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl z-10"
            style={{ background: recording ? '#ef4444' : 'var(--orange)', boxShadow: recording ? '0 8px 32px rgba(239,68,68,0.5)' : '0 8px 32px rgba(245,130,10,0.5)' }}>
            {processing ? (
              <motion.div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7 }} />
            ) : recording ? (
              <MicOff size={36} />
            ) : (
              <Mic size={36} />
            )}
          </motion.button>
        </div>

        <p className="mt-5 text-sm font-semibold" style={{ color: recording ? '#ef4444' : 'var(--orange-light)' }}>
          {processing ? 'Analysing your response...' : recording ? 'Recording... speak now!' : 'Tap to record'}
        </p>
      </div>
    </div>
  );

  // ── FEEDBACK ─────────────────────────────────────────────────────────────────
  if (screen === 'feedback') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: feedbackResult === 'correct' ? '#f0fdf4' : '#fff1f2' }}>
      {showConfetti && <Confetti />}
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.6 }}
        className="w-full max-w-sm text-center">

        <div className="text-8xl mb-4">{feedbackResult === 'correct' ? '🌟' : '🤔'}</div>

        <h2 className="text-3xl font-black mb-2" style={{ color: feedbackResult === 'correct' ? '#15803d' : '#b91c1c', fontFamily: 'Nunito, sans-serif' }}>
          {feedbackResult === 'correct' ? 'Fantastic!' : 'Almost there!'}
        </h2>

        <p className="text-base mb-2" style={{ color: '#374151' }}>
          {feedbackResult === 'correct'
            ? `You correctly read "${activeLesson.words[wordIndex]}"!`
            : `Let's try "${activeLesson.words[wordIndex]}" again.`}
        </p>

        {feedbackResult === 'correct' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 font-bold text-sm"
            style={{ background: '#dcfce7', color: '#15803d' }}>
            <Star size={14} fill="#15803d" /> +10 points earned!
          </motion.div>
        )}

        <div className="rounded-2xl p-4 mb-6 shadow-sm" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Session Progress</p>
          <p className="text-2xl font-black" style={{ color: 'var(--navy)', fontFamily: 'Nunito, sans-serif' }}>{sessionScore}/{sessionTotal}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>words correct this session</p>
          <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full" style={{ width: sessionTotal ? `${(sessionScore/sessionTotal)*100}%` : '0%', background: 'var(--green)' }} />
          </div>
        </div>

        <div className="flex gap-3">
          {feedbackResult === 'wrong' && (
            <button onClick={() => setScreen('lesson')} className="flex-1 py-3.5 rounded-xl font-bold text-base border-2 transition-all" style={{ borderColor: 'var(--border)', color: 'var(--navy)' }}>
              Try Again
            </button>
          )}
          <button onClick={nextWord}
            className="flex-1 py-3.5 rounded-xl font-black text-base text-white transition-all"
            style={{ background: 'var(--orange)', boxShadow: '0 6px 20px rgba(245,130,10,0.35)', fontFamily: 'Nunito, sans-serif' }}>
            {wordIndex < activeLesson.words.length - 1 ? 'Next Word →' : 'Finish Lesson 🏆'}
          </button>
        </div>
      </motion.div>
    </div>
  );

  // ── DASHBOARD ─────────────────────────────────────────────────────────────────
  if (screen === 'dashboard') return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      <div className="px-5 pt-10 pb-6" style={{ background: 'var(--navy)' }}>
        <button onClick={() => setScreen('home')} className="flex items-center gap-2 text-white/70 mb-4">
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>My Progress 📈</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm">{childName || 'Learner'} · {grade}</p>
      </div>

      <div className="px-5 mt-5 flex flex-col gap-4">
        {/* Overall stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Points', value: profile.points.toLocaleString(), icon: <Star size={20} />, color: '#F59E0B' },
            { label: 'Day Streak', value: `${profile.streak} days`, icon: <Zap size={20} />, color: '#F5820A' },
            { label: 'Lessons Done', value: `${profile.lessonsCompleted} / ${LESSONS.length}`, icon: <BookOpen size={20} />, color: '#1A5DB5' },
            { label: 'Avg Accuracy', value: '91%', icon: <Target size={20} />, color: '#16A34A' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <span style={{ color: s.color }}>{s.icon}</span>
              <p className="text-2xl font-black mt-1" style={{ color: 'var(--navy)', fontFamily: 'Nunito, sans-serif' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Lesson breakdown */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <h3 className="font-black mb-4" style={{ color: 'var(--navy)', fontFamily: 'Nunito, sans-serif' }}>Lesson Scores</h3>
          {LESSONS.filter(l => l.completed).map(l => (
            <div key={l.id} className="flex items-center gap-3 mb-3">
              <span className="text-lg">{l.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>{l.title}</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--green)' }}>{l.score}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${l.score}%`, background: 'var(--green)' }} />
                </div>
              </div>
            </div>
          ))}
          {LESSONS.filter(l => !l.completed).map(l => (
            <div key={l.id} className="flex items-center gap-3 mb-3 opacity-40">
              <span className="text-lg">{l.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>{l.title}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>Not started</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <h3 className="font-black mb-4" style={{ color: 'var(--navy)', fontFamily: 'Nunito, sans-serif' }}>Badges Earned 🏅</h3>
          <div className="flex gap-3 flex-wrap">
            {['⭐ First Lesson','🔥 7-Day Streak','📖 Bookworm'].map(b => (
              <div key={b} className="px-3 py-2 rounded-full text-sm font-bold" style={{ background: '#fff9f4', border: '2px solid var(--orange)', color: 'var(--orange)' }}>{b}</div>
            ))}
            <div className="px-3 py-2 rounded-full text-sm font-bold opacity-30" style={{ background: 'var(--border)', color: 'var(--muted)' }}>🏆 Perfect Score</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TEACHER VIEW ──────────────────────────────────────────────────────────────
  if (screen === 'teacher') return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      <div className="px-5 pt-10 pb-6" style={{ background: 'var(--navy)' }}>
        <button onClick={() => setScreen('home')} className="flex items-center gap-2 text-white/70 mb-4">
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>Teacher Dashboard 👩‍🏫</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm">Class overview & student progress</p>
      </div>

      <div className="px-5 mt-5 flex flex-col gap-4">
        {/* Class summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Students', value: '2', icon: '👥' },
            { label: 'Avg Score', value: '91%', icon: '📊' },
            { label: 'Active Today', value: '2', icon: '✅' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <div className="text-2xl">{s.icon}</div>
              <p className="font-black text-lg" style={{ color: 'var(--navy)', fontFamily: 'Nunito, sans-serif' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Student cards */}
        <h3 className="font-black" style={{ color: 'var(--navy)', fontFamily: 'Nunito, sans-serif' }}>Student Progress</h3>
        {CHILD_PROFILES.map(p => (
          <div key={p.name} className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: 'var(--bg)' }}>{p.avatar}</div>
              <div>
                <h4 className="font-black" style={{ color: 'var(--navy)', fontFamily: 'Nunito, sans-serif' }}>{p.name}</h4>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{p.grade} · {p.lessonsCompleted} lessons completed</p>
              </div>
              <div className="ml-auto">
                <ProgressRing pct={Math.round((p.lessonsCompleted/LESSONS.length)*100)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Points', value: p.points.toLocaleString() },
                { label: 'Streak', value: `${p.streak}d` },
                { label: 'Progress', value: `${Math.round((p.lessonsCompleted/LESSONS.length)*100)}%` },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-2" style={{ background: 'var(--bg)' }}>
                  <p className="font-black text-sm" style={{ color: 'var(--navy)', fontFamily: 'Nunito, sans-serif' }}>{s.value}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Lesson completion table */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <h3 className="font-black mb-4" style={{ color: 'var(--navy)', fontFamily: 'Nunito, sans-serif' }}>Lesson Completion</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th className="text-left pb-2 font-semibold" style={{ color: 'var(--muted)' }}>Lesson</th>
                  <th className="text-center pb-2 font-semibold" style={{ color: 'var(--muted)' }}>Amara</th>
                  <th className="text-center pb-2 font-semibold" style={{ color: 'var(--muted)' }}>Jamal</th>
                </tr>
              </thead>
              <tbody>
                {LESSONS.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2.5 font-medium" style={{ color: 'var(--navy)' }}>{l.icon} {l.title}</td>
                    <td className="text-center py-2.5">{l.completed ? <CheckCircle size={16} className="inline" style={{ color: 'var(--green)' }} /> : <XCircle size={16} className="inline" style={{ color: 'var(--border)' }} />}</td>
                    <td className="text-center py-2.5">{l.id <= 1 ? <CheckCircle size={16} className="inline" style={{ color: 'var(--green)' }} /> : <XCircle size={16} className="inline" style={{ color: 'var(--border)' }} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return null;
}
