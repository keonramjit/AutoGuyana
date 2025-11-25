import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ChevronLeft, Plus } from 'lucide-react';

export default function Brands() {
    const vehicleMakes = [
        { name: 'Acura', slug: 'acura' },
        { name: 'Alfa Romeo', slug: 'alfa-romeo' },
        { name: 'Audi', slug: 'audi' },
        { name: 'Bentley', slug: 'bentley' },
        { name: 'BMW', slug: 'bmw' },
        { name: 'BYD', slug: 'byd' },
        { name: 'Cadillac', slug: 'cadillac' },
        { name: 'Chevrolet', slug: 'chevrolet' },
        { name: 'Chrysler', slug: 'chrysler' },
        { name: 'Citroen', slug: 'citroen' },
        { name: 'DAF', slug: 'daf' },
        { name: 'Daihatsu', slug: 'daihatsu' },
        { name: 'Dodge', slug: 'dodge' },
        { name: 'Fiat', slug: 'fiat' },
        { name: 'Ford', slug: 'ford' },
        { name: 'Foton', slug: 'foton' },
        { name: 'Genesis', slug: 'genesis' },
        { name: 'GMC', slug: 'gmc' },
        { name: 'Honda', slug: 'honda' },
        { name: 'Hummer', slug: 'hummer' },
        { name: 'Hyundai', slug: 'hyundai' },
        { name: 'Infiniti', slug: 'infiniti' },
        { name: 'Isuzu', slug: 'isuzu' },
        { name: 'Jaguar', slug: 'jaguar' },
        { name: 'Jeep', slug: 'jeep' },
        { name: 'JMC', slug: 'jmc' },
        { name: 'Kia', slug: 'kia' },
        { name: 'Land Rover', slug: 'land-rover' },
        { name: 'Lexus', slug: 'lexus' },
        { name: 'Mack', slug: 'mack' },
        { name: 'MAN', slug: 'man' },
        { name: 'Mazda', slug: 'mazda' },
        { name: 'Mercedes-Benz', slug: 'mercedes-benz' },
        { name: 'MG', slug: 'mg' },
        { name: 'Mini', slug: 'mini' },
        { name: 'Mitsubishi', slug: 'mitsubishi' },
        { name: 'Nissan', slug: 'nissan' },
        { name: 'Peugeot', slug: 'peugeot' },
        { name: 'Porsche', slug: 'porsche' },
        { name: 'Ram', slug: 'ram' },
        { name: 'Renault', slug: 'renault' },
        { name: 'Scion', slug: 'scion' },
        { name: 'Subaru', slug: 'subaru' },
        { name: 'Suzuki', slug: 'suzuki' },
        { name: 'Tesla', slug: 'tesla' },
        { name: 'Toyota', slug: 'toyota' },
        { name: 'Volkswagen', slug: 'volkswagen' },
        { name: 'Volvo', slug: 'volvo' },
        { name: 'Yamaha', slug: 'yamaha' },
        { name: 'Other', slug: 'other' }
    ];

    const getLogoUrl = (slug) => {
        if (slug === 'other') return null;
        return `https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/${slug}.png`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <Link to="/" className="inline-flex items-center text-slate-600 hover:text-blue-600 mb-4 transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Home
                </Link>
                <h1 className="text-3xl font-bold text-slate-900">Browse by Brand</h1>
                <p className="text-slate-600 mt-2">Select a manufacturer to view available vehicles.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {vehicleMakes.map((make) => (
                    <Link
                        key={make.name}
                        to={`/listings?make=${encodeURIComponent(make.name)}`}
                        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all group flex flex-col items-center justify-center text-center h-40"
                    >
                        <div className="h-20 w-full flex items-center justify-center mb-4">
                            {make.slug !== 'other' ? (
                                <img
                                    src={getLogoUrl(make.slug)}
                                    alt={`${make.name} logo`}
                                    className="max-h-full max-w-[80%] object-contain group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                            ) : null}
                            <div className="hidden bg-slate-50 p-3 rounded-full group-hover:bg-blue-50 transition-colors" style={{ display: make.slug === 'other' ? 'block' : 'none' }}>
                                <Plus className="h-8 w-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                        </div>
                        <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                            {make.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
