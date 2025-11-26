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
  }, [router]);

  const handleScanMore = () => {
    window.location.href = '/api/logout';
  };

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

        <div className="bg-[#fef3c7] border-l-4 border-[#f59e0b] rounded-lg p-4 my-6 text-left">
          <p className="text-[#92400e] text-[0.95rem] font-medium mb-2">
            📧 <strong>Email Delivery:</strong>
          </p>
          <p className="text-[#78350f] text-[0.9rem]">
            You will receive your personalized report via email within <strong>24-48 hours</strong>.
          </p>
          <p className="text-[#78350f] text-[0.9rem] mt-2">
            ⚠️ <strong>Important:</strong> Please check your spam/junk folder if you don't see the email in your inbox.
          </p>
        </div>

        <button
          onClick={handleScanMore}
          className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-semibold py-3 px-6 rounded-xl text-lg hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Scan More
        </button>
      </div>
    </div>
  );
}
