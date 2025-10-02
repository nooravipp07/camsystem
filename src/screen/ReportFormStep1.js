import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput,StyleSheet, TouchableOpacity, Image, SafeAreaView, FlatList, ScrollView, Modal} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DataContext  } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';
import axios from 'axios';
import { BASE_URL } from '../config/Config';

const ReportFormStep1 = ( {navigation} ) => {

	const [modalProvVisible, setModalProvVisible] = useState(false);
	const [modalKabVisible, setModalKabVisible] = useState(false);
	const [modalKecVisible, setModalKecVisible] = useState(false);
	const [modalKelVisible, setModalKelVisible] = useState(false);

	const [provText, setProvText] = useState('');
	const [kabText, setKabText] = useState('');
	const [kecText, setKecText] = useState('');
	const [kelText, setKelText] = useState('');

	const [prov, setProv] = useState(null);
	const [kab, setKab] = useState(null);
	const [kec, setKec] = useState(null);
	const [kel, setKel] = useState(null);

	const { token, userInfo } = useContext(AuthContext);
	const { formData, updateFormData } = useContext(DataContext);

	const [date, setDate] = useState(new Date());
	const [time, setTime] = useState(new Date());

	const [formattedDate, setFormattedDate] = useState('');
	const [formattedTime, setFormattedTime] = useState('');

	const [showTimePicker, setShowTimePicker] = useState(false);
	const [showDatePicker, setShowDatePicker] = useState(false);

	const user = JSON.parse(userInfo);

	useEffect(() => {
		autoFill();
	}, []);

	const onChangeDate = (event, selectedDate) => {
		const currentDate = new Date(selectedDate) || date;
		const tempFormattedDate = moment(currentDate).format('MM-DD-YYYY');

		setShowDatePicker(Platform.OS === 'ios');
		setDate(currentDate);
		updateFormData({ date: tempFormattedDate });
		setFormattedDate(tempFormattedDate);

		console.log('Date From State :', formattedDate);
		console.log('Date From data :', formData.date);
    };

	const onChangeTime = (event, selectedTime) => {
        const currentTime = new Date(selectedTime) || time;
		const tempFormattedTime = moment(currentTime).format('HH:mm');

		setShowTimePicker(Platform.OS === 'ios');
		setTime(currentTime);
		updateFormData({ hour: tempFormattedTime });
		setFormattedTime(tempFormattedTime);

		console.log('Time From State :', formattedTime);
		console.log('Time From data :', formData.hour);
    };

	// Handle Showing modal Date Picker
	const showDatepicker = () => {
		setShowDatePicker(true);
	};

	const showTimepicker = () => {
		setShowTimePicker(true);
	};

	//Handle onChange Tempat
	const handleInputProvince = (value, text) => {
		updateFormData({ province_id: value });
		setProvText(text);

		updateFormData({ regency_id: '' });
		setKabText('');

		updateFormData({ district_id: '' });
		setKecText('');

		updateFormData({ village_id: '' });
		setKelText('');
	};

	const handleInputRegency = (value, text) => {
		updateFormData({ regency_id: value });
		setKabText(text);

		updateFormData({ district_id: '' });
		setKecText('');

		updateFormData({ village_id: '' });
		setKelText('');
	};

	const handleInputDistrict = (value, text) => {
		updateFormData({ district_id: value });
		setKecText(text);

		updateFormData({ village_id: '' });
		setKelText('');
	};

	const handleInputVillage = (value, text) => {
		updateFormData({ village_id: value });
		setKelText(text);
	};

	//Handle Request Data Master
	const getDataProv = async () => {
		try {
			const url = `${BASE_URL}/regional/list/provinces?perPage=35&page=1&search=`; // Replace with your API endpoint
		
			const response = await axios.get(url, {
				headers: {
					'Content-Type' : 'multipart/form-data',
					Authorization: `Bearer ${JSON.parse(token)}`,
				},
			});

			if(response){
				setProv(response.data.response.data);
			}else{
				console.log('gagal fetch data')
			}
			
		  } catch (error) {
			// Handle any errors here
			console.error(error);
		  }
	}

	const getDataKab = async () => {
		try {
			const url = `${BASE_URL}/regional/list/regency/${formData.province_id}?perPage=20&page=1&search=`; // Replace with your API endpoint
		
			const response = await axios.get(url, {
				headers: {
					'Content-Type' : 'multipart/form-data',
					Authorization: `Bearer ${JSON.parse(token)}`,
				},
			});

			if(response){
				setKab(response.data.response.data);
			}else{
				console.log('gagal fetch data')
			}
			
		  } catch (error) {
			// Handle any errors here
			console.error(error);
		  }
	}

	const getDataKec = async () => {
		try {
			const url = `${BASE_URL}/regional/list/district/${formData.regency_id}?perPage=20&page=1&search=`; // Replace with your API endpoint
		
			const response = await axios.get(url, {
				headers: {
					'Content-Type' : 'multipart/form-data',
					Authorization: `Bearer ${JSON.parse(token)}`,
				},
			});

			if(response){
				setKec(response.data.response.data);
			}else{
				console.log('gagal fetch data')
			}
		  } catch (error) {
			// Handle any errors here
			console.error(error);
		  }
	}

	const getDataKel = async () => {
		try {
			const url = `${BASE_URL}/regional/list/villages/${formData.district_id}?perPage=20&page=1&search=`; // Replace with your API endpoint
		
			const response = await axios.get(url, {
				headers: {
					'Content-Type' : 'multipart/form-data',
					Authorization: `Bearer ${JSON.parse(token)}`,
				},
			});

			if(response){
				setKel(response.data.response.data);
			}else{
				console.log('gagal fetch data')
			}
			console.log(response.data.response.data);
		  } catch (error) {
			// Handle any errors here
			console.error(error);
		  }
	}

	const ItemProv = ({ id, title }) => (
		<View style={styles.newsContainer}>
			<View style={{ flex:3, flexDirection: 'column' }}>
				<View style={styles.newsDescription}>
					<TouchableOpacity
						onPress={() => {
							handleInputProvince(id, title);
							setModalProvVisible(false);
						}}>
						<View style={styles.newsTitle}>
							<Text style={{ flex: 1, color: 'black',fontSize: 20, fontWeight: 'bold', textAlign: 'left', paddingBottom: 20 }}> {title}</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);

	const ItemKab = ({ id, title }) => (
		<View style={styles.newsContainer}>
			<View style={{ flex:3, flexDirection: 'column' }}>
				<View style={styles.newsDescription}>
					<TouchableOpacity
						onPress={() => {
							handleInputRegency(id, title)
							setModalKabVisible(false)
						}}>
						<View style={styles.newsTitle}>
							<Text style={{ flex: 1, color: 'black',fontSize: 20, fontWeight: 'bold', textAlign: 'left', paddingBottom: 20 }}> {title}</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);

	const ItemKec = ({ id, title }) => (
		<View style={styles.newsContainer}>
			<View style={{ flex:3, flexDirection: 'column' }}>
				<View style={styles.newsDescription}>
					<TouchableOpacity
						onPress={() => {
							handleInputDistrict(id, title)
							setModalKecVisible(false)
						}}>
						<View style={styles.newsTitle}>
							<Text style={{ flex: 1, color: 'black',fontSize: 20, fontWeight: 'bold', textAlign: 'left', paddingBottom: 20 }}> {title}</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);

	const ItemKel = ({ id, title }) => (
		<View style={styles.newsContainer}>
			<View style={{ flex:3, flexDirection: 'column' }}>
				<View style={styles.newsDescription}>
					<TouchableOpacity
						onPress={() => {
							handleInputVillage(id, title)
							setModalKelVisible(false)
						}}>
						<View style={styles.newsTitle}>
							<Text style={{ flex: 1, color: 'black',fontSize: 20, fontWeight: 'bold', textAlign: 'left', paddingBottom: 20 }}> {title}</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);

	const validateForm = () => {
		console.log(formData.province_id)
		if(formData.date === ""){
			alert("Data Tanggal tidak boleh kosong !");
		}else if (formData.hour === "") {
			alert("Data Waktu tidak boleh kosong !");
		} else if (formData.province_id === "") {
			alert("Data Provinsi tidak boleh kosong !");
		} else if (formData.regency_id === "") {
			alert("Data Kabupaten / Kota tidak boleh kosong !");
		} else if (formData.district_id === "") {
			alert("Data Kecamatan tidak boleh kosong !");
		} else if (formData.village_id === "") {
			alert("Data Kelurahan / Desa tidak boleh kosong !");
		} else {
			navigation.navigate('ReportFormStep2');
		}
	}

	//  Autofill tempat
	const autoFill = () => {
		setProvText(user.province_name)
		updateFormData({ province_id: user.province_id });
		setKabText(user.regency_name)
		updateFormData({ regency_id: user.regency_id });
		setKecText(user.district_name)
		updateFormData({ district_id: user.district_id });
		setKelText(user.village_name)
		updateFormData({ village_id: user.village_id });
	}

    return(
        <View style={styles.container}>
			<View style={{flexDirection: 'row', paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#adbcb1',}}>
				<Image
					style={{ width: 35, height: 35, marginRight: 5, tintColor: '#ffffff'}}
					source={require('../assets/Icons/title.png')}
				/>
				<Text style={{fontWeight: 'bold',fontSize: 35, color: '#ffffff'}}>Laporan</Text>
			</View>
			<Text style={styles.welcomeText}>Tambah Pelaporan</Text>
			<ScrollView>
				<Text style={styles.inputLabel}>TANGGAL</Text>
				<TouchableOpacity onPress={showDatepicker} style={styles.pickerContainer}>
					<TextInput 
						style={styles.input}
						editable={false}
						value={formattedDate}
						onChangeText={(text) => setFormattedDate(text)}
					/>
					<View style={{padding: 5}}>
						<Image
							onPress={showDatepicker}
							source={require('../assets/Icons/kalender.png')}
							style={{ width: 20, height: 20, marginBottom: 17}}
						/>
					</View>
					{showDatePicker && (
						<DateTimePicker
							testID="datePicker"
							value={date}
							mode="date"
							display="spinner"
							onChange={onChangeDate}
						/>
					)} 
				</TouchableOpacity>

				<Text style={styles.inputLabel}>WAKTU</Text>
				<TouchableOpacity onPress={showTimepicker} style={styles.pickerContainer}>
					<TextInput 
						style={styles.input}
						editable={false}
						value={formattedTime}
						onChangeText={(text) => setFormattedTime(text)}
					/>
					<View style={{padding: 5}}>
						<Image
							onPress={showTimepicker}
							source={require('../assets/Icons/kalender.png')}
							style={{ width: 20, height: 20, marginBottom: 17}}
						/>
					</View>
					{showTimePicker && (
						<DateTimePicker
							testID="timePicker"
							value={time}
							mode="time"
							is24Hour={true}
							display="spinner"
							onChange={onChangeTime}
						/>
					)} 
				</TouchableOpacity>

				<Text style={styles.inputLabel}>TEMPAT</Text>
				
				<TouchableOpacity
					onPress={() => {
						setModalProvVisible(true)
						getDataProv();
					} } 
					style={styles.pickerContainer}>
					<TextInput
						editable={false} 
						style={styles.input}
						placeholder='Provinsi'
						value={provText}
						onChangeText={handleInputProvince}
					/>
					<View
						style={{padding: 5}}>
						<Image
							source={require('../assets/Icons/dropdown.png')}
							style={{ width: 13, height: 13, marginBottom: 17}}
						/>
					</View> 
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						setModalKabVisible(true)
						getDataKab();
					}} 
					style={styles.pickerContainer}>
					<TextInput
						editable={false} 
						style={styles.input}
						placeholder='Kabupaten/Kota'
						value={kabText}
						onChangeText={handleInputRegency}
					/>
					<View style={{padding: 5}}>
						<Image
							source={require('../assets/Icons/dropdown.png')}
							style={{ width: 13, height: 13, marginBottom: 17}}
						/>
					</View>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						setModalKecVisible(true)
						getDataKec()
					}} 
					style={styles.pickerContainer}>
					<TextInput
						editable={false} 
						style={styles.input}
						placeholder='Kecamatan'
						value={kecText}
						onChangeText={handleInputDistrict}
					/>
					<View style={{padding: 5}}>
						<Image
							source={require('../assets/Icons/dropdown.png')}
							style={{ width: 13, height: 13, marginBottom: 17}}
						/>
					</View>
				</TouchableOpacity>
				<TouchableOpacity 
					onPress={() => {
						setModalKelVisible(true)
						getDataKel()
					}}
					style={styles.pickerContainer}>
					<TextInput
						editable={false} 
						style={styles.input}
						placeholder='Kelurahan/Desa'
						value={kelText}
						onChangeText={handleInputVillage}
					/>
					<View style={{padding: 5}}>
						<Image
							source={require('../assets/Icons/dropdown.png')}
							style={{ width: 13, height: 13, marginBottom: 17}}
						/>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.buttonContainer}>
					<TouchableOpacity
						style={styles.btn}
							onPress={() => navigation.navigate('ReportScreen')}
						>
						<Text style={styles.buttonText}>BATAL</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.btn}
							onPress={() => {
								validateForm()
							}}
						>
						<Text style={styles.buttonText}>LANJUT</Text>
					</TouchableOpacity>
            	</TouchableOpacity>
				<View style={{marginTop: 20}}>
					<View style={styles.centeredView}>
						<Modal
							animationType="slide"
							transparent={true}
							visible={modalProvVisible}
							onRequestClose={() => {
								setModalProvVisible(!modalProvVisible);
							}}>
							<View style={styles.centeredView}>
								<View style={styles.modalView}>
									<Text style={styles.modalText}>Cari Provinsi</Text>
									<SafeAreaView style={{ marginBottom: 20 }}>
										<FlatList
											data={prov}
											renderItem={({ item }) => <ItemProv id={item.code} title={item.name} />}
											keyExtractor={item => item.code}
										/>
									</SafeAreaView >
								</View>
							</View>
						</Modal>
					</View>
				</View>

				<View style={{marginTop: 20}}>
					<View style={styles.centeredView}>
						<Modal
							animationType="slide"
							transparent={true}
							visible={modalKabVisible}
							onRequestClose={() => {
								setModalKabVisible(!modalKabVisible);
							}}>
							<View style={styles.centeredView}>
								<View style={styles.modalView}>
									<Text style={styles.modalText}>Cari Kabupaten/Kota</Text>
									<SafeAreaView style={{ marginBottom: 20 }}>
										<FlatList
											data={kab}
											renderItem={({ item }) => <ItemKab id={item.code} title={item.name} />}
											keyExtractor={item => item.id}
										/>
									</SafeAreaView >
								</View>
							</View>
						</Modal>
					</View>
				</View>

				<View style={{marginTop: 20}}>
					<View style={styles.centeredView}>
						<Modal
							animationType="slide"
							transparent={true}
							visible={modalKecVisible}
							onRequestClose={() => {
								setModalKecVisible(!modalKecVisible);
							}}>
							<View style={styles.centeredView}>
								<View style={styles.modalView}>
									<Text style={styles.modalText}>Cari Kecamatan</Text>
									<SafeAreaView style={{ marginBottom: 20 }}>
										<FlatList
											data={kec}
											renderItem={({ item }) => <ItemKec id={item.code} title={item.name} />}
											keyExtractor={item => item.code}
										/>
									</SafeAreaView >
								</View>
							</View>
						</Modal>
					</View>
				</View>

				<View style={{marginTop: 20}}>
					<View style={styles.centeredView}>
						<Modal
							animationType="slide"
							transparent={true}
							visible={modalKelVisible}
							onRequestClose={() => {
								setModalKelVisible(!modalKelVisible);
							}}>
							<View style={styles.centeredView}>
								<View style={styles.modalView}>
									<Text style={styles.modalText}>Cari Kelurahan/Desa</Text>
									<SafeAreaView style={{ marginBottom: 20 }}>
										<FlatList
											data={kel}
											renderItem={({ item }) => <ItemKel id={item.code} title={item.name} />}
											keyExtractor={item => item.id}
										/>
									</SafeAreaView >
								</View>
							</View>
						</Modal>
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
		fontSize: 20,
		color: '#ffffff',
		paddingTop: 10,
		marginBottom: 30
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	btn: {
		flex: 1,
		backgroundColor: '#00aeef',
		justifyContent: 'center',
		paddingHorizontal: 28,
		paddingVertical: 10,
		marginHorizontal: 5,
		borderRadius: 2,
		marginTop: 12,
		height: 50,
	},
	buttonText: {
		textAlign: 'center',
		color: '#ffff',
		fontWeight: '700',
	},
	inputLabel: {
		color: '#00aeef',
		fontSize: 15,
		fontWeight: 'bold',
		paddingBottom: 5
	},
    textArea: {
        width: '100%',
        borderColor: '#00cea6',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 12,
        paddingHorizontal: 10,
        color: 'white',
    },
    input: {
		width: '100%',
		flex: 1,
		borderBottomWidth: 1,
		borderColor: '#00aeef',
		height: 40,
		color: 'white',
		marginBottom: 20
    },
	searchInput: {
		width: '100%',
		flex: 1,
		borderBottomWidth: 1,
		borderColor: 'black',
		height: 40,
		color: 'black',
		marginBottom: 20,
		marginTop: 20
	},
	pickerContainer: {
		flexDirection: 'row', 
		alignItems: 'center' 
	},
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 300,
	  },
	modalView: {
		margin: 20,
		backgroundColor: 'white',
		borderRadius: 5,
		width: '100%',
		height: '100%',
		padding: 30,
		shadowColor: '#000',
		shadowOffset: {
		  width: 0,
		  height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
 	button: {
		borderRadius: 20,
		padding: 10,
		elevation: 2,
	},
	buttonOpen: {
		backgroundColor: '#F194FF',
	},
	buttonClose: {
		backgroundColor: '#2196F3',
	},
	textStyle: {
		color: 'white',
		fontWeight: 'bold',
	},
	modalText: {
		marginBottom: 15,
		borderBottomWidth: 2,
		borderBottomColor: 'black',
		paddingBottom: 10,
		fontWeight: 'bold',
		fontSize: 20,
		color: 'black'
	},
});

export default ReportFormStep1;