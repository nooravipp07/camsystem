import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Modal,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { BASE_URL } from '../../config/Config';

const ConstructionReport = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [dummySPPGList, setDummySPPGList] = useState([
        { id: '307', name: 'Proyek Renovasi Gedung A' },
        { id: '308', name: 'Proyek Renovasi Gedung B' },
        { id: '309', name: 'Proyek Pembangunan Kantor' },
        { id: '310', name: 'Proyek Jalan Raya' },
    ]);
    const [filteredSPPG, setFilteredSPPG] = useState(dummySPPGList);
    const [searchText, setSearchText] = useState('');
    const [selectedSPPG, setSelectedSPPG] = useState(null);

    // ===== API FETCH REPORTS =====
    const getReports = async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}/progres-sppg?perPage=10&page=1&search=&orderBy=date&sortBy=desc`,
                {
                    headers: {
                        Authorization: `Bearer ${JSON.parse(token)}`,
                    },
                }
            );
            const data = response?.data?.response?.data ?? [];
            setReports(data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        getReports();
        const interval = setInterval(() => {
            getReports();
        }, 20000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        if (refreshing) return;
        setRefreshing(true);
        getReports();
    };

    const handleEdit = (item) => {
        navigation.navigate('HeaderForm', { report: item });
    };

    const handleDownload = (item) => {
        alert(`Downloading report for ${item.report_from}`);
    };

    const handlePreview = (item) => {
        alert(`Previewing report for ${item.report_from}`);
    };

    // ===== Modal Functions =====
    const handleSearchClick = () => {
        setSearchModalVisible(true);
        setFilteredSPPG(dummySPPGList);
        setSearchText('');
        setSelectedSPPG(null);
    };

    const handleSearchChange = (text) => {
        setSearchText(text);
        const filtered = dummySPPGList.filter((item) =>
            item.id.includes(text) || item.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredSPPG(filtered);
    };

    const handleSelectSPPG = (item) => {
        setSelectedSPPG(item);
    };

    const handleCreateReport = () => {
        if (!selectedSPPG) {
            alert('Silakan pilih ID SPPG terlebih dahulu!');
            return;
        }
        setSearchModalVisible(false);
        navigation.navigate('ProgressForm', { sppgId: selectedSPPG.id });
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.code}>#{item.id}</Text>
                <Text
                    style={[
                        styles.status,
                        item.total_progress >= 100 ? styles.statusActive : styles.statusProgress,
                    ]}
                >
                    {item.total_progress >= 100 ? 'SELESAI' : 'ON PROGRESS'}
                </Text>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.name}>
                    Dari: {item.report_from} → {item.report_to}
                </Text>
                <Text style={styles.yayasan}>Project Manager: {item.project_manager}</Text>
                <Text style={styles.wilayah}>Progress Total: {item.total_progress}%</Text>
                <Text style={styles.description}>
                    {item.description || '(tidak ada deskripsi)'}
                </Text>
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#17a2b8' }]}
                    onPress={() => handlePreview(item)}
                >
                    <Text style={styles.actionText}>👁️ Preview</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#5bc0de' }]}
                    onPress={() => handleDownload(item)}
                >
                    <Text style={styles.actionText}>⬇️ Download</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={{ color: '#fff', marginTop: 10 }}>Loading reports...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>LAP. PROGRES SPPG</Text>

            <TouchableOpacity onPress={handleSearchClick}>
                <View pointerEvents="none">
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari laporan berdasarkan ID SPPG"
                        placeholderTextColor="#ccc"
                        editable={false}
                    />
                </View>
            </TouchableOpacity>

            <SafeAreaView style={styles.listContainer}>
                <FlatList
                    data={reports}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={['#0068A7']}
                        />
                    }
                />
            </SafeAreaView>

            {/* ===== MODAL ===== */}
            <Modal
                visible={searchModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSearchModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Tombol close pojok kanan atas */}
                        <TouchableOpacity
                            style={styles.modalCloseIcon}
                            onPress={() => setSearchModalVisible(false)}
                        >
                            <Text style={styles.modalCloseIconText}>✕</Text>
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>Pilih ID SPPG</Text>

                        <TextInput
                            style={styles.modalSearchInput}
                            placeholder="Cari ID / Nama proyek..."
                            placeholderTextColor="#999"
                            value={searchText}
                            onChangeText={handleSearchChange}
                        />

                        <FlatList
                            data={filteredSPPG}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.modalItem,
                                        selectedSPPG?.id === item.id && { backgroundColor: '#e6f0ff' }
                                    ]}
                                    onPress={() => handleSelectSPPG(item)}
                                >
                                    <Text style={styles.modalItemText}>{item.id}</Text>
                                    <Text style={styles.modalSubText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        <TouchableOpacity
                            style={styles.modalCreateButton}
                            onPress={handleCreateReport}
                        >
                            <Text style={styles.modalCreateButtonText}>Buat Laporan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// ===== STYLES =====
const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#122E5F' },
    heading: { fontWeight: 'bold', fontSize: 20, color: '#fff', paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#adbcb1' },
    listContainer: { flex: 1, marginTop: 15 },
    searchInput: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 10, fontSize: 14, borderWidth: 1, borderColor: '#C4C4C4' },
    card: { backgroundColor: '#ffffffcc', borderRadius: 10, padding: 15, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    code: { backgroundColor: '#f8e9f8', color: '#C71585', fontWeight: 'bold', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, fontSize: 13 },
    status: { fontWeight: 'bold', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, fontSize: 12, color: '#fff' },
    statusActive: { backgroundColor: '#28a745' },
    statusProgress: { backgroundColor: '#f0ad4e' },
    cardBody: { marginTop: 10 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    yayasan: { fontSize: 13, color: '#007bff', marginTop: 3 },
    wilayah: { fontSize: 13, color: '#555', marginTop: 3 },
    description: { fontSize: 12, color: '#333', marginTop: 5, fontStyle: 'italic' },
    cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 },
    actionButton: { borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
    actionText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#122E5F' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    modalContainer: { backgroundColor: '#fff', borderRadius: 10, padding: 20, maxHeight: '80%', position: 'relative' },
    modalCloseIcon: { position: 'absolute', top: 10, right: 10, zIndex: 10, padding: 5 },
    modalCloseIconText: { fontSize: 18, fontWeight: 'bold', color: '#122E5F' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#122E5F' },
    modalSearchInput: { borderWidth: 1, borderColor: '#C4C4C4', borderRadius: 8, padding: 8, marginBottom: 10, fontSize: 14 },
    modalItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalItemText: { fontWeight: 'bold', color: '#000' },
    modalSubText: { color: '#555', fontSize: 12 },
    modalCreateButton: { backgroundColor: '#0068A7', paddingVertical: 12, borderRadius: 8, marginTop: 10 },
    modalCreateButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
});

export default ConstructionReport;
