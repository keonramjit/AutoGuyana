import React, { useState, useEffect } from 'react';
import {
    Check,
    X,
    Users,
    Car,
    BarChart3,
    Search,
    Filter,
    Trash2,
    MoreVertical,
    AlertCircle,
    Pencil
} from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import LoadingCar from '../components/LoadingCar';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [listings, setListings] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            // Fetch Listings
            const listingsSnapshot = await getDocs(collection(db, "listings"));
            const listingsData = listingsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setListings(listingsData);

            // Fetch Users
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusUpdate(id, newStatus) {
        if (!window.confirm(`Are you sure you want to ${newStatus === 'approved' ? 'approve' : 'reject'} this listing?`)) return;

        try {
            const listingRef = doc(db, "listings", id);
            await updateDoc(listingRef, {
                status: newStatus
            });

            // Update local state
            setListings(listings.map(listing =>
                listing.id === id ? { ...listing, status: newStatus } : listing
            ));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status.");
        }
    }

    async function handleDeleteListing(id) {
        if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;

        try {
            await deleteDoc(doc(db, "listings", id));
            setListings(listings.filter(listing => listing.id !== id));
        } catch (error) {
            console.error("Error deleting listing:", error);
            alert("Failed to delete listing.");
        }
    }

    async function toggleFeatured(id, currentStatus) {
        try {
            const listingRef = doc(db, "listings", id);
            await updateDoc(listingRef, {
                featured: !currentStatus
            });
            setListings(listings.map(l => l.id === id ? { ...l, featured: !currentStatus } : l));
        } catch (error) {
            console.error("Error toggling featured status:", error);
        }
    }

    // Filtered Listings
    const filteredListings = listings.filter(listing => {
        const matchesStatus = filterStatus === 'all' || listing.status === filterStatus;
        const matchesSearch = listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.model?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Stats
    const stats = {
        totalListings: listings.length,
        pendingListings: listings.filter(l => l.status === 'pending').length,
        activeListings: listings.filter(l => l.status === 'approved').length,
        totalUsers: users.length
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <LoadingCar />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="mt-1 text-slate-500">Manage listings, users, and platform settings.</p>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('listings')}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'listings'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            Listings Management
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'users'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            User Management
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div onClick={() => setActiveTab('listings')} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 cursor-pointer hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Total Listings</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalListings}</p>
                                    </div>
                                    <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <Car className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div onClick={() => { setActiveTab('listings'); setFilterStatus('pending'); }} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 cursor-pointer hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Pending Approval</p>
                                        <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pendingListings}</p>
                                    </div>
                                    <div className="h-12 w-12 bg-amber-50 rounded-lg flex items-center justify-center">
                                        <AlertCircle className="h-6 w-6 text-amber-600" />
                                    </div>
                                </div>
                            </div>

                            <div onClick={() => { setActiveTab('listings'); setFilterStatus('approved'); }} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 cursor-pointer hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Active Listings</p>
                                        <p className="text-3xl font-bold text-green-600 mt-1">{stats.activeListings}</p>
                                    </div>
                                    <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                                        <Check className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </div>

                            <div onClick={() => setActiveTab('users')} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 cursor-pointer hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Total Users</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalUsers}</p>
                                    </div>
                                    <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                        <Users className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Recent Listings */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900">Recent Listings</h3>
                                    <button onClick={() => setActiveTab('listings')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {listings.slice(0, 5).map(listing => (
                                        <div key={listing.id} className="px-6 py-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-slate-100 rounded-lg overflow-hidden">
                                                    {listing.imageUrls?.[0] ? (
                                                        <img src={listing.imageUrls[0]} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Car className="h-5 w-5 m-2.5 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{listing.title}</p>
                                                    <p className="text-xs text-slate-500">{listing.sellerEmail}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${listing.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                listing.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {listing.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Users */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900">Recent Users</h3>
                                    <button onClick={() => setActiveTab('users')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {users.slice(0, 5).map(user => (
                                        <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                    {user.email?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{user.email}</p>
                                                    <p className="text-xs text-slate-500">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-500 capitalize">{user.role}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Listings Tab */}
                {activeTab === 'listings' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Filters */}
                        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
                            <div className="relative w-full sm:w-96">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search listings..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Filter className="h-4 w-4 text-slate-500" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Seller</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Featured</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredListings.map((listing) => (
                                        <tr key={listing.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-slate-100">
                                                        {listing.imageUrls?.[0] ? (
                                                            <img className="h-10 w-10 object-cover" src={listing.imageUrls[0]} alt="" />
                                                        ) : (
                                                            <Car className="h-6 w-6 m-2 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900">{listing.title}</div>
                                                        <div className="text-sm text-slate-500">{listing.year} • {listing.make}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">{listing.sellerEmail}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-900">
                                                    ${listing.price?.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${listing.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        listing.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-amber-100 text-amber-800'}`}>
                                                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => toggleFeatured(listing.id, listing.featured)}
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${listing.featured ? 'bg-blue-600' : 'bg-slate-200'}`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${listing.featured ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <a href={`/edit-listing/${listing.id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md hover:bg-blue-100 transition-colors" title="Edit">
                                                        <Pencil className="h-4 w-4" />
                                                    </a>
                                                    {listing.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(listing.id, 'approved')}
                                                                className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-md hover:bg-green-100 transition-colors"
                                                                title="Approve"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(listing.id, 'rejected')}
                                                                className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors"
                                                                title="Reject"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteListing(listing.id)}
                                                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredListings.length === 0 && (
                            <div className="p-8 text-center text-slate-500">
                                No listings found matching your filters.
                            </div>
                        )}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                        {user.email?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900">{user.email}</div>
                                                        <div className="text-xs text-slate-500">ID: {user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
                                                    {user.role?.toUpperCase() || 'USER'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-slate-400 hover:text-blue-600">
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
