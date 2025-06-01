
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const moods = [
  { emoji: '😄', label: 'Very Happy', value: 5 },
  { emoji: '😊', label: 'Happy', value: 4 },
  { emoji: '😐', label: 'Neutral', value: 3 },
  { emoji: '😔', label: 'Sad', value: 2 },
  { emoji: '😢', label: 'Very Sad', value: 1 },
];

interface MoodLoggerProps {
  onMoodLogged: () => void;
}

const MoodLogger = ({ onMoodLogged }: MoodLoggerProps) => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Choose an emoji that represents how you're feeling today.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('mood_logs').insert({
        user_id: user.id,
        emoji: selectedMood,
        note: note.trim() || null,
        date: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;

      toast({
        title: "Mood logged successfully! 🎉",
        description: "Your mood has been saved for today.",
      });

      setSelectedMood('');
      setNote('');
      onMoodLogged();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling today?</CardTitle>
        <CardDescription>
          Select your mood and optionally add a note about your day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-medium">Choose your mood:</label>
            <div className="grid grid-cols-5 gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.emoji}
                  type="button"
                  onClick={() => setSelectedMood(mood.emoji)}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedMood === mood.emoji
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-3xl mb-1">{mood.emoji}</div>
                  <div className="text-xs text-gray-600">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium">
              Add a note (optional):
            </label>
            <Textarea
              id="note"
              placeholder="What made you feel this way today?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Log Mood'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MoodLogger;
