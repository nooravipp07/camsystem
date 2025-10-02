import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainNav from './MainNav';
import LoginScreen from '../screen/LoginScreen';
import SplashScreen from '../screen/SplashScreen';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

function AppNav() {
	const { token } = useContext(AuthContext);

    return (
		<Stack.Navigator screenOptions={{headerShown: false}}>
            {token !== null ? (
                <>
                    <Stack.Screen name="MainNav" component={MainNav} />
                </>
                ) : (
                <>
                    <Stack.Screen name="SplashScreen" component={SplashScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="MainNav" component={MainNav} />
                </>
            )}
		</Stack.Navigator>
    );
}

export default AppNav;