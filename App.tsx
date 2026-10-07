import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  BarlowCondensed_400Regular,
  BarlowCondensed_500Medium,
  BarlowCondensed_700Bold,
} from '@expo-google-fonts/barlow-condensed';
import { HabitsProvider } from './src/HabitsContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { HabitDetailScreen } from './src/screens/HabitDetailScreen';
import { QuickLogScreen } from './src/screens/QuickLogScreen';
import { colors } from './src/theme';

type Route =
  | { screen: 'home' }
  | { screen: 'detail'; habitId: string }
  | { screen: 'quicklog' };

export default function App() {
  const [route, setRoute] = useState<Route>({ screen: 'home' });
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    BarlowCondensed_400Regular,
    BarlowCondensed_500Medium,
    BarlowCondensed_700Bold,
  });
  const goHome = () => setRoute({ screen: 'home' });

  if (!fontsLoaded) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.volt} />
      </View>
    );
  }

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
      <StatusBar style="light" />
    </HabitsProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
