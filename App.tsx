import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { HabitsProvider } from './src/HabitsContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { HabitDetailScreen } from './src/screens/HabitDetailScreen';

type Route = { screen: 'home' } | { screen: 'detail'; habitId: string };

export default function App() {
  const [route, setRoute] = useState<Route>({ screen: 'home' });

  return (
    <HabitsProvider>
      {route.screen === 'home' ? (
        <HomeScreen onOpenHabit={(habitId) => setRoute({ screen: 'detail', habitId })} />
      ) : (
        <HabitDetailScreen habitId={route.habitId} onBack={() => setRoute({ screen: 'home' })} />
      )}
      <StatusBar style="auto" />
    </HabitsProvider>
  );
}
