import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';
import { BASE_URL, BASE_IMG_URL } from '../config/Config';

const HomeScreen = ({ navigation }) => {
	const { userInfo } = useContext(AuthContext);
	const { token } = useContext(AuthContext);
	const [reports, setReports] = useState(null);
	const [news, setNews] = useState(null);

	const user = JSON.parse(userInfo);

	useEffect(() => {
		const interval = setInterval(() => {
			getNews();
			getReports();
		}, 10000);	
		console.log(user);
		getNews();
		getReports();
		
		return() => {
			clearInterval(interval);
		}

	}, []);

	const getReports = async () => {
		try {
			const response = await axios.get(`${BASE_URL}/reports?perPage=2&page=1&search=&orderBy=created_at&sortBy=desc`, {
				headers: {
					Authorization: `Bearer ${JSON.parse(token)}`,
				},
			});

			if(response){
				setReports(response.data.response.data);
			}else{
				console.log('gagal fetch data')
			}
		} catch (error) {
			console.error(error);
		}				
	}

	const getNews = async () => {
		try {
			const response = await axios.get(`${BASE_URL}/news?perPage=2&page=1&search=&orderBy=date&sortBy=desc`, {
				headers: {
					Authorization: `Bearer ${JSON.parse(token)}`,
				},
			});

			if(response){
				setNews(response.data.response.data);
			}else{
				console.log('gagal fetch data')
			}
		} catch (error) {
			console.error(error);
		}				
	}

	return (
		// <ScrollView>
			<ImageBackground 
				style={styles.imgBackground}
				source={ require('../assets/Images/bg.png') }
			>
			<View style={{flexDirection: 'row', paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#adbcb1',}}>
				<Image
					style={{ width: 35, height: 35, marginRight: 5, tintColor: '#ffffff'}}
					source={require('../assets/Icons/title.png')}
				/>
				<Text style={{fontWeight: 'bold',fontSize: 35, color: '#ffffff'}}>Dashboard</Text>
			</View>
			<Text style={styles.welcomeText}>Selamat Datang</Text>
				<View style={styles.profileContainer}>
					<TouchableOpacity 
						onPress={ () => {
							navigation.navigate('Profile');
						}}
					>
						{user? 
							<Image
								style={styles.profileImage}
								source={{ uri: `${BASE_IMG_URL}${user.avatar}` }}
							/>
							:
							<Image
								style={styles.profileImage}
								source={require('../assets/Icons/kamera.png')}
							/>
						}
					</TouchableOpacity>
					<View style={styles.profileName}>
						<Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 25 }}>{ user ? user.name : '' }</Text>
						<Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 15 }}>Kodam { user ? user.kodam_name : '' }</Text>
						<Text style={{ color: '#00aeef', fontSize: 15 }}>{user ? user.regency_name : '' }</Text>
					</View>
				</View>
				<SafeAreaView style={styles.newsListContainer}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#00aeef', padding: 8, borderTopRightRadius: 3, borderTopLeftRadius: 3 }}>
						<Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff' }}>BULETIN BERITA</Text>
						<TouchableOpacity
							onPress={() => navigation.navigate('Buletin Berita')}
						>
							<Text style={{ fontSize: 17, color: '#ffffff'  }}>Lihat Semua </Text>
						</TouchableOpacity>
					</View>
					{
						news?.map((val, index) => {
							return (
								<View style={styles.newsContainer} key={index}>
									{/* {val.thumbnail !== null ? 
										<Image
											style={styles.newsImage}
											source={{ uri: `${BASE_IMG_URL}/${val.thumbnail}` }}
										/>
										:
										<Image
											style={styles.newsImage}
											source={require('../assets/Icons/kamera.png')}
										/>
									} */}
									<View style={{ flex:3, flexDirection: 'column' }}>
										<View style={styles.newsDescription}>
											<Text style={{ flex: 1, color: '#a7a9ac' }}>{moment(val.date, 'YYYY-MM-DD').format('DD MMMM YYYY')}</Text>
												<Text style={{ color: '#00aeef'}}>Oleh: Admin</Text>
											</View>
											<View style={styles.newsTitle}>
												<Text style={{ flex: 1, color: '#58595b', fontWeight: 'bold', textAlign: 'left' }}>{val.title}</Text>
											</View>
									</View>
								</View>
							)
						})
					}
				</SafeAreaView>
				<SafeAreaView style={styles.newsListContainer}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#00aeef', padding: 8, borderTopRightRadius: 3, borderTopLeftRadius: 3 }}>
						<Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff' }}>PELAPORAN</Text>
						<TouchableOpacity
							onPress={() => navigation.navigate('Pelaporan')}
						>
							<Text style={{ fontSize: 17, color: '#ffffff'  }}>Lihat Semua </Text>
						</TouchableOpacity>
					</View>
					{
						reports?.map((val, index) => {
							let imageFound = false;
							return (
								<View style={styles.newsContainer} key={index}>
									{/* { 
										val.photos.length !== 0 ? 
										(val.photos.map((val, index) => {
											if(!imageFound && val.extension_file !== 'application/pdf'){
												imageFound = true;
												return(
													<Image
														key={index}
														style={styles.newsImage}
														source={{ uri: `${BASE_IMG_URL}${val.file}` }}
													/>
												)
											} else {
												return null;
											}
										})) : 
										(
											<Image
												style={styles.newsImage}
												source={require('../assets/Icons/kamera.png')}
											/>
										)
									} */}
									<View style={{ flex:3, flexDirection: 'column' }}>
										<View style={styles.newsDescription}>
											<Text style={{ flex: 1, color: '#a7a9ac' }}>{moment(val.date, 'YYYY-MM-DD').format('DD MMMM YYYY')}</Text>
												<Text style={{ color: '#00aeef'}}>{val.hour.substring(0, 5)}</Text>
											</View>
											<View style={styles.newsTitle}>
												<Text style={{ flex: 1, color: '#58595b', fontWeight: 'bold', textAlign: 'left' }}>{val.desc.substring(0, 120)} ... </Text>
											</View>
									</View>
								</View>
							)
						})
					}
				</SafeAreaView>
				</ImageBackground>
		// </ScrollView>
		
	);
};

const styles = StyleSheet.create({
	imgBackground: {
        flex: 1,
		padding: 15,
        resizeMode: 'over',
		justifyContent: 'center'
    },
	container: {
		flex: 1,
		padding: 15,
		backgroundColor: '#29352e'
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
		color: '#00aeef',
		paddingTop: 10,
		paddingBottom: 10,
	},
	profileContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingBottom: 20,
		marginBottom: 16,
		borderBottomWidth: 2,
		borderBottomColor: '#00aeef',
	},
	profileImage: {
		width: 70,
		height: 70,
		borderRadius: 5,
		borderColor: '#00aeef',
		borderWidth: 2,
		marginRight: 8,
	},
	profileName: {
		paddingLeft: 7,
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
		borderTopWidth: 2,
		borderTopColor: '#00aeef',
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

export default HomeScreen;