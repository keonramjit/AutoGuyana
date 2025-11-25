import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function MakeAdmin() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    async function handleMakeAdmin() {
        if (!currentUser) {
            setMessage('You must be logged in first.');
            return;
        }

        setLoading(true);
        try {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                role: "admin"
            });
            setMessage('Success! You are now an admin. Please log out and log back in to see changes.');
            // Optional: force refresh or logout
        } catch (error) {
            console.error("Error updating role:", error);
            setMessage('Error: ' + error.message);
        }
        setLoading(false);
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Admin Setup</h1>
            <p className="mb-6 text-slate-600">
                Click the button below to promote your current account ({currentUser?.email}) to <strong>Admin</strong>.
            </p>

            {message && (
                <div className={`mb-4 p-3 rounded ${message.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}

            <button
                onClick={handleMakeAdmin}
                disabled={loading || !currentUser}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Processing...' : 'Make Me Admin'}
            </button>

            <div className="mt-6">
                <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-700">
                    Back to Home
                </button>
            </div>
        </div>
    );
}
