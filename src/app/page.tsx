'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AudioRecorder, RECORDING_DURATION } from '@/lib/audioRecorder';

interface UserData {
  name: string;
  email: string;
  date: string;
}

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RECORDING_DURATION);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<
    'success' | 'error' | 'info'
  >('info');

  const router = useRouter();
  const audioRecorder = new AudioRecorder();

  useEffect(() => {
    // Check authentication status
    fetch('/api/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUserData(data.user_data);
        } else {
          setIsAuthenticated(false);
          router.push('/login');
        }
      })
      .catch((error) => {
        console.error('Error checking session:', error);
        setIsAuthenticated(false);
        router.push('/login');
      });
  }, [router]);

  const handleStartRecording = async () => {
    try {
      await audioRecorder.startRecording();
      setIsRecording(true);
      setRecordedBlob(null);
      setAudioUrl(null);
      setSecondsLeft(RECORDING_DURATION);

      // Start countdown
      const interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleStopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      showMessage(
        'Error: Could not access microphone. Please grant permission.',
        'error'
      );
    }
  };

  const handleStopRecording = async () => {
    try {
      const blob = await audioRecorder.stopRecording();
      setRecordedBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
      showMessage('Error stopping recording', 'error');
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!recordedBlob) {
      showMessage('Please record audio before submitting', 'error');
      return;
    }

    setIsSubmitting(true);
    showMessage('Uploading audio...', 'info');

    try {
      // Step 1: Upload audio to frontend server
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const audioFormData = new FormData();
        audioFormData.append('audio', base64Audio);

        try {
          const uploadResponse = await fetch('/api/upload-audio', {
            method: 'POST',
            body: audioFormData,
          });

          const uploadResult = await uploadResponse.json();

          if (!uploadResult.success) {
            throw new Error(uploadResult.error || 'Audio upload failed');
          }

          const uploadedAudioUrl = uploadResult.audio_url;
          console.log('Audio uploaded:', uploadedAudioUrl);

          // Step 2: Submit all data to backend server
          showMessage('Submitting client data...', 'info');

          const formData = new FormData(form);
          const clientData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            gender: formData.get('gender'),
            weight: formData.get('weight'),
            weight_unit: formData.get('weight_unit'),
            height: formData.get('height'),
            height_unit: formData.get('height_unit'),
            date_of_birth: formData.get('date_of_birth'),
            audio_url: uploadedAudioUrl,
          };

          // Send to Next.js API proxy (avoids CORS)
          fetch('/api/submit-client', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData),
            keepalive: true,
          }).catch((error) => {
            console.error('Backend submission error:', error);
          });

          // Clear session to prevent re-submission
          try {
            await fetch('/api/clear-session', {
              method: 'POST',
            });
          } catch (error) {
            console.error('Error clearing session:', error);
          }

          // Small delay to ensure fetch is initiated before redirect
          setTimeout(() => {
            router.push('/thank-you');
          }, 100);
        } catch (error) {
          console.error('Submission error:', error);
          showMessage(
            `✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'error'
          );
          setIsSubmitting(false);
        }
      };

      reader.readAsDataURL(recordedBlob);
    } catch (error) {
      console.error('Process error:', error);
      showMessage(
        `✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
      setIsSubmitting(false);
    }
  };

  const showMessage = (
    msg: string,
    type: 'success' | 'error' | 'info'
  ) => {
    setMessage(msg);
    setMessageType(type);

    // Auto-hide only for success/error, not info
    if (type !== 'info') {
      setTimeout(() => {
        setMessage('');
      }, 8000);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      <div className="w-full max-w-[700px]">
        <div className="bg-white rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] p-10 animate-slideUp">
          {/* Welcome Message */}
          <div className="text-center mb-4">
            <span className="inline-block bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb] text-[#4b5563] text-[13px] py-1.5 px-4 rounded-[20px] font-medium">
              👋 Welcome, <strong className="text-[#1f2937]">{userData?.name || 'User'}</strong>
            </span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-[2rem] font-bold text-[#1f2937] mb-2">
              Client Registration Form
            </h1>
            <p className="text-[#6b7280] text-[0.95rem]">
              Complete the form and record a 10-second audio message
            </p>
          </div>

          <form id="submissionForm" onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div className="mt-8 mb-6 pb-2 border-b border-[#e5e7eb]">
              <h2 className="text-xl font-semibold text-[#4f46e5]">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="firstName" className="block mb-2 font-medium text-[#1f2937] text-[0.95rem]">
                  First Name <span className="text-[#ef4444] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="first_name"
                  required
                  placeholder="Enter first name"
                  className="w-full p-3 border-2 border-[#e5e7eb] rounded-lg text-base bg-[#f9fafb] transition-all duration-300 focus:outline-none focus:border-[#6366f1] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block mb-2 font-medium text-[#1f2937] text-[0.95rem]">
                  Last Name <span className="text-[#ef4444] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="last_name"
                  required
                  placeholder="Enter last name"
                  className="w-full p-3 border-2 border-[#e5e7eb] rounded-lg text-base bg-[#f9fafb] transition-all duration-300 focus:outline-none focus:border-[#6366f1] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block mb-2 font-medium text-[#1f2937] text-[0.95rem]">
                Email Address <span className="text-[#ef4444] ml-0.5">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="your.email@example.com"
                className="w-full p-3 border-2 border-[#e5e7eb] rounded-lg text-base bg-[#f9fafb] transition-all duration-300 focus:outline-none focus:border-[#6366f1] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium text-[#1f2937] text-[0.95rem]">
                Gender <span className="text-[#ef4444] ml-0.5">*</span>
              </label>
              <div className="flex gap-8 p-3 bg-[#f9fafb] rounded-lg border-2 border-[#e5e7eb]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    required
                    className="w-5 h-5 accent-[#6366f1] cursor-pointer"
                  />
                  <span>Male</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    required
                    className="w-5 h-5 accent-[#6366f1] cursor-pointer"
                  />
                  <span>Female</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="birthDate" className="block mb-2 font-medium text-[#1f2937] text-[0.95rem]">
                Date of Birth <span className="text-[#ef4444] ml-0.5">*</span>
              </label>
              <input
                type="date"
                id="birthDate"
                name="date_of_birth"
                required
                className="w-full p-3 border-2 border-[#e5e7eb] rounded-lg text-base bg-[#f9fafb] transition-all duration-300 focus:outline-none focus:border-[#6366f1] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
              />
            </div>

            {/* Physical Measurements Section */}
            <div className="mt-8 mb-6 pb-2 border-b border-[#e5e7eb]">
              <h2 className="text-xl font-semibold text-[#4f46e5]">Physical Measurements</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="weight" className="block mb-2 font-medium text-[#1f2937] text-[0.95rem]">
                  Weight <span className="text-[#ef4444] ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  required
                  placeholder="Enter weight"
                  step="0.1"
                  min="0"
                  className="w-full p-3 border-2 border-[#e5e7eb] rounded-lg text-base bg-[#f9fafb] transition-all duration-300 focus:outline-none focus:border-[#6366f1] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                />
              </div>

              <div>
                <label htmlFor="weightUnit" className="block mb-2 font-medium text-[#1f2937] text-[0.95rem]">
                  Weight Unit <span className="text-[#ef4444] ml-0.5">*</span>
                </label>
                <select
                  id="weightUnit"
                  name="weight_unit"
                  required
                  className="w-full p-3 border-2 border-[#e5e7eb] rounded-lg text-base bg-[#f9fafb] transition-all duration-300 focus:outline-none focus:border-[#6366f1] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                >
                  <option value="">Select unit</option>
                  <option value="kgs">Kilograms (kg)</option>
                  <option value="lbs">Pounds (lbs)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="height" className="block mb-2 font-medium text-[#1f2937] text-[0.95rem]">
                  Height <span className="text-[#ef4444] ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  required
                  placeholder="Enter height"
                  step="0.1"
                  min="0"
                  className="w-full p-3 border-2 border-[#e5e7eb] rounded-lg text-base bg-[#f9fafb] transition-all duration-300 focus:outline-none focus:border-[#6366f1] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                />
              </div>

              <div>
                <label htmlFor="heightUnit" className="block mb-2 font-medium text-[#1f2937] text-[0.95rem]">
                  Height Unit <span className="text-[#ef4444] ml-0.5">*</span>
                </label>
                <select
                  id="heightUnit"
                  name="height_unit"
                  required
                  className="w-full p-3 border-2 border-[#e5e7eb] rounded-lg text-base bg-[#f9fafb] transition-all duration-300 focus:outline-none focus:border-[#6366f1] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                >
                  <option value="">Select unit</option>
                  <option value="ft">Feet (ft)</option>
                  <option value="in">Inches (in)</option>
                  <option value="cm">Centimeters (cm)</option>
                </select>
              </div>
            </div>

            {/* Audio Recording Section */}
            <div className="mt-8 mb-6 pb-2 border-b border-[#e5e7eb]">
              <h2 className="text-xl font-semibold text-[#4f46e5]">Audio Recording</h2>
            </div>

            <div className="my-6 p-6 bg-[#f9fafb] rounded-xl border-2 border-dashed border-[#e5e7eb]">
              <p className="text-center text-[#6b7280] mb-4 text-[0.9rem]">
                Record a 10-second audio message
              </p>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                {!isRecording && !recordedBlob && (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="inline-flex items-center justify-center gap-2 py-3 px-6 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-300 bg-[#6366f1] text-white min-w-[180px] hover:bg-[#4f46e5] hover:-translate-y-0.5 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] active:translate-y-0"
                  >
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v6m0 6v6m-6-6h6m6 0h-6" />
                    </svg>
                    Start Recording
                  </button>
                )}

                {isRecording && (
                  <div className="flex items-center gap-4 bg-white py-2 px-4 rounded-[20px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-2 text-[#ef4444] font-semibold">
                      <span className="w-2.5 h-2.5 bg-[#ef4444] rounded-full animate-pulse-dot" />
                      Recording...
                    </div>
                    <div className="text-xl font-bold text-[#1f2937] min-w-[45px] text-right">
                      {secondsLeft}s
                    </div>
                  </div>
                )}
              </div>

              {recordedBlob && audioUrl && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-[#10b981] animate-fadeIn">
                  <div className="flex items-center gap-2 text-[#10b981] font-semibold mb-3 text-[0.9rem]">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Recording Complete
                  </div>
                  <audio controls className="w-full h-10" src={audioUrl} />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!recordedBlob || isSubmitting}
              className="w-full py-4 px-6 border-none rounded-xl text-[1.1rem] font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white mt-8 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
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
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Submit Registration
                </>
              )}
            </button>
          </form>

          {/* Response Message */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-lg font-medium text-center ${messageType === 'success'
                ? 'bg-[#d1fae5] text-[#065f46] border border-[#10b981]'
                : messageType === 'error'
                  ? 'bg-[#fee2e2] text-[#991b1b] border border-[#ef4444]'
                  : 'bg-[#e0f2fe] text-[#0369a1] border border-[#0ea5e9]'
                }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
