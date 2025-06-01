
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MoodData {
  date: string;
  mood: number;
  emoji: string;
}

interface MoodChartProps {
  refreshTrigger: number;
}

const MoodChart = ({ refreshTrigger }: MoodChartProps) => {
  const [chartData, setChartData] = useState<MoodData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const moodToValue = (emoji: string): number => {
    const moodMap: { [key: string]: number } = {
      '😢': 1,
      '😔': 2,
      '😐': 3,
      '😊': 4,
      '😄': 5,
    };
    return moodMap[emoji] || 3;
  };

  const fetchWeeklyMoodData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

      const { data, error } = await supabase
        .from('mood_logs')
        .select('date, emoji')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      const processedData = (data || []).map((log) => ({
        date: new Date(log.date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        mood: moodToValue(log.emoji),
        emoji: log.emoji,
      }));

      setChartData(processedData);
    } catch (error: any) {
      toast({
        title: "Error loading chart data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyMoodData();
  }, [refreshTrigger]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{label}</p>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{data.emoji}</span>
            <span className="text-sm text-gray-600">Mood: {data.mood}/5</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Mood Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">Loading chart data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Mood Trend</CardTitle>
        <CardDescription>
          Your mood patterns over the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Not enough data for chart. Log moods for a few days to see your trend! 📈
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tick={{ fill: '#666' }}
                />
                <YAxis 
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  fontSize={12}
                  tick={{ fill: '#666' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="mood" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodChart;
