import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Search, Filter, X, Car, MapPin, Calendar, DollarSign, Gauge, ChevronLeft, ChevronRight, Cog, Fuel, Shield, Truck } from 'lucide-react';
import LoadingCar from '../components/LoadingCar';

export default function AllListings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        keyword: '',
        make: '',
        minPrice: '',
        maxPrice: '',
        minYear: '',
        maxYear: '',
        condition: '',
        transmission: '',
        fuelType: '',
        bodyType: '',
        minMileage: '',
        maxMileage: '',
        color: '',
        location: ''
    });

    // Sorting and Pagination State
    const [sortBy, setSortBy] = useState('newest');
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [currentPage, setCurrentPage] = useState(1);

    const location = useLocation();

    // Generate Year Options (1980 - 2026)
    const years = Array.from({ length: 2026 - 1980 + 1 }, (_, i) => 2026 - i);

    // Price Options (GYD)
    const priceOptions = [
        { value: 500000, label: '$500k' },
        { value: 1000000, label: '$1M' },
        { value: 2000000, label: '$2M' },
        { value: 3000000, label: '$3M' },
        { value: 5000000, label: '$5M' },
        { value: 7500000, label: '$7.5M' },
        { value: 10000000, label: '$10M' },
        { value: 15000000, label: '$15M' },
        { value: 20000000, label: '$20M' },
        { value: 30000000, label: '$30M+' }
    ];

    // Mileage Options (km)
    const mileageOptions = [
        { value: 10000, label: '10,000 km' },
        { value: 20000, label: '20,000 km' },
        { value: 30000, label: '30,000 km' },
        { value: 40000, label: '40,000 km' },
        { value: 50000, label: '50,000 km' },
        { value: 75000, label: '75,000 km' },
        { value: 100000, label: '100,000 km' },
        { value: 150000, label: '150,000 km' },
        { value: 200000, label: '200,000+ km' }
    ];

    // Vehicle Makes
    const vehicleMakes = [
        'Acura', 'Alfa Romeo', 'Audi', 'Bentley', 'BMW', 'BYD', 'Cadillac', 'Chevrolet',
        'Chrysler', 'Citroen', 'DAF', 'Daihatsu', 'Dodge', 'Fiat', 'Ford',
        'Foton', 'Genesis', 'GMC', 'Honda', 'Hummer', 'Hyundai',
        'Infiniti', 'Isuzu', 'Jaguar', 'Jeep', 'JMC', 'Kia', 'Land Rover',
        'Lexus', 'Mack', 'MAN', 'Mazda', 'Mercedes-Benz', 'MG', 'Mini', 'Mitsubishi',
        'Nissan', 'Peugeot', 'Porsche', 'Ram', 'Renault', 'Scion',
        'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'Yamaha', 'Other'
    ];

    // Guyana Locations
    const locations = [
        "Georgetown", "Linden", "New Amsterdam", "Anna Regina", "Bartica",
        "Corriverton", "Rose Hall", "Lethem", "Mabaruma", "Mahdia",
        "East Coast Demerara", "East Bank Demerara", "West Coast Demerara", "West Bank Demerara", "Essequibo Coast"
    ];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const keyword = params.get('keyword') || '';
        const make = params.get('make') || '';
        const bodyType = params.get('body') || '';

        setFilters(prev => ({
            ...prev,
            keyword,
            make,
            bodyType
        }));

        fetchListings();
    }, [location.search]);

    // Reset to page 1 when filters or sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, sortBy, itemsPerPage]);

    async function fetchListings() {
        setLoading(true);
        try {
            const q = query(collection(db, "listings"));
            const querySnapshot = await getDocs(q);
            const now = new Date();
            const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const data = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(listing => {
                    if (listing.status === 'approved') return true;
                    if (listing.status === 'sold') {
                        const soldDate = listing.soldAt?.toDate ? listing.soldAt.toDate() : new Date(listing.soldAt);
                        return soldDate > twentyFourHoursAgo;
                    }
                    return false;
                });

            setListings(data);
        } catch (error) {
            console.error("Error fetching listings:", error);
        } finally {
            setLoading(false);
        }
    }

    function handleFilterChange(e) {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    }

    const filteredListings = listings.filter(listing => {
        const matchKeyword = filters.keyword === '' ||
            listing.title?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
            listing.make?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
            listing.model?.toLowerCase().includes(filters.keyword.toLowerCase());

        const matchMake = filters.make === '' || listing.make?.toLowerCase().includes(filters.make.toLowerCase());
        const matchMinYear = filters.minYear === '' || listing.year >= Number(filters.minYear);
        const matchMaxYear = filters.maxYear === '' || listing.year <= Number(filters.maxYear);
        const matchMinPrice = filters.minPrice === '' || listing.price >= Number(filters.minPrice);
        const matchMaxPrice = filters.maxPrice === '' || listing.price <= Number(filters.maxPrice);
        const matchCondition = filters.condition === '' || listing.condition?.toLowerCase() === filters.condition.toLowerCase();
        const matchTransmission = filters.transmission === '' || listing.transmission?.toLowerCase() === filters.transmission.toLowerCase();
        const matchFuelType = filters.fuelType === '' || listing.fuelType?.toLowerCase() === filters.fuelType.toLowerCase();
        const matchBodyType = filters.bodyType === '' || listing.bodyType?.toLowerCase() === filters.bodyType.toLowerCase();
        const matchMinMileage = filters.minMileage === '' || listing.mileage >= Number(filters.minMileage);
        const matchMaxMileage = filters.maxMileage === '' || listing.mileage <= Number(filters.maxMileage);
        const matchColor = filters.color === '' || listing.color?.toLowerCase().includes(filters.color.toLowerCase());

        // Location filter is currently a placeholder as requested
        // const matchLocation = filters.location === '' || listing.location?.toLowerCase().includes(filters.location.toLowerCase());

        return matchKeyword && matchMake && matchMinYear && matchMaxYear && matchMinPrice && matchMaxPrice &&
            matchCondition && matchTransmission && matchFuelType && matchBodyType && matchMinMileage && matchMaxMileage && matchColor;
    });

    // Sorting Logic
    const sortedListings = [...filteredListings].sort((a, b) => {
        switch (sortBy) {
            case 'price_asc':
                return (a.price || 0) - (b.price || 0);
            case 'price_desc':
                return (b.price || 0) - (a.price || 0);
            case 'mileage_asc':
                return (a.mileage || 0) - (b.mileage || 0);
            case 'year_desc':
                return (b.year || 0) - (a.year || 0);
            case 'year_asc':
                return (a.year || 0) - (b.year || 0);
            case 'newest':
            default:
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return dateB - dateA;
        }
    });

    // Pagination Logic
    const totalPages = Math.ceil(sortedListings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedListings = sortedListings.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Banner */}
            <div className="bg-slate-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold tracking-tight">Find Your Perfect Ride</h1>
                    <p className="mt-2 text-slate-400 text-lg">Browse our extensive collection of quality vehicles.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Styled Sidebar Filter */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-lg border border-blue-100 sticky top-24 overflow-hidden">
                            <div className="p-5 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white flex justify-between items-center">
                                <div className="flex items-center text-blue-900 font-bold text-lg">
                                    <Filter className="h-5 w-5 mr-2 text-blue-600" />
                                    Filters
                                </div>
                                {Object.values(filters).some(v => v !== '') && (
                                    <button
                                        onClick={() => setFilters({ keyword: '', make: '', minPrice: '', maxPrice: '', minYear: '', maxYear: '', condition: '', transmission: '', fuelType: '', bodyType: '', minMileage: '', maxMileage: '', color: '', location: '' })}
                                        className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center transition-colors bg-red-50 px-2 py-1 rounded-md"
                                    >
                                        <X className="h-3 w-3 mr-1" /> Clear All
                                    </button>
                                )}
                            </div>

                            <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">

                                {/* Location (Placeholder) */}
                                <div>
                                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        <MapPin className="h-3 w-3 mr-1" /> Location
                                    </label>
                                    <select
                                        name="location"
                                        value={filters.location}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    >
                                        <option value="">All Locations</option>
                                        {locations.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Make Dropdown */}
                                <div>
                                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        <Car className="h-3 w-3 mr-1" /> Make
                                    </label>
                                    <select
                                        name="make"
                                        value={filters.make}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    >
                                        <option value="">All Makes</option>
                                        {vehicleMakes.map(make => (
                                            <option key={make} value={make}>{make}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Year Range */}
                                <div>
                                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        <Calendar className="h-3 w-3 mr-1" /> Year Range
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <select
                                            name="minYear"
                                            value={filters.minYear}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        >
                                            <option value="">Min Year</option>
                                            {years.map(year => (
                                                <option key={`min-${year}`} value={year}>{year}</option>
                                            ))}
                                        </select>
                                        <select
                                            name="maxYear"
                                            value={filters.maxYear}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        >
                                            <option value="">Max Year</option>
                                            {years.map(year => (
                                                <option key={`max-${year}`} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        <DollarSign className="h-3 w-3 mr-1" /> Price Range (GYD)
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <select
                                            name="minPrice"
                                            value={filters.minPrice}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        >
                                            <option value="">Min Price</option>
                                            {priceOptions.map(opt => (
                                                <option key={`min-${opt.value}`} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <select
                                            name="maxPrice"
                                            value={filters.maxPrice}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        >
                                            <option value="">Max Price</option>
                                            {priceOptions.map(opt => (
                                                <option key={`max-${opt.value}`} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Mileage Range */}
                                <div>
                                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        <Gauge className="h-3 w-3 mr-1" /> Mileage
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <select
                                            name="minMileage"
                                            value={filters.minMileage}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        >
                                            <option value="">Min km</option>
                                            {mileageOptions.map(opt => (
                                                <option key={`min-${opt.value}`} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <select
                                            name="maxMileage"
                                            value={filters.maxMileage}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        >
                                            <option value="">Max km</option>
                                            {mileageOptions.map(opt => (
                                                <option key={`max-${opt.value}`} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Condition */}
                                <div>
                                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        <Shield className="h-3 w-3 mr-1" /> Condition
                                    </label>
                                    <select
                                        name="condition"
                                        value={filters.condition}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    >
                                        <option value="">Any Condition</option>
                                        <option value="new">New</option>
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="salvage">Salvage</option>
                                    </select>
                                </div>

                                {/* Body Type */}
                                <div>
                                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        <Truck className="h-3 w-3 mr-1" /> Body Type
                                    </label>
                                    <select
                                        name="bodyType"
                                        value={filters.bodyType}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    >
                                        <option value="">Any Body Type</option>
                                        <option value="sedan">Sedan</option>
                                        <option value="suv">SUV</option>
                                        <option value="truck">Truck</option>
                                        <option value="coupe">Coupe</option>
                                        <option value="convertible">Convertible</option>
                                        <option value="hatchback">Hatchback</option>
                                        <option value="van">Van</option>
                                        <option value="wagon">Wagon</option>
                                    </select>
                                </div>

                                {/* Transmission */}
                                <div>
                                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        <Cog className="h-3 w-3 mr-1" /> Transmission
                                    </label>
                                    <select
                                        name="transmission"
                                        value={filters.transmission}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    >
                                        <option value="">Any Transmission</option>
                                        <option value="automatic">Automatic</option>
                                        <option value="manual">Manual</option>
                                        <option value="cvt">CVT</option>
                                    </select>
                                </div>

                                {/* Fuel Type */}
                                <div>
                                    <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        <Fuel className="h-3 w-3 mr-1" /> Fuel Type
                                    </label>
                                    <select
                                        name="fuelType"
                                        value={filters.fuelType}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    >
                                        <option value="">Any Fuel Type</option>
                                        <option value="gasoline">Gasoline</option>
                                        <option value="diesel">Diesel</option>
                                        <option value="electric">Electric</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>

                                {/* Color */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Color</label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={filters.color}
                                        onChange={handleFilterChange}
                                        placeholder="e.g. Silver"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Listings Grid Area */}
                    <div className="flex-1">

                        {/* Independent Search Bar */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="keyword"
                                    value={filters.keyword}
                                    onChange={handleFilterChange}
                                    placeholder="Search by make, model, or keywords..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                                Search
                            </button>
                        </div>

                        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-slate-600 font-medium">
                                Showing <span className="text-slate-900 font-bold">{filteredListings.length}</span> vehicles
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500 whitespace-nowrap">Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                                    >
                                        <option value="newest">Newest Listed</option>
                                        <option value="price_asc">Lowest Price</option>
                                        <option value="price_desc">Highest Price</option>
                                        <option value="mileage_asc">Lowest Mileage</option>
                                        <option value="year_desc">Newest Year</option>
                                        <option value="year_asc">Oldest Year</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500 whitespace-nowrap">Show:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                                    >
                                        <option value={12}>12</option>
                                        <option value={24}>24</option>
                                        <option value={48}>48</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <LoadingCar />
                            </div>
                        ) : filteredListings.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                                <div className="mx-auto h-12 w-12 text-slate-300 mb-4">
                                    <Search className="h-full w-full" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">No vehicles found</h3>
                                <p className="mt-2 text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
                                <button
                                    onClick={() => setFilters({ keyword: '', make: '', minPrice: '', maxPrice: '', minYear: '', maxYear: '', condition: '', transmission: '', fuelType: '', bodyType: '', minMileage: '', maxMileage: '', color: '', location: '' })}
                                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedListings.map((listing) => (
                                    <Link key={listing.id} to={`/listings/${listing.id}`} className="group block">
                                        <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-blue-200 flex flex-col h-full transform hover:-translate-y-1">
                                            <div className="h-48 bg-slate-200 relative overflow-hidden">
                                                {listing.imageUrls && listing.imageUrls[0] ? (
                                                    <img
                                                        src={listing.imageUrls[0]}
                                                        alt={listing.title}
                                                        className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ${listing.status === 'sold' ? 'grayscale' : ''}`}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                                        <Car className="h-12 w-12 opacity-20" />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-slate-900 shadow-sm border border-slate-100">
                                                    {listing.year}
                                                </div>
                                                {listing.status === 'sold' && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                                                        <span className="bg-red-600 text-white px-4 py-1 rounded-full font-bold transform -rotate-12 shadow-lg border-2 border-white">
                                                            SOLD
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <p className="text-white text-xs font-medium truncate">View Details &rarr;</p>
                                                </div>
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="mb-2">
                                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">{listing.make}</p>
                                                    <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">{listing.title}</h3>
                                                </div>
                                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{listing.description}</p>
                                                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                                                    <span className={`text-xl font-bold transition-colors ${listing.status === 'sold' ? 'text-slate-500 line-through' : 'text-slate-900 group-hover:text-blue-600'}`}>
                                                        ${listing.price?.toLocaleString()}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        {listing.model}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {!loading && filteredListings.length > 0 && (
                            <div className="mt-8 flex justify-center items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg border ${currentPage === 1 ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg border ${currentPage === totalPages ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
