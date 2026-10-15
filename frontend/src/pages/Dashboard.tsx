import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, Settings, FolderPlus, Plus, Edit2, Trash2,
    Calendar, X, Loader2, Sparkles, Menu,
    Filter, CheckCircle2, Circle, Clock4, ChevronDown, RefreshCw
} from 'lucide-react';

interface Category { id: number; name: string; color: string; }
interface Task {
    id: number; category_id: number; title: string;
    description: string | null; status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high'; due_date: string | null; assigned_to: number | null;
}
interface UserInfo { id: number; name: string; email: string; }

/* ── Color tokens ─────────────────────────────────────── */
const C = {
    bg:      '#080808',
    sidebar: '#0d0d0d',
    card:    '#111111',
    card2:   '#161616',
    border:  'rgba(255,255,255,0.07)',
    border2: 'rgba(255,255,255,0.04)',
    accent:  '#10b981',          // emerald-500
    accentDim:'rgba(16,185,129,0.12)',
    accentBorder:'rgba(16,185,129,0.25)',
    textPrimary:'#f0f0f0',
    textSub: '#6b7280',
    textMuted:'#374151',
};

const STATUS = {
    pending:     { label:'Pending',     Icon:Circle,       color:'#f59e0b', bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.2)' },
    in_progress: { label:'In Progress', Icon:Clock4,       color:'#60a5fa', bg:'rgba(96,165,250,0.1)',  border:'rgba(96,165,250,0.2)' },
    completed:   { label:'Done',        Icon:CheckCircle2, color:'#10b981', bg:'rgba(16,185,129,0.1)', border:'rgba(16,185,129,0.2)' },
};
const PRIORITY = {
    high:   { label:'High',   color:'#ef4444', dot:'#ef4444' },
    medium: { label:'Medium', color:'#f59e0b', dot:'#f59e0b' },
    low:    { label:'Low',    color:'#10b981', dot:'#10b981' },
};

const initials = (n?: string) => n?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || 'U';

/* ── Custom Status Dropdown ───────────────────────────── */
const StatusDropdown: React.FC<{
    value: Task['status'];
    onChange: (s: Task['status']) => void;
}> = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const cfg = STATUS[value];
    const Icon = cfg.Icon;

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const options: Task['status'][] = ['pending', 'in_progress', 'completed'];

    return (
        <div ref={ref} style={{ position:'relative' }}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    display:'flex', alignItems:'center', gap:5,
                    padding:'5px 10px', borderRadius:99,
                    background: cfg.bg, border:`1px solid ${cfg.border}`,
                    color: cfg.color, fontSize:11, fontWeight:700,
                    cursor:'pointer', userSelect:'none', whiteSpace:'nowrap',
                }}
            >
                <Icon size={11} />
                <span>{cfg.label}</span>
                <ChevronDown size={9} style={{ opacity:0.7, transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.15s' }} />
            </button>

            {/* Popup */}
            {open && (
                <div style={{
                    position:'absolute', bottom:'calc(100% + 6px)', left:0,
                    background:'#141414', border:'1px solid rgba(255,255,255,0.1)',
                    borderRadius:10, overflow:'hidden', zIndex:100,
                    boxShadow:'0 12px 32px rgba(0,0,0,0.7)', minWidth:148,
                }}>
                    {options.map(opt => {
                        const oCfg = STATUS[opt];
                        const OIcon = oCfg.Icon;
                        const isActive = opt === value;
                        return (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => { onChange(opt); setOpen(false); }}
                                style={{
                                    width:'100%', display:'flex', alignItems:'center', gap:9,
                                    padding:'9px 13px', background: isActive ? 'rgba(255,255,255,0.05)' : 'none',
                                    border:'none', color: isActive ? oCfg.color : '#9ca3af',
                                    fontSize:13, fontWeight: isActive ? 700 : 500,
                                    cursor:'pointer', textAlign:'left', transition:'background 0.1s',
                                }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none'; }}
                            >
                                <div style={{ width:24, height:24, borderRadius:7, background: oCfg.bg, border:`1px solid ${oCfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                    <OIcon size={12} color={oCfg.color} />
                                </div>
                                <span>{oCfg.label}</span>
                                {isActive && (
                                    <div style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:oCfg.color, flexShrink:0 }} />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════ */
const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [tasks,      setTasks]      = useState<Task[]>([]);
    const [users,      setUsers]      = useState<UserInfo[]>([]);
    const [selCat,     setSelCat]     = useState<number|null>(null);
    const [loading,    setLoading]    = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error,      setError]      = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    /* modals */
    const [showCatModal,  setShowCatModal]  = useState(false);
    const [editCat,       setEditCat]       = useState<Category|null>(null);
    const [catName,       setCatName]       = useState('');
    const [catColor,      setCatColor]      = useState('#10b981');

    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editTask,      setEditTask]      = useState<Task|null>(null);
    const [tTitle,        setTTitle]        = useState('');
    const [tDesc,         setTDesc]         = useState('');
    const [tCat,          setTCat]          = useState(0);
    const [tPriority,     setTPriority]     = useState<Task['priority']>('medium');
    const [tDue,          setTDue]          = useState('');
    const [tAssign,       setTAssign]       = useState<number|null>(null);
    const [showInlineCat, setShowInlineCat] = useState(false);
    const [inlineCatName, setInlineCatName] = useState('');
    const [creatingCat,   setCreatingCat]   = useState(false);

    /* ── load ── */
    const load = async () => {
        try {
            setLoading(true); setError('');
            const [cR, tR, uR] = await Promise.all([api.get('/categories'), api.get('/tasks'), api.get('/users')]);
            const cats = cR.data.data ?? cR.data;
            const tsks = tR.data.data ?? tR.data;
            setCategories(Array.isArray(cats) ? cats : []);
            setTasks(Array.isArray(tsks) ? tsks : []);
            setUsers(uR.data.users ?? []);
            if (cats.length > 0) setTCat(cats[0].id);
        } catch { setError('Failed to connect. Is the server running?'); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const filtered = selCat ? tasks.filter(t => t.category_id === selCat) : tasks;

    /* ── handlers ── */
    const handleLogout = async () => { await logout(); navigate('/login'); };

    const openAddCat = () => { setEditCat(null); setCatName(''); setCatColor('#10b981'); setShowCatModal(true); };
    const openEditCat = (c: Category, e: React.MouseEvent) => {
        e.stopPropagation(); setEditCat(c); setCatName(c.name); setCatColor(c.color); setShowCatModal(true);
    };
    const submitCat = async (e: React.FormEvent) => {
        e.preventDefault(); setSubmitting(true);
        try {
            if (editCat) {
                const r = await api.put(`/categories/${editCat.id}`, { name: catName, color: catColor });
                setCategories(cs => cs.map(c => c.id === editCat.id ? r.data.category : c));
            } else {
                const r = await api.post('/categories', { name: catName, color: catColor });
                setCategories(cs => [...cs, r.data.category]);
            }
            setShowCatModal(false);
        } catch {} finally { setSubmitting(false); }
    };
    const deleteCat = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete category and all its tasks?')) return;
        setCategories(cs => cs.filter(c => c.id !== id));
        setTasks(ts => ts.filter(t => t.category_id !== id));
        if (selCat === id) setSelCat(null);
        try { await api.delete(`/categories/${id}`); } catch { load(); }
    };

    const handleCreateInlineCat = async () => {
        if (!inlineCatName.trim()) return;
        setCreatingCat(true);
        try {
            const r = await api.post('/categories', { name: inlineCatName.trim(), color: '#10b981' });
            const newCat = r.data.category;
            setCategories(cs => [...cs, newCat]);
            setTCat(newCat.id);
            setInlineCatName('');
            setShowInlineCat(false);
        } catch {
            alert('Failed to create workspace');
        } finally {
            setCreatingCat(false);
        }
    };

    const openAddTask = () => {
        setEditTask(null); setTTitle(''); setTDesc('');
        setTCat(selCat || categories[0]?.id || 0);
        setTPriority('medium'); setTDue(''); setTAssign(null);
        setShowInlineCat(categories.length === 0);
        setInlineCatName('');
        setShowTaskModal(true);
    };
    const openEditTask = (t: Task) => {
        setEditTask(t); setTTitle(t.title); setTDesc(t.description||'');
        setTCat(t.category_id); setTPriority(t.priority);
        setTDue(t.due_date ? t.due_date.slice(0,10) : '');
        setTAssign(t.assigned_to);
        setShowInlineCat(false);
        setShowTaskModal(true);
    };
    const submitTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tCat) {
            setShowInlineCat(true);
            alert('Please create or select a workspace first.');
            return;
        }
        setSubmitting(true);
        const body: any = { title: tTitle, description: tDesc||null, category_id: tCat, priority: tPriority, due_date: tDue||null };
        try {
            if (editTask) {
                const r = await api.put(`/tasks/${editTask.id}`, body);
                let updated = r.data.task;
                if (tAssign !== editTask.assigned_to) {
                    const ar = await api.patch(`/tasks/${editTask.id}/assign`, { assigned_to: tAssign });
                    updated = ar.data.task;
                }
                setTasks(ts => ts.map(t => t.id === editTask.id ? updated : t));
            } else {
                const r = await api.post('/tasks', body);
                let nt = r.data.task;
                if (tAssign) { const ar = await api.patch(`/tasks/${nt.id}/assign`, { assigned_to: tAssign }); nt = ar.data.task; }
                setTasks(ts => [nt, ...ts]);
            }
            setShowTaskModal(false);
        } catch {} finally { setSubmitting(false); }
    };
    const changeStatus = async (task: Task, s: Task['status']) => {
        setTasks(ts => ts.map(t => t.id === task.id ? {...t, status: s} : t)); // optimistic
        try { await api.patch(`/tasks/${task.id}/status`, { status: s }); }
        catch { setTasks(ts => ts.map(t => t.id === task.id ? task : t)); }
    };
    const deleteTask = async (id: number) => {
        if (!confirm('Delete this task?')) return;
        setTasks(ts => ts.filter(t => t.id !== id)); // optimistic
        try { await api.delete(`/tasks/${id}`); } catch { load(); }
    };

    /* ── styles ── */
    const s = { fontFamily:"'Inter',sans-serif" };
    const inputSt: React.CSSProperties = {
        width:'100%', padding:'10px 14px', background:'#0a0a0a',
        border:`1px solid ${C.border}`, borderRadius:10, color:C.textPrimary,
        fontSize:14, outline:'none', transition:'border 0.15s',
    };
    const labelSt: React.CSSProperties = {
        display:'block', fontSize:11, fontWeight:700,
        color:C.textSub, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em',
    };

    return (
        <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:C.bg, ...s }} className="relative">

            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm md:hidden transition-opacity duration-200"
                />
            )}

            {/* ═══ SIDEBAR ═══ */}
            <div
                className={`fixed inset-y-0 left-0 z-50 md:static transition-transform duration-200 ease-in-out md:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                }`}
                style={{ width:260, display:'flex', flexDirection:'column', background:C.sidebar, borderRight:`1px solid ${C.border}`, flexShrink:0, height:'100%' }}
            >

                {/* Brand */}
                <div style={{ padding:'18px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,${C.accent},#059669)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 20px ${C.accentDim}` }}>
                            <Sparkles size={15} color="white" />
                        </div>
                        <span style={{ fontWeight:800, fontSize:17, color:C.textPrimary, letterSpacing:'-0.03em' }}>TaskFlow</span>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-transparent cursor-pointer"
                        title="Close Menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* User */}
                <div style={{ padding:'12px 12px', borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', borderRadius:10, background:'transparent' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${C.accentDim},rgba(5,150,105,0.2))`, border:`1px solid ${C.accentBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                {user?.avatar
                                    ? <img src={user.avatar} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} />
                                    : <span style={{ fontSize:11, fontWeight:700, color:C.accent }}>{initials(user?.name)}</span>
                                }
                            </div>
                            <div>
                                <div style={{ fontSize:13, fontWeight:600, color:C.textPrimary, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
                                <div style={{ fontSize:11, color:C.textSub, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
                            </div>
                        </div>
                        <div style={{ display:'flex', gap:2 }}>
                            <button onClick={() => navigate('/profile')} title="Profile" style={{ padding:'6px', borderRadius:7, background:'none', border:'none', color:C.textSub, cursor:'pointer', transition:'all 0.15s' }}
                                onMouseEnter={e=>(e.currentTarget.style.color=C.textPrimary)} onMouseLeave={e=>(e.currentTarget.style.color=C.textSub)}>
                                <Settings size={14} />
                            </button>
                            <button onClick={handleLogout} title="Logout" style={{ padding:'6px', borderRadius:7, background:'none', border:'none', color:C.textSub, cursor:'pointer', transition:'all 0.15s' }}
                                onMouseEnter={e=>(e.currentTarget.style.color='#ef4444')} onMouseLeave={e=>(e.currentTarget.style.color=C.textSub)}>
                                <LogOut size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div style={{ flex:1, overflowY:'auto', padding:'10px 8px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 8px 8px' }}>
                        <span style={{ fontSize:10, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.1em' }}>Workspaces</span>
                        <button onClick={() => { openAddCat(); setSidebarOpen(false); }} title="New" style={{ padding:4, borderRadius:6, background:'none', border:'none', color:C.textSub, cursor:'pointer' }}
                            onMouseEnter={e=>(e.currentTarget.style.color=C.accent)} onMouseLeave={e=>(e.currentTarget.style.color=C.textSub)}>
                            <FolderPlus size={13} />
                        </button>
                    </div>

                    {/* All */}
                    {(() => {
                        const active = selCat === null;
                        return (
                            <button onClick={() => { setSelCat(null); setSidebarOpen(false); }} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', borderRadius:8, background: active ? C.accentDim : 'none', border: active ? `1px solid ${C.accentBorder}` : '1px solid transparent', color: active ? C.accent : C.textSub, cursor:'pointer', marginBottom:2, transition:'all 0.15s', textAlign:'left' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <Filter size={13} />
                                    <span style={{ fontSize:13, fontWeight:500 }}>All Tasks</span>
                                </div>
                                <span style={{ fontSize:11, fontWeight:600, color: active ? C.accent : C.textMuted }}>{tasks.length}</span>
                            </button>
                        );
                    })()}

                    {categories.map(cat => {
                        const active = selCat === cat.id;
                        return (
                            <button key={cat.id} onClick={() => { setSelCat(cat.id); setSidebarOpen(false); }} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', borderRadius:8, background: active ? 'rgba(255,255,255,0.04)' : 'none', border:`1px solid ${active ? C.border : 'transparent'}`, color: active ? C.textPrimary : C.textSub, cursor:'pointer', marginBottom:2, transition:'all 0.15s', textAlign:'left' }}
                                onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.color=C.textPrimary; }}}
                                onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background='none'; e.currentTarget.style.color=C.textSub; }}}>
                                <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                                    <div style={{ width:7, height:7, borderRadius:'50%', background:cat.color, flexShrink:0 }} />
                                    <span style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{cat.name}</span>
                                </div>
                                <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                                    <span style={{ fontSize:11, color:C.textMuted }}>{tasks.filter(t=>t.category_id===cat.id).length}</span>
                                    <span onClick={e=>openEditCat(cat,e)} style={{ color:C.textMuted, cursor:'pointer', lineHeight:1 }}
                                        onMouseEnter={e=>(e.currentTarget.style.color=C.accent)} onMouseLeave={e=>(e.currentTarget.style.color=C.textMuted)}>
                                        <Edit2 size={11} />
                                    </span>
                                    <span onClick={e=>deleteCat(cat.id,e)} style={{ color:C.textMuted, cursor:'pointer', lineHeight:1 }}
                                        onMouseEnter={e=>(e.currentTarget.style.color='#ef4444')} onMouseLeave={e=>(e.currentTarget.style.color=C.textMuted)}>
                                        <Trash2 size={11} />
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Bottom stats */}
                <div style={{ padding:'12px', borderTop:`1px solid ${C.border}` }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                        {(['pending','in_progress','completed'] as Task['status'][]).map(s => {
                            const cfg = STATUS[s];
                            return (
                                <div key={s} style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 4px', borderRadius:8, background:C.card, border:`1px solid ${C.border2}` }}>
                                    <span style={{ fontSize:18, fontWeight:800, color:cfg.color }}>{tasks.filter(t=>t.status===s).length}</span>
                                    <span style={{ fontSize:9, color:C.textSub, marginTop:2, textAlign:'center', lineHeight:'1.2' }}>{cfg.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ═══ MAIN ═══ */}
            <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

                {/* Topbar */}
                <div
                    className="px-3.5 py-3 sm:px-7 sm:py-4 flex items-center justify-between flex-shrink-0"
                    style={{ borderBottom:`1px solid ${C.border}`, background:C.sidebar }}
                >
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        {/* Mobile Hamburger Button */}
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer transition-colors"
                            title="Open Workspaces"
                        >
                            <Menu size={18} />
                        </button>
                        <div>
                            <h1 style={{ fontSize:17, fontWeight:700, color:C.textPrimary, margin:0, letterSpacing:'-0.02em' }} className="truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                                {selCat ? categories.find(c=>c.id===selCat)?.name : 'All Tasks'}
                            </h1>
                            <p style={{ fontSize:11, color:C.textSub, margin:'2px 0 0' }}>{filtered.length} task{filtered.length!==1?'s':''}</p>
                        </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <button onClick={load} title="Refresh" style={{ padding:'8px 10px', borderRadius:9, background:C.card, border:`1px solid ${C.border}`, color:C.textSub, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                            <RefreshCw size={14} />
                        </button>
                        <button onClick={openAddTask} style={{ padding:'8px 14px', borderRadius:9, background:`linear-gradient(135deg,${C.accent},#059669)`, border:'none', color:'white', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6, boxShadow:`0 4px 18px ${C.accentDim}` }}>
                            <Plus size={15} />
                            <span className="hidden sm:inline">New Task</span>
                            <span className="inline sm:hidden">Task</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-7">
                    {loading ? (
                        <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
                            <Loader2 size={28} color={C.accent} style={{ animation:'spin 1s linear infinite' }} />
                            <p style={{ color:C.textSub, fontSize:14 }}>Loading workspace...</p>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : error ? (
                        <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <div style={{ textAlign:'center', padding:28, background:C.card, border:`1px solid rgba(239,68,68,0.15)`, borderRadius:16, maxWidth:320 }}>
                                <p style={{ color:'#ef4444', fontWeight:600, marginBottom:6 }}>Connection Error</p>
                                <p style={{ color:'rgba(239,68,68,0.6)', fontSize:13, marginBottom:16 }}>{error}</p>
                                <button onClick={load} style={{ padding:'8px 20px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', cursor:'pointer', fontSize:13 }}>Retry</button>
                            </div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <div style={{ textAlign:'center', padding:40, border:`1px dashed ${C.border}`, borderRadius:18, maxWidth:300 }}>
                                <div style={{ width:52, height:52, borderRadius:14, background:C.accentDim, border:`1px solid ${C.accentBorder}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                                    <Plus size={24} color={C.accent} />
                                </div>
                                <h3 style={{ color:C.textPrimary, fontWeight:700, margin:'0 0 8px' }}>No tasks yet</h3>
                                <p style={{ color:C.textSub, fontSize:13, margin:'0 0 18px' }}>Create your first task to get started.</p>
                                <button onClick={openAddTask} style={{ padding:'8px 20px', borderRadius:8, background:C.accentDim, border:`1px solid ${C.accentBorder}`, color:C.accent, cursor:'pointer', fontWeight:600, fontSize:13 }}>
                                    + Create Task
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {filtered.map(task => {
                                const cat = categories.find(c=>c.id===task.category_id);
                                const assignee = users.find(u=>u.id===task.assigned_to);
                                const pCfg = PRIORITY[task.priority];
                                return (
                                    <div key={task.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'16px', display:'flex', flexDirection:'column', transition:'border-color 0.15s, transform 0.15s' }}
                                        onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; e.currentTarget.style.transform='translateY(-1px)'; }}
                                        onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='none'; }}>

                                        {/* Top */}
                                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'3px 8px', borderRadius:99, fontSize:11, fontWeight:600, background:`${cat?.color||C.accent}18`, border:`1px solid ${cat?.color||C.accent}25`, color:cat?.color||C.accent }}>
                                                <div style={{ width:5, height:5, borderRadius:'50%', background:cat?.color||C.accent }} />
                                                {cat?.name||'General'}
                                            </div>
                                            <div style={{ display:'flex', gap:4 }}>
                                                <button onClick={()=>openEditTask(task)} style={{ padding:5, borderRadius:6, background:'none', border:'none', color:C.textMuted, cursor:'pointer' }}
                                                    onMouseEnter={e=>(e.currentTarget.style.color=C.accent)} onMouseLeave={e=>(e.currentTarget.style.color=C.textMuted)}>
                                                    <Edit2 size={12} />
                                                </button>
                                                <button onClick={()=>deleteTask(task.id)} style={{ padding:5, borderRadius:6, background:'none', border:'none', color:C.textMuted, cursor:'pointer' }}
                                                    onMouseEnter={e=>(e.currentTarget.style.color='#ef4444')} onMouseLeave={e=>(e.currentTarget.style.color=C.textMuted)}>
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 style={{ fontSize:14, fontWeight:600, color: task.status==='completed' ? C.textSub : C.textPrimary, margin:'0 0 6px', lineHeight:'1.4', textDecoration: task.status==='completed' ? 'line-through' : 'none' }}>
                                            {task.title}
                                        </h3>
                                        {task.description && (
                                            <p style={{ fontSize:12, color:C.textSub, margin:'0 0 12px', lineHeight:'1.6', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                                                {task.description}
                                            </p>
                                        )}
                                        <div style={{ flex:1 }} />

                                        {/* Bottom */}
                                        <div style={{ borderTop:`1px solid ${C.border2}`, paddingTop:12, marginTop:12, display:'flex', flexDirection:'column', gap:8 }}>
                                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                                <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, color:pCfg.color }}>
                                                    <div style={{ width:6, height:6, borderRadius:'50%', background:pCfg.dot }} />
                                                    {pCfg.label}
                                                </div>
                                                {task.due_date && (
                                                    <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:C.textSub }}>
                                                        <Calendar size={11} />
                                                        {task.due_date.slice(0,10)}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                                {/* Status */}
                                                <StatusDropdown
                                                    value={task.status}
                                                    onChange={s => changeStatus(task, s)}
                                                />
                                                {/* Assignee */}
                                                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                                    <div style={{ width:22, height:22, borderRadius:'50%', background:C.card2, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                                        <span style={{ fontSize:9, fontWeight:700, color:C.textSub }}>{assignee ? initials(assignee.name) : '?'}</span>
                                                    </div>
                                                    <span style={{ fontSize:11, color:C.textSub, maxWidth:70, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                                        {assignee?.name || 'Unassigned'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ CATEGORY MODAL ═══ */}
            {showCatModal && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:60, padding:12 }}>
                    <div style={{ background:'#0f0f0f', border:`1px solid ${C.border}`, borderRadius:18, width:'100%', maxWidth:420, boxShadow:'0 25px 60px rgba(0,0,0,0.7)', maxHeight:'90vh', overflowY:'auto' }}>
                        <div style={{ padding:'18px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#0f0f0f', zIndex:1 }}>
                            <h3 style={{ fontWeight:700, color:C.textPrimary, margin:0, fontSize:15 }}>{editCat ? 'Edit Workspace' : 'New Workspace'}</h3>
                            <button onClick={()=>setShowCatModal(false)} style={{ padding:6, borderRadius:7, background:'none', border:'none', color:C.textSub, cursor:'pointer' }}>
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={submitCat} style={{ padding:20, display:'flex', flexDirection:'column', gap:16 }}>
                            <div>
                                <label style={labelSt}>Name</label>
                                <input value={catName} onChange={e=>setCatName(e.target.value)} required placeholder="e.g. Work, Personal..."
                                    style={inputSt}
                                    onFocus={e=>(e.target.style.borderColor=C.accentBorder)}
                                    onBlur={e=>(e.target.style.borderColor=C.border)} />
                            </div>
                            <div>
                                <label style={labelSt}>Color</label>
                                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                                    <input type="color" value={catColor} onChange={e=>setCatColor(e.target.value)}
                                        style={{ width:40, height:40, borderRadius:8, border:'none', cursor:'pointer', background:'none' }} />
                                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                        {['#10b981','#6366f1','#3b82f6','#f59e0b','#ef4444','#ec4899'].map(c=>(
                                            <button key={c} type="button" onClick={()=>setCatColor(c)} style={{ width:24, height:24, borderRadius:'50%', background:c, border: catColor===c ? '2px solid white' : '2px solid transparent', cursor:'pointer', outline:'none' }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button type="submit" disabled={submitting} style={{ padding:'11px', borderRadius:10, background:`linear-gradient(135deg,${C.accent},#059669)`, border:'none', color:'white', fontWeight:700, fontSize:14, cursor:'pointer', opacity: submitting ? 0.6 : 1 }}>
                                {submitting ? 'Saving...' : 'Save Workspace'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══ TASK MODAL ═══ */}
            {showTaskModal && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:60, padding:12 }}>
                    <div style={{ background:'#0f0f0f', border:`1px solid ${C.border}`, borderRadius:18, width:'100%', maxWidth:480, boxShadow:'0 25px 60px rgba(0,0,0,0.7)', maxHeight:'90vh', overflowY:'auto' }}>
                        <div style={{ padding:'18px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#0f0f0f', zIndex:1 }}>
                            <h3 style={{ fontWeight:700, color:C.textPrimary, margin:0, fontSize:15 }}>{editTask ? 'Edit Task' : 'New Task'}</h3>
                            <button onClick={()=>setShowTaskModal(false)} style={{ padding:6, borderRadius:7, background:'none', border:'none', color:C.textSub, cursor:'pointer' }}>
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={submitTask} style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
                            <div>
                                <label style={labelSt}>Title *</label>
                                <input value={tTitle} onChange={e=>setTTitle(e.target.value)} required placeholder="What needs to be done?"
                                    style={{...inputSt, fontSize:15, fontWeight:500}}
                                    onFocus={e=>(e.target.style.borderColor=C.accentBorder)} onBlur={e=>(e.target.style.borderColor=C.border)} />
                            </div>
                            <div>
                                <label style={labelSt}>Description</label>
                                <textarea value={tDesc} onChange={e=>setTDesc(e.target.value)} placeholder="Add details..." rows={3}
                                    style={{...inputSt, resize:'none'}}
                                    onFocus={e=>(e.target.style.borderColor=C.accentBorder)} onBlur={e=>(e.target.style.borderColor=C.border)} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                                        <label style={{ ...labelSt, marginBottom:0 }}>Workspace *</label>
                                        <button
                                             type="button"
                                            onClick={() => setShowInlineCat(v => !v)}
                                            style={{ background:'none', border:'none', color:C.accent, fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:3, padding:0 }}
                                        >
                                            <Plus size={12} /> {showInlineCat ? 'Cancel' : 'New'}
                                        </button>
                                    </div>
                                    {showInlineCat && (
                                        <div style={{ display:'flex', gap:6, marginBottom:6 }}>
                                            <input
                                                type="text"
                                                value={inlineCatName}
                                                onChange={e => setInlineCatName(e.target.value)}
                                                placeholder="New workspace..."
                                                style={{ ...inputSt, padding:'7px 10px', fontSize:13 }}
                                                autoFocus
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleCreateInlineCat();
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                disabled={creatingCat || !inlineCatName.trim()}
                                                onClick={handleCreateInlineCat}
                                                style={{
                                                    padding:'7px 12px', borderRadius:10,
                                                    background:`linear-gradient(135deg,${C.accent},#059669)`,
                                                    border:'none', color:'white', fontWeight:700, fontSize:12,
                                                    cursor:'pointer', whiteSpace:'nowrap',
                                                    opacity: (creatingCat || !inlineCatName.trim()) ? 0.6 : 1
                                                }}
                                            >
                                                {creatingCat ? 'Adding...' : 'Add'}
                                            </button>
                                        </div>
                                    )}
                                    {(!showInlineCat || categories.length > 0) && (
                                        <select
                                            value={tCat || ''}
                                            onChange={e => setTCat(Number(e.target.value))}
                                            style={{
                                                ...inputSt,
                                                borderColor: (categories.length === 0 && !showInlineCat) ? '#ef4444' : C.border
                                            }}
                                        >
                                            {categories.length === 0 ? (
                                                <option value="" disabled>⚠️ No workspace - click "+ New" above</option>
                                            ) : (
                                                categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                            )}
                                        </select>
                                    )}
                                    {categories.length === 0 && !showInlineCat && (
                                        <p style={{ color:'#ef4444', fontSize:11, margin:'4px 0 0' }}>
                                            Please click "+ New" above to add a workspace.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label style={labelSt}>Priority</label>
                                    <select value={tPriority} onChange={e=>setTPriority(e.target.value as Task['priority'])} style={inputSt}>
                                        <option value="low">🟢 Low</option>
                                        <option value="medium">🟡 Medium</option>
                                        <option value="high">🔴 High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label style={labelSt}>Due Date</label>
                                    <input type="date" value={tDue} onChange={e=>setTDue(e.target.value)} style={{...inputSt, colorScheme:'dark'}} />
                                </div>
                                <div>
                                    <label style={labelSt}>Assign To</label>
                                    <select value={tAssign||''} onChange={e=>setTAssign(e.target.value ? Number(e.target.value) : null)} style={inputSt}>
                                        <option value="">Unassigned</option>
                                        {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" disabled={submitting} style={{ padding:'12px', borderRadius:10, background:`linear-gradient(135deg,${C.accent},#059669)`, border:'none', color:'white', fontWeight:700, fontSize:14, cursor:'pointer', marginTop:4, opacity: submitting ? 0.6 : 1 }}>
                                {submitting ? 'Saving...' : editTask ? 'Save Changes' : 'Create Task'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
