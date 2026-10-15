import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User, Lock, Save, Loader2 } from 'lucide-react';

const Profile: React.FC = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingAvatar, setLoadingAvatar] = useState(false);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password && password !== passwordConfirmation) {
            setError('Passwords do not match.');
            return;
        }

        setLoadingProfile(true);
        try {
            const data: any = { name };
            if (password) {
                data.password = password;
                data.password_confirmation = passwordConfirmation;
            }

            const response = await api.put('/profile', data);
            
            // Update auth state (response contains user and token is still in localStorage)
            const token = localStorage.getItem('token') || '';
            login(token, response.data.user);
            
            setSuccess('Profile updated successfully!');
            setPassword('');
            setPasswordConfirmation('');
        } catch (err: any) {
            if (err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0] as string[];
                setError(firstError[0]);
            } else {
                setError(err.response?.data?.message || 'Failed to update profile.');
            }
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError('Image size must be less than 2MB.');
            return;
        }

        setError('');
        setSuccess('');
        setLoadingAvatar(true);

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await api.post('/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update user state
            const token = localStorage.getItem('token') || '';
            login(token, response.data.user);
            setSuccess('Avatar uploaded successfully!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload avatar.');
        } finally {
            setLoadingAvatar(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <div className="max-w-3xl mx-auto px-3.5 py-6 sm:px-6 sm:py-8">
                {/* Header */}
                <div className="flex items-center space-x-3.5 sm:space-x-4 mb-6 sm:mb-8">
                    <button 
                        onClick={() => navigate('/')}
                        className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all duration-200 cursor-pointer"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Profile Settings</h1>
                        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Manage your personal profile and account settings</p>
                    </div>
                </div>

                {/* Notifications */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 sm:p-4 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 sm:p-4 rounded-xl mb-6 text-sm">
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Avatar Upload Card */}
                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Profile Photo</h3>
                        
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            {/* Avatar Display */}
                            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-indigo-500/30 group-hover:border-indigo-500 flex items-center justify-center bg-slate-800 transition-all duration-200">
                                {loadingAvatar ? (
                                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                                ) : user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                     <span className="text-3xl font-extrabold text-indigo-400">
                                         {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U'}
                                     </span>
                                )}
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                                <Camera className="h-8 w-8 text-white" />
                            </div>
                        </div>

                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*"
                        />

                        <p className="text-slate-500 text-xs mt-4">JPG, PNG or GIF. Max size of 2MB.</p>
                        
                        <button 
                            onClick={handleAvatarClick}
                            className="mt-6 px-4 py-2 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg text-sm font-semibold transition-all duration-200"
                        >
                            Change Photo
                        </button>
                    </div>

                    {/* Right: Profile Details Form */}
                    <div className="md:col-span-2 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 sm:p-8 shadow-xl">
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold border-b border-slate-800 pb-2 text-indigo-400">Personal Information</h3>
                                
                                <div className="text-left">
                                    <label className="block text-slate-400 text-sm mb-1.5 font-medium flex items-center">
                                        <User className="h-4 w-4 mr-2 text-indigo-500" /> Name
                                    </label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        required 
                                        className="w-full px-4 py-2.5 bg-black/25 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-white placeholder-slate-600 focus:outline-none transition-all duration-200"
                                    />
                                </div>

                                <div className="text-left">
                                    <label className="block text-slate-400 text-sm mb-1.5 font-medium flex items-center">
                                        Email Address
                                    </label>
                                    <input 
                                        type="email" 
                                        value={user?.email} 
                                        disabled
                                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-900 rounded-lg text-slate-500 cursor-not-allowed"
                                    />
                                    <p className="text-slate-600 text-xs mt-1">Email cannot be changed.</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h3 className="text-lg font-bold border-b border-slate-800 pb-2 text-indigo-400">Change Password</h3>
                                <p className="text-slate-500 text-xs">Leave blank if you do not want to change your password.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="text-left">
                                        <label className="block text-slate-400 text-sm mb-1.5 font-medium flex items-center">
                                            <Lock className="h-4 w-4 mr-2 text-indigo-500" /> New Password
                                        </label>
                                        <input 
                                            type="password" 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            placeholder="Min 8 characters"
                                            className="w-full px-4 py-2.5 bg-black/25 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-white placeholder-slate-600 focus:outline-none transition-all duration-200"
                                        />
                                    </div>

                                    <div className="text-left">
                                        <label className="block text-slate-400 text-sm mb-1.5 font-medium flex items-center">
                                            <Lock className="h-4 w-4 mr-2 text-indigo-500" /> Confirm Password
                                        </label>
                                        <input 
                                            type="password" 
                                            value={passwordConfirmation} 
                                            onChange={(e) => setPasswordConfirmation(e.target.value)} 
                                            placeholder="Confirm password"
                                            className="w-full px-4 py-2.5 bg-black/25 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-white placeholder-slate-600 focus:outline-none transition-all duration-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-end">
                                <button 
                                    type="submit" 
                                    disabled={loadingProfile}
                                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none cursor-pointer"
                                >
                                    {loadingProfile ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Saving Changes...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
