import React, { useState, useRef, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
    ActivityIndicator,
    Alert
} from 'react-native';
import axios from "axios";
import { Picker } from '@react-native-picker/picker';
import SignatureCapture from 'react-native-signature-capture';
import { useProgress } from "../../context/ProgressContext";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from '../../config/Config';

const GeneralInformationForm = ({ navigation }) => {
    const { updateProgressPayload, progressPayload } = useProgress();
    const { token } = useContext(AuthContext);

    const [form, setForm] = useState(
        progressPayload || {
            headerForm: {
                sppgId: "",
                total_progress: "",
                reportedBy: "",
                reportedTo: "",
                description: ""
            },
            generalInformation: {
                tasksPerformed: [],
                materialsUsed: [],
                toolsUsed: [],
                weatherCondition: "",
                obstacles: "",
                suggestions: "",
                uploadedFiles: [],
                signatureBase64Img: "",
                signerPosition: "",
                signerName: ""
            }
        }
    );

    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const signRef = useRef();

    // ✅ helper untuk update state nested
    const handleChange = (section, key, value) => {
        const updatedForm = {
            ...form,
            [section]: { ...form[section], [key]: value },
        };
        setForm(updatedForm);
        updateProgressPayload(section, updatedForm[section]);
    };

    // ✅ hanya simpan value (string) ke array
    const appendToArrayField = (section, field, value) => {
        if (!value) return;
        const current = Array.isArray(form[section][field]) ? form[section][field] : [];
        if (!current.includes(value)) {
            const updatedForm = {
                ...form,
                [section]: { ...form[section], [field]: [...current, value] },
            };
            setForm(updatedForm);
            updateProgressPayload(section, updatedForm[section]);
        }
    };

    // ✅ remove berdasarkan value string
    const removeFromArrayField = (section, field, value) => {
        const current = Array.isArray(form[section][field]) ? form[section][field] : [];
        const updatedForm = {
            ...form,
            [section]: {
                ...form[section],
                [field]: current.filter((i) => i !== value),
            },
        };
        setForm(updatedForm);
        updateProgressPayload(section, updatedForm[section]);
    };

    const handleSignatureSave = (result) => {
        const updatedForm = {
            ...form,
            generalInformation: { ...form.generalInformation, signatureBase64Img: result.encoded }
        };
        setForm(updatedForm);
        updateProgressPayload('generalInformation', updatedForm.generalInformation);
    };

    // === Confirm then Submit ===
    const handleSubmit = () => {
        setShowConfirm(true);
    };

    // === Actual Submit Handler ===
    const submitData = async () => {
        setShowConfirm(false);
        setLoading(true);

        try {
            const payload = form;
            const url = `${BASE_URL}/progres-sppg/insert`;
            const response = await axios.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${JSON.parse(token)}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200 || response.status === 201) {
                // ✅ clear context
                updateProgressPayload('headerForm', {
                    sppgId: "",
                    total_progress: "",
                    reportedBy: "",
                    reportedTo: "",
                    description: ""
                });
                updateProgressPayload('generalInformation', {
                    tasksPerformed: [],
                    materialsUsed: [],
                    toolsUsed: [],
                    weatherCondition: "",
                    obstacles: "",
                    suggestions: "",
                    uploadedFiles: [],
                    signatureBase64Img: "",
                    signerPosition: "",
                    signerName: ""
                });

                Alert.alert('Sukses', 'Data berhasil dikirim!', [
                    { text: 'OK', onPress: () => navigation.navigate('ConstructionReport') }
                ]);
            } else {
                Alert.alert('Gagal', 'Gagal mengirim data');
            }
        } catch (error) {
            console.log('Error submit:', error.response || error.message);
            Alert.alert('Error', 'Terjadi kesalahan saat mengirim data');
        } finally {
            setLoading(false);
        }
    };

    // === Data lists ===
    const materialList = [
        { value: "semen", label: "Semen" },
        { value: "pasir", label: "Pasir" },
        { value: "batu_split", label: "Batu Split" },
        { value: "batu_bata", label: "Batu Bata / Batako" },
        { value: "besi_beton", label: "Besi Beton" },
        { value: "baja_ringan", label: "Baja Ringan" },
        { value: "kayu", label: "Kayu / Triplek" },
        { value: "kusen", label: "Kusen Pintu / Jendela" },
        { value: "kaca", label: "Kaca" },
        { value: "cat", label: "Cat" },
        { value: "pipa", label: "Pipa PVC" },
        { value: "keramik", label: "Keramik" },
        { value: "gypsum", label: "Gypsum / Plafon" },
        { value: "kabel", label: "Kabel Listrik" },
        { value: "cat_besi", label: "Cat Besi / Kayu" },
        { value: "ac", label: "Air Conditioner (AC) Unit" },
        { value: "atap", label: "Atap Seng / Genteng" },
        { value: "paku", label: "Paku / Baut" }
    ];

    const toolsList = [
        { value: "roll_cat", label: "Roll Cat" },
        { value: "kuas_cat", label: "Kuas Cat" },
        { value: "sekop", label: "Sekop" },
        { value: "cangkul", label: "Cangkul" },
        { value: "molen", label: "Molen (Mixer Beton)" },
        { value: "gerinda", label: "Gerinda" },
        { value: "bor", label: "Bor Listrik" },
        { value: "tangga", label: "Tangga" },
        { value: "palu", label: "Palu" },
        { value: "tang", label: "Tang" },
        { value: "gergaji", label: "Gergaji Besi/Kayu" },
        { value: "waterpass", label: "Waterpass" },
        { value: "meteran", label: "Meteran" },
        { value: "ember", label: "Ember" },
        { value: "troli", label: "Troli/Dorongan" }
    ];

    const weatherList = ['Cerah', 'Mendung', 'Hujan Ringan', 'Hujan Sedang', 'Hujan Lebat'];

    // ✅ helper tampilkan label di list terpilih
    const getLabel = (list, value) => list.find(item => item.value === value)?.label || value;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>DATA UMUM</Text>

                {/* Header Form */}
                <Text style={styles.label}>ID SPPG</Text>
                <TextInput
                    style={styles.input}
                    value={form.headerForm.sppgId}
                    editable={false}
                />

                <Text style={styles.label}>Report Dari</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Kontraktor Pelaksana Dapur ..."
                    value={form.headerForm.reportedBy}
                    onChangeText={(val) => handleChange('headerForm', 'reportedBy', val)}
                />

                <Text style={styles.label}>Report Untuk</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Bapak / Ibu ..."
                    value={form.headerForm.reportedTo}
                    onChangeText={(val) => handleChange('headerForm', 'reportedTo', val)}
                />

                <Text style={styles.label}>Keterangan</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    value={form.headerForm.description}
                    onChangeText={(val) => handleChange('headerForm', 'description', val)}
                />

                {/* Material Picker */}
                <Text style={styles.label}>Material yang tersedia</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue=""
                        onValueChange={(val) => {
                            if (val) appendToArrayField('generalInformation', 'materialsUsed', val);
                        }}
                    >
                        <Picker.Item label="Pilih material..." value="" />
                        {materialList.map((item, i) => (
                            <Picker.Item key={i} label={item.label} value={item.value} />
                        ))}
                    </Picker>
                </View>

                {form.generalInformation.materialsUsed.length > 0 && (
                    <View style={styles.selectedListContainer}>
                        {form.generalInformation.materialsUsed.map((value, i) => (
                            <View key={i} style={styles.selectedItem}>
                                <Text style={styles.selectedText}>{getLabel(materialList, value)}</Text>
                                <TouchableOpacity
                                    onPress={() => removeFromArrayField('generalInformation', 'materialsUsed', value)}
                                    style={styles.removeButton}
                                >
                                    <Text style={styles.removeButtonText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Tools Picker */}
                <Text style={styles.label}>Alat Kerja</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue=""
                        onValueChange={(val) => {
                            if (val) appendToArrayField('generalInformation', 'toolsUsed', val);
                        }}
                    >
                        <Picker.Item label="Pilih alat kerja..." value="" />
                        {toolsList.map((item, i) => (
                            <Picker.Item key={i} label={item.label} value={item.value} />
                        ))}
                    </Picker>
                </View>

                {form.generalInformation.toolsUsed.length > 0 && (
                    <View style={styles.selectedListContainer}>
                        {form.generalInformation.toolsUsed.map((value, i) => (
                            <View key={i} style={styles.selectedItem}>
                                <Text style={styles.selectedText}>{getLabel(toolsList, value)}</Text>
                                <TouchableOpacity
                                    onPress={() => removeFromArrayField('generalInformation', 'toolsUsed', value)}
                                    style={styles.removeButton}
                                >
                                    <Text style={styles.removeButtonText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Cuaca */}
                <Text style={styles.label}>Cuaca Hari Ini</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={form.generalInformation.weatherCondition}
                        onValueChange={(val) => handleChange('generalInformation', 'weatherCondition', val)}
                    >
                        <Picker.Item label="Pilih cuaca..." value="" />
                        {weatherList.map((item, i) => (
                            <Picker.Item key={i} label={item} value={item} />
                        ))}
                    </Picker>
                </View>

                {/* Kendala dan Saran */}
                <Text style={styles.label}>Kendala</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    value={form.generalInformation.obstacles}
                    onChangeText={(val) => handleChange('generalInformation', 'obstacles', val)}
                />

                <Text style={styles.label}>Saran</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    value={form.generalInformation.suggestions}
                    onChangeText={(val) => handleChange('generalInformation', 'suggestions', val)}
                />

                {/* Signature */}
                <Text style={styles.label}>Tanda Tangan</Text>
                <View style={styles.signatureContainer}>
                    <SignatureCapture
                        style={{ flex: 1 }}
                        ref={signRef}
                        onSaveEvent={handleSignatureSave}
                        showNativeButtons={false}
                        showTitleLabel={false}
                        strokeColor="#000000"
                        minStrokeWidth={1}
                        maxStrokeWidth={15}
                    />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={() => {
                            signRef.current?.resetImage();
                            handleChange('generalInformation', 'signatureBase64Img', null);
                        }}
                    >
                        <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.resetButton, { backgroundColor: '#28a745' }]}
                        onPress={() => signRef.current?.saveImage()}
                    >
                        <Text style={styles.resetButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                {form.generalInformation.signatureBase64Img && (
                    <Image
                        source={{ uri: `data:image/png;base64,${form.generalInformation.signatureBase64Img}` }}
                        style={{ width: '100%', height: 150, borderWidth: 1, borderColor: '#000', marginBottom: 20 }}
                        resizeMode="contain"
                    />
                )}

                <Text style={styles.label}>Yang Menandatangani</Text>
                <TextInput
                    style={styles.input}
                    value={form.generalInformation.signerPosition}
                    onChangeText={(val) => handleChange('generalInformation', 'signerPosition', val)}
                />

                <Text style={styles.label}>Nama Penandatangan</Text>
                <TextInput
                    style={styles.input}
                    value={form.generalInformation.signerName}
                    onChangeText={(val) => handleChange('generalInformation', 'signerName', val)}
                />

                {/* Navigation Buttons */}
                <View style={styles.navButtons}>
                    <TouchableOpacity
                        style={[styles.navButton, { backgroundColor: '#6c757d' }]}
                        onPress={() => navigation.navigate('ProgressForm')}
                    >
                        <Text style={styles.navButtonText}>Kembali</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.navButton, { backgroundColor: '#0068A7' }]}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.navButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* === Modal Konfirmasi === */}
            <Modal
                visible={showConfirm}
                transparent
                animationType="fade"
                onRequestClose={() => setShowConfirm(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
                            Konfirmasi Pengiriman
                        </Text>
                        <Text style={{ fontSize: 14, color: '#555', marginBottom: 20 }}>
                            Apakah Anda yakin ingin mengirim data laporan ini?
                        </Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#6c757d' }]}
                                onPress={() => setShowConfirm(false)}
                            >
                                <Text style={styles.modalButtonText}>Batal</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#0068A7', marginLeft: 10 }]}
                                onPress={submitData}
                            >
                                <Text style={styles.modalButtonText}>OK Kirim</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {loading && (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color="#0068A7" />
                </View>
            )}
        </View>
    );
};

export default GeneralInformationForm;

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
    resetButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    resetButtonText: { color: '#fff', fontWeight: '600' },
    navButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 80 },
    navButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    navButtonText: { color: '#fff', fontWeight: '600' },
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
    selectedText: { color: '#333', fontSize: 14 },
    removeButton: {
        backgroundColor: '#dc3545',
        borderRadius: 20,
        width: 25,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButtonText: { color: '#fff', fontWeight: 'bold' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '80%',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    loaderOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
