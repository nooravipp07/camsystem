import React, { useState, useEffect, useContext } from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	ScrollView,
	useWindowDimensions,
	ActivityIndicator,
	TouchableOpacity,
	SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';
import RenderHtml from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL, BASE_IMG_URL } from '../config/Config';
import SkeletonCard from '../components/SkeletonCard';

const NewsDetailScreen = ({ route, navigation }) => {
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
				setNews(response.data.response);
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
		return <SkeletonCard count={5} />;
	}

	if (error) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={{ color: '#0d2143', textAlign: 'center' }}>{error}</Text>
			</View>
		);
	}

	if (!news) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={{ color: '#0d2143' }}>Berita tidak ditemukan.</Text>
			</View>
		);
	}

	const source = { html: news.desc || '' };

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					style={styles.backButton}
				>
					<Icon name="arrow-back-outline" size={24} color="#000" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Detail Berita</Text>
			</View>

			{/* Konten berita */}
			<SafeAreaView style={styles.contentContainer}>
				<ScrollView showsVerticalScrollIndicator={false}>
					<View style={styles.card}>
						{/* Gambar utama dengan title di atasnya */}
						<View style={styles.imageWrapper}>
							<View style={styles.overlay}>
								<Text style={styles.imageTitle}>{news.title}</Text>
							</View>
							{/* <Image
								style={styles.cardImage}
								source={{
									uri: news.thumbnail
										? `${BASE_IMG_URL}/${news.thumbnail}`
										: `https://picsum.photos/400/250?random=1`,
								}}
							/> */}
							<Image
								style={styles.cardImage}
								source={{
									uri: news.thumbnail
										? `https://picsum.photos/400/250?random=1`
										: `https://picsum.photos/400/250?random=1`,
								}}
							/>
							<View style={styles.overlay}>
								<Text style={styles.imageTitle}>{news.title}</Text>
							</View>
						</View>

						{/* Meta info */}
						<View style={styles.cardContent}>
							<View style={styles.cardMeta}>
								<Text style={styles.cardDate}>
									{moment(news.date, 'YYYY-MM-DD').format('DD MMMM YYYY')}
								</Text>
								<Text style={styles.cardAuthor}>Admin</Text>
							</View>

							{/* Konten berita (HTML) */}
							<View style={styles.cardDesc}>
								<RenderHtml
									contentWidth={width - 60}
									source={source}
									tagsStyles={{
										p: {
											fontSize: 15,
											color: '#222',
											lineHeight: 24,
											marginBottom: 10,
											textAlign: 'justify',
										},
										h2: {
											fontSize: 18,
											fontWeight: '700',
											color: '#0d2143',
											marginVertical: 8,
										},
										h3: {
											fontSize: 16,
											fontWeight: '600',
											color: '#333',
											marginVertical: 6,
										},
										strong: { fontWeight: 'bold' },
									}}
								/>
							</View>
						</View>
					</View>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 15,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		backgroundColor: '#fff',
	},
	backButton: {
		padding: 6,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#0d2143',
		marginLeft: 10,
	},
	contentContainer: {
		flex: 1,
		padding: 15,
		backgroundColor: '#fff',
	},
	card: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 0,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 4,
		elevation: 2,
	},
	imageWrapper: {
		position: 'relative',
	},
	cardImage: {
		width: '100%',
		height: 220,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		resizeMode: 'cover',
	},
	overlay: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		padding: 10,
		backgroundColor: 'rgba(0,0,0,0.4)',
		borderBottomLeftRadius: 12,
		borderBottomRightRadius: 12,
	},
	imageTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#fff',
		lineHeight: 24,
	},
	cardContent: {
		paddingHorizontal: 15,
		paddingVertical: 12,
	},
	cardMeta: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	cardDate: {
		fontSize: 13,
		color: '#6c757d',
	},
	cardAuthor: {
		fontSize: 13,
		color: '#007bff',
		fontWeight: '600',
	},
	cardDesc: {
		marginTop: 6,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
	},
});

export default NewsDetailScreen;
