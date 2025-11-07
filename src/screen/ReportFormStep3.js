import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Loading } from '../components/Loading';
import { DataContext  } from '../context/DataContext';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import DocumentPicker from 'react-native-document-picker';
import {PERMISSIONS, RESULTS, check} from 'react-native-permissions';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config/Config';

function ReportFormStep3({ navigation }) {
	const [imageCamera, setImageCamera] = useState([]);
	const [files, setFiles] = useState([]);

	const [lat, setLat] = useState('');
	const [long, setLong] = useState('');

	const { token } = useContext(AuthContext);

	const [isLoading, setIsLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isModalCancelVisible, setIsModalCancelVisible] = useState(false);
	const [isModalSuccessVisible, setIsModalSuccessVisible] = useState(false);

	const { formData, updateFormData } = useContext(DataContext);

	const { userInfo } = useContext(AuthContext);
	const user = JSON.parse(userInfo);

	useEffect(() => {
		getGeolocation();
	});

	const cleanFormData = () => {
		updateFormData({ date: "" });
		updateFormData({ hour: "" });
		updateFormData({ title: "" });
		updateFormData({ province_id: "" });
		updateFormData({ regency_id: "" });
		updateFormData({ district_id: "" });
		updateFormData({ village_id: "" });
		updateFormData({ desc: "" });
		updateFormData({ keterangan: "" });
		updateFormData({ file: []});
		updateFormData({ user_id: "" });
		updateFormData({ kodam_id: "" });
	}

	const deleteImage = (index) => {
		const updatedImages = [...imageCamera];
		updatedImages.splice(index, 1);
		setImageCamera(updatedImages);
	};
	  
	const deleteFile = (index) => {
		const updatedFiles = [...files];
		updatedFiles.splice(index, 1);
		setFiles(updatedFiles);
	};

	const captureImage = async () => {
		try {
			check(Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA)
            .then((result) => {
                if(result === RESULTS.GRANTED) {
                    let options = {
						mediaType: 'photo', // Include both photo and video options
						quality: 0.5,
						multiple: true,
					  };

					launchCamera(options, (response) => {		
						if (response.didCancel) {
							return;
						} else if (response.errorCode == 'camera_unavailable') {
							alert('Camera not available on device');
							return;
						} else if (response.errorCode == 'permission') {
							alert('Permission not satisfied');
							return;
						} else if (response.errorCode == 'others') {
							alert(response.errorMessage);
							return;
						} else {
							const data = response.assets;
							if(data[0].fileSize < 2000000){
								setImageCamera((prevSelectedImages) => prevSelectedImages.concat(data));
							}else{
								// setImageCamera(null);
								alert('Foto / Gambar harus kurang atau sama dengan 2 MB !')
							}
						}
					});
                } else {
                    console.log('Permission Denied')
                }
            })
            .catch((error) => {
                console.log(error);
            });
		}catch(error) {

		}
	};	

	function openGalery() {
		let options = {
			mediaType: 'photo', 
			quality: 0.5,
			multiple: true,
		};

		launchImageLibrary(options, (response) => {
	
			if (response.didCancel) {
				return;
			} else if (response.errorCode == 'camera_unavailable') {
				alert('Camera not available on device');
				return;
			} else if (response.errorCode == 'permission') {
				alert('Permission not satisfied');
				return;
			} else if (response.errorCode == 'others') {
				alert(response.errorMessage);
				return;
			} else {
				const data = response.assets;
				if(data[0].fileSize < 2000000){
					setImageCamera((prevSelectedImages) => prevSelectedImages.concat(data));
				}else{
					// setImageCamera(null);
					alert('Foto / Gambar harus kurang atau sama dengan 2 MB !')
				}
			}
		});
	}

	const  pickDocument = async () => {
		try {
			const res = await DocumentPicker.pick({
				type: [DocumentPicker.types.allFiles],
				allowMultiSelection: true,
			})
			setFiles((prevSelectedFile) => prevSelectedFile.concat(res));
		} catch(error) {
			console.log(error)
		}
		console.log('Files Uploaded :', files);
	} 
	
	const handlePressSubmit = () => {
		validateForm();
	};
	
	const handleCancel = () => {
		setIsModalVisible(false);
	};

	const handleConfirm = () => {
		console.log(formData)
		setIsLoading(true);
		postData();
	};

	const handleCancelButton = () => {
		setIsModalCancelVisible(true);
	};

	const handleCancelButtonConfirm = () => {
		setIsModalCancelVisible(false);
	};

	const handleCancelConfirm = () => {
		cleanFormData();
		navigation.navigate('ReportScreen')
	}
	
	const validateForm = () => {
		if(imageCamera.length === 0){
			alert("Data Foto Harus di Isi !");
		} else {
			setIsModalVisible(true);
		}
	}

	const getGeolocation =  async () => {
		try {
			check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
				.then((result) => {
					if(result === RESULTS.GRANTED) {
						Geolocation.getCurrentPosition( info => {
							setLat(info.coords.latitude);
							setLong(info.coords.longitude);
						});
					} else {
						console.log('Permission Denied')
					}
				})
				.catch((error) => {
					console.log(error);
				});
		} catch (error) {
			console.log(error);
		}
	}

	const postData = async () => {
		try {
			updateFormData({ user_id: user.id });
			updateFormData({ kodam_id: user.id });

			let uploadData = new FormData();
            Object.keys(formData).forEach(element => {
                if (element != 'file') {
                    uploadData.append(element, formData[element]);
                }
            });

			uploadData.append("lat", lat);
			uploadData.append("long", long);
			
			let mergedFiles = [];

			Object.values(files).forEach((val) => {
				mergedFiles.push({
					uri: val.uri,
					type: val.type,
					name: val.name,
				})
			});

			let mergedImages = [];

			Object.values(imageCamera).forEach((val) => {
				mergedImages.push({
					uri: val.uri,
					type: val.type,
					name: val.fileName,
				})
			});
			
			let mergedFilesToUpload = [...mergedFiles, ...mergedImages];

			console.log("files to Upload : ", mergedFilesToUpload);

			mergedFilesToUpload.map((val) => {
				uploadData.append("file[]", val);
			})

            console.log('FormData : '+uploadData);

			const response = await axios.post(`${BASE_URL}/reports/insert`, uploadData, {
				headers: {
					"Content-Type" : "multipart/form-data",
					Authorization: `Bearer ${token}`,
				},
			});

			if(response.status === 200){
				setIsLoading(false);
				cleanFormData();
				setIsModalVisible(false);
				setIsModalSuccessVisible(true);

				setTimeout( () => {
					setIsModalSuccessVisible(false);
					navigation.navigate('ReportScreen');
				}, 3000);
			}else{
				setIsModalVisible(false);
				alert('Gagal kirim Laporan')
			}

			console.log('Upload Response : ', response.data);
		} catch(error){
			setIsLoading(false);
			setIsModalVisible(false);
			alert('Gagal kirim Laporan')
			console.log('Error sending data : ', error);
		}
	}


	const ConfirmationModal = ({ visible, onCancel, onConfirm }) => {
		return (
		  <Modal
			visible={visible}
			animationType="fade"
			transparent={true}
			onRequestClose={onCancel}
		  >
			<View style={styles.modalContainer}>
			  <View style={styles.modalContent}>
				<Text style={{color: 'black', fontWeight: '700', fontSize: 16}}>Apakah Anda Ingin Menyelesaikan Laporan ?</Text>
				<View style={{}}>
					{isLoading ? (
						<Loading />
					) : (
						<></>
					)}
					<TouchableOpacity
						style={{backgroundColor: '#00aeef', paddingVertical: 17, marginTop: 30, marginBottom: 10}}
						onPress={handleConfirm}
					>
						<Text style={styles.buttonText}>KIRIM</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={{borderWidth: 1, borderColor: '#00aeef', paddingVertical: 17}}
						onPress={handleCancel}
					>
						<Text style={{color: 'black', textAlign: 'center'}}>KEMBALI</Text>
					</TouchableOpacity>
				</View>
			  </View>
			</View>
		  </Modal>
		);
	};

	const CancelModal = ({ visible, onCancel, onConfirm }) => {
		return (
		  <Modal
			visible={visible}
			animationType="fade"
			transparent={true}
			onRequestClose={onCancel}
		  >
			<View style={styles.modalContainer}>
			  <View style={styles.modalContent}>
				<Text style={{color: 'black', fontWeight: '700', fontSize: 16}}>Apakah Anda Yakin Untuk Membatalkan Laporan ?</Text>
				<View style={{}}>
					<TouchableOpacity
						style={{backgroundColor: '#00aeef', paddingVertical: 17, marginTop: 30, marginBottom: 10}}
						onPress={() => {
							handleCancelConfirm();
						}}
					>
					<Text style={styles.buttonText}>BATALKAN PELAPORAN</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={{borderWidth: 1, borderColor: '#00aeef', paddingVertical: 17}}
						onPress={handleCancelButtonConfirm}
					>
					<Text style={{color: 'black', textAlign: 'center'}}>KEMBALI</Text>
					</TouchableOpacity>
				</View>
			  </View>
			</View>
		  </Modal>
		);
	};

	const SuccessModal = ({ visible, onCancel, onConfirm }) => {
		return (
			<Modal
				visible={visible}
				animationType="fade"
				transparent={true}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={{color: 'black', fontWeight: '700', fontSize: 16}}>Laporan Berhasil di Kirim !</Text>
					</View>
				</View>
			</Modal>
		);
	}

	const FailedModal = ({ visible, onCancel, onConfirm }) => {
		return (
			<Modal
				visible={visible}
				animationType="fade"
				transparent={true}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={{color: 'black', fontWeight: '700', fontSize: 16}}>Laporan Gagal di Kirim !</Text>
					</View>
				</View>
			</Modal>
		);
	}
	
    return (
        <SafeAreaView  style={styles.container}>
            <View style={{flexDirection: 'row', paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#adbcb1',}}>
				<Image
					style={{ width: 35, height: 35, marginRight: 5, tintColor: '#ffffff'}}
					source={require('../assets/Icons/title.png')}
				/>
				<Text style={{fontWeight: 'bold',fontSize: 35, color: '#ffffff'}}>Laporan</Text>
			</View>
            <Text style={styles.welcomeText}>Tambah Pelaporan</Text>
            <Text style={styles.inputLabel}>FOTO, VIDEO, DOKUMEN</Text>
			<ScrollView>
				<TouchableOpacity 
					onPress={ () => captureImage() } 
					style={styles.btnPicker}
				>
					<Text style={styles.buttonText}>AMBIL FOTO</Text>
				</TouchableOpacity>

				<TouchableOpacity 
					onPress={ () => openGalery() }
					style={styles.btnPicker}
				>
					<Text style={styles.buttonText}>AMBIL DATA DARI PONSEL</Text>
				</TouchableOpacity>

				<TouchableOpacity 
					onPress={ () => pickDocument() }
					style={styles.btnPicker}
				>
					<Text style={styles.buttonText}>AMBIL DATA FILE</Text>
				</TouchableOpacity>
				<Text style={styles.inputLabel}>LAMPIRAN FOTO :</Text>
				<ScrollView style={styles.imgContainer} horizontal={true}>
				{
					imageCamera.map((image, index) => {
						return (
							<TouchableOpacity onPress={() => deleteImage(index)}>
								<Image key={index.toString()} source={{ uri:image.uri }} style={styles.profileImage} />
							</TouchableOpacity>
							);
						})
				}
				</ScrollView>
				<Text style={styles.inputLabel}>LAMPIRAN DOKUMEN :</Text>
				<View>
					{files?.map((val, index) => {
						return (
							<TouchableOpacity onPress={() => deleteFile(index)}>
								<Text key={index.toString()}>{val.name}</Text>
							</TouchableOpacity>
						)
					})}
				</View>
			</ScrollView>
			<ConfirmationModal
				visible={isModalVisible}
				onCancel={handleCancel}
				onConfirm={handleConfirm}
			/>
			<SuccessModal 
				visible={isModalSuccessVisible}
				onCancel={handleCancel}
				onConfirm={handleConfirm}
			/>
			<CancelModal
				visible={isModalCancelVisible}
				onCancel={handleCancelButton}
				onConfirm={handleCancelButtonConfirm}
			/>
            
            <View style={styles.btnContainer}>
				<TouchableOpacity
					style={styles.btn}
					onPress={() => {
						handleCancelButton()
					}}
                >
                  <Text style={styles.buttonText}>BATAL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                 	style={styles.btn}
                  	onPress={() => {
						navigation.navigate('ReportFormStep2')
					}}
                >
                  <Text style={styles.buttonText}>KEMBALI</Text>
                </TouchableOpacity>
                <TouchableOpacity
					style={styles.btn}
					onPress={() => handlePressSubmit()}
                >
                  <Text style={styles.buttonText}>KIRIM</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView >
    );
}

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
		marginBottom: 30
	},
	btnContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	btnPicker : {
		backgroundColor: '#00aeef',
		paddingHorizontal: 20,
    	paddingVertical: 20,
		marginVertical: 5,
		borderRadius: 5
	},
	btn: {
		flex: 1,
		backgroundColor: '#00aeef',
		justifyContent: 'center',
		paddingHorizontal: 10,
		paddingVertical: 12,
		marginHorizontal: 5,
		borderRadius: 2,
		marginTop: 12,
		height: 50,
	},
	buttonText: {
		textAlign: 'center',
		color: '#ffff',
		fontWeight: '700',
		fontSize: 12,
	},
	inputLabel: {
		color: '#00aeef',
		fontSize: 15,
		fontWeight: 'bold',
		paddingBottom: 5
	},
	imgContainer: {
		flex: 1,
		flexDirection: 'row',
		marginTop: 20,
		paddingBottom: 20
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 5,
		borderWidth: 2,
		marginRight: 8,
	},
	modalContainer: {
		flex: 1,
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalContent: {
		backgroundColor: 'white',
		padding: 20,
		borderRadius: 2,
	},
	buttonContainer: {
		marginTop: 20,
		padding: 50
	},
});

export default ReportFormStep3;
