import React, { useState, useEffect, useContext } from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	ImageBackground,
	ScrollView,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import NetInfo from '@react-native-community/netinfo';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL, BASE_IMG_URL } from '../config/Config';

const HomeScreen = ({ navigation }) => {
	const { userInfo, token } = useContext(AuthContext);
	const user = userInfo;

	const [reports, setReports] = useState([]);
	const [news, setNews] = useState([]);
	const [isConnected, setIsConnected] = useState(true);

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(state => {
			setIsConnected(state.isConnected);
		});

		const interval = setInterval(() => {
			fetchNews();
			fetchReports();
		}, 10000);

		fetchNews();
		fetchReports();

		return () => {
			unsubscribe();
			clearInterval(interval);
		};
	}, []);

	const fetchReports = async () => {
		try {
			const { data } = await axios.get(
				`${BASE_URL}/reports?perPage=2&page=1&orderBy=created_at&sortBy=desc`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setReports(data.response.data || []);
		} catch (err) {
			console.error('Failed to fetch reports:', err);
		}
	};

	const fetchNews = async () => {
		try {
			const { data } = await axios.get(
				`${BASE_URL}/news?perPage=2&page=1&orderBy=date&sortBy=desc`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setNews(data.response.data || []);
		} catch (err) {
			console.error('Failed to fetch news:', err);
		}
	};

	return (
		<ImageBackground
			source={require('../assets/Images/bg.png')}
			style={styles.imgBackground}
		>
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.headerContainer}>
					<Text style={styles.headerTitle}>Dashboard</Text>
					<View
						style={[
							styles.networkIndicator,
							{ backgroundColor: isConnected ? '#4CAF50' : '#F44336' },
						]}
					>
						<Text style={styles.networkText}>
							{isConnected ? 'Online' : 'Offline'}
						</Text>
					</View>
				</View>

				{/* Welcome + Profile */}
				<Text style={styles.welcomeText}>Selamat Datang</Text>
				<View style={styles.profileContainer}>
					<TouchableOpacity onPress={() => navigation.navigate('Profile')}>
						<Image
							style={styles.profileImage}
							source={
								user?.avatar
									? { uri: `${BASE_IMG_URL}${user.avatar}` }
									: require('../assets/Icons/kamera.png')
							}
						/>
					</TouchableOpacity>
					<View style={styles.profileInfo}>
						<Text style={styles.profileName}>{user?.name}</Text>
						<Text style={styles.profileSub}>{user?.kodam_name}</Text>
						<Text style={styles.profileLocation}>{user?.regency_name}</Text>
					</View>
				</View>

				{/* Menu Grid */}
				<View style={styles.menuGrid}>
					<MenuButton
						label="Lap. Kerawanan"
						icon={require('../assets/Icons/pelaporan.png')}
						onPress={() => navigation.navigate('Pelaporan')}
					/>
					<MenuButton
						label="Lap. Progres SPPG"
						icon={require('../assets/Icons/pelaporan.png')}
						onPress={() => navigation.navigate('Progres SPPG')}
					/>
					<MenuButton
						label="Lap. Kejadian"
						icon={require('../assets/Icons/pelaporan.png')}
						onPress={() => navigation.navigate('Pelaporan')}
					/>
					<MenuButton
						label="Lap. Harian"
						icon={require('../assets/Icons/pelaporan.png')}
						onPress={() => navigation.navigate('Pelaporan')}
					/>
					<MenuButton
						label="Lap. Lain - lain"
						icon={require('../assets/Icons/pelaporan.png')}
						onPress={() => navigation.navigate('Pelaporan')}
					/>
				</View>

				{/* News Section */}
				<DataSection
					title="Buletin Berita"
					data={news}
					onPress={() => navigation.navigate('Buletin Berita')}
					renderItem={(val) => (
						<View style={styles.itemRow}>
							<View style={{ flex: 3 }}>
								<View style={styles.itemMeta}>
									<Text style={styles.itemDate}>
										{moment(val.date).format('DD MMM YYYY')}
									</Text>
									<Text style={styles.itemAuthor}>Oleh: Admin</Text>
								</View>
								<Text style={styles.itemTitle} numberOfLines={2}>
									{val.title}
								</Text>
							</View>
						</View>
					)}
				/>

				{/* Reports Section */}
				<DataSection
					title="Pelaporan"
					data={reports}
					onPress={() => navigation.navigate('Pelaporan')}
					renderItem={(val) => (
						<View style={styles.itemRow}>
							<View style={{ flex: 3 }}>
								<View style={styles.itemMeta}>
									<Text style={styles.itemDate}>
										{moment(val.date).format('DD MMM YYYY')}
									</Text>
									<Text style={styles.itemAuthor}>
										{val.hour?.substring(0, 5)}
									</Text>
								</View>
								<Text style={styles.itemTitle} numberOfLines={2}>
									{val.desc}
								</Text>
							</View>
						</View>
					)}
				/>
			</ScrollView>
		</ImageBackground>
	);
};

/* ---------- Sub Components ---------- */
const MenuButton = ({ label, icon, onPress }) => (
	<TouchableOpacity style={styles.menuItem} onPress={onPress}>
		<Image source={icon} style={styles.menuIcon} />
		<Text style={styles.menuLabel}>{label}</Text>
	</TouchableOpacity>
);

const DataSection = ({ title, data, onPress, renderItem }) => (
	<SafeAreaView style={styles.sectionContainer}>
		<View style={styles.sectionHeader}>
			<Text style={styles.sectionTitle}>{title}</Text>
			<TouchableOpacity onPress={onPress}>
				<Text style={styles.sectionMore}>Lihat Semua</Text>
			</TouchableOpacity>
		</View>
		{data.map((item, idx) => (
			<View key={idx}>{renderItem(item)}</View>
		))}
	</SafeAreaView>
);

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
	imgBackground: {
		flex: 1,
		padding: 16,
		backgroundColor: '#0c1a13',
	},
	headerContainer: {
		borderBottomWidth: 1,
		borderBottomColor: '#adbcb1',
		paddingBottom: 6,
		marginBottom: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	headerTitle: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#fff',
	},
	networkIndicator: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 10,
	},
	networkText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 12,
	},
	welcomeText: {
		fontSize: 22,
		fontWeight: '600',
		color: '#fff',
		marginVertical: 10,
	},
	profileContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
		borderBottomWidth: 2,
		borderBottomColor: '#2761a9',
		marginBottom: 16,
	},
	profileImage: {
		width: 70,
		height: 70,
		borderRadius: 10,
		borderColor: '#2761a9',
		borderWidth: 2,
		marginRight: 12,
	},
	profileInfo: { flex: 1 },
	profileName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
	profileSub: { color: '#fff', fontSize: 15 },
	profileLocation: { color: '#fff', fontSize: 14 },
	menuGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'flex-start',
		columnGap: 18,
		rowGap: 10,
		marginBottom: 16,
	},
	menuItem: {
		width: '30%',
		backgroundColor: '#ffffffcc',
		borderRadius: 12,
		alignItems: 'center',
		paddingVertical: 15,
	},
	menuIcon: {
		width: 45,
		height: 45,
		tintColor: '#2761a9',
		marginBottom: 5,
	},
	menuLabel: {
		fontSize: 13,
		fontWeight: '600',
		color: '#29352e',
		textAlign: 'center',
	},
	sectionContainer: {
		backgroundColor: '#fff',
		borderRadius: 8,
		marginBottom: 16,
		overflow: 'hidden',
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		backgroundColor: '#2761a9',
		padding: 10,
	},
	sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
	sectionMore: { fontSize: 16, color: '#fff', fontWeight: '500' },
	itemRow: {
		flexDirection: 'row',
		padding: 10,
		borderTopWidth: 1,
		borderColor: '#2761a933',
	},
	itemMeta: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 4,
	},
	itemDate: { color: '#a7a9ac', fontSize: 13 },
	itemAuthor: { color: '#2761a9', fontSize: 13 },
	itemTitle: { color: '#333', fontWeight: '600', fontSize: 14 },
});

export default HomeScreen;
