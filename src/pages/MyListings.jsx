import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Archive, CheckCircle2, Eye, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingCar from '../components/LoadingCar';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export default function MyListings() {
    const { currentUser } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        const filterParam = searchParams.get('filter');
        if (filterParam) {
            setActiveFilter(filterParam);
        }
    }, [searchParams]);

    useEffect(() => {
        async function fetchListings() {
            if (!currentUser) return;

            try {
                const q = query(
                    collection(db, "listings"),
                    where("sellerId", "==", currentUser.uid)
                );

                const querySnapshot = await getDocs(q);
                const userListings = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setListings(userListings);
            } catch (error) {
                console.error("Error fetching listings:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchListings();
    }, [currentUser]);

    async function handleDelete(id) {
        if (window.confirm("Are you sure you want to delete this listing?")) {
            try {
                await deleteDoc(doc(db, "listings", id));
                setListings(listings.filter(listing => listing.id !== id));
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
                setListings(listings.map(l => l.id === id ? { ...l, ...updates } : l));
            } catch (error) {
                console.error("Error updating status:", error);
                alert("Failed to update status.");
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <LoadingCar />
            </div>
        );
    }

    const filteredListings = activeFilter === 'all'
        ? listings
        : listings.filter(listing => listing.status === activeFilter);

    const filterTabs = [
        { key: 'all', label: 'All', count: listings.length },
        { key: 'pending', label: 'Pending', count: listings.filter(l => l.status === 'pending').length },
        { key: 'approved', label: 'Approved', count: listings.filter(l => l.status === 'approved').length },
        { key: 'sold', label: 'Sold', count: listings.filter(l => l.status === 'sold').length },
        { key: 'archived', label: 'Archived', count: listings.filter(l => l.status === 'archived').length }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900">My Listings</h1>
                <Link to="/create-listing" className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Listing
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 border-b border-slate-200">
                <div className="flex gap-2 overflow-x-auto">
                    {filterTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveFilter(tab.key)}
                            className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeFilter === tab.key
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {filteredListings.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        {activeFilter === 'all'
                            ? "You haven't listed any vehicles yet."
                            : `No ${activeFilter} listings found.`}
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredListings.map((listing) => (
                                <tr key={listing.id} className="hover:bg-blue-50 transition-all duration-200 hover:shadow-md">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-slate-200 rounded-md overflow-hidden">
                                                {listing.imageUrls && listing.imageUrls[0] ? (
                                                    <img src={listing.imageUrls[0]} alt={listing.title} className="h-10 w-10 object-cover" />
                                                ) : (
                                                    <div className="h-full w-full bg-slate-300"></div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900">{listing.title}</div>
                                                <div className="text-sm text-slate-500">{listing.make} {listing.model}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">
                                            ${listing.price?.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${listing.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                listing.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    listing.status === 'sold' ? 'bg-slate-100 text-slate-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {new Date(listing.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                to={`/listings/${listing.id}`}
                                                className="text-slate-600 hover:text-blue-600 p-1.5 hover:bg-slate-50 rounded-md transition-colors"
                                                title="View Listing"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </Link>
                                            <Link
                                                to={`/edit-listing/${listing.id}`}
                                                className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </Link>

                                            {listing.status === 'archived' ? (
                                                <button
                                                    onClick={() => handleStatusUpdate(listing.id, 'approved')}
                                                    className="text-purple-600 hover:text-purple-900 p-1.5 hover:bg-purple-50 rounded-md transition-colors"
                                                    title="Unarchive"
                                                >
                                                    <RotateCcw className="h-5 w-5" />
                                                </button>
                                            ) : (
                                                <>
                                                    {listing.status === 'sold' ? (
                                                        <button
                                                            onClick={() => handleStatusUpdate(listing.id, 'approved')}
                                                            className="text-orange-600 hover:text-orange-900 p-1.5 hover:bg-orange-50 rounded-md transition-colors"
                                                            title="Mark as Available"
                                                        >
                                                            <RotateCcw className="h-5 w-5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStatusUpdate(listing.id, 'sold')}
                                                            className="text-green-600 hover:text-green-900 p-1.5 hover:bg-green-50 rounded-md transition-colors"
                                                            title="Mark as Sold"
                                                        >
                                                            <CheckCircle2 className="h-5 w-5" />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleStatusUpdate(listing.id, 'archived')}
                                                        className="text-slate-500 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                                                        title="Archive"
                                                    >
                                                        <Archive className="h-5 w-5" />
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                onClick={() => handleDelete(listing.id)}
                                                className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
