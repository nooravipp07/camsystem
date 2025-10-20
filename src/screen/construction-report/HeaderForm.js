import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import SignatureCapture from 'react-native-signature-capture';

const HeaderForm = ({ navigation }) => {
    const [form, setForm] = useState({
        reportFrom: '',
        reportTo: '',
        description: '',
        workDone: [], // multi-select
        materials: [], // multi-select
        tools: [], // multi-select
        weather: '',
        issues: '',
        suggestion: '',
        signerRole: '',
        signerName: '',
    });

    const [signature, setSignature] = useState(null);
    const signRef = useRef();

    const handleChange = (key, value) => setForm({ ...form, [key]: value });

    // === Data Dropdown ===
    const workDoneList = [
        'PEKERJAAN PERSIAPAN, GALIAN DAN URUGAN',
        'PEKERJAAN PONDASI, DINDING DAN BETON BERTULANG',
        'PEKERJAAN KUSEN PINTU/JENDELA (LENGKAP AKSESORIS)',
        'PEKERJAAN ATAP, PLAFOND DAN RANGKA',
        'PEKERJAAN LANTAI',
        'PEKERJAAN KAMAR MANDI & SANITAIR',
        'PEKERJAAN PENGECATAN',
        'PEKERJAAN INSTALASI LISTRIK & AIR',
        'FIRE PROCTECTION',
        'PENANGKAL PETIR',
        'PEKERJAAN LAIN - LAIN',
    ];

    const statusKategori = [
        'On Progres',
        'Proses Persiapan',
        'Penentuan Kepala SPPG',
        'BA Verval',
        'Pembuatan VA',
        'Unggah Proposal',
        'Sudah Beroperasi',
        'Bermasalah',
    ];

    // helper untuk append ke array (hindari duplikat)
    const appendToArrayField = (field, value) => {
        if (!value) return;
        const current = Array.isArray(form[field]) ? form[field] : [];
        if (!current.includes(value)) {
        setForm({ ...form, [field]: [...current, value] });
        }
    };

    // helper remove
    const removeFromArrayField = (field, value) => {
        const current = Array.isArray(form[field]) ? form[field] : [];
        setForm({ ...form, [field]: current.filter((i) => i !== value) });
    };

    return (
        <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>INFORMASI WILAYAH SPPG</Text>

            {/* Report Dari */}
            <Text style={styles.label}>ID SPPG</Text>
            <TextInput
                style={styles.input}
                placeholder=""
                value={form.reportFrom}
                onChangeText={(val) => handleChange('reportFrom', val)}
            />

            {/* Report Untuk */}
            <Text style={styles.label}>Yayasan</Text>
            <TextInput
                style={styles.input}
                placeholder=""
                value={form.reportTo}
                onChangeText={(val) => handleChange('reportTo', val)}
            />

            <Text style={styles.label}>Nama Dapur</Text>
            <TextInput
                style={styles.input}
                placeholder=""
                value={form.reportFrom}
                onChangeText={(val) => handleChange('reportFrom', val)}
            />

            {/* Keterangan */}
            <Text style={styles.label}>Alamat</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                placeholder="Tuliskan keterangan..."
                value={form.description}
                onChangeText={(val) => handleChange('description', val)}
            />

            {/* MULTI SELECT: Pekerjaan yang sudah dilaksanakan */}
            <Text style={styles.label}>Provinsi</Text>
            <View style={styles.pickerContainer}>
            <Picker
                selectedValue=""
                onValueChange={(val) => appendToArrayField('workDone', val)}
            >
                <Picker.Item label="Pilih Provinisi" value="" />
                {workDoneList.map((item, index) => (
                <Picker.Item key={index} label={item} value={item} />
                ))}
            </Picker>
            </View>

            {/* MULTI SELECT: Pekerjaan yang sudah dilaksanakan */}
            <Text style={styles.label}>Kota / Kabupten</Text>
            <View style={styles.pickerContainer}>
            <Picker
                selectedValue=""
                onValueChange={(val) => appendToArrayField('workDone', val)}
            >
                <Picker.Item label="Pilih Kota / Kabupten" value="" />
                {workDoneList.map((item, index) => (
                    <Picker.Item key={index} label={item} value={item} />
                ))}
            </Picker>
            </View>

            {/* MULTI SELECT: Pekerjaan yang sudah dilaksanakan */}
            <Text style={styles.label}>Kecamatan</Text>
            <View style={styles.pickerContainer}>
            <Picker
                selectedValue=""
                onValueChange={(val) => appendToArrayField('workDone', val)}
            >
                <Picker.Item label="Pilih Kecamatan" value="" />
                {workDoneList.map((item, index) => (
                    <Picker.Item key={index} label={item} value={item} />
                ))}
            </Picker>
            </View>

            {/* MULTI SELECT: Pekerjaan yang sudah dilaksanakan */}
            <Text style={styles.label}>Desa / Kelurahan</Text>
            <View style={styles.pickerContainer}>
            <Picker
                selectedValue=""
                onValueChange={(val) => appendToArrayField('workDone', val)}
            >
                <Picker.Item label="Pilih Desa / Kelurahan" value="" />
                {workDoneList.map((item, index) => (
                    <Picker.Item key={index} label={item} value={item} />
                ))}
            </Picker>
            </View>

            {/* Keterangan */}
            <Text style={styles.label}>Keterangan</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                placeholder="Tuliskan keterangan..."
                value={form.description}
                onChangeText={(val) => handleChange('description', val)}
            />

            {/* Report Dari */}
            <Text style={styles.label}>Koordinat (Latitude, Longitude)</Text>
            <TextInput
                style={styles.input}
                placeholder=""
                value={form.reportFrom}
                onChangeText={(val) => handleChange('reportFrom', val)}
            />

            {/* MATERIAL (multi-select) */}
            <Text style={styles.label}>Status Kategori</Text>
            <View style={styles.pickerContainer}>
            <Picker
                selectedValue=""
                onValueChange={(val) => appendToArrayField('materials', val)}
            >
                <Picker.Item label="Pilih Status Kategori..." value="" />
                {statusKategori.map((item, index) => (
                    <Picker.Item key={index} label={item} value={item} />
                ))}
            </Picker>
            </View>

            {/* Tombol Navigasi */}
            <View style={styles.navButtons}>
            <TouchableOpacity
                style={[styles.navButton, { backgroundColor: '#6c757d' }]}
                onPress={() => navigation.navigate('ConstructionReport')}
            >
                <Text style={styles.navButtonText}>Kembali</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.navButton, { backgroundColor: '#0068A7' }]}
                onPress={() => navigation.navigate('ProgressForm')}
            >
                <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
            </View>
        </ScrollView>
        </View>
    );
};

export default HeaderForm;

// === Styles ===
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { padding: 20, paddingBottom: 15 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#122E5F', marginBottom: 20 },
    label: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 5 },
    input: {
        borderWidth: 1,
        borderColor: '#C4C4C4',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#C4C4C4',
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    signatureContainer: {
        height: 200,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 8,
        marginBottom: 20,
    },
    signatureButtons: { marginBottom: 20, alignItems: 'flex-end' },
    resetButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    resetButtonText: { color: '#fff', fontWeight: '600' },
    navButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    navButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    navButtonText: { color: '#fff', fontWeight: '600' },

    // Additional Styles for Multi-Select
    selectedListContainer: {
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#C4C4C4',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#f9f9f9',
    },
    selectedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedText: { flex: 1, color: '#333', fontSize: 14 },
    removeButton: {
        backgroundColor: '#dc3545',
        borderRadius: 15,
        paddingVertical: 2,
        paddingHorizontal: 8,
        marginLeft: 10,
    },
    removeButtonText: { color: '#fff', fontWeight: 'bold' },
});
