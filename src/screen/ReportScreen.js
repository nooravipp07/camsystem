import React, { useEffect, useContext, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';
import { BASE_URL, BASE_IMG_URL } from '../config/Config';
import { ReportContext } from '../context/ReportContext';

const ReportScreen = ( {navigation} ) => {
	const { token } = useContext(AuthContext);
	const { reports, setReports } = useContext(ReportContext);
	const [ refreshing, setRefreshing]  = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			handleRefresh();
		}, 20000);	
		getReports();
		return() => {
			clearInterval(interval);
		}
	}, []);

	const getReports = async () => {
		try {
			const response = await axios.get(`${BASE_URL}/reports?perPage=50&page=1&search=&orderBy=created_at&sortBy=desc`, {
				headers: {
					Authorization: `Bearer ${JSON.parse(token)}`,
				},
			});

			const data = response.data.response.data;
			if(response){
				setReports(data);
				setRefreshing(false);

			}else{
				console.log('gagal fetch data')
			}
		} catch (error) {
			console.error(error);
		}
	}

	const handleRefresh = () => {
		if (refreshing) return;
	  
		setRefreshing(true);
	  
		// Perform data fetching or any asynchronous operation
		getReports();
		
	 };

	const Item = ({ id, desc, date , hour, image}) => (
		<TouchableOpacity 
			style={styles.newsContainer}
			onPress={() => {
				navigation.navigate('ReportDetailScreen', {
					reportId: id
				})}
			}
		>
			{image !== undefined ? 
				
				<Image 
					style={styles.newsImage} 
					source={{ uri: `${BASE_IMG_URL}${image.file}`}} 
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
						<Text style={{ color: '#00aeef'}}>{hour.substring(0, 5)}</Text>
					</View>
					<View style={styles.newsTitle}>
						<Text style={{ flex: 1, color: '#a7a9ac', fontWeight: 'bold', textAlign: 'left' }}>{desc.substring(0, 120)} ... </Text>
					</View>
			</View>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<View style={{flexDirection: 'row', paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#adbcb1',}}>
				<Text style={{fontWeight: 'bold',fontSize: 32, color: '#ffffff'}}>Laporan Kejadian</Text>
			</View>
			<Text style={styles.welcomeText}>Daftar Laporan</Text>
			<SafeAreaView style={styles.newsListContainer}>
				<FlatList
					data={reports}
					renderItem={({ item }) => <Item id={item.id} desc={item.desc} date={item.date} hour={item.hour} image={item.photos.find(val => val.extension_file !== "application/pdf" && val.extension_file !== "video/mp4")} />}
					keyExtractor={item => item.id}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
					}
				/>
			</SafeAreaView >
			<TouchableOpacity 
				style={styles.buttonContainer}
				onPress={() => navigation.navigate('ReportFormStep1')}
			>
				<Text style={styles.buttonText}>TAMBAH LAPORAN</Text>
			</TouchableOpacity>
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
		backgroundColor: '#ffffffcc',
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
	buttonContainer: {
		backgroundColor: '#0068A7',
		paddingVertical: 12,
		borderRadius: 4,
		width: '100%',
		marginTop: 30,
	},
	buttonText: {
		textAlign: 'center',
		color: '#ffff',
		fontWeight: '700',
	},

});

export default ReportScreen;