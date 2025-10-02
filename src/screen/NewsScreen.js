import React, { useEffect, useContext, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import moment from 'moment';
import { BASE_URL, BASE_IMG_URL } from '../config/Config';
import { NewsContext } from '../context/NewsContext';

const NewsScreen = ( {navigation} ) => {
	const { token } = useContext(AuthContext);
	const { news, setNews } = useContext(NewsContext);
	const [ refreshing, setRefreshing]  = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			handleRefresh();
		}, 20000);	
		getNews();

		console.log(news)
		return() => {
			clearInterval(interval);
		}
	}, []);

	const getNews = async () => {
		try {
			const response = await axios.get(`${BASE_URL}/news?perPage=10&page=1&search=&orderBy=date&sortBy=desc`, {
				headers: {
					Authorization: `Bearer ${JSON.parse(token)}`,
				},
			});

			const data = response.data.response.data;
			if(response){
				setNews(data);
				setRefreshing(false);

			}else{
				console.log('gagal fetch data')
			}
		} catch (error) {
			console.error(error);
		}
	}

	const handleRefresh = () => {

		console.log('Refresh triggred !!')
		if (refreshing) return;
	  
		setRefreshing(true);
	  
		getNews();
		
	 };

	const Item = ({ id, title, date , hour, image}) => (
		<TouchableOpacity 
			style={styles.newsContainer}
			onPress={() => navigation.navigate('NewsDetailScreen', {
				newsId: id
			})}
		>
			{image !== null ? 
				<Image
					style={styles.newsImage}
					source={{ uri: `${BASE_IMG_URL}/${image}` }}
				/>
				:
				<Image
					style={styles.newsImage}
					source={require('../assets/Icons/kamera.png')}
				/>
			}
			<View style={{ flex:3, flexDirection: 'column' }}>
				<View style={styles.newsDescription}>
					<Text style={{ flex: 1, color: '#a7a9ac' }}>{moment(date, 'YYYY-MM-DD').format('DD MMMM YYYY')}</Text>
					<Text style={{ color: '#00aeef'}}>Oleh : Admin</Text>
				</View>
				<View style={styles.newsTitle}>
						<Text style={{ flex: 1, color: '#58595b', fontWeight: 'bold', textAlign: 'left' }}>{title}</Text>
				</View>
			</View>
		</TouchableOpacity >
	);

	return (
		<View style={styles.container}>
			<View style={{flexDirection: 'row', paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#adbcb1',}}>
				<Image
					style={{ width: 35, height: 35, marginRight: 5, tintColor: '#ffffff'}}
					source={require('../assets/Icons/title.png')}
				/>
				<Text style={{fontWeight: 'bold',fontSize: 35, color: '#ffffff'}}>Buletin Berita</Text>
			</View>
			<Text style={styles.welcomeText}>Daftar Berita</Text>
			<SafeAreaView style={styles.newsListContainer}>
				<FlatList
					data={news}
					renderItem={({ item }) => <Item id={item.id} title={item.title} date={item.date} hour={item.hour} image={item.thumbnail} />}
					keyExtractor={item => item.id}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
					}
				/>
			</SafeAreaView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 15,
		backgroundColor: '#122E5F'
	},
	heading: {
		fontWeight: 'bold',
		fontSize: 35,
		color: '#ffffff',
		paddingBottom: 5,
		borderBottomWidth: 1,
		borderBottomColor: '#adbcb1',
	},
	welcomeText: {
		fontWeight: 'bold',
		fontSize: 25,
		color: '#ffffff',
		paddingTop: 10,
		paddingBottom: 10,
	},
	newsListContainer: {
		flex: 1,
		borderRadius: 3,
		backgroundColor: '#ffffff',
		marginTop: 10,
		marginBottom: 10,
	},
	newsContainer: {
		flex: 1,
		flexDirection: 'row',
		padding: 8,
		borderTopWidth: 1,
		borderTopColor: '#00aeef',
		borderBottomWidth: 1,
		borderBottomColor: '#00aeef',
	},
	newsImage: {
		flex: 1,
		width: 70,
		height: 70,
		marginRight: 8,
	},
	newsDescription: {
		flexDirection: 'row', 
		justifyContent: 'space-between',
		paddingLeft: 7
	},
	newsTitle: {
		flexDirection: 'row',
		justifyContent: 'center',
		paddingLeft: 7,
		paddingTop: 5,
	},

});

export default NewsScreen;