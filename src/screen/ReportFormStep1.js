import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';
import axios from 'axios';
import { BASE_URL } from '../config/Config';

const ReportFormStep1 = ({ navigation }) => {
	// modal visibility
	const [modalVisible, setModalVisible] = useState(false);
	// modal type: 'prov' | 'kab' | 'kec' | 'kel'
	const [modalType, setModalType] = useState(null);
	// lists
	const [provList, setProvList] = useState([]);
	const [kabList, setKabList] = useState([]);
	const [kecList, setKecList] = useState([]);
	const [kelList, setKelList] = useState([]);
	// texts shown on pickers
	const [provText, setProvText] = useState('');
	const [kabText, setKabText] = useState('');
	const [kecText, setKecText] = useState('');
	const [kelText, setKelText] = useState('');
	// loading for modal fetch
	const [modalLoading, setModalLoading] = useState(false);

	const { token, userInfo } = useContext(AuthContext);
	const { formData, updateFormData } = useContext(DataContext);

	// date/time
	const [date, setDate] = useState(new Date());
	const [time, setTime] = useState(new Date());
	const [formattedDate, setFormattedDate] = useState('');
	const [formattedTime, setFormattedTime] = useState('');
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showTimePicker, setShowTimePicker] = useState(false);

	// set user object safely
	let user = null;
	try {
		user = userInfo ? JSON.parse(userInfo) : null;
	} catch (e) {
		user = null;
	}

	// Auto-fill when userInfo becomes available
	useEffect(() => {
		if (user) {
		autoFill();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userInfo]);

	// initial date/time formatting (if formData already has values)
	useEffect(() => {
		if (formData?.date) {
		setFormattedDate(formData.date);
		setDate(moment(formData.date, 'YYYY-MM-DD').toDate());
		}
		if (formData?.hour) {
		setFormattedTime(formData.hour);
		setTime(moment(formData.hour, 'HH:mm').toDate());
		}
	}, []);

	// DATE / TIME handlers
	const onChangeDate = (event, selectedDate) => {
		const current = selectedDate || date;
		const isoDate = moment(current).format('YYYY-MM-DD');
		setShowDatePicker(Platform.OS === 'ios');
		setDate(current);
		setFormattedDate(isoDate);
		updateFormData({ date: isoDate });
		// log immediate value (not from state)
		console.log('Selected Date:', isoDate);
	};

	const onChangeTime = (event, selectedTime) => {
		const current = selectedTime || time;
		const hhmm = moment(current).format('HH:mm');
		setShowTimePicker(Platform.OS === 'ios');
		setTime(current);
		setFormattedTime(hhmm);
		updateFormData({ hour: hhmm });
		console.log('Selected Time:', hhmm);
	};

	const showDatepicker = () => setShowDatePicker(true);
	const showTimepicker = () => setShowTimePicker(true);

	// AUTOFILL
	const autoFill = () => {
		if (!user) return;
		if (user.province_name) {
		setProvText(user.province_name);
		updateFormData({ province_id: user.province_id });
		}
		if (user.regency_name) {
		setKabText(user.regency_name);
		updateFormData({ regency_id: user.regency_id });
		}
		if (user.district_name) {
		setKecText(user.district_name);
		updateFormData({ district_id: user.district_id });
		}
		if (user.village_name) {
		setKelText(user.village_name);
		updateFormData({ village_id: user.village_id });
		}
	};

	// FETCH FUNCTIONS (no Content-Type header on GET)
	const getDataProv = async () => {
		setModalLoading(true);
		try {
		const url = `${BASE_URL}/regional/list/provinces?perPage=35&page=1&search=`;
		const res = await axios.get(url, {
			headers: { Authorization: `Bearer ${token}` },
		});
		setProvList(res?.data?.response?.data || []);
		} catch (err) {
		console.error('getDataProv', err);
		} finally {
		setModalLoading(false);
		}
	};

	const getDataKab = async (provinceId) => {
		if (!provinceId) return setKabList([]);
		setModalLoading(true);
		try {
		const url = `${BASE_URL}/regional/list/regency/${provinceId}?perPage=200&page=1&search=`;
		const res = await axios.get(url, {
			headers: { Authorization: `Bearer ${token}` },
		});
		setKabList(res?.data?.response?.data || []);
		} catch (err) {
		console.error('getDataKab', err);
		} finally {
		setModalLoading(false);
		}
	};

	const getDataKec = async (regencyId) => {
		if (!regencyId) return setKecList([]);
		setModalLoading(true);
		try {
		const url = `${BASE_URL}/regional/list/district/${regencyId}?perPage=200&page=1&search=`;
		const res = await axios.get(url, {
			headers: { Authorization: `Bearer ${token}` },
		});
		setKecList(res?.data?.response?.data || []);
		} catch (err) {
		console.error('getDataKec', err);
		} finally {
		setModalLoading(false);
		}
	};

	const getDataKel = async (districtId) => {
		if (!districtId) return setKelList([]);
		setModalLoading(true);
		try {
		const url = `${BASE_URL}/regional/list/villages/${districtId}?perPage=200&page=1&search=`;
		const res = await axios.get(url, {
			headers: { Authorization: `Bearer ${token}` },
		});
		setKelList(res?.data?.response?.data || []);
		} catch (err) {
		console.error('getDataKel', err);
		} finally {
		setModalLoading(false);
		}
	};

	// generic item component
	const ItemPicker = ({ id, title, onSelect }) => (
		<TouchableOpacity
		onPress={() => onSelect(id, title)}
		style={styles.modalItem}
		>
		<Text style={styles.modalItemText}>{title}</Text>
		</TouchableOpacity>
	);

	// show modal for each type and fetch the corresponding list
	const openModal = async (type) => {
		setModalType(type);
		setModalVisible(true);

		// fetch appropriate data
		if (type === 'prov') {
		await getDataProv();
		} else if (type === 'kab') {
		await getDataKab(formData.province_id);
		} else if (type === 'kec') {
		await getDataKec(formData.regency_id);
		} else if (type === 'kel') {
		await getDataKel(formData.district_id);
		}
	};

	// handlers for selection
	const handleSelectProvince = (id, name) => {
		updateFormData({ province_id: id });
		setProvText(name);

		// reset lower level
		updateFormData({ regency_id: '', district_id: '', village_id: '' });
		setKabText(''); setKecText(''); setKelText('');
		setModalVisible(false);
	};

	const handleSelectRegency = (id, name) => {
		updateFormData({ regency_id: id });
		setKabText(name);

		updateFormData({ district_id: '', village_id: '' });
		setKecText(''); setKelText('');
		setModalVisible(false);
	};

	const handleSelectDistrict = (id, name) => {
		updateFormData({ district_id: id });
		setKecText(name);

		updateFormData({ village_id: '' });
		setKelText('');
		setModalVisible(false);
	};

	const handleSelectVillage = (id, name) => {
		updateFormData({ village_id: id });
		setKelText(name);
		setModalVisible(false);
	};

	const validateForm = () => {
		if (!formData?.date) {
		alert('Data Tanggal tidak boleh kosong !');
		} else if (!formData?.hour) {
		alert('Data Waktu tidak boleh kosong !');
		} else if (!formData?.province_id) {
		alert('Data Provinsi tidak boleh kosong !');
		} else if (!formData?.regency_id) {
		alert('Data Kabupaten / Kota tidak boleh kosong !');
		} else if (!formData?.district_id) {
		alert('Data Kecamatan tidak boleh kosong !');
		} else if (!formData?.village_id) {
		alert('Data Kelurahan / Desa tidak boleh kosong !');
		} else {
		navigation.navigate('ReportFormStep2');
		}
	};

	// determine current list for modal rendering
	const currentList = () => {
		switch (modalType) {
		case 'prov': return provList;
		case 'kab': return kabList;
		case 'kec': return kecList;
		case 'kel': return kelList;
		default: return [];
		}
	};

	// select callback based on modalType
	const selectCallback = (id, title) => {
		if (modalType === 'prov') return handleSelectProvince(id, title);
		if (modalType === 'kab') return handleSelectRegency(id, title);
		if (modalType === 'kec') return handleSelectDistrict(id, title);
		if (modalType === 'kel') return handleSelectVillage(id, title);
	};

	return (
		<View style={styles.container}>
		<View style={styles.headerRow}>
			<Image
			style={{ width: 35, height: 35, marginRight: 5, tintColor: '#ffffff' }}
			source={require('../assets/Icons/title.png')}
			/>
			<Text style={styles.headingText}>Laporan</Text>
		</View>

		<Text style={styles.welcomeText}>Tambah Pelaporan</Text>

		<ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
			{/* DATE */}
			<Text style={styles.inputLabel}>TANGGAL</Text>
			<TouchableOpacity onPress={showDatepicker} style={styles.pickerContainer}>
			<TextInput
				style={styles.input}
				editable={false}
				value={formattedDate}
				placeholder="Pilih tanggal"
				placeholderTextColor="#ddd"
			/>
			<View style={{ padding: 5 }}>
				<Image
				source={require('../assets/Icons/kalender.png')}
				style={{ width: 20, height: 20 }}
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

			{/* TIME */}
			<Text style={styles.inputLabel}>WAKTU</Text>
			<TouchableOpacity onPress={showTimepicker} style={styles.pickerContainer}>
			<TextInput
				style={styles.input}
				editable={false}
				value={formattedTime}
				placeholder="Pilih waktu"
				placeholderTextColor="#ddd"
			/>
			<View style={{ padding: 5 }}>
				<Image
				source={require('../assets/Icons/kalender.png')}
				style={{ width: 20, height: 20 }}
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

			{/* PLACE PICKERS */}
			<Text style={styles.inputLabel}>TEMPAT</Text>

			<TouchableOpacity
			onPress={() => openModal('prov')}
			style={styles.pickerContainer}
			>
			<TextInput
				editable={false}
				style={styles.input}
				placeholder="Provinsi"
				value={provText}
				placeholderTextColor="#ddd"
			/>
			<View style={{ padding: 5 }}>
				<Image
				source={require('../assets/Icons/dropdown.png')}
				style={{ width: 13, height: 13 }}
				/>
			</View>
			</TouchableOpacity>

			<TouchableOpacity
			onPress={() => openModal('kab')}
			style={styles.pickerContainer}
			>
			<TextInput
				editable={false}
				style={styles.input}
				placeholder="Kabupaten/Kota"
				value={kabText}
				placeholderTextColor="#ddd"
			/>
			<View style={{ padding: 5 }}>
				<Image
				source={require('../assets/Icons/dropdown.png')}
				style={{ width: 13, height: 13 }}
				/>
			</View>
			</TouchableOpacity>

			<TouchableOpacity
			onPress={() => openModal('kec')}
			style={styles.pickerContainer}
			>
			<TextInput
				editable={false}
				style={styles.input}
				placeholder="Kecamatan"
				value={kecText}
				placeholderTextColor="#ddd"
			/>
			<View style={{ padding: 5 }}>
				<Image
				source={require('../assets/Icons/dropdown.png')}
				style={{ width: 13, height: 13 }}
				/>
			</View>
			</TouchableOpacity>

			<TouchableOpacity
			onPress={() => openModal('kel')}
			style={styles.pickerContainer}
			>
			<TextInput
				editable={false}
				style={styles.input}
				placeholder="Kelurahan/Desa"
				value={kelText}
				placeholderTextColor="#ddd"
			/>
			<View style={{ padding: 5 }}>
				<Image
				source={require('../assets/Icons/dropdown.png')}
				style={{ width: 13, height: 13 }}
				/>
			</View>
			</TouchableOpacity>

			{/* ACTIONS */}
			<View style={styles.buttonContainer}>
			<TouchableOpacity
				style={[styles.btn, { backgroundColor: '#6c757d' }]}
				onPress={() => navigation.navigate('ReportScreen')}
			>
				<Text style={styles.buttonText}>BATAL</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.btn}
				onPress={validateForm}
			>
				<Text style={styles.buttonText}>LANJUT</Text>
			</TouchableOpacity>
			</View>

			{/* GENERIC MODAL */}
			<Modal
			animationType="slide"
			transparent={true}
			visible={modalVisible}
			onRequestClose={() => setModalVisible(false)}
			>
			<View style={styles.modalOverlay}>
				<View style={styles.modalContainer}>
				<TouchableOpacity
					style={styles.modalClose}
					onPress={() => setModalVisible(false)}
				>
					<Text style={styles.modalCloseText}>✕</Text>
				</TouchableOpacity>

				<Text style={styles.modalTitle}>
					{modalType === 'prov' && 'Cari Provinsi'}
					{modalType === 'kab' && 'Cari Kabupaten / Kota'}
					{modalType === 'kec' && 'Cari Kecamatan'}
					{modalType === 'kel' && 'Cari Kelurahan / Desa'}
				</Text>

				<SafeAreaView style={{ flex: 1 }}>
					{modalLoading ? (
					<View style={{ padding: 30, alignItems: 'center' }}>
						<ActivityIndicator size="large" color="#0068A7" />
					</View>
					) : (
					<FlatList
						data={currentList()}
						keyExtractor={(it) => (it.id ?? it.code ?? it.value ?? Math.random()).toString()}
						renderItem={({ item }) => (
						<ItemPicker
							id={item.code ?? item.id}
							title={item.name}
							onSelect={selectCallback}
						/>
						)}
						ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }} />}
					/>
					)}
				</SafeAreaView>
				</View>
			</View>
			</Modal>
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
	headerRow: {
		flexDirection: 'row',
		paddingBottom: 5,
		borderBottomWidth: 1,
		borderBottomColor: '#adbcb1',
		alignItems: 'center',
	},
	headingText: {
		fontWeight: 'bold',
		fontSize: 35,
		color: '#ffffff',
	},
	welcomeText: {
		fontWeight: 'bold',
		fontSize: 20,
		color: '#ffffff',
		paddingTop: 10,
		marginBottom: 20,
	},
	inputLabel: {
		color: '#00aeef',
		fontSize: 15,
		fontWeight: 'bold',
		paddingBottom: 5,
		marginTop: 6,
	},
	pickerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 6,
		backgroundColor: 'transparent',
	},
	input: {
		width: '100%',
		flex: 1,
		borderBottomWidth: 1,
		borderColor: '#00aeef',
		height: 44,
		color: 'white',
		marginBottom: 8,
		paddingLeft: 4,
	},
	buttonContainer: {
		flexDirection: 'row',
		marginTop: 12,
		justifyContent: 'space-between',
	},
	btn: {
		flex: 1,
		backgroundColor: '#00aeef',
		justifyContent: 'center',
		paddingHorizontal: 18,
		paddingVertical: 10,
		marginHorizontal: 5,
		borderRadius: 6,
		height: 50,
	},
	buttonText: {
		textAlign: 'center',
		color: '#ffff',
		fontWeight: '700',
	},

	/* modal styles */
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.45)',
		justifyContent: 'center',
		padding: 20,
	},
	modalContainer: {
		backgroundColor: '#fff',
		borderRadius: 10,
		maxHeight: '85%',
		padding: 16,
	},
	modalClose: {
		position: 'absolute',
		right: 10,
		top: 8,
		zIndex: 10,
		padding: 6,
	},
	modalCloseText: {
		fontSize: 18,
		color: '#333',
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#122E5F',
		marginBottom: 10,
		textAlign: 'center',
	},
	modalItem: {
		paddingVertical: 14,
		paddingHorizontal: 8,
	},
	modalItemText: {
		fontSize: 16,
		color: '#111',
	},
	modalTextSmall: {
		fontSize: 12,
		color: '#666',
	},
});

export default ReportFormStep1;
