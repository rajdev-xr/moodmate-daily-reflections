
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, StickyNote } from 'lucide-react';

interface MoodLog {
  id: string;
  date: string;
  emoji: string;
  note: string | null;
  created_at: string;
}

interface MoodHistoryProps {
  refreshTrigger: number;
}

const MoodHistory = ({ refreshTrigger }: MoodHistoryProps) => {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMoodLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setMoodLogs(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading mood history",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoodLogs();
  }, [refreshTrigger]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">Loading your mood history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Mood Journey</CardTitle>
        <CardDescription>
          A timeline of your recent moods and reflections
        </CardDescription>
      </CardHeader>
      <CardContent>
        {moodLogs.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No mood logs yet. Start by logging your first mood! 🌟
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {moodLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="text-3xl">{log.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(log.date)}</span>
                  </div>
                  {log.note && (
                    <div className="flex items-start space-x-2 mt-2">
                      <StickyNote className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {log.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodHistory;
