import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingCar from '../components/LoadingCar';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import ListingCard from '../components/ListingCard';

export default function Watchlist() {
    const { currentUser } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFavorites() {
            if (!currentUser) return;

            try {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const favoriteIds = userData.favorites || [];

                    if (favoriteIds.length > 0) {
                        const listingPromises = favoriteIds.map(id => getDoc(doc(db, "listings", id)));
                        const listingSnapshots = await Promise.all(listingPromises);

                        const listings = listingSnapshots
                            .filter(snap => snap.exists())
                            .map(snap => ({ id: snap.id, ...snap.data() }));

                        setFavorites(listings);
                    } else {
                        setFavorites([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching favorites:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchFavorites();
    }, [currentUser]);

    if (loading) {
        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <LoadingCar />
                </div>
            );
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">My Watchlist</h1>

            {favorites.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-slate-200">
                    <p className="text-slate-500 mb-4">You haven't saved any vehicles yet.</p>
                    <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
                        Browse Marketplace
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map(listing => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            )}
        </div>
    );
}
