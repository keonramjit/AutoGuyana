import React from 'react';
import { Car } from 'lucide-react';

export default function LoadingCar() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
            <div className="relative">
                {/* Road */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-slate-300 animate-road-move"></div>
                </div>

                {/* Car */}
                <div className="relative z-10 animate-car-bounce">
                    <Car className="h-12 w-12 text-blue-600" />
                    {/* Motion lines */}
                    <div className="absolute top-1 -right-4 space-y-1">
                        <div className="w-4 h-0.5 bg-blue-200 rounded-full animate-wind-1"></div>
                        <div className="w-6 h-0.5 bg-blue-300 rounded-full animate-wind-2"></div>
                        <div className="w-3 h-0.5 bg-blue-200 rounded-full animate-wind-3"></div>
                    </div>
                </div>
            </div>
            <p className="mt-4 text-blue-600 font-medium animate-pulse">Loading...</p>

            <style jsx>{`
                @keyframes road-move {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes car-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                @keyframes wind-1 {
                    0% { opacity: 0; transform: translateX(0); }
                    50% { opacity: 1; }
                    100% { opacity: 0; transform: translateX(-10px); }
                }
                @keyframes wind-2 {
                    0% { opacity: 0; transform: translateX(0); }
                    50% { opacity: 1; }
                    100% { opacity: 0; transform: translateX(-15px); }
                }
                @keyframes wind-3 {
                    0% { opacity: 0; transform: translateX(0); }
                    50% { opacity: 1; }
                    100% { opacity: 0; transform: translateX(-8px); }
                }
                .animate-road-move {
                    animation: road-move 1s linear infinite;
                }
                .animate-car-bounce {
                    animation: car-bounce 0.5s ease-in-out infinite;
                }
                .animate-wind-1 {
                    animation: wind-1 0.8s linear infinite;
                }
                .animate-wind-2 {
                    animation: wind-2 0.8s linear infinite 0.1s;
                }
                .animate-wind-3 {
                    animation: wind-3 0.8s linear infinite 0.2s;
                }
            `}</style>
        </div>
    );
}
