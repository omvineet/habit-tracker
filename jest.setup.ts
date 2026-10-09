import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@expo-google-fonts/bebas-neue', () => ({
  useFonts: () => [true],
  BebasNeue_400Regular: 'BebasNeue_400Regular',
}));

jest.mock('@expo-google-fonts/barlow-condensed', () => ({
  BarlowCondensed_400Regular: 'BarlowCondensed_400Regular',
  BarlowCondensed_500Medium: 'BarlowCondensed_500Medium',
  BarlowCondensed_700Bold: 'BarlowCondensed_700Bold',
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
  isLoaded: () => true,
  loadAsync: async () => {},
}));

jest.mock('expo-linking', () => ({
  useLinkingURL: jest.fn(() => null),
}));

beforeEach(async () => {
  await AsyncStorage.clear();
});
