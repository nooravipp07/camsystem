import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatList from '../screen/chat/ChatList';
import ChatRoom from '../screen/chat/ChatRoom';

const ChatStack = createNativeStackNavigator();

const ChatNav = () => {
    return(
        <ChatStack.Navigator 
            initialRouteName="NewsScreen"
            screenOptions={{ headerShown: false}}
        >
            {/* <ChatStack.Screen name="ChatList" component={ChatList} /> */}
            <ChatStack.Screen name="ChatRoom" component={ChatRoom} />
        </ChatStack.Navigator>
    );
};

export default ChatNav;