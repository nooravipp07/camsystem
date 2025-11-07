import React, { useState, useEffect, useContext } from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	ScrollView,
	useWindowDimensions,
	ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';
import RenderHtml from 'react-native-render-html';
import { BASE_URL, BASE_IMG_URL } from '../config/Config';

const NewsDetailScreen = ({ route }) => {
	const { token } = useContext(AuthContext);
	const [news, setNews] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { width } = useWindowDimensions();

	useEffect(() => {
		const { newsId } = route.params;

		const getNewsById = async () => {
			try {
				const response = await axios.get(`${BASE_URL}/news/${newsId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				const data = response.data.response;
				setNews(data);
			} catch (err) {
				console.error(err);
				setError('Gagal memuat berita. Silakan coba lagi.');
			} finally {
				setLoading(false);
			}
		};

		getNewsById();
	}, []);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#ffffff" />
				<Text style={{ color: '#ffffff', marginTop: 10 }}>Memuat berita...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={{ color: '#ffffff', textAlign: 'center' }}>{error}</Text>
			</View>
		);
	}

	if (!news) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={{ color: '#ffffff' }}>Berita tidak ditemukan.</Text>
			</View>
		);
	}

	const source = { html: news.desc || '' };

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Image
					style={styles.headerIcon}
					source={require('../assets/Icons/title.png')}
				/>
				<Text style={styles.headerTitle}>Buletin Berita</Text>
			</View>

			<Text style={styles.subTitle}>Baca Berita</Text>

			<ScrollView
				style={styles.contentContainer}
				showsVerticalScrollIndicator={false}
			>
				{/* Info Tanggal dan Penulis */}
				<View style={styles.metaInfo}>
					<Text style={styles.dateText}>
						{moment(news.date, 'YYYY-MM-DD').format('DD MMMM YYYY')}
					</Text>
					<Text style={styles.authorText}>Oleh : Admin</Text>
				</View>

				{/* Judul */}
				<Text style={styles.title}>{news.title}</Text>

				{/* Gambar Utama */}
				{news.thumbnail ? (
					<Image
						style={styles.image}
						source={{ uri: `${BASE_IMG_URL}/${news.thumbnail}` }}
					/>
				) : (
					<Image
						style={styles.image}
						source={require('../assets/Icons/kamera.png')}
					/>
				)}

				{/* Konten HTML */}
				<View style={styles.descContainer}>
					<RenderHtml
						contentWidth={width}
						source={source}
						tagsStyles={{
							p: { fontSize: 15, color: '#333', lineHeight: 22, textAlign: 'justify' },
							h2: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
							strong: { fontWeight: 'bold' },
						}}
					/>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 15,
		backgroundColor: '#122E5F',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderBottomColor: '#adbcb1',
		paddingBottom: 5,
	},
	headerIcon: {
		width: 35,
		height: 35,
		tintColor: '#ffffff',
		marginRight: 8,
	},
	headerTitle: {
		fontWeight: 'bold',
		fontSize: 28,
		color: '#ffffff',
	},
	subTitle: {
		fontSize: 18,
		color: '#ffffff',
		fontWeight: '500',
		marginTop: 10,
		marginBottom: 15,
	},
	contentContainer: {
		backgroundColor: '#ffffffcc',
		borderRadius: 10,
		padding: 12,
	},
	metaInfo: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	dateText: {
		fontSize: 14,
		color: '#6c757d',
	},
	authorText: {
		fontSize: 14,
		color: '#00aeef',
		fontWeight: 'bold',
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#222',
		marginBottom: 12,
		lineHeight: 30,
	},
	image: {
		width: '100%',
		height: 250,
		borderRadius: 8,
		marginBottom: 15,
		resizeMode: 'cover',
	},
	descContainer: {
		paddingBottom: 20,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#122E5F',
	},
});

export default NewsDetailScreen;
