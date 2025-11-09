import React, { useState, useEffect, useContext} from 'react';
import { View, Text, Image, StyleSheet,ScrollView, TouchableOpacity, Linking } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';
import ImageModal from 'react-native-image-modal';
import { BASE_URL, BASE_IMG_URL } from '../config/Config';

const ReportDetailScreen = ({route, navigation}) => {
    const { token } = useContext(AuthContext);
    const [report, setReport] = useState(null);

    const [date, setDate] = useState('');
    const [hour, setHour] = useState('');
    const [desc, setDesc] = useState('');
    const [keterangan, setKeterangan] = useState('');
    const [province, setProvince] = useState('');
    const [regency, setRegency] = useState('');
    const [district, setDistrict] = useState('');
    const [village, setVillage] = useState('');
	const [files, setFiles] = useState([]);

	useEffect(() => {
		console.log('Token :', token);
		console.log('BASE URL :', BASE_IMG_URL);

        const { reportId } = route.params;

        console.log('Report Id :', reportId);

		const getReportById = async () => {
			try {
				const response = await axios.get(`${BASE_URL}/reports/${reportId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const data = response.data.response;
                console.log(data.photos);
				if(response){
					setReport(response.data.response);
                    setDate(data.date);
                    setHour(data.hour);
                    setDesc(data.desc);
                    setKeterangan(data.keterangan);
                    setProvince(data.province_name);
                    setRegency(data.regency_name);
                    setDistrict(data.district_name);
                    setVillage(data.village_name);
					setFiles(data.photos)
				}else{
					console.log('gagal fetch data')
				}
			} catch (error) {
				console.error(error);
			}				
		}

		getReportById();
	}, []);

	return (
		<View style={styles.container}>
			<View style={{flexDirection: 'row', paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#adbcb1',}}>
				<Image
					style={{ width: 35, height: 35, marginRight: 5, tintColor: '#ffffff'}}
					source={require('../assets/Icons/title.png')}
				/>
				<Text style={{fontWeight: 'bold',fontSize: 35, color: '#ffffff'}}>Pelaporan</Text>
			</View>
			<Text style={styles.welcomeText}>Lihat Pelaporan</Text>
			<ScrollView style={styles.newsListContainer}>
				<View style={{backgroundColor: '#00aeef', flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 30, padding: 5}}>
                    <Text style={{fontSize: 20, color:'#ffffff', fontWeight:'bold', padding: 6}}>PELAPORAN</Text>
                </View>
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, padding: 5}}>
                    <Text style={{flex: 1, color:'black', fontSize: 10, fontWeight:'bold', padding: 6}}>{moment(date, 'YYYY-MM-DD').format('DD MMMM YYYY')} | {hour.substring(0, 5)}</Text>
                    <Text style={{flex:1, color:'black', fontSize: 10, fontWeight:'bold', padding: 6, textAlign: 'right'}}>Desa {village}, Kec. {district}, Kab {regency}, {province}</Text>
                </View>
                <View style={{flex: 1, marginTop: 25, padding: 5}}>
                    <Text style={{flex: 1, color:'#ffffff', backgroundColor: '#00aeef', fontSize: 10, fontWeight:'bold', padding: 6}}>URAIAN KEJADIAN</Text>
                    <Text style={{flex: 1, color:'black', fontSize: 10, padding: 6}}>
                        {desc}
                    </Text>
                </View>

                <View style={{flex: 1, marginTop: 25, padding: 5}}>
                    <Text style={{flex: 1, color:'#ffffff', backgroundColor: '#00aeef', fontSize: 10, fontWeight:'bold', padding: 6}}>KETERANGAN / TINDAKAN</Text>
                    <Text style={{flex: 1, color:'black', fontSize: 10, padding: 6}}>
                        {keterangan}
                    </Text>
                </View>

                <View style={{flex: 1, marginTop: 25, padding: 5}}>
					<Text style={{flex: 1, color:'#ffffff', backgroundColor: '#00aeef', fontSize: 10, fontWeight:'bold', padding: 6}}>LAMPIRAN FOTO</Text>
					<ScrollView style={{ flexDirection: 'row', padding: 5}} horizontal={true}>
					{files?.map((val, index) => {
						if(val.extension_file == "image/jpeg"){
							return (
								<ImageModal
									key={index.toString()}
									modalImageResizeMode="contain"
									style={styles.imgContainer}
									source={{ uri: `${BASE_IMG_URL}${val.file}`}}
								/>				
							)
						}
					})}
					</ScrollView>
                </View>
				<View style={{flex: 1, marginTop: 25, padding: 5}}>
					<Text style={{flex: 1, color:'#ffffff', backgroundColor: '#00aeef', fontSize: 10, fontWeight:'bold', padding: 6}}>LAMPIRAN VIDEO</Text>
					<ScrollView style={{ flexDirection: 'row', padding: 5}} horizontal={true}>
					{files?.map((val, index) => {
						if(val.extension_file == "video/mp4"){
							return (
								<TouchableOpacity
									key={index.toString()}
									onPress={() => {
										const url = `${BASE_IMG_URL}${val.file}`;
										Linking.openURL(url).catch(err => console.error('An error occurred', err));
									}}
								>
									<Text style={{ flex: 1, color: 'black', fontSize: 10, padding: 6 }}>
										{val.file.substring(val.file.lastIndexOf('/'))} (Klik Untuk Melihat Video)
									</Text>
								</TouchableOpacity>	
							)
						}
					})}
					</ScrollView>
                </View>
				<View style={{flex: 1, marginTop: 15, padding: 5}}>
					<Text style={{flex: 1, color:'#ffffff', backgroundColor: '#00aeef', fontSize: 10, fontWeight:'bold', padding: 6}}>LAMPIRAN DOKUMEN</Text>
					<View style={{ flexDirection: 'column', padding: 5}}>
					{files?.map((val, index) => {
						if(val.extension_file === "application/pdf"){
							return (
								<TouchableOpacity
									key={index}
									onPress={() => {
										navigation.navigate('PDFViewer', {
											uri: `${BASE_IMG_URL}${val.file}`
										})}
									}
								>
									<Text style={{flex: 1, color:'black', fontSize: 10, padding: 6}}>{val.file.substring(val.file.lastIndexOf('/'))} (Klik Untuk Melihat Dokumen)</Text>
								</TouchableOpacity>				
							)
						}
					})}
					</View>
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
		width: 160,
		height: 160,
		margin: 3,
		borderRadius: 2,
		marginTop: 10

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
	video: {
		width: '100%',
		height: 300,
	},

});

export default ReportDetailScreen;