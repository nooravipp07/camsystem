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

const GeneralInformationForm = ({ navigation }) => {
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

    const materialList = [
        'Semen',
        'Pasir',
        'Batu Split',
        'Batu Bata / Batako',
        'Besi Beton',
        'Baja Ringan',
        'Kayu / Triplek',
        'Kusen Pintu / Jendela',
        'Kaca',
        'Cat',
        'Pipa PVC',
        'Keramik',
        'Gypsum / Plafon',
        'Kabel Listrik',
        'Cat Besi / Kayu',
        'Air Conditioner (AC) Unit',
        'Atap Seng/ Genteng',
        'Paku / Baut',
    ];

    const toolsList = [
        'Roll Cat',
        'Kuas Cat',
        'Sekop',
        'Cangkul',
        'Mollen (Mixer Beton)',
        'Gerinda',
        'Bor Listrik',
        'Tangga',
        'Palu',
        'Tang',
        'Gergaji Besi / Kayu',
        'Meteran',
        'Ember',
        'Troli / Dorongan',
    ];

    const weatherList = [
        'Cerah',
        'Mendung',
        'Hujan Ringan',
        'Hujan Sedang',
        'Hujan Lebat',
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
            <Text style={styles.title}>DATA UMUM</Text>

            {/* Report Dari */}
            <Text style={styles.label}>Report Dari</Text>
            <TextInput
            style={styles.input}
            placeholder="Kontraktor Pelaksana Dapur ..."
            value={form.reportFrom}
            onChangeText={(val) => handleChange('reportFrom', val)}
            />

            {/* Report Untuk */}
            <Text style={styles.label}>Report Untuk</Text>
            <TextInput
            style={styles.input}
            placeholder="Bapak / Ibu ..."
            value={form.reportTo}
            onChangeText={(val) => handleChange('reportTo', val)}
            />

            {/* Keterangan */}
            <Text style={styles.label}>Keterangan</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                placeholder="Tuliskan keterangan..."
                value={form.description}
                onChangeText={(val) => handleChange('description', val)}
            />

            {/* MULTI SELECT: Pekerjaan yang sudah dilaksanakan */}
            <Text style={styles.label}>Pekerjaan yang sudah dilaksanakan</Text>
            <View style={styles.pickerContainer}>
            <Picker
                selectedValue=""
                onValueChange={(val) => appendToArrayField('workDone', val)}
            >
                <Picker.Item label="Pilih pekerjaan..." value="" />
                {workDoneList.map((item, index) => (
                <Picker.Item key={index} label={item} value={item} />
                ))}
            </Picker>
            </View>

            {/* List pilihan yang sudah dipilih */}
            {form.workDone.length > 0 && (
            <View style={styles.selectedListContainer}>
                {form.workDone.map((item, index) => (
                <View key={index} style={styles.selectedItem}>
                    <Text style={styles.selectedText}>{item}</Text>
                    <TouchableOpacity
                    onPress={() => removeFromArrayField('workDone', item)}
                    style={styles.removeButton}
                    >
                    <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>
                ))}
            </View>
            )}

            {/* MATERIAL (multi-select) */}
            <Text style={styles.label}>Material yang tersedia</Text>
            <View style={styles.pickerContainer}>
            <Picker
                selectedValue=""
                onValueChange={(val) => appendToArrayField('materials', val)}
            >
                <Picker.Item label="Pilih material..." value="" />
                {materialList.map((item, index) => (
                <Picker.Item key={index} label={item} value={item} />
                ))}
            </Picker>
            </View>

            {/* List Material */}
            {form.materials.length > 0 && (
            <View style={styles.selectedListContainer}>
                {form.materials.map((item, index) => (
                <View key={index} style={styles.selectedItem}>
                    <Text style={styles.selectedText}>{item}</Text>
                    <TouchableOpacity
                    onPress={() => removeFromArrayField('materials', item)}
                    style={styles.removeButton}
                    >
                    <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>
                ))}
            </View>
            )}

            {/* TOOLS (multi-select) */}
            <Text style={styles.label}>Alat Kerja</Text>
            <View style={styles.pickerContainer}>
            <Picker
                selectedValue=""
                onValueChange={(val) => appendToArrayField('tools', val)}
            >
                <Picker.Item label="Pilih alat kerja..." value="" />
                {toolsList.map((item, index) => (
                <Picker.Item key={index} label={item} value={item} />
                ))}
            </Picker>
            </View>

            {/* List Tools */}
            {form.tools.length > 0 && (
            <View style={styles.selectedListContainer}>
                {form.tools.map((item, index) => (
                <View key={index} style={styles.selectedItem}>
                    <Text style={styles.selectedText}>{item}</Text>
                    <TouchableOpacity
                    onPress={() => removeFromArrayField('tools', item)}
                    style={styles.removeButton}
                    >
                    <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>
                ))}
            </View>
            )}

            {/* Cuaca Hari Ini */}
            <Text style={styles.label}>Cuaca Hari Ini (Terlapor)</Text>
            <View style={styles.pickerContainer}>
            <Picker
                selectedValue={form.weather}
                onValueChange={(val) => handleChange('weather', val)}
            >
                <Picker.Item label="Pilih cuaca..." value="" />
                {weatherList.map((item, index) => (
                <Picker.Item key={index} label={item} value={item} />
                ))}
            </Picker>
            </View>

            {/* Kendala */}
            <Text style={styles.label}>Kendala</Text>
            <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            placeholder="Tuliskan kendala..."
            value={form.issues}
            onChangeText={(val) => handleChange('issues', val)}
            />

            {/* Saran */}
            <Text style={styles.label}>Saran</Text>
            <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            placeholder="Tuliskan saran..."
            value={form.suggestion}
            onChangeText={(val) => handleChange('suggestion', val)}
            />

            {/* Tanda Tangan */}
            <Text style={styles.label}>Tanda Tangan</Text>
            <View style={styles.signatureContainer}>
            <SignatureCapture
                style={{ flex: 1, height: 200, borderWidth: 1, borderColor: '#000', borderRadius: 8 }}
                ref={signRef}
                onSaveEvent={(result) => console.log(result.pathName)}
                onDragEvent={() => console.log('signing')}
                showNativeButtons={false}
                showTitleLabel={false}
                viewMode={'portrait'}
                minStrokeWidth={2}
                maxStrokeWidth={4}
                backgroundColor="#ffffff"
                strokeColor="#000000"
            />
            </View>

            {/* Tombol Reset Signature */}
            <View style={styles.signatureButtons}>
            <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                if (signRef.current) {
                    signRef.current.resetImage();
                    setSignature(null);
                }
                }}
            >
                <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            </View>

            {/* Yang Menandatangani */}
            <Text style={styles.label}>Yang Menandatangani</Text>
            <TextInput
            style={styles.input}
            placeholder="PIC, Pemimpin Proyek, Mandor, dll"
            value={form.signerRole}
            onChangeText={(val) => handleChange('signerRole', val)}
            />

            {/* Nama Penandatangan */}
            <Text style={styles.label}>Nama Penandatangan</Text>
            <TextInput
            style={styles.input}
            placeholder="Masukkan nama penandatangan"
            value={form.signerName}
            onChangeText={(val) => handleChange('signerName', val)}
            />

            {/* Tombol Navigasi */}
            <View style={styles.navButtons}>
            <TouchableOpacity
                style={[styles.navButton, { backgroundColor: '#6c757d' }]}
                onPress={() => navigation.navigate('ProgressForm')}
            >
                <Text style={styles.navButtonText}>Kembali</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.navButton, { backgroundColor: '#0068A7' }]}
                onPress={() => console.log('Form Data:', form)}
            >
                <Text style={styles.navButtonText}>Submit</Text>
            </TouchableOpacity>
            </View>
        </ScrollView>
        </View>
    );
};

export default GeneralInformationForm;

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
