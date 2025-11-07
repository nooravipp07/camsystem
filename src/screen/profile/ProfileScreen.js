import React, { useState, useContext } from 'react';
import {
	View,
	StyleSheet,
	Image,
	Text,
	TouchableOpacity,
	Alert,
	Platform,
	ActivityIndicator
} from 'react-native';
import { BASE_URL, BASE_IMG_URL } from '../../config/Config';
import { AuthContext } from '../../context/AuthContext';
import { launchCamera } from 'react-native-image-picker';
import { PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import axios from 'axios';

const ProfileScreen = ({ navigation }) => {
	const [imageCamera, setImageCamera] = useState(null);
	const [loading, setLoading] = useState(false);
	const { token, setUserInfo, userInfo } = useContext(AuthContext);
	const user = userInfo;

	const captureImage = async () => {
		try {
			const permission = await check(
				Platform.OS === 'android'
					? PERMISSIONS.ANDROID.CAMERA
					: PERMISSIONS.IOS.CAMERA
			);

			if (permission !== RESULTS.GRANTED) {
				Alert.alert('Izin Kamera Diperlukan', 'Aktifkan izin kamera di pengaturan.');
				return;
			}

			launchCamera(
				{
					mediaType: 'photo',
					quality: 0.5,
					cameraType: 'front',
					includeExif: true,
				},
				(response) => {
					if (response.didCancel) return;
					if (response.errorCode) {
						Alert.alert('Error', response.errorMessage || 'Terjadi kesalahan kamera.');
						return;
					}

					const data = response.assets?.[0];
					if (!data) return;

					if (data.fileSize > 2000000) {
						Alert.alert('Ukuran Gambar Terlalu Besar', 'Foto harus kurang dari 2MB');
						return;
					}

					setImageCamera(data);
				}
			);
		} catch (error) {
			console.error('Camera Error:', error);
		}
	};

	const updateProfile = async () => {
		if (!imageCamera) {
			Alert.alert('Perhatian', 'Ambil foto terlebih dahulu sebelum menyimpan.');
			return;
		}

		setLoading(true);

		try {
			const payload = new FormData();
			payload.append('file', {
				uri: imageCamera.uri,
				type: imageCamera.type,
				name: imageCamera.fileName,
			});

			const response = await axios.post(`${BASE_URL}/user/update`, payload, {
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.data?.response) {
				setUserInfo(JSON.stringify(response.data.response));
				Alert.alert('Berhasil', 'Profil berhasil diperbarui.', [
					{
						text: 'OK',
						onPress: () => {
							setImageCamera(null);
							navigation.reset({
								index: 0,
								routes: [{ name: 'Dashboard' }],
							});
						},
					},
				]);
			} else {
				Alert.alert('Gagal', 'Tidak ada data response dari server.');
			}
		} catch (error) {
			console.error(error);
			Alert.alert('Error', 'Terjadi kesalahan saat mengunggah data.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.imageContainer}>
				{imageCamera ? (
					<Image source={{ uri: imageCamera.uri }} style={styles.img} />
				) : user.avatar ? (
					<Image source={{ uri: `${BASE_IMG_URL}${user.avatar}` }} style={styles.img} />
				) : (
					<Image
						source={require('../../assets/Icons/avatar.png')}
						style={styles.img}
					/>
				)}

				<Text style={styles.text}>
					Silahkan ambil gambar swafoto anda untuk melanjutkan
				</Text>

				<TouchableOpacity onPress={captureImage} style={styles.button}>
					<Text style={styles.btnText}>AKTIFKAN KAMERA</Text>
				</TouchableOpacity>

				{imageCamera && (
					<TouchableOpacity onPress={updateProfile} style={styles.buttonSimpan}>
						{loading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.btnText}>SIMPAN PERUBAHAN</Text>
						)}
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 15,
		backgroundColor: '#122E5F',
	},
	imageContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	img: {
		width: 250,
		height: 250,
		borderWidth: 2,
		borderColor: '#0068A7',
		borderRadius: 5,
	},
	text: {
		color: '#ffffff',
		marginTop: 20,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	button: {
		backgroundColor: '#0068A7',
		justifyContent: 'center',
		paddingHorizontal: 70,
		borderRadius: 2,
		marginTop: 50,
		height: 50,
	},
	buttonSimpan: {
		backgroundColor: '#0068A7',
		justifyContent: 'center',
		paddingHorizontal: 65,
		borderRadius: 2,
		marginTop: 10,
		height: 50,
	},
	btnText: {
		textAlign: 'center',
		color: '#fff',
		fontWeight: '700',
	},
});

export default ProfileScreen;
