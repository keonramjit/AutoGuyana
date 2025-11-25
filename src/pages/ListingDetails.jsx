import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import {
    ArrowLeft,
    Heart,
    Share2,
    Calendar,
    Gauge,
    Fuel,
    Car,
    MapPin,
    Mail,
    Phone,
    ChevronLeft,
    ChevronRight,
    Cog,
    Palette,
    CheckCircle2,
    Shield,
    Wind,
    Zap,
    FileText,
    CreditCard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingCar from '../components/LoadingCar';
import ListingCard from '../components/ListingCard';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';

export default function ListingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [similarListings, setSimilarListings] = useState([]);

    useEffect(() => {
        if (listing) {
            fetchSimilarListings();
        }
    }, [listing]);

    useEffect(() => {
        fetchListing();
        checkFavoriteStatus();
    }, [id, currentUser]);

    async function checkFavoriteStatus() {
        if (!currentUser) return;
        try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.favorites && userData.favorites.includes(id)) {
                    setIsFavorite(true);
                } else {
                    setIsFavorite(false);
                }
            }
        } catch (error) {
            console.error("Error checking favorite status:", error);
        }
    }

    async function handleToggleWatchlist() {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        try {
            const userRef = doc(db, "users", currentUser.uid);
            if (isFavorite) {
                await updateDoc(userRef, {
                    favorites: arrayRemove(id)
                });
                setIsFavorite(false);
            } else {
                await updateDoc(userRef, {
                    favorites: arrayUnion(id)
                });
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Error toggling watchlist:", error);
        }
    }

    async function fetchListing() {
        try {
            const docRef = doc(db, 'listings', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setListing({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.error('Listing not found');
            }
        } catch (error) {
            console.error('Error fetching listing:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchSimilarListings() {
        if (!listing) return;
        try {
            const q = query(
                collection(db, 'listings'),
                where('make', '==', listing.make),
                limit(4)
            );
            const querySnapshot = await getDocs(q);
            const similar = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(item => item.id !== listing.id)
                .slice(0, 3);

            setSimilarListings(similar);
        } catch (error) {
            console.error("Error fetching similar listings:", error);
        }
    }

    function nextImage() {
        if (listing?.imageUrls) {
            setCurrentImageIndex((prev) =>
                prev === listing.imageUrls.length - 1 ? 0 : prev + 1
            );
        }
    }

    function prevImage() {
        if (listing?.imageUrls) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? listing.imageUrls.length - 1 : prev - 1
            );
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <LoadingCar />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Car className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Vehicle Not Found</h2>
                    <p className="text-slate-600 mb-6">This listing may have been removed or is no longer available.</p>
                    <Link to="/listings" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to All Vehicles
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Back Button */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Images & Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Image Gallery */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="relative">
                                {listing.imageUrls && listing.imageUrls.length > 0 ? (
                                    <>
                                        <div className="aspect-[16/9] bg-slate-200 relative">
                                            <img
                                                src={listing.imageUrls[currentImageIndex]}
                                                alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                                                className={`w-full h-full object-cover ${listing.status === 'sold' ? 'grayscale' : ''}`}
                                            />
                                            {listing.status === 'sold' && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                                    <span className="bg-red-600 text-white px-8 py-2 rounded-full font-bold text-xl transform -rotate-12 shadow-xl border-4 border-white">
                                                        SOLD
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {listing.imageUrls.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                                                >
                                                    <ChevronLeft className="h-6 w-6 text-slate-900" />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                                                >
                                                    <ChevronRight className="h-6 w-6 text-slate-900" />
                                                </button>

                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                    {listing.imageUrls.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setCurrentImageIndex(index)}
                                                            className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-6' : 'bg-white/60'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="aspect-[16/9] bg-slate-200 flex items-center justify-center">
                                        <Car className="h-24 w-24 text-slate-400 opacity-20" />
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Grid */}
                            {listing.imageUrls && listing.imageUrls.length > 1 && (
                                <div className="p-4 grid grid-cols-6 gap-2">
                                    {listing.imageUrls.map((url, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                                                }`}
                                        >
                                            <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Vehicle Specifications */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Vehicle Specifications</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-2.5 rounded-lg">
                                        <Car className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Make</p>
                                        <p className="font-semibold text-slate-900">{listing.make}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-2.5 rounded-lg">
                                        <Car className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Model</p>
                                        <p className="font-semibold text-slate-900">{listing.model}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-2.5 rounded-lg">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Year</p>
                                        <p className="font-semibold text-slate-900">{listing.year}</p>
                                    </div>
                                </div>

                                {listing.condition && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 p-2.5 rounded-lg">
                                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Condition</p>
                                            <p className="font-semibold text-slate-900 capitalize">{listing.condition}</p>
                                        </div>
                                    </div>
                                )}

                                {listing.mileage && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 p-2.5 rounded-lg">
                                            <Gauge className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Mileage</p>
                                            <p className="font-semibold text-slate-900">{listing.mileage?.toLocaleString()} km</p>
                                        </div>
                                    </div>
                                )}

                                {listing.transmission && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 p-2.5 rounded-lg">
                                            <Cog className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Transmission</p>
                                            <p className="font-semibold text-slate-900 capitalize">{listing.transmission}</p>
                                        </div>
                                    </div>
                                )}

                                {listing.fuelType && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 p-2.5 rounded-lg">
                                            <Fuel className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Fuel Type</p>
                                            <p className="font-semibold text-slate-900 capitalize">{listing.fuelType}</p>
                                        </div>
                                    </div>
                                )}

                                {listing.engineSize && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 p-2.5 rounded-lg">
                                            <Cog className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Engine Size</p>
                                            <p className="font-semibold text-slate-900">{listing.engineSize} CC</p>
                                        </div>
                                    </div>
                                )}

                                {listing.bodyType && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 p-2.5 rounded-lg">
                                            <Car className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Body Type</p>
                                            <p className="font-semibold text-slate-900 capitalize">{listing.bodyType}</p>
                                        </div>
                                    </div>
                                )}

                                {listing.color && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 p-2.5 rounded-lg">
                                            <Palette className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Color</p>
                                            <p className="font-semibold text-slate-900 capitalize">{listing.color}</p>
                                        </div>
                                    </div>
                                )}

                                {listing.vin && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 p-2.5 rounded-lg">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">VIN</p>
                                            <p className="font-semibold text-slate-900">{listing.vin}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vehicle Description */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Description</h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                {listing.description || 'No description available.'}
                            </p>
                        </div>

                        {/* Features Section */}
                        {listing.features && (Object.keys(listing.features).some(category => listing.features[category]?.length > 0)) && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Features & Equipment</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {listing.features.safety && listing.features.safety.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-blue-600" />
                                                Safety Features
                                            </h3>
                                            <ul className="space-y-2">
                                                {listing.features.safety.map((feature, index) => (
                                                    <li key={index} className="flex items-center gap-2 text-slate-600 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {listing.features.comfort && listing.features.comfort.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <Wind className="h-5 w-5 text-blue-600" />
                                                Comfort Features
                                            </h3>
                                            <ul className="space-y-2">
                                                {listing.features.comfort.map((feature, index) => (
                                                    <li key={index} className="flex items-center gap-2 text-slate-600 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {listing.features.interior && listing.features.interior.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <Car className="h-5 w-5 text-blue-600" />
                                                Interior Features
                                            </h3>
                                            <ul className="space-y-2">
                                                {listing.features.interior.map((feature, index) => (
                                                    <li key={index} className="flex items-center gap-2 text-slate-600 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {listing.features.exterior && listing.features.exterior.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <Zap className="h-5 w-5 text-blue-600" />
                                                Exterior Features
                                            </h3>
                                            <ul className="space-y-2">
                                                {listing.features.exterior.map((feature, index) => (
                                                    <li key={index} className="flex items-center gap-2 text-slate-600 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Price & Contact */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-32 space-y-6">

                            {/* Title & Price */}
                            <div>
                                <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide mb-2">
                                    {listing.make} {listing.model}
                                </p>
                                <h1 className="text-3xl font-bold text-slate-900 mb-4">{listing.title}</h1>
                                <div className={`text-4xl font-bold ${listing.status === 'sold' ? 'text-slate-500 line-through' : 'text-blue-600'}`}>
                                    ${listing.price?.toLocaleString()}
                                </div>
                                <p className="text-sm text-slate-500 mt-1">GYD</p>
                                {listing.hirePurchase && (
                                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200">
                                        <CreditCard className="h-4 w-4" />
                                        <span className="text-sm font-medium">Available for Hire Purchase</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-200 pt-6">
                                <h3 className="font-semibold text-slate-900 mb-3">Seller Information</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Mail className="h-4 w-4" />
                                        <span>{listing.sellerEmail}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Buttons */}
                            <div className="space-y-3 pt-4 border-t border-slate-200">
                                {listing.status === 'sold' ? (
                                    <button
                                        disabled
                                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-slate-100 text-slate-400 font-semibold rounded-lg cursor-not-allowed border border-slate-200"
                                    >
                                        <span className="mr-2">🚫</span>
                                        Vehicle Sold
                                    </button>
                                ) : (
                                    <a
                                        href={`mailto:${listing.sellerEmail}?subject=Inquiry about ${listing.title}`}
                                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Mail className="h-5 w-5 mr-2" />
                                        Contact Seller
                                    </a>
                                )}

                                <button
                                    onClick={handleToggleWatchlist}
                                    className={`w-full inline-flex items-center justify-center px-6 py-3 border-2 font-semibold rounded-lg transition-colors ${isFavorite
                                        ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                                    {isFavorite ? 'Remove from Watchlist' : 'Add to Watchlist'}
                                </button>
                            </div>

                            {/* Listed Date */}
                            <div className="text-xs text-slate-500 pt-4 border-t border-slate-200">
                                Listed on {listing.createdAt?.toDate ?
                                    listing.createdAt.toDate().toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Listings Section */}
                {similarListings.length > 0 && (
                    <div className="mt-12 border-t border-slate-200 pt-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">You Might Also Like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {similarListings.map(item => (
                                <ListingCard key={item.id} listing={item} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
