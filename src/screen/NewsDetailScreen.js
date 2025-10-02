import React, { useState, useEffect, useContext} from 'react';
import { View, Text, Image, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';
import RenderHtml from 'react-native-render-html';
import { BASE_URL, BASE_IMG_URL } from '../config/Config';

const NewsDetailScreen = ({route}) => {
	const { token } = useContext(AuthContext);
    const [ news, setNews] = useState(null);

	const [date, setDate] = useState('');
    const [hour, setHour] = useState('');
	const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
	const [thumbnail, setThumbnail] = useState('');

	const { width } = useWindowDimensions();
	const source = {
		html: `${desc}`
	};

	useEffect(() => {
        const { newsId } = route.params;
		const getNewsById = async () => {
			try {
				const response = await axios.get(`${BASE_URL}/news/${newsId}`, {
					headers: {
						Authorization: `Bearer ${JSON.parse(token)}`,
					},
				});

				const data = response.data.response;
                console.log(data);
				if(response){
					setNews(response.data.response);
                    setDate(data.date);
                    setHour(data.hour);
                    setDesc(data.desc);
                    setTitle(data.title);
					setThumbnail(data.thumbnail)
				}else{
					console.log('gagal fetch data')
				}
			} catch (error) {
				console.error(error);
			}				
		}

		getNewsById();
	}, []);

	return (
		<View style={styles.container}>
			<View style={{flexDirection: 'row', paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#adbcb1',}}>
				<Image
					style={{ width: 35, height: 35, marginRight: 5, tintColor: '#ffffff'}}
					source={require('../assets/Icons/title.png')}
				/>
				<Text style={{fontWeight: 'bold',fontSize: 35, color: '#ffffff'}}>Buletin Berita</Text>
			</View>
			<Text style={styles.welcomeText}>Baca</Text>
			<ScrollView style={styles.newsListContainer}>
				<View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, padding: 5}}>
                    <Text style={{flex: 1, color:'#58595b', fontSize: 15, fontWeight:'bold', padding: 6}}>{moment(date, 'YYYY-MM-DD').format('DD MMMM YYYY')}</Text>
                    <Text style={{flex:1, color:'#00aeef', fontSize: 15, fontWeight:'bold', padding: 6, textAlign: 'right'}}>Oleh : Admin</Text>
                </View>
				<View style={{flex: 1, flexDirection: 'row', padding: 5}}>
                    <Text style={{flex: 1, color:'#58595b', fontSize: 25, textAlign: 'justify', fontWeight:'bold', padding: 6}}>{title}</Text>
                </View>
				<View style={{flex: 1, flexDirection: 'row', marginTop: 10, padding: 6}}>
					<Image 
						style={styles.imgContainer} 
						source={{ uri: `${BASE_IMG_URL}/${thumbnail}`}} 
					/>
                </View>
				<View style={{flex: 1, flexDirection: 'row', marginTop: 5, padding: 5}}>
					<RenderHtml
						contentWidth={width}
						source={source}
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
		fontSize: 26,
		color: '#ffffff',
		paddingTop: 10,
		paddingBottom: 10,
	},
	newsListContainer: {
		borderRadius: 3,
		backgroundColor: '#ffffff',
		marginTop: 10,
		marginBottom: 10,
	},
	newsContainer: {
		flexDirection: 'row',
		padding: 8
	},
	imgContainer: {
		width: '100%',
		height: 300,
		borderRadius: 5,
		marginBottom: 5

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

export default NewsDetailScreen;