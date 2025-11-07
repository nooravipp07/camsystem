import React, { useState, useContext } from 'react';
import {
	View,
	StyleSheet,
	Image,
	Text,
	TouchableOpacity,
	Alert,
	Platform,
	ActivityIndicator,
	ScrollView,
} from 'react-native';
import { BASE_URL, BASE_IMG_URL } from '../../config/Config';
import { AuthContext } from '../../context/AuthContext';
import { launchCamera } from 'react-native-image-picker';
import { PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';

const ProfileScreen = ({ navigation }) => {
	const [imageCamera, setImageCamera] = useState(null);
	const [loading, setLoading] = useState(false);
	const { token, setUserInfo, userInfo, setToken, logout } = useContext(AuthContext);
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

	const handleLogout = async () => {
		Alert.alert('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar?', [
			{ text: 'Batal', style: 'cancel' },
			{
				text: 'Keluar',
				style: 'destructive',
				onPress: async () => {
					try {
						// Hapus semua data di EncryptedStorage
						await EncryptedStorage.clear();

						// Reset context
						setUserInfo({});
						setToken(null);

						// Redirect ke halaman login
						navigation.reset({
							index: 0,
							routes: [{ name: 'Login' }],
						});
					} catch (error) {
						console.error('Gagal logout:', error);
						Alert.alert('Error', 'Terjadi kesalahan saat logout.');
					}
				},
			},
		]);
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
				<View style={styles.header}>
					<Text style={styles.headerTitle}>Profil Pengguna</Text>
					<Text style={styles.headerSubtitle}>Perbarui informasi dan foto Anda</Text>
				</View>

				<View style={styles.card}>
					<View style={styles.avatarContainer}>
						<Image
							source={
								imageCamera
									? { uri: imageCamera.uri }
									: user.avatar
									? { uri: `${BASE_IMG_URL}${user.avatar}` }
									: require('../../assets/Icons/avatar.png')
							}
							style={styles.avatar}
						/>
					</View>

					<Text style={styles.infoText}>
						{user?.name || 'Nama tidak tersedia'}
					</Text>
					<Text style={styles.emailText}>{user?.email || '-'}</Text>

					<Text style={styles.instructions}>
						Silakan ambil foto swafoto Anda untuk memperbarui profil.
					</Text>

					<TouchableOpacity onPress={captureImage} style={styles.buttonPrimary}>
						<Text style={styles.buttonText}>📷 Ambil Foto</Text>
					</TouchableOpacity>

					{imageCamera && (
						<TouchableOpacity
							onPress={updateProfile}
							style={styles.buttonSecondary}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={styles.buttonText}>💾 Simpan Perubahan</Text>
							)}
						</TouchableOpacity>
					)}

					{/* Tombol Logout */}
					<TouchableOpacity onPress={handleLogout} style={styles.buttonLogout}>
						<Text style={styles.buttonText}>🚪 Logout</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f4f6fb',
		paddingHorizontal: 15,
		paddingTop: 10,
	},
	header: {
		marginBottom: 15,
		marginTop: 10,
	},
	headerTitle: {
		fontSize: 22,
		fontWeight: '700',
		color: '#0d2143',
	},
	headerSubtitle: {
		fontSize: 13,
		color: '#888',
		marginTop: 2,
	},
	card: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 20,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.15,
		shadowRadius: 6,
		elevation: 4,
	},
	avatarContainer: {
		marginBottom: 15,
	},
	avatar: {
		width: 150,
		height: 150,
		borderRadius: 75,
		borderWidth: 3,
		borderColor: '#0068A7',
	},
	infoText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#0d2143',
		marginBottom: 2,
	},
	emailText: {
		fontSize: 13,
		color: '#0068A7',
		marginBottom: 10,
	},
	instructions: {
		color: '#333',
		fontSize: 14,
		textAlign: 'center',
		marginBottom: 20,
	},
	buttonPrimary: {
		backgroundColor: '#0068A7',
		paddingVertical: 10,
		paddingHorizontal: 30,
		borderRadius: 8,
		marginBottom: 10,
	},
	buttonSecondary: {
		backgroundColor: '#28a745',
		paddingVertical: 10,
		paddingHorizontal: 30,
		borderRadius: 8,
		marginBottom: 10,
	},
	buttonLogout: {
		backgroundColor: '#dc3545',
		paddingVertical: 10,
		paddingHorizontal: 30,
		borderRadius: 8,
		marginTop: 10,
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 15,
	},
});

export default ProfileScreen;
