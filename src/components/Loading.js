import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';

export const Loading = () => {
    return (
        <View
            style={{
                flex: 1,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 999999,
            }}>
            <ActivityIndicator color={'white'} animating={true} size="large" />
        </View>
    );
};