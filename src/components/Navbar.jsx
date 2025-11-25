import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Menu,
    X,
    Car,
    User,
    LogOut,
    LayoutDashboard,
    Settings,
    Heart,
    List,
    ChevronDown,
    ShieldCheck
} from 'lucide-react';
import GuyanaFlag from './GuyanaFlag';

export default function Navbar() {
    const { currentUser, logout, userRole } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
            setIsProfileOpen(false);
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo & Main Nav */}
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                            <div className="bg-white p-0.5 rounded border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                                <GuyanaFlag className="h-5 w-auto" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight">AutoGuyana</span>
                        </Link>

                        <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                            <Link to="/listings" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all">
                                All Vehicles
                            </Link>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden sm:ml-6 sm:flex sm:items-center gap-4">
                        {currentUser ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors focus:outline-none"
                                >
                                    <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 overflow-hidden">
                                        {currentUser.photoURL ? (
                                            <img src={currentUser.photoURL} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-5 w-5" />
                                        )}
                                    </div>
                                    <span className="max-w-[150px] truncate">{currentUser.email}</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 focus:outline-none transform origin-top-right transition-all">
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Signed in as</p>
                                            <p className="text-sm font-medium text-slate-900 truncate">{currentUser.email}</p>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                to="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <User className="mr-3 h-4 w-4" />
                                                Your Profile
                                            </Link>
                                            <Link
                                                to="/dashboard"
                                                className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <LayoutDashboard className="mr-3 h-4 w-4" />
                                                Dashboard
                                            </Link>
                                            <Link
                                                to="/my-listings"
                                                className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <List className="mr-3 h-4 w-4" />
                                                My Listings
                                            </Link>
                                            <Link
                                                to="/watchlist"
                                                className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <Heart className="mr-3 h-4 w-4" />
                                                Watchlist
                                            </Link>
                                        </div>

                                        {userRole === 'admin' && (
                                            <div className="py-1 border-t border-slate-100">
                                                <Link
                                                    to="/admin"
                                                    className="flex items-center px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 font-medium"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <ShieldCheck className="mr-3 h-4 w-4" />
                                                    Admin Dashboard
                                                </Link>
                                            </div>
                                        )}

                                        <div className="py-1 border-t border-slate-100">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <LogOut className="mr-3 h-4 w-4" />
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-blue-200 transition-all hover:shadow-md"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div >
            </div >

            {/* Mobile menu */}
            {
                isOpen && (
                    <div className="sm:hidden bg-white border-t border-slate-100">
                        <div className="pt-2 pb-3 space-y-1 px-2">
                            <Link to="/listings" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                                All Vehicles
                            </Link>

                            {currentUser && (
                                <>
                                    <div className="border-t border-slate-100 my-2"></div>
                                    <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                                        Your Profile
                                    </Link>
                                    <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                                        Dashboard
                                    </Link>
                                    <Link to="/my-listings" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                                        My Listings
                                    </Link>
                                    <Link to="/watchlist" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                                        Watchlist
                                    </Link>
                                    {userRole === 'admin' && (
                                        <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-purple-600 hover:bg-purple-50">
                                            Admin Dashboard
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="pt-4 pb-4 border-t border-slate-200 px-4">
                            {currentUser ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden">
                                                {currentUser.photoURL ? (
                                                    <img src={currentUser.photoURL} alt="Profile" className="h-full w-full object-cover" />
                                                ) : (
                                                    <User className="h-6 w-6" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-base font-medium text-slate-800">{currentUser.email}</div>
                                            <div className="text-xs text-slate-500 capitalize">{userRole || 'User'}</div>
                                        </div>
                                    </div>
                                    <button onClick={handleLogout} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                                        <LogOut className="h-6 w-6" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Link to="/login" className="block w-full text-center px-4 py-2 border border-slate-300 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50">
                                        Log in
                                    </Link>
                                    <Link to="/signup" className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </nav >
    );
}
