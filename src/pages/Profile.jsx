import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage, auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User, Camera, Save, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import GuyanaFlag from '../components/GuyanaFlag';

export default function Profile() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phoneNumber: '',
        countryCode: '+592',
        photoURL: '',
        dealershipName: '',
        dealershipAddress: '',
        contactNumber1: '',
        contactNumber2: '',
        dealershipEmail: '',
        bannerURL: '',
        openingHours: {
            monFri: { open: '', close: '' },
            saturday: { open: '', close: '', isClosed: false },
            sunday: { open: '', close: '', isClosed: false }
        }
    });

    const countryCodes = [
        { code: '+592', country: 'Guyana' },
        { code: '+1', country: 'USA/Canada' },
        { code: '+44', country: 'UK' },
        { code: '+597', country: 'Suriname' },
        { code: '+55', country: 'Brazil' },
        { code: '+58', country: 'Venezuela' },
    ];

    useEffect(() => {
        if (currentUser) {
            fetchUserData();
        }
    }, [currentUser]);

    // Debounce username check
    useEffect(() => {
        const checkUsername = async () => {
            if (!formData.username || formData.username.length < 3) {
                setUsernameError('');
                return;
            }

            try {
                const q = query(
                    collection(db, "users"),
                    where("username", "==", formData.username)
                );
                const querySnapshot = await getDocs(q);

                // Check if username exists and belongs to another user
                const isTaken = querySnapshot.docs.some(doc => doc.id !== currentUser.uid);

                if (isTaken) {
                    setUsernameError('Username is already taken');
                } else {
                    setUsernameError('');
                }
            } catch (err) {
                console.error("Error checking username:", err);
            }
        };

        const timeoutId = setTimeout(() => {
            if (formData.username) checkUsername();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.username, currentUser]);

    async function fetchUserData() {
        try {
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    username: data.username || '',
                    email: currentUser.email || '',
                    phoneNumber: data.phoneNumber || '',
                    countryCode: data.countryCode || '+592',
                    photoURL: data.photoURL || currentUser.photoURL || '',
                    dealershipName: data.dealershipName || '',
                    dealershipAddress: data.dealershipAddress || '',
                    contactNumber1: data.contactNumber1 || '',
                    contactNumber2: data.contactNumber2 || '',
                    dealershipEmail: data.dealershipEmail || '',
                    bannerURL: data.bannerURL || '',
                    openingHours: data.openingHours || {
                        monFri: { open: '', close: '' },
                        saturday: { open: '', close: '', isClosed: false },
                        sunday: { open: '', close: '', isClosed: false }
                    }
                });
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, day, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [day]: {
                        ...prev[parent][day],
                        [field]: type === 'checkbox' ? checked : value
                    }
                }
            }));
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
        setError('');
        setSuccess('');
    }

    async function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size (max 5MB)
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB.');
            return;
        }

        try {
            setSaving(true);
            const storageRef = ref(storage, `profile_photos/${currentUser.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            setFormData(prev => ({ ...prev, photoURL: downloadURL }));

            // Update immediately in Firestore
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, { photoURL: downloadURL });

            // Update Firebase Auth Profile
            await updateProfile(currentUser, { photoURL: downloadURL });

            // Force reload to update navbar
            window.location.reload();

            setSuccess('Profile photo updated successfully!');
        } catch (err) {
            console.error("Error uploading image:", err);
            setError("Failed to upload image.");
        } finally {
            setSaving(false);
        }
    }

    async function handleBannerUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB.');
            return;
        }

        try {
            setSaving(true);
            const storageRef = ref(storage, `dealership_banners/${currentUser.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            setFormData(prev => ({ ...prev, bannerURL: downloadURL }));
            setSuccess('Banner uploaded! Save changes to persist.');
        } catch (err) {
            console.error("Error uploading banner:", err);
            setError("Failed to upload banner.");
        } finally {
            setSaving(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (usernameError) return;

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                phoneNumber: formData.phoneNumber,
                countryCode: formData.countryCode,
                dealershipName: formData.dealershipName,
                dealershipAddress: formData.dealershipAddress,
                contactNumber1: formData.contactNumber1,
                contactNumber2: formData.contactNumber2,
                dealershipEmail: formData.dealershipEmail,
                bannerURL: formData.bannerURL,
                openingHours: formData.openingHours,
                updatedAt: new Date().toISOString()
            });
            setSuccess('Profile updated successfully!');
        } catch (err) {
            console.error("Error updating profile:", err);
            setError("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Cover Image Area - Increased height for more spacing */}
            <div className="h-64 bg-gradient-to-r from-blue-600 to-blue-800 w-full relative">
                <div className="absolute inset-0 bg-black/10"></div>
            </div>

            {/* Main Content Container - Adjusted negative margin to position card */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="px-6 py-8 sm:p-10">

                        {/* Profile Photo Section - Adjusted margin to position avatar */}
                        <div className="flex flex-col items-center mt-0 mb-6">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                {/* Gradient border container */}
                                <div className="h-36 w-36 rounded-full p-1 bg-gradient-to-r from-[#009E49] via-[#FCD116] to-[#CE1126] shadow-[0_0_20px_rgba(0,158,73,0.4),0_0_30px_rgba(252,209,22,0.3),0_0_40px_rgba(206,17,38,0.2)]">
                                    <div className="h-full w-full rounded-full overflow-hidden bg-white relative z-10">
                                        {formData.photoURL ? (
                                            <img src={formData.photoURL} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                                                <User className="h-16 w-16" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                                <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md z-30 border-2 border-white group-hover:bg-blue-700 transition-colors">
                                    <Camera className="h-4 w-4" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <h1 className="mt-4 text-2xl font-bold text-slate-900">
                                {formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}` : 'Your Profile'}
                            </h1>
                            <p className="text-slate-500">{formData.email}</p>
                        </div>

                        <div className="border-t border-slate-100 pt-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                    Member since {currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).getFullYear() : new Date().getFullYear()}
                                </span>
                            </div>

                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                                    <AlertCircle className="h-5 w-5 mr-2" />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${usernameError
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                                                }`}
                                            placeholder="johndoe123"
                                        />
                                    </div>
                                    {usernameError && (
                                        <p className="mt-1 text-sm text-red-600">{usernameError}</p>
                                    )}
                                    <p className="mt-1 text-xs text-slate-500">This will be your unique identifier on the platform.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                                    />
                                    <p className="mt-1 text-xs text-slate-500">Email address cannot be changed.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                    <div className="flex gap-3">
                                        <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50">
                                            <GuyanaFlag className="h-5 w-auto" />
                                            <span className="text-slate-700 font-medium">+592</span>
                                        </div>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder="622-9848"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-8">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-6">Dealership Information</h2>

                                    <div className="space-y-6">
                                        {/* Banner Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Dealership Banner</label>
                                            <div className="relative h-48 w-full bg-slate-100 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors group cursor-pointer">
                                                <input
                                                    type="file"
                                                    onChange={handleBannerUpload}
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                {formData.bannerURL ? (
                                                    <img src={formData.bannerURL} alt="Banner" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                                        <Camera className="h-8 w-8 mb-2" />
                                                        <span className="text-sm">Click to upload banner</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <span className="text-white font-medium">Change Banner</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Dealership Name</label>
                                                <input
                                                    type="text"
                                                    name="dealershipName"
                                                    value={formData.dealershipName}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                                    placeholder="AutoGuyana Motors"
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                                <input
                                                    type="text"
                                                    name="dealershipAddress"
                                                    value={formData.dealershipAddress}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                                    placeholder="123 Main Street, Georgetown"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number 1</label>
                                                <input
                                                    type="tel"
                                                    name="contactNumber1"
                                                    value={formData.contactNumber1}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                                    placeholder="622-1234"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number 2</label>
                                                <input
                                                    type="tel"
                                                    name="contactNumber2"
                                                    value={formData.contactNumber2}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                                    placeholder="225-5678"
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Dealership Email</label>
                                                <input
                                                    type="email"
                                                    name="dealershipEmail"
                                                    value={formData.dealershipEmail}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                                    placeholder="sales@autoguyana.com"
                                                />
                                            </div>
                                        </div>

                                        {/* Opening Hours */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Clock className="h-5 w-5 text-blue-600" />
                                                <h3 className="text-sm font-semibold text-slate-900">Business Hours</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Mon-Fri */}
                                                <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mon - Fri</span>
                                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="relative">
                                                            <input
                                                                type="time"
                                                                name="openingHours.monFri.open"
                                                                value={formData.openingHours?.monFri?.open || ''}
                                                                onChange={handleChange}
                                                                className="w-full min-w-0 px-3 sm:pl-12 sm:pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                                            />
                                                            <div className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none hidden sm:block">
                                                                <span className="text-[10px] font-bold tracking-wide">OPEN</span>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <input
                                                                type="time"
                                                                name="openingHours.monFri.close"
                                                                value={formData.openingHours?.monFri?.close || ''}
                                                                onChange={handleChange}
                                                                className="w-full min-w-0 px-3 sm:pl-12 sm:pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                                            />
                                                            <div className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none hidden sm:block">
                                                                <span className="text-[10px] font-bold tracking-wide">CLOSE</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Saturday */}
                                                <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saturday</span>
                                                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                                        </div>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                name="openingHours.saturday.isClosed"
                                                                checked={formData.openingHours?.saturday?.isClosed || false}
                                                                onChange={handleChange}
                                                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                                            />
                                                            <span className="text-xs font-medium text-slate-600">Closed</span>
                                                        </label>
                                                    </div>

                                                    {formData.openingHours?.saturday?.isClosed ? (
                                                        <div className="h-[88px] flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                                                            <span className="text-sm font-medium text-slate-400">Closed on Saturdays</span>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <div className="relative">
                                                                <input
                                                                    type="time"
                                                                    name="openingHours.saturday.open"
                                                                    value={formData.openingHours?.saturday?.open || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full px-3 sm:pl-12 sm:pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                                                />
                                                                <div className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none hidden sm:block">
                                                                    <span className="text-[10px] font-bold tracking-wide">OPEN</span>
                                                                </div>
                                                            </div>
                                                            <div className="relative">
                                                                <input
                                                                    type="time"
                                                                    name="openingHours.saturday.close"
                                                                    value={formData.openingHours?.saturday?.close || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full px-3 sm:pl-12 sm:pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                                                />
                                                                <div className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none hidden sm:block">
                                                                    <span className="text-[10px] font-bold tracking-wide">CLOSE</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Sunday */}
                                                <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sunday</span>
                                                            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                                        </div>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                name="openingHours.sunday.isClosed"
                                                                checked={formData.openingHours?.sunday?.isClosed || false}
                                                                onChange={handleChange}
                                                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                                            />
                                                            <span className="text-xs font-medium text-slate-600">Closed</span>
                                                        </label>
                                                    </div>

                                                    {formData.openingHours?.sunday?.isClosed ? (
                                                        <div className="h-[88px] flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                                                            <span className="text-sm font-medium text-slate-400">Closed on Sundays</span>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <div className="relative">
                                                                <input
                                                                    type="time"
                                                                    name="openingHours.sunday.open"
                                                                    value={formData.openingHours?.sunday?.open || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full px-3 sm:pl-12 sm:pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                                                />
                                                                <div className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none hidden sm:block">
                                                                    <span className="text-[10px] font-bold tracking-wide">OPEN</span>
                                                                </div>
                                                            </div>
                                                            <div className="relative">
                                                                <input
                                                                    type="time"
                                                                    name="openingHours.sunday.close"
                                                                    value={formData.openingHours?.sunday?.close || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full px-3 sm:pl-12 sm:pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                                                />
                                                                <div className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none hidden sm:block">
                                                                    <span className="text-[10px] font-bold tracking-wide">CLOSE</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving || !!usernameError}
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="-ml-1 mr-2 h-5 w-5" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
