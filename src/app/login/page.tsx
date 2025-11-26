'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('error');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            showMessage('Please enter your email address', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (result.success) {
                showMessage(`✓ ${result.message}! Redirecting...`, 'success');
                setTimeout(() => {
                    router.push('/');
                }, 1000);
            } else {
                showMessage(`✗ ${result.message}`, 'error');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('✗ Connection error. Please try again.', 'error');
            setIsLoading(false);
        }
    };

    const showMessage = (msg: string, type: 'success' | 'error') => {
        setMessage(msg);
        setMessageType(type);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#667eea] to-[#764ba2]">
            <div className="bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] px-[50px] py-[60px] max-w-[450px] w-full animate-slideUp">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            className="w-10 h-10"
                        >
                            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-[32px] font-bold text-[#2d3748] mb-2.5">
                        Welcome Back
                    </h1>
                    <p className="text-base text-[#718096] leading-6">
                        Enter the email you used to purchase your package to access the
                        voice analysis system.
                    </p>
                </div>

                {message && (
                    <div
                        className={`p-4 rounded-xl mb-5 text-sm font-medium animate-slideDown ${messageType === 'success'
                                ? 'bg-[#d4edda] text-[#155724] border border-[#c3e6cb]'
                                : 'bg-[#f8d7da] text-[#721c24] border border-[#f5c6cb]'
                            }`}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-7">
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-[#4a5568] mb-2.5"
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full p-4 text-base border-2 border-[#e2e8f0] rounded-xl transition-all duration-300 focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
                            placeholder="your.email@example.com"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full p-4 text-base font-semibold text-white bg-gradient-to-br from-[#667eea] to-[#764ba2] border-none rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-2.5 hover:translate-y-[-2px] hover:shadow-[0_10px_25px_rgba(102,126,234,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                    >
                        {isLoading ? (
                            <>
                                <span className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-5-4l5-5-5-5m5 5H3" />
                                </svg>
                                Access System
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-7 pt-6 border-t border-[#e2e8f0] text-[#718096] text-sm">
                    🔒 Your data is secure and protected
                </div>
            </div>
        </div>
    );
}
