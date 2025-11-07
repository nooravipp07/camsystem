import React, { useRef, useEffect, useState } from 'react';
import {AppState} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';
import { ProgressProvider } from './src/context/ProgressContext';
import AppNav from './src/navigation/AppNav';

import NetInfo from '@react-native-community/netinfo';
import { sendOfflineReports } from './src/utils/offlineSync';

function App() {

	// useEffect(() => {
	// 	const unsubscribe = NetInfo.addEventListener(state => {
	// 		if (state.isConnected) {
	// 		console.log('🌐 Internet connected, syncing offline reports...');
	// 		sendOfflineReports();
	// 		}
	// 	});

	// 	return () => unsubscribe();
	// }, []);
	return (
		<AuthProvider>
			<DataProvider>
				<ProgressProvider>
					<NavigationContainer>
						<AppNav />
					</NavigationContainer>
				</ProgressProvider>
			</DataProvider>
		</AuthProvider>
	);
}


export default App;