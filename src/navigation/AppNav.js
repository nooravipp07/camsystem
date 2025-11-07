import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EncryptedStorage from 'react-native-encrypted-storage';
import MainNav from './MainNav';
import LoginScreen from '../screen/LoginScreen';
import SplashScreen from '../screen/SplashScreen';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

function AppNav() {
  const { token, isCheckingAuth } = useContext(AuthContext);
  
  if (isCheckingAuth) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="MainNav" component={MainNav} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default AppNav;
