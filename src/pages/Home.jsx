import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Car, Shield, Clock, Star, ChevronRight, ChevronLeft, MapPin, Phone, Truck, Navigation, Package, Gauge, Cog, CarFront, Bus, Mountain, Zap, Wind } from 'lucide-react';
import { SedanIcon, SUVIcon, TruckIcon, CoupeIcon, HatchbackIcon, ConvertibleIcon, VanIcon, WagonIcon } from '../components/CarIcons';
import LoadingCar from '../components/LoadingCar';
import ListingCard from '../components/ListingCard';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export default function Home() {
    const [recentListings, setRecentListings] = useState([]);
    const [featuredListings, setFeaturedListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [featuredLoading, setFeaturedLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchRecentListings() {
            try {
                const q = query(
                    collection(db, "listings"),
                    where("status", "in", ["approved", "sold"])
                );
                const querySnapshot = await getDocs(q);
                const now = new Date();
                const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

                const listings = querySnapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .filter(listing => {
                        if (listing.status === 'sold') {
                            const soldDate = listing.soldAt?.toDate ? listing.soldAt.toDate() : new Date(listing.soldAt);
                            return soldDate > twentyFourHoursAgo;
                        }
                        return true;
                    })
                    .sort((a, b) => {
                        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                        return dateB - dateA;
                    })
                    .slice(0, 8);
                setRecentListings(listings);
            } catch (error) {
                console.error("Error fetching recent listings:", error);
            } finally {
                setLoading(false);
            }
        }

        async function fetchFeaturedListings() {
            try {
                const q = query(
                    collection(db, "listings"),
                    where("status", "==", "approved"),
                    where("featured", "==", true)
                );
                const querySnapshot = await getDocs(q);
                const listings = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setFeaturedListings(listings);
            } catch (error) {
                console.error("Error fetching featured listings:", error);
            } finally {
                setFeaturedLoading(false);
            }
        }

        fetchRecentListings();
        fetchFeaturedListings();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/listings?keyword=${encodeURIComponent(searchTerm)}`);
        }
    };

    const brands = [
        { name: 'Toyota', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/120px-Toyota_carlogo.svg.png' },
        { name: 'Nissan', logo: 'https://pngimg.com/uploads/nissan/nissan_PNG77.png' },
        { name: 'Honda', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Honda_logo.svg/120px-Honda_logo.svg.png' },
        { name: 'Mercedes-Benz', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/120px-Mercedes-Logo.svg.png' },
        { name: 'BMW', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/BMW_logo_%28gray%29.svg/120px-BMW_logo_%28gray%29.svg.png' },
        { name: 'Audi', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/120px-Audi-Logo_2016.svg.png' },
        { name: 'Mazda', logo: 'https://pngimg.com/uploads/mazda/mazda_PNG52.png' },
        { name: 'Suzuki', logo: 'https://pngimg.com/uploads/suzuki/suzuki_PNG12291.png' },
        { name: 'Lexus', logo: 'https://pngimg.com/uploads/lexus/lexus_PNG22.png' },
        { name: 'Land Rover', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Land_Rover_logo_black.svg/120px-Land_Rover_logo_black.svg.png' },
        { name: 'Ford', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/120px-Ford_logo_flat.svg.png' },
        { name: 'Jeep', logo: 'https://pngimg.com/uploads/jeep/jeep_PNG95.png' },
        { name: 'Kia', logo: 'https://pngimg.com/uploads/kia/kia_PNG2.png' },
        { name: 'Hyundai', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Hyundai_Motor_Company_logo.svg/120px-Hyundai_Motor_Company_logo.svg.png' },
    ];

    const [currentBrandIndex, setCurrentBrandIndex] = useState(0);
    const brandsPerPage = 6;

    const nextBrands = () => {
        setCurrentBrandIndex((prev) =>
            prev + 1 > brands.length - brandsPerPage ? 0 : prev + 1
        );
    };

    const prevBrands = () => {
        setCurrentBrandIndex((prev) =>
            prev - 1 < 0 ? brands.length - brandsPerPage : prev - 1
        );
    };

    const bodyStyles = [
        { name: 'Convertible', icon: <ConvertibleIcon className="h-12 w-12" /> },
        { name: 'Coupe', icon: <CoupeIcon className="h-12 w-12" /> },
        { name: 'Hatchback', icon: <HatchbackIcon className="h-12 w-12" /> },
        { name: 'Sedan', icon: <SedanIcon className="h-12 w-12" /> },
        { name: 'SUV', icon: <SUVIcon className="h-12 w-12" /> },
        { name: 'Truck', icon: <TruckIcon className="h-12 w-12" /> },
        { name: 'Van', icon: <VanIcon className="h-12 w-12" /> },
        { name: 'Wagon', icon: <WagonIcon className="h-12 w-12" /> },
    ];

    const [currentBodyTypeIndex, setCurrentBodyTypeIndex] = useState(0);
    const bodyTypesPerPage = 6;

    const nextBodyTypes = () => {
        setCurrentBodyTypeIndex((prev) =>
            prev + 1 > bodyStyles.length - bodyTypesPerPage ? 0 : prev + 1
        );
    };

    const prevBodyTypes = () => {
        setCurrentBodyTypeIndex((prev) =>
            prev - 1 < 0 ? bodyStyles.length - bodyTypesPerPage : prev - 1
        );
    };

    const featuredDealerships = [
        { name: 'AutoGuyana Premium', location: 'Georgetown', rating: 4.9, image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80' },
        { name: 'Berbice Motors', location: 'New Amsterdam', rating: 4.7, image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=400&q=80' },
        { name: 'Essequibo Drives', location: 'Anna Regina', rating: 4.8, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80' },
        { name: 'Linden Auto Sales', location: 'Linden', rating: 4.6, image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=400&q=80' },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="relative bg-blue-900 text-white overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
                        alt="Hero Background"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-900/40"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                            Find Your Dream Car in Guyana
                        </h1>
                        <p className="text-xl text-blue-100 mb-8">
                            The most trusted marketplace for buying and selling vehicles.
                            Browse hundreds of verified listings today.
                        </p>

                        {/* Search Bar */}
                        <div className="bg-white p-2 rounded-lg shadow-lg max-w-2xl mb-8 flex flex-col sm:flex-row gap-2 focus-within-guyana-pulse transition-shadow duration-300">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by make, model, or keyword..."
                                    className="w-full pl-10 pr-4 py-3 rounded-md text-slate-900 focus:outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                            >
                                Search
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/listings"
                                className="inline-flex items-center justify-center px-8 py-3 border border-white text-lg font-medium rounded-lg text-white hover:bg-white/10 transition-colors"
                            >
                                Browse All Cars
                            </Link>
                            <Link
                                to="/create-listing"
                                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-medium rounded-lg text-blue-900 bg-blue-100 hover:bg-blue-200 transition-colors"
                            >
                                Sell Your Car
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popular Brands */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Popular Brands</h2>
                    <Link to="/brands" className="text-blue-600 font-medium hover:text-blue-700 flex items-center">
                        View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </div>

                <div className="relative group px-4">
                    {/* Left Button */}
                    <button
                        onClick={prevBrands}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all focus:outline-none"
                        aria-label="Previous brands"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    {/* Carousel Window */}
                    <div className="overflow-hidden -mx-4 px-4 py-2">
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentBrandIndex * (100 / brandsPerPage)}%)` }}
                        >
                            {brands.map((brand) => (
                                <div
                                    key={brand.name}
                                    className="flex-none w-1/2 md:w-1/3 lg:w-1/6 px-2"
                                >
                                    <Link
                                        to={`/listings?make=${encodeURIComponent(brand.name)}`}
                                        className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group h-full"
                                    >
                                        <div className="h-16 w-16 flex items-center justify-center mb-3">
                                            <img
                                                src={brand.logo}
                                                alt={`${brand.name} logo`}
                                                className="max-h-full max-w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                        </div>
                                        <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {brand.name}
                                        </span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Button */}
                    <button
                        onClick={nextBrands}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all focus:outline-none"
                        aria-label="Next brands"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Featured Listings */}
            <div className="bg-slate-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Featured Listings</h2>
                            <p className="text-slate-500 mt-1">Hand-picked vehicles for you</p>
                        </div>
                        <Link to="/listings" className="text-blue-600 font-medium hover:text-blue-700 flex items-center">
                            View All <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>

                    {featuredLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <LoadingCar />
                        </div>
                    ) : featuredListings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredListings.map((listing) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Car className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 text-lg">No featured listings available at the moment.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Browse by Body Type */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-16 border-y border-blue-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Browse by Body Type</h2>
                    <p className="text-blue-200 mb-8">Find your perfect vehicle style</p>

                    <div className="relative group px-4">
                        {/* Left Button */}
                        <button
                            onClick={prevBodyTypes}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all focus:outline-none"
                            aria-label="Previous body types"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>

                        {/* Carousel Window */}
                        <div className="overflow-hidden -mx-4 px-4 py-2">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${currentBodyTypeIndex * (100 / bodyTypesPerPage)}%)` }}
                            >
                                {bodyStyles.map((style) => (
                                    <div
                                        key={style.name}
                                        className="flex-none w-1/2 md:w-1/3 lg:w-1/6 px-2"
                                    >
                                        <Link
                                            to={`/listings?body=${encodeURIComponent(style.name)}`}
                                            className="flex flex-col items-center justify-center p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:border-white hover:bg-white hover:shadow-lg transition-all group h-full"
                                        >
                                            <div className="text-blue-200 group-hover:text-blue-600 transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-1 mb-4">
                                                {style.icon}
                                            </div>
                                            <span className="font-semibold text-white group-hover:text-slate-900 transition-colors text-center">
                                                {style.name}
                                            </span>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Button */}
                        <button
                            onClick={nextBodyTypes}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all focus:outline-none"
                            aria-label="Next body types"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Featured Dealerships */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Featured Dealerships</h2>
                        <p className="text-slate-500 mt-1">Top rated sellers in your area</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredDealerships.map((dealer) => (
                        <div key={dealer.name} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="h-32 overflow-hidden relative">
                                <img src={dealer.image} alt={dealer.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-3 left-3 text-white font-bold text-lg">{dealer.name}</div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center text-slate-500 text-sm">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {dealer.location}
                                    </div>
                                    <div className="flex items-center text-amber-500 font-bold text-sm">
                                        <Star className="h-4 w-4 mr-1 fill-current" />
                                        {dealer.rating}
                                    </div>
                                </div>
                                <button className="w-full mt-2 py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm">
                                    View Inventory
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* New Listings */}
            <div className="bg-slate-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">New Listings</h2>
                            <p className="text-slate-500 mt-1">Check out the latest vehicles added to our marketplace</p>
                        </div>
                        <Link to="/listings" className="text-blue-600 font-medium hover:text-blue-700 flex items-center">
                            View All <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <LoadingCar />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recentListings.slice(0, 12).map((listing) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Features / Trust Section */}
            <div className="bg-blue-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6">
                            <div className="h-12 w-12 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-6 w-6 text-blue-300" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Trusted Sellers</h3>
                            <p className="text-blue-200">Every listing is verified to ensure a safe buying experience.</p>
                        </div>
                        <div className="p-6">
                            <div className="h-12 w-12 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Car className="h-6 w-6 text-blue-300" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Wide Selection</h3>
                            <p className="text-blue-200">From sedans to trucks, find the perfect vehicle for your needs.</p>
                        </div>
                        <div className="p-6">
                            <div className="h-12 w-12 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star className="h-6 w-6 text-blue-300" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Easy Financing</h3>
                            <p className="text-blue-200">Connect with trusted local banks for vehicle financing options.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
