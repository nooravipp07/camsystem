import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NewsScreen from '../screen/NewsScreen';
import NewsDetailScreen from '../screen/NewsDetailScreen';

import { NewsProvider } from '../context/NewsContext';

const BuletinStack = createNativeStackNavigator();

const BuletinBeritaNav = () => {
    return(
        <NewsProvider>
            <BuletinStack.Navigator 
            initialRouteName="NewsScreen"
            screenOptions={{ headerShown: false}}
            >
            <BuletinStack.Screen name="NewsScreen" component={NewsScreen} />
            <BuletinStack.Screen name="NewsDetailScreen" component={NewsDetailScreen} />
            </BuletinStack.Navigator>
        </NewsProvider>
    );
};

export default BuletinBeritaNav;