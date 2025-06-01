
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthPage from '@/components/auth/AuthPage';
import Header from '@/components/layout/Header';
import MoodLogger from '@/components/mood/MoodLogger';
import MoodHistory from '@/components/mood/MoodHistory';
import MoodChart from '@/components/mood/MoodChart';

const Index = () => {
  const { user, loading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMoodLogged = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🌟</div>
          <p className="text-lg text-gray-600">Loading MoodMate...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back! 👋
            </h2>
            <p className="text-gray-600">
              How are you feeling today? Let's log your mood and track your emotional journey.
            </p>
          </div>

          {/* Mood Logger */}
          <div className="max-w-2xl mx-auto">
            <MoodLogger onMoodLogged={handleMoodLogged} />
          </div>

          {/* Charts and History */}
          <div className="grid lg:grid-cols-2 gap-8">
            <MoodChart refreshTrigger={refreshTrigger} />
            <MoodHistory refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
