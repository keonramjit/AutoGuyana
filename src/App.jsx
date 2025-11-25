import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import MyListings from './pages/MyListings';
import Watchlist from './pages/Watchlist';
import AdminDashboard from './pages/AdminDashboard';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import MakeAdmin from './pages/MakeAdmin';
import AllListings from './pages/AllListings';
import ListingDetails from './pages/ListingDetails';
import Dashboard from './pages/Dashboard';
import Brands from './pages/Brands';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
                    <Navbar />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/make-admin" element={<MakeAdmin />} />
                            <Route path="/listings" element={<AllListings />} />
                            <Route path="/listings/:id" element={<ListingDetails />} />
                            <Route path="/brands" element={<Brands />} />

                            {/* Protected Routes */}
                            <Route path="/dashboard" element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/my-listings" element={
                                <ProtectedRoute>
                                    <MyListings />
                                </ProtectedRoute>
                            } />
                            <Route path="/watchlist" element={
                                <ProtectedRoute>
                                    <Watchlist />
                                </ProtectedRoute>
                            } />
                            <Route path="/create-listing" element={
                                <ProtectedRoute>
                                    <CreateListing />
                                </ProtectedRoute>
                            } />
                            <Route path="/edit-listing/:id" element={
                                <ProtectedRoute>
                                    <EditListing />
                                </ProtectedRoute>
                            } />
                            <Route path="/profile" element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } />

                            {/* Admin Route */}
                            <Route path="/admin" element={
                                <ProtectedRoute adminOnly={true}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
