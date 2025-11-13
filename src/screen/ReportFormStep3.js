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
import Icon from 'react-native-vector-icons/Ionicons';

function ReportFormStep3({ navigation }) {
	const [imageCamera, setImageCamera] = useState([]);
	const [files, setFiles] = useState([]);
	const [lat, setLat] = useState('');
	const [long, setLong] = useState('');
	const { token, userInfo } = useContext(AuthContext);
	const { formData, updateFormData } = useContext(DataContext);

	const [isLoading, setIsLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isModalCancelVisible, setIsModalCancelVisible] = useState(false);
	const [isModalSuccessVisible, setIsModalSuccessVisible] = useState(false);

	useEffect(() => {
		getGeolocation();
	}, []);

	const cleanFormData = () => {
		const fields = ['date','hour','title','province_id','regency_id','district_id','village_id','desc','keterangan','file','user_id','kodam_id'];
		fields.forEach(field => updateFormData({ [field]: field === 'file' ? [] : "" }));
	};

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
			launchCamera({ mediaType: 'photo', quality: 0.5, multiple: true }, (response) => {
				if (response.didCancel) return;
				if (response.errorCode) {
				alert(response.errorMessage || 'Error saat membuka kamera');
				return;
				}
				const data = response.assets;
				if(data[0].fileSize < 2000000){
				setImageCamera(prev => prev.concat(data));
				} else {
				alert('Foto / Gambar harus <= 2 MB');
				}
			});
			}
		}).catch(console.log);
		} catch(e) { console.log(e); }
	};

	const openGalery = () => {
		launchImageLibrary({ mediaType: 'photo', quality: 0.5, multiple: true }, (response) => {
		if (response.didCancel) return;
		if (response.errorCode) {
			alert(response.errorMessage || 'Error saat membuka galeri');
			return;
		}
		const data = response.assets;
		if(data[0].fileSize < 2000000){
			setImageCamera(prev => prev.concat(data));
		} else {
			alert('Foto / Gambar harus <= 2 MB');
		}
		});
	};

	const pickDocument = async () => {
		try {
		const res = await DocumentPicker.pick({ type: [DocumentPicker.types.allFiles], allowMultiSelection: true });
		setFiles(prev => prev.concat(res));
		} catch(e) { console.log(e); }
	};

	const getGeolocation = async () => {
		try {
		check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(result => {
			if(result === RESULTS.GRANTED) {
			Geolocation.getCurrentPosition(info => {
				setLat(info.coords.latitude);
				setLong(info.coords.longitude);
			});
			}
		}).catch(console.log);
		} catch(e) { console.log(e); }
	};

	const handlePressSubmit = () => { 
		if(imageCamera.length === 0) alert("Data Foto Harus di Isi !");
		else setIsModalVisible(true);
	};

	const handleCancelConfirm = () => {
		cleanFormData();
		navigation.navigate('ReportScreen');
	};

	const handleConfirm = async () => {
		setIsLoading(true);
		try {
		updateFormData({ user_id: userInfo.id, kodam_id: userInfo.id });
		let uploadData = new FormData();
		Object.keys(formData).forEach(key => { if(key !== 'file') uploadData.append(key, formData[key]); });
		uploadData.append("lat", lat);
		uploadData.append("long", long);

		[...files.map(f => ({ uri: f.uri, type: f.type, name: f.name })), 
		...imageCamera.map(img => ({ uri: img.uri, type: img.type, name: img.fileName }))].forEach(file => uploadData.append("file[]", file));

		const response = await axios.post(
			`${BASE_URL}/reports/insert`, 
			uploadData, 
			{
				headers: {
					"Content-Type": "multipart/form-data", 
					Authorization: `Bearer ${token}`,
					timeout: 0, // no timeout
					maxContentLength: Infinity,
					maxBodyLength: Infinity, // penting untuk upload file besar 
			} 
		});

		if(response.status === 200){
			setIsLoading(false);
			cleanFormData();
			setIsModalVisible(false);
			setIsModalSuccessVisible(true);
			setTimeout(() => { setIsModalSuccessVisible(false); navigation.navigate('ReportScreen'); }, 3000);
		} else {
			setIsModalVisible(false);
			alert('Gagal kirim Laporan');
		}
		} catch(e) {
			setIsLoading(false);
			setIsModalVisible(false);
			alert('Gagal kirim Laporan');
			console.log(e);
		}
	};

	const ConfirmationModal = ({ visible, onCancel, onConfirm }) => (
		<Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
		<View style={styles.modalContainer}>
			<View style={styles.modalContent}>
			<Text style={styles.modalText}>Apakah Anda Ingin Menyelesaikan Laporan ?</Text>
			{isLoading && <Loading />}
			<TouchableOpacity style={styles.modalBtn} onPress={onConfirm}>
				<Text style={styles.modalBtnText}>KIRIM</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.modalCancelBtn} onPress={onCancel}>
				<Text style={styles.modalCancelText}>KEMBALI</Text>
			</TouchableOpacity>
			</View>
		</View>
		</Modal>
	);

	const CancelModal = ({ visible, onCancel, onConfirm }) => (
		<Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
		<View style={styles.modalContainer}>
			<View style={styles.modalContent}>
			<Text style={styles.modalText}>Apakah Anda Yakin Untuk Membatalkan Laporan ?</Text>
			<TouchableOpacity style={styles.modalBtn} onPress={handleCancelConfirm}>
				<Text style={styles.modalBtnText}>BATALKAN PELAPORAN</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.modalCancelBtn} onPress={onConfirm}>
				<Text style={styles.modalCancelText}>KEMBALI</Text>
			</TouchableOpacity>
			</View>
		</View>
		</Modal>
	);

	const SuccessModal = ({ visible }) => (
		<Modal visible={visible} animationType="fade" transparent>
		<View style={styles.modalContainer}>
			<View style={styles.modalContent}>
			<Text style={styles.modalText}>Laporan Berhasil di Kirim !</Text>
			</View>
		</View>
		</Modal>
	);

	return (
		<SafeAreaView style={styles.container}>
		<View style={styles.header}>
			<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
			<Icon name="arrow-back-outline" size={26} color="#0d2143" />
			</TouchableOpacity>
			<Text style={styles.headerTitle}>Laporan Progres SPPG</Text>
		</View>

		<Text style={styles.inputLabel}>FOTO, VIDEO, DOKUMEN</Text>

		<ScrollView contentContainerStyle={{paddingBottom: 20}}>
			<TouchableOpacity onPress={captureImage} style={styles.btnPicker}>
			<Text style={styles.buttonText}>AMBIL FOTO</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={openGalery} style={styles.btnPicker}>
			<Text style={styles.buttonText}>AMBIL DATA DARI PONSEL</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={pickDocument} style={styles.btnPicker}>
			<Text style={styles.buttonText}>AMBIL DATA FILE</Text>
			</TouchableOpacity>

			<Text style={styles.inputLabel}>LAMPIRAN FOTO :</Text>
			<ScrollView horizontal style={styles.imgContainer}>
			{imageCamera.map((image, index) => (
				<TouchableOpacity key={index.toString()} onPress={() => deleteImage(index)}>
				<Image source={{ uri: image.uri }} style={styles.profileImage} />
				</TouchableOpacity>
			))}
			</ScrollView>

			<Text style={styles.inputLabel}>LAMPIRAN DOKUMEN :</Text>
			<View>
			{files.map((file, index) => (
				<TouchableOpacity key={index.toString()} onPress={() => deleteFile(index)}>
				<Text style={{marginVertical: 4}}>{file.name}</Text>
				</TouchableOpacity>
			))}
			</View>
		</ScrollView>

		<ConfirmationModal visible={isModalVisible} onCancel={() => setIsModalVisible(false)} onConfirm={handleConfirm} />
		<CancelModal visible={isModalCancelVisible} onCancel={() => setIsModalCancelVisible(false)} onConfirm={() => setIsModalCancelVisible(false)} />
		<SuccessModal visible={isModalSuccessVisible} />

		<View style={styles.btnContainer}>
			<TouchableOpacity style={styles.btn} onPress={() => setIsModalCancelVisible(true)}>
			<Text style={styles.buttonText}>BATAL</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('ReportFormStep2')}>
			<Text style={styles.buttonText}>KEMBALI</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.btn} onPress={handlePressSubmit}>
			<Text style={styles.buttonText}>KIRIM</Text>
			</TouchableOpacity>
		</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingBottom: 10 },
  backButton: { marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0d2143' },
  inputLabel: { color: '#000000', fontSize: 15, fontWeight: 'bold', marginVertical: 10 },
  btnPicker: { backgroundColor: '#0068A7', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 5, marginVertical: 5 },
  buttonText: { textAlign: 'center', color: '#ffffff', fontWeight: '700', fontSize: 14 },
  imgContainer: { flexDirection: 'row', marginVertical: 10 },
  profileImage: { width: 100, height: 100, borderRadius: 5, borderWidth: 1, borderColor: '#ccc', marginRight: 8 },
  btnContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  btn: { flex: 1, backgroundColor: '#0068A7', paddingVertical: 14, marginHorizontal: 5, borderRadius: 5 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#ffffff', padding: 20, borderRadius: 5, width: '80%', alignItems: 'center' },
  modalText: { fontWeight: '700', fontSize: 16, color: '#000', marginBottom: 15, textAlign: 'center' },
  modalBtn: { backgroundColor: '#0068A7', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 5, width: '100%', marginBottom: 10 },
  modalBtnText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  modalCancelBtn: { borderWidth: 1, borderColor: '#0068A7', paddingVertical: 12, borderRadius: 5, width: '100%' },
  modalCancelText: { color: '#000', textAlign: 'center', fontWeight: '700' },
});

export default ReportFormStep3;
