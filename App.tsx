import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  BarlowCondensed_400Regular,
  BarlowCondensed_500Medium,
  BarlowCondensed_700Bold,
} from '@expo-google-fonts/barlow-condensed';
import { HabitsProvider, useHabits } from './src/HabitsContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { HabitDetailScreen } from './src/screens/HabitDetailScreen';
import { QuickLogScreen } from './src/screens/QuickLogScreen';
import { colors } from './src/theme';
import { AppRoute, parseAssistantUrl, resolveAssistantAction } from './src/utils/assistantActions';

export default function App() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    BarlowCondensed_400Regular,
    BarlowCondensed_500Medium,
    BarlowCondensed_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.volt} />
      </View>
    );
  }

  return (
    <HabitsProvider>
      <AppNavigator />
      <StatusBar style="light" />
    </HabitsProvider>
  );
}

function AppNavigator() {
  const linkingUrl = Linking.useLinkingURL();
  const { habits, loading } = useHabits();
  const [route, setRoute] = useState<AppRoute>({ screen: 'home' });
  const handledUrl = useRef<string | null>(null);
  const goHome = () => setRoute({ screen: 'home' });

  useEffect(() => {
    if (!linkingUrl || linkingUrl === handledUrl.current || loading) return;
    const action = parseAssistantUrl(linkingUrl);
    if (!action) return;
    handledUrl.current = linkingUrl;
    setRoute(resolveAssistantAction(action, habits));
  }, [linkingUrl, loading, habits]);

  return (
    <>
      {route.screen === 'home' && (
        <HomeScreen
          onOpenHabit={(habitId) => setRoute({ screen: 'detail', habitId })}
          onQuickLog={() => setRoute({ screen: 'quicklog' })}
          openAdd={route.openAdd}
          addName={route.addName}
        />
      )}
      {route.screen === 'detail' && (
        <HabitDetailScreen habitId={route.habitId} onBack={goHome} />
      )}
      {route.screen === 'quicklog' && (
        <QuickLogScreen onDone={goHome} seedText={route.seedText} />
      )}
    </>
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
