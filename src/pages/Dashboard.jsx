import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingCar from '../components/LoadingCar';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import {
    Car,
    Heart,
    Clock,
    FileText,
    Plus,
    TrendingUp,
    Eye,
    ArrowRight,
    Edit,
    Search,
    Filter,
    MoreVertical,
    Trash2,
    CheckCircle2,
    XCircle
} from 'lucide-react';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        myListings: 0,
        pending: 0,
        favorites: 0
    });
    const [recentListings, setRecentListings] = useState([]);
    const [allListings, setAllListings] = useState([]);
    const [bannerURL, setBannerURL] = useState('');
    const [dealershipName, setDealershipName] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        if (currentUser) {
            fetchDashboardData();
        }
    }, [currentUser]);

    async function fetchDashboardData() {
        try {
            // Fetch user's listings
            const listingsQuery = query(
                collection(db, 'listings'),
                where('sellerId', '==', currentUser.uid)
            );
            const listingsSnapshot = await getDocs(listingsQuery);
            const listings = listingsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Count pending listings
            const pendingCount = listings.filter(l => l.status === 'pending').length;

            // Get recent 3 listings
            const recent = listings
                .sort((a, b) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                    return dateB - dateA;
                })
                .slice(0, 3);

            // Fetch user's favorites count and banner
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            const userData = userDocSnap.data();
            const favoritesCount = userDocSnap.exists() && userData?.favorites
                ? userData.favorites.length
                : 0;
            const banner = userData?.bannerURL || '';
            const dealership = userData?.dealershipName || '';
            const photo = userData?.photoURL || '';

            setStats({
                myListings: listings.length,
                pending: pendingCount,
                favorites: favoritesCount
            });

            setRecentListings(recent);
            setAllListings(listings);
            setBannerURL(banner);
            setDealershipName(dealership);
            setPhotoURL(photo);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm("Are you sure you want to delete this listing?")) {
            try {
                await deleteDoc(doc(db, "listings", id));
                setAllListings(allListings.filter(listing => listing.id !== id));
                setRecentListings(recentListings.filter(listing => listing.id !== id));
                setStats(prev => ({ ...prev, myListings: prev.myListings - 1 }));
            } catch (error) {
                console.error("Error deleting listing:", error);
                alert("Failed to delete listing.");
            }
        }
    }

    async function handleStatusUpdate(id, newStatus) {
        const action = newStatus === 'sold' ? 'mark this listing as sold' :
            newStatus === 'approved' ? 'mark this listing as available' :
                `mark this listing as ${newStatus}`;

        if (window.confirm(`Are you sure you want to ${action}?`)) {
            try {
                const listingRef = doc(db, "listings", id);
                const updates = { status: newStatus };

                if (newStatus === 'sold') {
                    updates.soldAt = new Date();
                } else if (newStatus === 'approved') {
                    updates.soldAt = null;
                }

                await updateDoc(listingRef, updates);

                const updateList = (list) => list.map(l => l.id === id ? { ...l, ...updates } : l);
                setAllListings(updateList(allListings));
                setRecentListings(updateList(recentListings));
            } catch (error) {
                console.error("Error updating status:", error);
                alert("Failed to update status.");
            }
        }
    }

    const filteredListings = allListings.filter(listing => {
        const matchesSearch = (
            listing.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.year?.toString().includes(searchQuery)
        );
        const matchesFilter = filterStatus === 'all' || listing.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const statCards = [
        {
            title: 'My Listings',
            value: stats.myListings,
            icon: Car,
            color: 'blue',
            link: '/my-listings'
        },
        {
            title: 'Pending',
            value: stats.pending,
            icon: Clock,
            color: 'orange',
            link: '/my-listings?filter=pending'
        },
        {
            title: 'My Favorites',
            value: stats.favorites,
            icon: Heart,
            color: 'red',
            link: '/watchlist'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <LoadingCar />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    {dealershipName ? (
                        <p className="text-slate-600 mt-1">
                            <span className="font-semibold text-blue-600">{dealershipName}</span> • Welcome back, {currentUser?.email?.split('@')[0]}!
                        </p>
                    ) : (
                        <p className="text-slate-600 mt-1">Welcome back, {currentUser?.email?.split('@')[0]}!</p>
                    )}
                </div>

                {/* Dealership Banner */}
                {bannerURL && (
                    <div className="relative mb-16 rounded-xl overflow-hidden shadow-md group">
                        <img
                            src={bannerURL}
                            alt="Dealership Banner"
                            className="w-full h-48 sm:h-56 md:h-64 object-cover"
                        />
                        <Link
                            to="/profile"
                            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 rounded-lg p-2.5 shadow-lg transition-all hover:scale-105 flex items-center gap-2 opacity-0 group-hover:opacity-100"
                        >
                            <Edit className="h-4 w-4" />
                            <span className="text-sm font-medium">Edit Banner</span>
                        </Link>

                        {/* Profile Logo Overlay */}
                        <div className="absolute -bottom-12 left-6 sm:left-8 z-10">
                            <div className="relative">
                                <img
                                    src={photoURL || 'https://via.placeholder.com/150'}
                                    alt="Dealership Logo"
                                    className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-white shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {statCards.map((card, index) => {
                        const Icon = card.icon;
                        const colorClasses = {
                            blue: 'bg-blue-50 text-blue-600',
                            orange: 'bg-orange-50 text-orange-600',
                            red: 'bg-red-50 text-red-600'
                        };

                        return (
                            <Link
                                key={index}
                                to={card.link}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">{card.title}</p>
                                        <p className="text-4xl font-bold text-slate-900">{card.value}</p>
                                    </div>
                                    <div className={`p-4 rounded-xl ${colorClasses[card.color]}`}>
                                        <Icon className="h-8 w-8" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Inventory Management Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Inventory Management</h2>
                                <p className="text-slate-500 text-sm mt-1">Manage your vehicle listings, track status, and update details.</p>
                            </div>
                            <Link
                                to="/create-listing"
                                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Add New Listing
                            </Link>
                        </div>

                        {/* Filters & Search */}
                        <div className="mt-6 flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by make, model, or year..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                                {[
                                    { id: 'all', label: 'All Listings' },
                                    { id: 'approved', label: 'Active', icon: CheckCircle2 },
                                    { id: 'pending', label: 'Pending', icon: Clock },
                                    { id: 'sold', label: 'Sold', icon: CheckCircle2 }
                                ].map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setFilterStatus(tab.id)}
                                            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === tab.id
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            {Icon && <Icon className="h-4 w-4 mr-2" />}
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Listings Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Vehicle</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Views</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredListings.length > 0 ? (
                                    filteredListings.map((listing) => (
                                        <tr key={listing.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                                        <img
                                                            src={listing.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                                                            alt={`${listing.year} ${listing.make} ${listing.model}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Link to={`/listing/${listing.id}`} className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                                                            {listing.year} {listing.make} {listing.model}
                                                        </Link>
                                                        <p className="text-sm text-slate-500">{listing.mileage?.toLocaleString()} km • {listing.transmission}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-900">
                                                    ${parseInt(listing.price).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${listing.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        listing.status === 'sold' ? 'bg-slate-100 text-slate-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {listing.status === 'approved' ? 'Active' : listing.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-slate-500">
                                                    <Eye className="h-4 w-4 mr-1.5" />
                                                    {listing.views || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        to={`/edit-listing/${listing.id}`}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Listing"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    {listing.status !== 'sold' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(listing.id, 'sold')}
                                                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Mark as Sold"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(listing.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Listing"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                    <Search className="h-6 w-6 text-slate-400" />
                                                </div>
                                                <p className="text-lg font-medium text-slate-900">No listings found</p>
                                                <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
