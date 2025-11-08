import React, { useState, useEffect, useContext } from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	ScrollView,
	FlatList,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import NetInfo from '@react-native-community/netinfo';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL, BASE_IMG_URL } from '../config/Config';

const HomeScreen = ({ navigation }) => {
	const { userInfo } = useContext(AuthContext);
	const user = userInfo;
	const [reports, setReports] = useState([]);
	const [news, setNews] = useState([]);
	const [isConnected, setIsConnected] = useState(true);
	const [stats, setStats] = useState([]);

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(state => {
			setIsConnected(state.isConnected);
		});

		// Dummy News
		const dummyNews = [
			{ id: 1, title: 'Pembangunan Jembatan Baru di Kodam III', date: '2025-11-01' },
			{ id: 2, title: 'Latihan Gabungan TNI Sukses Digelar', date: '2025-11-02' },
			{ id: 3, title: 'Kodam IV Gelar Donor Darah Massal', date: '2025-11-03' },
			{ id: 4, title: 'Kegiatan Bakti Sosial di Bandung Raya', date: '2025-11-04' },
			{ id: 5, title: 'Peringatan Hari Pahlawan di Makodam', date: '2025-11-05' },
		];

		// Dummy Statistik
		const dummyStats = [
			{
				id: 1,
				title: 'Dapur BIN',
				items: [
					{ label: 'Pembangunan', value: 12 },
					{ label: 'Persiapan Running', value: 6 },
					{ label: 'Running', value: 18 },
					{ label: 'Terkendala', value: 3 },
					{ label: 'Bermasalah', value: 1 },
				],
				color: '#2761A9',
			},
			{
				id: 2,
				title: 'Dapur APBN BGN',
				items: [{ label: 'Total', value: 8 }],
				color: '#F5B700',
			},
			{
				id: 3,
				title: 'Dapur Lain',
				items: [{ label: 'Total', value: 5 }],
				color: '#6BCB77',
			},
			{
				id: 4,
				title: 'Jumlah Dapur Bermasalah',
				items: [{ label: 'Total', value: 4 }],
				color: '#F44336',
			},
		];

		setNews(dummyNews);
		setStats(dummyStats);
		setReports([]);
		return () => unsubscribe();
	}, []);

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			{/* Header */}
			<View style={styles.headerContainer}>
				<Text style={styles.headerTitle}>Dashboard</Text>
				<View
					style={[
						styles.networkIndicator,
						{ backgroundColor: isConnected ? '#6BCB77' : '#F44336' },
					]}
				>
					<Text style={styles.networkText}>
						{isConnected ? 'Online' : 'Offline'}
					</Text>
				</View>
			</View>

			{/* Profile Section */}
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

			{/* News Section */}
			<SafeAreaView style={styles.sectionContainer}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Buletin Berita</Text>
					<TouchableOpacity onPress={() => navigation.navigate('Buletin Berita')}>
						<Text style={styles.sectionMore}>Lihat Semua</Text>
					</TouchableOpacity>
				</View>

				<FlatList
					data={news}
					keyExtractor={(item) => item.id.toString()}
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 10, paddingTop: 10 }}
					renderItem={({ item }) => (
						<View style={styles.newsCard}>
							<Image
								source={{
									uri: 'https://picsum.photos/300/200?random=' + item.id,
								}}
								style={styles.newsImage}
							/>
							<View style={styles.newsContent}>
								<Text style={styles.newsDate}>
									{moment(item.date).format('DD MMM YYYY')}
								</Text>
								<Text style={styles.newsTitle} numberOfLines={2}>
									{item.title}
								</Text>
								<TouchableOpacity
									style={styles.readMoreBtn}
									onPress={() => navigation.navigate('Buletin Berita')}
								>
									<Text style={styles.readMoreText}>Baca Selengkapnya</Text>
								</TouchableOpacity>
							</View>
						</View>
					)}
				/>
			</SafeAreaView>

			{/* Statistik Section */}
			<SafeAreaView style={[styles.sectionContainer , { marginBottom: 110 }]}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Statistik Dapur</Text>
				</View>

				<View style={styles.statsGrid}>
					{stats.map((item) => (
						<View key={item.id} style={[styles.statCard, { borderLeftColor: item.color }]}>
							<Text style={[styles.statTitle, { color: item.color }]}>{item.title}</Text>
							{item.items.map((sub, i) => (
								<View key={i} style={styles.statRow}>
									<Text style={styles.statLabel}>{sub.label}</Text>
									<Text style={styles.statValue}>{sub.value}</Text>
								</View>
							))}
						</View>
					))}
				</View>
			</SafeAreaView>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		padding: 16,
	},
	headerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingBottom: 8,
		borderBottomWidth: 3,
		borderBottomColor: '#F5B700',
	},
	headerTitle: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#2761A9',
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
		color: '#333',
		marginVertical: 10,
	},
	profileContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#EAF4FF',
		padding: 10,
		borderRadius: 12,
		marginTop: 15,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: '#CFE3FF',
	},
	profileImage: {
		width: 70,
		height: 70,
		borderRadius: 10,
		borderColor: '#2761A9',
		borderWidth: 2,
		marginRight: 12,
	},
	profileInfo: { flex: 1 },
	profileName: { color: '#2761A9', fontSize: 18, fontWeight: 'bold' },
	profileSub: { color: '#333', fontSize: 14 },
	profileLocation: { color: '#777', fontSize: 14 },

	sectionContainer: {
		backgroundColor: '#FFFFFF',
		borderRadius: 10,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: '#E3E3E3',
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		backgroundColor: '#2761A9',
		padding: 10,
	},
	sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
	sectionMore: { fontSize: 16, color: '#F5B700', fontWeight: '500' },

	newsCard: {
		width: 260,
		backgroundColor: '#FFFFFF',
		borderRadius: 10,
		marginRight: 15,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 3,
		borderBottomWidth: 4,
		borderBottomColor: '#F5B700',
	},
	newsImage: {
		width: '100%',
		height: 140,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
	},
	newsContent: { padding: 10 },
	newsDate: { fontSize: 12, color: '#777', marginBottom: 5 },
	newsTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 10 },
	readMoreBtn: {
		backgroundColor: '#6BCB77',
		paddingVertical: 6,
		borderRadius: 6,
		alignSelf: 'flex-start',
		paddingHorizontal: 10,
	},
	readMoreText: { color: '#fff', fontSize: 13, fontWeight: '500' },

	// Statistik
	statsGrid: {
		flexDirection: 'column',
		padding: 12,
	},
	statCard: {
		backgroundColor: '#F9F9F9',
		borderRadius: 10,
		padding: 12,
		marginBottom: 12,
		borderLeftWidth: 6,
	},
	statTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 6,
	},
	statRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 2,
	},
	statLabel: {
		color: '#555',
		fontSize: 14,
	},
	statValue: {
		fontWeight: 'bold',
		color: '#333',
		fontSize: 14,
	},
});

export default HomeScreen;
