import React, { useEffect } from 'react';
import { Image, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			handleGetToken();
		}, 3000);

		return () => clearTimeout(timer);
	}, []);

	const handleGetToken = async () => {
		const dataToken = await AsyncStorage.getItem('token');
		if (!dataToken) {
			navigation.replace('Login');
		} else {
			navigation.replace('MainNav');
		}
	};

	return (
		<ImageBackground
			source={require('../assets/Images/bg.png')}
			style={styles.imgBackground}
		>
			<Image
				style={styles.logo}
				source={require('../assets/Images/sintesa.png')}
				resizeMode="contain"
			/>
		</ImageBackground>
	);
};

const styles = StyleSheet.create({
	imgBackground: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	logo: {
		width: width * 0.7, // 70% dari lebar layar
		height: height * 0.15, // tinggi proporsional
		resizeMode: 'contain',
	},
});

export default SplashScreen;
