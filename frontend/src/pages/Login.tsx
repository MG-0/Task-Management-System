import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const r = await api.post('/login', { email, password });
            login(r.data.token, r.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials.');
        } finally { setLoading(false); }
    };

    const inp: React.CSSProperties = {
        width:'100%', padding:'11px 14px', background:'#0a0a0a',
        border:'1px solid rgba(255,255,255,0.08)', borderRadius:10,
        color:'#f0f0f0', fontSize:14, outline:'none',
    };

    return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080808', fontFamily:"'Inter',sans-serif", padding:16, position:'relative', overflow:'hidden' }}>
            {/* Glow */}
            <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.06),transparent)', pointerEvents:'none' }} />

            <div style={{ width:'100%', maxWidth:360, position:'relative', zIndex:1 }}>
                {/* Logo */}
                <div style={{ textAlign:'center', marginBottom:32 }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 8px 28px rgba(16,185,129,0.25)' }}>
                        <Sparkles size={22} color="white" />
                    </div>
                    <h1 style={{ fontSize:22, fontWeight:800, color:'#f0f0f0', margin:'0 0 6px', letterSpacing:'-0.03em' }}>Welcome back</h1>
                    <p style={{ fontSize:13, color:'#6b7280', margin:0 }}>Sign in to your TaskFlow workspace</p>
                </div>

                {/* Card */}
                <div style={{ background:'#0f0f0f', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:24, boxShadow:'0 20px 50px rgba(0,0,0,0.5)' }}>
                    {error && (
                        <div style={{ padding:'10px 14px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:9, color:'#f87171', fontSize:13, marginBottom:16 }}>
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                        <div>
                            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#6b7280', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em' }}>Email</label>
                            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" style={inp}
                                onFocus={e=>(e.target.style.borderColor='rgba(16,185,129,0.35)')} onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.08)')} />
                        </div>
                        <div>
                            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#6b7280', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em' }}>Password</label>
                            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" style={inp}
                                onFocus={e=>(e.target.style.borderColor='rgba(16,185,129,0.35)')} onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.08)')} />
                        </div>
                        <button type="submit" disabled={loading} style={{ padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#10b981,#059669)', border:'none', color:'white', fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 18px rgba(16,185,129,0.3)', marginTop:4, opacity: loading ? 0.7 : 1 }}>
                            {loading ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /><span>Signing in...</span></> : <><span>Sign In</span><ArrowRight size={16} /></>}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign:'center', color:'#6b7280', fontSize:13, marginTop:18 }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color:'#10b981', fontWeight:600, textDecoration:'none' }}>Create one</Link>
                </p>
            </div>
            <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        </div>
    );
};
export default Login;
