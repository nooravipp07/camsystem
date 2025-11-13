import React, { useState, useEffect, useContext } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	FlatList,
	Modal,
	ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';
import axios from 'axios';
import { BASE_URL } from '../config/Config';
import Icon from 'react-native-vector-icons/Ionicons';

const fetchRegionalData = async (url, token, setList, setLoading) => {
	setLoading(true);
	try {
		const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
		setList(res?.data?.response?.data || []);
	} catch (err) {
		console.error('Regional Fetch Error:', err);
		setList([]);
	} finally {
		setLoading(false);
	}
};

const ReportFormStep1 = ({ navigation }) => {
	const { token, userInfo } = useContext(AuthContext);
	const { formData, updateFormData } = useContext(DataContext);

	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState(null);
	const [modalLoading, setModalLoading] = useState(false);

	const [provList, setProvList] = useState([]);
	const [kabList, setKabList] = useState([]);
	const [kecList, setKecList] = useState([]);
	const [kelList, setKelList] = useState([]);

	const [provText, setProvText] = useState('');
	const [kabText, setKabText] = useState('');
	const [kecText, setKecText] = useState('');
	const [kelText, setKelText] = useState('');

	const [date, setDate] = useState(new Date());
	const [time, setTime] = useState(new Date());
	const [formattedDate, setFormattedDate] = useState('');
	const [formattedTime, setFormattedTime] = useState('');
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showTimePicker, setShowTimePicker] = useState(false);

	let user = null;
	try {
		user = userInfo ? userInfo : null;
	} catch {
		user = null;
	}

	useEffect(() => {
		if (user) autoFillUserLocation();
		console.log(user)
	}, [userInfo]);

	const autoFillUserLocation = () => {
		if (!user) return;
		const fields = [
			{ key: 'province', id: 'province_id', text: setProvText },
			{ key: 'regency', id: 'regency_id', text: setKabText },
			{ key: 'district', id: 'district_id', text: setKecText },
			{ key: 'village', id: 'village_id', text: setKelText },
		];
		fields.forEach((f) => {
			if (user[`${f.key}_name`]) {
				f.text(user[`${f.key}_name`]);
				updateFormData({ [f.id]: user[`${f.key}_id`] });
			}
		});
	};

	const handleDateChange = (_, selectedDate) => {
		const current = selectedDate || date;
		setShowDatePicker(false);
		setDate(current);
		const formatted = moment(current).format('YYYY-MM-DD');
		setFormattedDate(formatted);
		updateFormData({ date: formatted });
	};

	const handleTimeChange = (_, selectedTime) => {
		const current = selectedTime || time;
		setShowTimePicker(false);
		setTime(current);
		const formatted = moment(current).format('HH:mm');
		setFormattedTime(formatted);
		updateFormData({ hour: formatted });
	};

	const loadProvinces = () =>
		fetchRegionalData(`${BASE_URL}/regional/list/provinces?perPage=35&page=1&search=`, token, setProvList, setModalLoading);
	const loadRegencies = (id) =>
		fetchRegionalData(`${BASE_URL}/regional/list/regency/${id}?perPage=200&page=1&search=`, token, setKabList, setModalLoading);
	const loadDistricts = (id) =>
		fetchRegionalData(`${BASE_URL}/regional/list/district/${id}?perPage=200&page=1&search=`, token, setKecList, setModalLoading);
	const loadVillages = (id) =>
		fetchRegionalData(`${BASE_URL}/regional/list/villages/${id}?perPage=200&page=1&search=`, token, setKelList, setModalLoading);

	const openModal = async (type) => {
		setModalType(type);
		setModalVisible(true);
		switch (type) {
			case 'prov': await loadProvinces(); break;
			case 'kab': await loadRegencies(formData.province_id); break;
			case 'kec': await loadDistricts(formData.regency_id); break;
			case 'kel': await loadVillages(formData.district_id); break;
		}
	};

	const handleSelect = (type, id, name) => {
		switch (type) {
			case 'prov':
				updateFormData({ province_id: id, regency_id: '', district_id: '', village_id: '' });
				setProvText(name); setKabText(''); setKecText(''); setKelText('');
				break;
			case 'kab':
				updateFormData({ regency_id: id, district_id: '', village_id: '' });
				setKabText(name); setKecText(''); setKelText('');
				break;
			case 'kec':
				updateFormData({ district_id: id, village_id: '' });
				setKecText(name); setKelText('');
				break;
			case 'kel':
				updateFormData({ village_id: id });
				setKelText(name);
				break;
		}
		setModalVisible(false);
	};

	const currentList = () => {
		switch (modalType) {
			case 'prov': return provList;
			case 'kab': return kabList;
			case 'kec': return kecList;
			case 'kel': return kelList;
			default: return [];
		}
	};

	const validateForm = () => {
		const required = [
			{ key: 'date', msg: 'Tanggal tidak boleh kosong!' },
			{ key: 'hour', msg: 'Waktu tidak boleh kosong!' },
			{ key: 'province_id', msg: 'Provinsi tidak boleh kosong!' },
			{ key: 'regency_id', msg: 'Kabupaten/Kota tidak boleh kosong!' },
			{ key: 'district_id', msg: 'Kecamatan tidak boleh kosong!' },
			{ key: 'village_id', msg: 'Kelurahan/Desa tidak boleh kosong!' },
		];
		for (let r of required) if (!formData?.[r.key]) return alert(r.msg);
		navigation.navigate('ReportFormStep2');
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<Icon name="arrow-back-outline" size={26} color="#0d2143" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Laporan Progres SPPG</Text>
			</View>

			<ScrollView contentContainerStyle={styles.scroll}>
				{/* Date Input */}
				<FormField label="Tanggal" value={formattedDate} onPress={() => setShowDatePicker(true)} />
				{showDatePicker && (
					<DateTimePicker value={date} mode="date" display="spinner" onChange={handleDateChange} />
				)}

				{/* Time Input */}
				<FormField label="Waktu" value={formattedTime} onPress={() => setShowTimePicker(true)} />
				{showTimePicker && (
					<DateTimePicker value={time} mode="time" is24Hour display="spinner" onChange={handleTimeChange} />
				)}

				{/* Region Pickers */}
				{[
					{ label: 'Provinsi', value: provText, type: 'prov' },
					{ label: 'Kabupaten/Kota', value: kabText, type: 'kab' },
					{ label: 'Kecamatan', value: kecText, type: 'kec' },
					{ label: 'Kelurahan/Desa', value: kelText, type: 'kel' },
				].map((item) => (
					<FormField
						key={item.type}
						label={item.label}
						value={item.value}
						onPress={() => openModal(item.type)}
					/>
				))}

				{/* Buttons */}
				<View style={styles.buttonContainer}>
					<TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigation.navigate('ReportScreen')}>
						<Text style={styles.buttonText}>Batal</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button} onPress={validateForm}>
						<Text style={styles.buttonText}>Lanjut</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			{/* Modal Picker */}
			<Modal visible={modalVisible} transparent animationType="fade">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<Text style={styles.modalTitle}>
							{modalType === 'prov' && 'Pilih Provinsi'}
							{modalType === 'kab' && 'Pilih Kabupaten/Kota'}
							{modalType === 'kec' && 'Pilih Kecamatan'}
							{modalType === 'kel' && 'Pilih Kelurahan/Desa'}
						</Text>
						{modalLoading ? (
							<ActivityIndicator size="large" color="#0d2143" style={{ marginVertical: 30 }} />
						) : (
							<FlatList
								data={currentList()}
								keyExtractor={(it) => it.code?.toString() ?? it.id?.toString()}
								renderItem={({ item }) => (
									<TouchableOpacity
										style={styles.modalItem}
										onPress={() => handleSelect(modalType, item.code ?? item.id, item.name)}
									>
										<Text style={styles.modalItemText}>{item.name}</Text>
									</TouchableOpacity>
								)}
							/>
						)}
						<TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalClose}>
							<Text style={styles.modalCloseText}>Tutup</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const FormField = ({ label, value, onPress }) => (
	<View style={{ marginBottom: 16 }}>
		<Text style={styles.label}>{label}</Text>
		<TouchableOpacity onPress={onPress} activeOpacity={0.8}>
			<View style={styles.input}>
				<Text style={{ color: value ? '#000' : '#aaa' }}>
					{value || `Pilih ${label}`}
				</Text>
			</View>
		</TouchableOpacity>
	</View>
);

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	scroll: { padding: 16, paddingBottom: 60 },
	header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
	backButton: { marginRight: 10 },
	headerTitle: { fontSize: 18, fontWeight: '700', color: '#0d2143' },
	sectionTitle: { fontSize: 20, fontWeight: '700', color: '#0d2143', marginVertical: 16 },
	label: { fontWeight: '600', color: '#0d2143', marginBottom: 6 },
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 10,
		backgroundColor: '#f9f9f9',
	},
	buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
	button: {
		flex: 1,
		backgroundColor: '#0068A7',
		paddingVertical: 14,
		borderRadius: 8,
		marginHorizontal: 5,
		alignItems: 'center',
	},
	cancelButton: { backgroundColor: '#6c757d' },
	buttonText: { color: '#fff', fontWeight: '700' },
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
	modalContainer: { backgroundColor: '#fff', borderRadius: 10, width: '85%', maxHeight: '80%', padding: 16 },
	modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: '#0d2143', textAlign: 'center' },
	modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
	modalItemText: { fontSize: 16, color: '#333' },
	modalClose: { marginTop: 16, alignItems: 'center' },
	modalCloseText: { color: '#0d2143', fontWeight: '600' },
});

export default ReportFormStep1;
