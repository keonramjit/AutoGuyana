import React from 'react';
import GuyanaFlag from './GuyanaFlag';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-white mt-auto relative">
            {/* Guyana Colors Border Top */}
            <div className="absolute top-0 left-0 right-0 h-1 flex">
                <div className="w-1/3 h-full bg-green-600"></div>
                <div className="w-1/3 h-full bg-yellow-500"></div>
                <div className="w-1/3 h-full bg-red-600"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-9">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold">AutoGuyana</h3>
                            <GuyanaFlag className="h-4 w-auto" />
                        </div>
                        <p className="text-slate-400 text-sm">The premier vehicle marketplace in Guyana.</p>
                    </div>
                    <div className="flex space-x-6">
                        <a href="#" className="text-slate-400 hover:text-white transition-colors">About</a>
                        <a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a>
                        <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>
                        <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
                    </div>
                </div>
                <div className="mt-8 border-t border-slate-800 pt-8 flex flex-col items-center justify-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} AutoGuyana. All rights reserved.</p>
                    <div className="flex items-center gap-1.5 mt-2">
                        <span>Made in</span>
                        <GuyanaFlag className="h-3 w-auto" />
                        <span>Guyana</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
