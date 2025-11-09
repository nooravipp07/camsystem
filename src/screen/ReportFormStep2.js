import React, { useState, useContext } from 'react';
import { 
    View, Text, TextInput, StyleSheet, TouchableOpacity, 
    SafeAreaView, ScrollView, Dimensions 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { DataContext } from '../context/DataContext';
import Icon from 'react-native-vector-icons/Ionicons';

const ReportFormStep2 = ({ navigation }) => {
	const { formData, updateFormData } = useContext(DataContext);

	const [form, setForm] = useState({
		uraian: '',
		tindakan: '',
		level: '',
		yayasan: '',
	});

	const handleInputUraianKejadian = (value) => {
		updateFormData({ desc: value });
	};

	const handleInputTindakan = (value) => {
		updateFormData({ keterangan: value });
	};

	const handleChange = (key, value) => setForm({ ...form, [key]: value });

	const validateForm = () => {
		if (formData.desc === "") {
			alert("Data Uraian Kejadian tidak boleh kosong !");
		} else if (formData.keterangan === "") {
			alert("Data Keterangan / Tindakan tidak boleh kosong !");
		} else {
			navigation.navigate('ReportFormStep3');
		}
	};

	const levelList = ['MINOR', 'MODERAT', 'SERIUS', 'KRITIS'];
	const yayasanList = [
		{ id: '-1', name: 'YAYASAN LAINNYA' },
	];

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<Icon name="arrow-back-outline" size={26} color="#0d2143" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Laporan Progres SPPG</Text>
			</View>

			<ScrollView contentContainerStyle={styles.scroll}>
				{/* Uraian Kejadian */}
				<Text style={styles.label}>Uraian Kejadian</Text>
				<TextInput
					style={styles.textArea}
					value={formData.desc}
					onChangeText={handleInputUraianKejadian}
					multiline={true}
					numberOfLines={4}
					placeholder="Masukkan uraian kejadian..."
					placeholderTextColor="#aaa"
				/>

				{/* Tindakan */}
				<Text style={styles.label}>Tentang / Tindakan</Text>
				<TextInput
					style={styles.textArea}
					value={formData.keterangan}
					onChangeText={handleInputTindakan}
					multiline={true}
					numberOfLines={4}
					placeholder="Masukkan tindakan yang dilakukan..."
					placeholderTextColor="#aaa"
				/>

				{/* Level */}
				<Text style={styles.label}>Level</Text>
				<View style={styles.pickerWrapper}>
				<Picker
					selectedValue={form.level}
					onValueChange={(val) => handleChange('level', val)}
					style={styles.picker}
					dropdownIconColor="#000000"
				>
					<Picker.Item label="Pilih Level..." value="" color="#aaa" />
					{levelList.map((item, index) => (
					<Picker.Item key={index} label={item} value={item} color="#000000" />
					))}
				</Picker>
				</View>

				{/* Yayasan */}
				<Text style={styles.label}>Yayasan</Text>
				<View style={styles.pickerWrapper}>
				<Picker
					selectedValue={form.yayasan}
					onValueChange={(val) => handleChange('yayasan', val)}
					style={styles.picker}
					dropdownIconColor="#000000"
				>
					<Picker.Item label="Pilih Yayasan..." value="" color="#aaa" />
					{yayasanList.map((item) => (
					<Picker.Item 
						key={item.id}
						label={item.name}
						value={item.id}
						color="#000000"
					/>
					))}
				</Picker>
				</View>

				{/* Buttons */}
				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={[styles.button, styles.cancelButton]}
						onPress={() => navigation.navigate('ReportFormStep1')}
					>
						<Text style={styles.buttonText}>Kembali</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.button}
						onPress={validateForm}
					>
						<Text style={styles.buttonText}>Lanjut</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	scroll: { padding: 16, paddingBottom: 60 },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
	},
	backButton: { marginRight: 10 },
	backIcon: { width: 24, height: 24, tintColor: '#0d2143' },
	headerTitle: { fontSize: 18, fontWeight: '700', color: '#0d2143' },
	sectionTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#0d2143',
		marginVertical: 16,
	},
	label: { fontWeight: '600', color: '#0d2143', marginBottom: 6 },
	textArea: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 10,
		backgroundColor: '#f9f9f9',
		color: '#000',
		textAlignVertical: 'top',
		marginBottom: 16,
	},
	pickerWrapper: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		backgroundColor: '#f9f9f9',
		marginBottom: 16,
	},
	picker: { color: '#000' },
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 25,
	},
	button: {
		flex: 1,
		backgroundColor: '#0068A7',
		paddingVertical: 14,
		borderRadius: 8,
		marginHorizontal: 5,
		alignItems: 'center',
	},
	cancelButton: { backgroundColor: '#6c757d' },
	secondaryButton: { backgroundColor: '#00aeef' },
	buttonText: { color: '#fff', fontWeight: '700' },
});

export default ReportFormStep2;
