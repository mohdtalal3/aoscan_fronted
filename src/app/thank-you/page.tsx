'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ThankYouPage() {
  const [userName, setUserName] = useState('User');
  const router = useRouter();

  useEffect(() => {
    // Get user data from session
    fetch('/api/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user_data) {
          setUserName(data.user_data.name);
        }
      })
      .catch((error) => console.error('Error fetching session:', error));

    // Auto-logout and redirect after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = '/api/logout';
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8">
      <div className="bg-white rounded-[20px] p-12 max-w-[500px] w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-slideUp">
        <div className="w-20 h-20 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center mx-auto mb-8 animate-scaleIn">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            className="w-10 h-10"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-[2rem] font-bold text-[#1f2937] mb-4">
          Thank You, {userName}! 🎉
        </h1>
        <p className="text-[1.1rem] text-[#6b7280] mb-6 leading-relaxed">
          Your registration has been successfully submitted and is now being
          processed.
        </p>

        <div className="bg-[#f3f4f6] rounded-xl p-6 my-8 text-left">
          <h3 className="text-base font-semibold text-[#1f2937] mb-3">
            What happens next?
          </h3>
          <ul className="list-none p-0 m-0">
            <li className="text-[#6b7280] py-2 flex items-center text-[0.95rem]">
              <span className="text-[#667eea] font-bold mr-3 text-xl">✓</span>
              Your audio is being analyzed
            </li>
            <li className="text-[#6b7280] py-2 flex items-center text-[0.95rem]">
              <span className="text-[#667eea] font-bold mr-3 text-xl">✓</span>
              Your report is being generated
            </li>
            <li className="text-[#6b7280] py-2 flex items-center text-[0.95rem]">
              <span className="text-[#667eea] font-bold mr-3 text-xl">✓</span>
              You'll receive an email with your results
            </li>
          </ul>
        </div>

        <p className="text-[#374151] font-medium">
          Please check your email inbox for your personalized report.
        </p>

        <div className="text-[0.9rem] text-[#9ca3af] mt-8">
          Logging you out and redirecting
          <span className="inline-block ml-2">
            <span className="animate-blink-1">.</span>
            <span className="animate-blink-2">.</span>
            <span className="animate-blink-3">.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
