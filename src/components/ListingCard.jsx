import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Gauge, Cog } from 'lucide-react';

export default function ListingCard({ listing }) {
    return (
        <Link
            to={`/listings/${listing.id}`}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-slate-200 group flex flex-col"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                {listing.imageUrls && listing.imageUrls[0] ? (
                    <img
                        src={listing.imageUrls[0]}
                        alt={listing.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${listing.status === 'sold' ? 'grayscale' : ''}`}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Car className="h-12 w-12" />
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-slate-900">
                    {listing.year}
                </div>
                {listing.status === 'sold' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                        <span className="bg-red-600 text-white px-4 py-1 rounded-full font-bold transform -rotate-12 shadow-lg border-2 border-white">
                            SOLD
                        </span>
                    </div>
                )}
                {listing.featured && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Featured
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-slate-900 truncate mb-1">{listing.title}</h3>
                <p className={`font-bold mb-3 ${listing.status === 'sold' ? 'text-slate-500 line-through' : 'text-blue-600'}`}>
                    ${listing.price?.toLocaleString()}
                </p>

                <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1.5">
                        <Gauge className="h-3.5 w-3.5 text-slate-400" />
                        {listing.mileage ? `${listing.mileage.toLocaleString()} km` : 'N/A'}
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                        <Cog className="h-3.5 w-3.5 text-slate-400" />
                        {listing.transmission || 'Auto'}
                    </div>
                </div>

                <div className="mt-auto pt-3 border-t border-slate-100">
                    <span className="block w-full text-center py-2 bg-slate-50 text-blue-600 text-sm font-semibold rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        View Details
                    </span>
                </div>
            </div>
        </Link>
    );
}
