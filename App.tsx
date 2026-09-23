import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { HabitsProvider } from './src/HabitsContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { HabitDetailScreen } from './src/screens/HabitDetailScreen';
import { QuickLogScreen } from './src/screens/QuickLogScreen';

type Route =
  | { screen: 'home' }
  | { screen: 'detail'; habitId: string }
  | { screen: 'quicklog' };

export default function App() {
  const [route, setRoute] = useState<Route>({ screen: 'home' });
  const goHome = () => setRoute({ screen: 'home' });

  return (
    <HabitsProvider>
      {route.screen === 'home' && (
        <HomeScreen
          onOpenHabit={(habitId) => setRoute({ screen: 'detail', habitId })}
          onQuickLog={() => setRoute({ screen: 'quicklog' })}
        />
      )}
      {route.screen === 'detail' && (
        <HabitDetailScreen habitId={route.habitId} onBack={goHome} />
      )}
      {route.screen === 'quicklog' && <QuickLogScreen onDone={goHome} />}
      <StatusBar style="auto" />
    </HabitsProvider>
  );
}
