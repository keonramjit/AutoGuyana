import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { X, ImagePlus, CheckCircle2, Car, DollarSign } from 'lucide-react';

export default function CreateListing() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [images, setImages] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        vin: '',
        make: '',
        model: '',
        year: '',
        price: '',
        hirePurchase: false,
        condition: '',
        mileage: '',
        transmission: '',
        fuelType: '',
        bodyType: '',
        engineSize: '',
        color: '',
        description: '',
        features: {
            safety: [],
            comfort: [],
            interior: [],
            exterior: []
        }
    });

    function handleChange(e) {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    }

    function toggleFeature(category, feature) {
        setFormData(prev => {
            const categoryFeatures = prev.features[category];
            const isChecked = categoryFeatures.includes(feature);

            return {
                ...prev,
                features: {
                    ...prev.features,
                    [category]: isChecked
                        ? categoryFeatures.filter(f => f !== feature)
                        : [...categoryFeatures, feature]
                }
            };
        });
    }

    function handleImageChange(e) {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);
            if (images.length + newImages.length > 10) {
                setError('Maximum 10 images allowed');
                return;
            }
            setImages(prev => [...prev, ...newImages]);
            setError('');
        }
    }

    function removeImage(index) {
        setImages(prev => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(e, submitStatus = 'pending') {
        e.preventDefault();
        if (!currentUser) return;

        if (images.length === 0) {
            setError('Please upload at least one image');
            return;
        }

        setLoading(true);
        setStatus('Initializing upload...');
        setError('');

        try {
            const imageUrls = [];
            for (let i = 0; i < images.length; i++) {
                setStatus(`Uploading image ${i + 1} of ${images.length}...`);
                const image = images[i];
                const storageRef = ref(storage, `listings/${currentUser.uid}/${Date.now()}_${image.name}`);
                const snapshot = await uploadBytes(storageRef, image);
                const url = await getDownloadURL(snapshot.ref);
                imageUrls.push(url);
            }

            setStatus('Saving listing details...');
            const listingData = {
                ...formData,
                price: Number(formData.price),
                year: Number(formData.year),
                mileage: formData.mileage ? Number(formData.mileage) : null,
                sellerId: currentUser.uid,
                sellerEmail: currentUser.email,
                imageUrls: imageUrls,
                status: submitStatus === 'pending' ? 'approved' : submitStatus, // Auto-approve for testing
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, "listings"), listingData);

            setStatus('Success!');
            setTimeout(() => {
                navigate('/my-listings');
            }, 1000);
        } catch (err) {
            console.error("Error creating listing:", err);
            setError(err.message);
            setLoading(false);
            setStatus('');
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
                    <h1 className="text-4xl font-bold mb-2">Add New Listing</h1>
                    <p className="text-blue-100 text-lg">Fill in the details below to list your vehicle and reach thousands of potential buyers</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Photo Upload Section */}
                    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <ImagePlus className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Upload Photos *</h2>
                                <p className="text-sm text-slate-600">Add up to 10 photos. The first image will be the cover photo.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {images.map((image, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 group">
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    {index === 0 && (
                                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium">
                                            Cover
                                        </div>
                                    )}
                                </div>
                            ))}

                            {images.length < 10 && (
                                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50">
                                    <ImagePlus className="h-8 w-8 text-slate-400 mb-2" />
                                    <span className="text-xs text-slate-600">Add Photo</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Car Details Section */}
                    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Car className="h-6 w-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Vehicle Specifications</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="md:col-span-2 lg:col-span-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Listing Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. 2020 Toyota Camry XLE - Low Mileage"
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Make *</label>
                                <select
                                    name="make"
                                    value={formData.make}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
                                >
                                    <option value="">Select Make</option>
                                    <option value="Acura">Acura</option>
                                    <option value="Alfa Romeo">Alfa Romeo</option>
                                    <option value="Audi">Audi</option>

                                    <option value="Bentley">Bentley</option>
                                    <option value="BMW">BMW</option>
                                    <option value="BYD">BYD</option>
                                    <option value="Cadillac">Cadillac</option>

                                    <option value="Chevrolet">Chevrolet</option>

                                    <option value="Chrysler">Chrysler</option>
                                    <option value="Citroen">Citroen</option>
                                    <option value="DAF">DAF</option>
                                    <option value="Daihatsu">Daihatsu</option>
                                    <option value="Dodge">Dodge</option>
                                    <option value="Dongfeng">Dongfeng</option>
                                    <option value="Ferrari">Ferrari</option>
                                    <option value="Fiat">Fiat</option>
                                    <option value="Ford">Ford</option>
                                    <option value="Foton">Foton</option>

                                    <option value="Genesis">Genesis</option>
                                    <option value="GMC">GMC</option>



                                    <option value="Honda">Honda</option>
                                    <option value="Hummer">Hummer</option>
                                    <option value="Hyundai">Hyundai</option>
                                    <option value="Infiniti">Infiniti</option>
                                    <option value="Isuzu">Isuzu</option>

                                    <option value="Jaguar">Jaguar</option>
                                    <option value="Jeep">Jeep</option>

                                    <option value="JMC">JMC</option>
                                    <option value="Kia">Kia</option>

                                    <option value="Land Rover">Land Rover</option>
                                    <option value="Lexus">Lexus</option>

                                    <option value="Mack">Mack</option>
                                    <option value="MAN">MAN</option>

                                    <option value="Mazda">Mazda</option>
                                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                                    <option value="MG">MG</option>
                                    <option value="Mini">Mini</option>
                                    <option value="Mitsubishi">Mitsubishi</option>
                                    <option value="Nissan">Nissan</option>
                                    <option value="Peugeot">Peugeot</option>
                                    <option value="Porsche">Porsche</option>
                                    <option value="Ram">Ram</option>
                                    <option value="Renault">Renault</option>

                                    <option value="Scion">Scion</option>


                                    <option value="Subaru">Subaru</option>
                                    <option value="Suzuki">Suzuki</option>
                                    <option value="Tesla">Tesla</option>
                                    <option value="Toyota">Toyota</option>
                                    <option value="Volkswagen">Volkswagen</option>
                                    <option value="Volvo">Volvo</option>
                                    <option value="Yamaha">Yamaha</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Model *</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    placeholder="e.g. Camry"
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Body Type *</label>
                                <select
                                    name="bodyType"
                                    value={formData.bodyType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Sedan">Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="Truck">Truck</option>
                                    <option value="Coupe">Coupe</option>
                                    <option value="Convertible">Convertible</option>
                                    <option value="Hatchback">Hatchback</option>
                                    <option value="Van">Van</option>
                                    <option value="Wagon">Wagon</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Year *</label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    placeholder="2020"
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Condition *</label>
                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="New">New</option>
                                    <option value="Excellent">Excellent</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                    <option value="Salvage">Salvage</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mileage (km)</label>
                                <input
                                    type="number"
                                    name="mileage"
                                    value={formData.mileage}
                                    onChange={handleChange}
                                    placeholder="50000"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Transmission</label>
                                <select
                                    name="transmission"
                                    value={formData.transmission}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Automatic">Automatic</option>
                                    <option value="Manual">Manual</option>
                                    <option value="CVT">CVT</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Type</label>
                                <select
                                    name="fuelType"
                                    value={formData.fuelType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="Gasoline">Gasoline</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Electric">Electric</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Engine Size (CC)</label>
                                <input
                                    type="text"
                                    name="engineSize"
                                    value={formData.engineSize}
                                    onChange={handleChange}
                                    placeholder="e.g. 1600, 2000, 3500"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    placeholder="e.g. Silver"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">VIN / Chassis No.</label>
                                <input
                                    type="text"
                                    name="vin"
                                    value={formData.vin}
                                    onChange={handleChange}
                                    placeholder="e.g. JTDB..."
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing Section */}
                    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Pricing</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price (GYD) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="4500000"
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="flex items-center">
                                <label className="flex items-center gap-3 cursor-pointer group p-4 border border-slate-200 rounded-lg w-full hover:border-blue-300 hover:bg-blue-50 transition-all">
                                    <input
                                        type="checkbox"
                                        name="hirePurchase"
                                        checked={formData.hirePurchase}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="block font-medium text-slate-900">Available for Hire Purchase</span>
                                        <span className="text-xs text-slate-500">Check this if you accept installment payments</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <CheckCircle2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Vehicle Features</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                            {/* Safety Features */}
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-3 text-sm">Safety</h3>
                                <div className="space-y-2">
                                    {['Anti-Lock Braking System', 'Airbags', 'Traction Control', 'Stability Control', 'Parking Sensors', 'Backup Camera', 'Blind Spot Monitor', 'Lane Departure Warning', 'Adaptive Cruise Control'].map((feature) => (
                                        <label key={feature} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.features.safety.includes(feature)}
                                                onChange={() => toggleFeature('safety', feature)}
                                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700 group-hover:text-slate-900">{feature}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Comfort & Convenience */}
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-3 text-sm">Comfort & Convenience</h3>
                                <div className="space-y-2">
                                    {['Air Conditioning', 'Climate Control', 'Heated Seats', 'Ventilated Seats', 'Power Seats', 'Leather Seats', 'Sunroof', 'Keyless Entry', 'Push Button Start', 'Cruise Control'].map((feature) => (
                                        <label key={feature} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.features.comfort.includes(feature)}
                                                onChange={() => toggleFeature('comfort', feature)}
                                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700 group-hover:text-slate-900">{feature}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Interior Features */}
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-3 text-sm">Interior</h3>
                                <div className="space-y-2">
                                    {['Premium Sound System', 'Navigation System', 'Touchscreen Display', 'Apple CarPlay', 'Android Auto', 'Wireless Charging', 'USB Ports', 'Ambient Lighting', 'Power Windows', 'Tinted Windows'].map((feature) => (
                                        <label key={feature} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.features.interior.includes(feature)}
                                                onChange={() => toggleFeature('interior', feature)}
                                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700 group-hover:text-slate-900">{feature}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Exterior Features */}
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-3 text-sm">Exterior</h3>
                                <div className="space-y-2">
                                    {['Alloy Wheels', 'LED Headlights', 'Fog Lights', 'Roof Rack', 'Spoiler', 'Running Boards', 'Power Mirrors', 'Heated Mirrors', 'Rain Sensing Wipers', 'Tow Package'].map((feature) => (
                                        <label key={feature} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.features.exterior.includes(feature)}
                                                onChange={() => toggleFeature('exterior', feature)}
                                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700 group-hover:text-slate-900">{feature}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Description</h2>
                        </div>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Provide a detailed description of the vehicle, including any special features, service history, or other important information..."
                            rows="6"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                        ></textarea>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {status && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            {status}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/my-listings')}
                            className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, 'draft')}
                            disabled={loading}
                            className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-300 transition-colors"
                        >
                            Save as Draft
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? status : 'Submit Listing'}
                        </button>
                    </div>

                    <p className="text-xs text-slate-500 text-center">
                        Your listing will be reviewed by our team before being published.
                    </p>
                </form>
            </div>
        </div>
    );
}
