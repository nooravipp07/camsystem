import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  Image, SafeAreaView, ScrollView, Dimensions 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { DataContext } from '../context/DataContext';

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
      <View style={styles.header}>
        <Image
          style={styles.headerIcon}
          source={require('../assets/Icons/title.png')}
        />
        <Text style={styles.headerTitle}>Laporan</Text>
      </View>

      <Text style={styles.welcomeText}>Tambah Pelaporan</Text>

      <ScrollView>
        {/* Uraian Kejadian */}
        <Text style={styles.inputLabel}>URAIAN KEJADIAN</Text>
        <TextInput
          style={styles.textArea}
          value={formData.desc}
          onChangeText={handleInputUraianKejadian}
          multiline={true}
          numberOfLines={4}
        />

        {/* Tindakan */}
        <Text style={styles.inputLabel}>TENTANG / TINDAKAN</Text>
        <TextInput
          style={styles.textArea}
          value={formData.keterangan}
          onChangeText={handleInputTindakan}
          multiline={true}
          numberOfLines={4}
        />

        {/* Level */}
        <Text style={styles.inputLabel}>LEVEL</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.level}
            onValueChange={(val) => handleChange('level', val)}
            style={styles.picker}
            dropdownIconColor="#ffffff"
          >
            <Picker.Item label="Pilih Level..." value="" color="#000000" />
            {levelList.map((item, index) => (
              <Picker.Item key={index} label={item} value={item} color="#000000" />
            ))}
          </Picker>
        </View>

        {/* Yayasan */}
        <Text style={styles.inputLabel}>YAYASAN</Text>
        <View style={styles.pickerWrapper}>
			<Picker
				selectedValue={form.yayasan}
				onValueChange={(val) => handleChange('yayasan', val)}
				style={styles.picker}
				dropdownIconColor="#ffffff"
			>
				<Picker.Item label="Pilih Yayasan..." value="" color="#000000" />
				{yayasanList.map((item) => (
					<Picker.Item 
					key={item.id}
					label={`${item.name}`} 
					value={item.id} 
					color="#000000"
					/>
				))}
			</Picker>
        </View>
      </ScrollView>

      {/* Buttons */}
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
          onPress={validateForm}
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
    backgroundColor: '#122E5F',
  },
  header: {
    flexDirection: 'row',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#adbcb1',
  },
  headerIcon: {
    width: 35,
    height: 35,
    marginRight: 5,
    tintColor: '#ffffff',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 35,
    color: '#ffffff',
  },
  welcomeText: {
    fontWeight: 'bold',
    fontSize: 25,
    color: '#ffffff',
    paddingTop: 10,
    marginBottom: 30,
  },
  inputLabel: {
    color: '#00aeef',
    fontSize: 15,
    fontWeight: 'bold',
    paddingBottom: 5,
  },
  textArea: {
    width: '100%',
    height: 150,
    borderColor: '#00aeef',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 30,
    paddingHorizontal: 10,
    color: 'white',
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    borderColor: '#00aeef',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 30,
  },
  picker: {
    color: '#ffffff', // teks value menjadi putih
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
});

export default ReportFormStep2;
