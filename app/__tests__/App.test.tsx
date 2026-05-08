/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => {
  const React = require('react');

  return {
    NavigationContainer: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');

  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
      Screen: ({ children }: { children?: React.ReactNode }) =>
        typeof children === 'function' ? children({}) : <>{children}</>,
    }),
  };
});

jest.mock('@react-navigation/drawer', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    createDrawerNavigator: () => ({
      Navigator: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
      Screen: ({ children }: { children?: React.ReactNode }) =>
        typeof children === 'function' ? children({}) : <>{children}</>,
    }),
    DrawerContentScrollView: ({ children, contentContainerStyle }: { children?: React.ReactNode; contentContainerStyle?: any }) => (
      <View style={contentContainerStyle}>{children}</View>
    ),
    DrawerItemList: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    DrawerItem: ({ label }: { label?: string }) => null,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaView: ({ children, style }: { children?: React.ReactNode; style?: unknown }) => (
      <View style={style}>{children}</View>
    ),
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

import App from '../App';

test('renders correctly', async () => {
  jest.useFakeTimers();

  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(() => {
    renderer?.unmount();
  });

  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
