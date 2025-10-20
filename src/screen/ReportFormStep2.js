import React, { useState, useContext } from 'react';
import { View, Text, TextInput,StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { DataContext  } from '../context/DataContext';
import { Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ReportFormStep2 = ( {navigation} ) => {
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

	const handleInputNilai = (value) => {
		updateFormData({ nilai: value });
	};

	const validateForm = () => {
		if(formData.desc === ""){
			alert("Data Uraian Kejadian tidak boleh kosong !");
		} else if (formData.keterangan === "") {
			alert("Data Keterangan / Tindakan tidak boleh kosong !");
		} else {
			navigation.navigate('ReportFormStep3')
		}
	}

	const handleChange = (key, value) => setForm({ ...form, [key]: value });

	const levelList = [
        'MINOR',
        'MODERAT',
        'SERIUS',
        'KRITIS',
    ];

	const yayasanList = [
        'Z1R5RR - YAYASAN PERJUANGAN UNTUK KESEJAHTERAAN RAKYAT'
    ];

    return(
        <SafeAreaView style={styles.container}>
			<View style={{flexDirection: 'row', paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#adbcb1',}}>
				<Image
					style={{ width: 35, height: 35, marginRight: 5, tintColor: '#ffffff'}}
					source={require('../assets/Icons/title.png')}
				/>
				<Text style={{fontWeight: 'bold',fontSize: 35, color: '#ffffff'}}>Laporan</Text>
			</View>
			<Text style={styles.welcomeText}>Tambah Pelaporan</Text>
			<ScrollView>
				<Text style={styles.inputLabel}>URAIAN KEJADIAN</Text>
				<TextInput
					style={styles.textArea}
					value={formData.desc}
					onChangeText={handleInputUraianKejadian}
					multiline={true}
					numberOfLines={4}
				/>
				<Text style={styles.inputLabel}>TENTANG / TINDAKAN</Text>
				<TextInput
					style={styles.textArea}
					value={formData.keterangan}
					onChangeText={handleInputTindakan}
					multiline={true}
					numberOfLines={4}
				/>
				<Text style={styles.inputLabel}>LEVEL</Text>
				<Picker
					selectedValue={form.level}
					onValueChange={(val) => handleChange('level', val)}
				>
						<Picker.Item label="Pilih Level..." value="" />
						{levelList.map((item, index) => (
							<Picker.Item key={index} label={item} value={item} />
						))}
				</Picker>
				<Text style={styles.inputLabel}>YAYASAN</Text>
				<Picker
					selectedValue={form.yayasan}
					onValueChange={(val) => handleChange('yayasan', val)}
				>
					<Picker.Item label="Pilih Yayasan..." value="" />
					{yayasanList.map((item, index) => (
					<Picker.Item key={index} label={item} value={item} />
					))}
				</Picker>
			</ScrollView>
			<View style={styles.buttonContainer}>
				<TouchableOpacity
                  style={styles.btn}
                  onPress={() => navigation.navigate('ReportScreen')}
                >
                  <Text style={styles.buttonText}>BATAL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => navigation.navigate('ReportFormStep1')}
                >
                  <Text style={styles.buttonText}>KEMBALI</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => {
					validateForm();
				  }}
                >
                  <Text style={styles.buttonText}>LANJUT</Text>
                </TouchableOpacity>
            </View>
		</SafeAreaView>
    );
};

const { height: viewportHeight } = Dimensions.get('window');
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
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	btn: {
		flex: 1,
		backgroundColor: '#00aeef',
		justifyContent: 'center',
		paddingHorizontal: 10,
		paddingVertical: 15,
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
    input: {
        width: '100%',
        height: 40,
        borderColor: '#00aeef',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 12,
        paddingHorizontal: 10,
        color: 'white',
    },
	textArea: {
        width: '100%',
        height: 150,
        borderColor: '#00aeef',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 12,
        paddingHorizontal: 10,
        color: 'white',
		textAlignVertical: 'top', 
		marginBottom: 30
    },
	selectBox: {
		borderBottomWidth: 0,
		paddingBottom: 10,
	},

});

export default ReportFormStep2;