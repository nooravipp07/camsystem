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
import { getOfflineReports, deleteReport } from '../../utils/db';
import { sendOfflineReports } from '../../utils/offlineSync';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/Ionicons';
import SkeletonCard from '../../components/SkeletonCard';

const ConstructionReport = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [offlineReports, setOfflineReports] = useState([]);
    const [activeTab, setActiveTab] = useState('online');

    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [sppgList, setSppgList] = useState([]);
    const [filteredSPPG, setFilteredSPPG] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedSPPG, setSelectedSPPG] = useState(null);
    const [loadingSPPG, setLoadingSPPG] = useState(false);

    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        getReports();
        getOfflineData();
        const interval = setInterval(() => getReports(), 20000);
        return () => clearInterval(interval);
    }, []);

    // === FETCH ONLINE REPORTS ===
    const getReports = async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}/progres-sppg?perPage=10&page=1&search=&orderBy=date&sortBy=desc`,
                {
                    headers: { Authorization: `Bearer ${token}` },
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

    // === FETCH OFFLINE DATA ===
    const getOfflineData = async () => {
        try {
            const data = await getOfflineReports();
            const parsed = data.map((r) => {
                let parsedData = null;
                try {
                    parsedData = JSON.parse(r.data);
                } catch (e) {
                    parsedData = null;
                }
                return {
                    dbId: r.id,
                    token: r.token,
                    payload: parsedData,
                    createdAt: r.created_at || null,
                };
            });
            setOfflineReports(parsed.reverse());
        } catch (e) {
            console.error('Error getOfflineData:', e);
        }
    };

    // === FETCH SPPG LIST (for modal) ===
    const getSPPGList = async () => {
        try {
            setLoadingSPPG(true);
            const response = await axios.get(
                `${BASE_URL}/progres-sppg/list-sppg?perPage=10&page=1&orderBy=date&sortBy=desc`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = response?.data?.response?.data ?? [];
            const mapped = data.map((item) => ({
                id: item.id.toString(),
                name: item.yayasan_name,
                code: item.code,
                address: item.address,
            }));
            setSppgList(mapped);
            setFilteredSPPG(mapped);
        } catch (error) {
            console.error('Error fetching SPPG list:', error);
        } finally {
            setLoadingSPPG(false);
        }
    };

    const handleRefresh = async () => {
        if (refreshing) return;
        setRefreshing(true);
        await getReports();
        await getOfflineData();
        setRefreshing(false);
    };

    const handleSearchClick = () => {
        setSearchModalVisible(true);
        getSPPGList();
        setSearchText('');
        setSelectedSPPG(null);
    };

    const handleSearchChange = (text) => {
        setSearchText(text);
        const filtered = sppgList.filter(
            (item) =>
                item.id.includes(text) ||
                item.name.toLowerCase().includes(text.toLowerCase()) ||
                item.code.toLowerCase().includes(text.toLowerCase())
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

    const handleDownload = (item) => {
        alert(`Downloading report for ${item.report_from}`);
    };

    const handlePreview = (item) => {
        alert(`Previewing report for ${item.report_from}`);
    };

    const handleSyncOfflineData = async (token) => {
        try {
            const state = await NetInfo.fetch();
            if (!state.isConnected) {
                alert('⚠️ Tidak ada koneksi internet. Silakan coba lagi nanti.');
                return;
            }

            setSyncing(true);
            const sentCount = await sendOfflineReports(token);
            await getOfflineData();

            if (sentCount > 0) {
                alert(`✅ Berhasil mengirim ${sentCount} laporan offline ke server.`);
            } else {
                alert('📭 Tidak ada data draft untuk dikirim.');
            }
        } catch (e) {
            console.error('Error syncing data:', e);
            alert('❌ Gagal melakukan sinkronisasi data.');
        } finally {
            setSyncing(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);

        // Format lokal Indonesia
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // === RENDER ONLINE REPORT CARD ===
    const renderOnlineItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.code}>#{item.id}</Text>
                <Text
                    style={[
                        styles.status,
                        item.total_progress >= 100
                            ? styles.statusActive
                            : styles.statusProgress,
                    ]}
                >
                    {formatDateTime(item.created_at)}
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
                    style={[styles.actionButton, { backgroundColor: '#0068A7' }]}
                    onPress={() => handlePreview(item)}
                >
                    <Text style={styles.actionText}>👁️ Preview</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#0068A7' }]}
                    onPress={() => handleDownload(item)}
                >
                    <Text style={styles.actionText}>⬇️ Download</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // === RENDER OFFLINE REPORT CARD ===
    const renderOfflineItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: '#ccd3e9cc' }]}>
            <View style={styles.cardHeader}>
                <Text style={styles.code}>#D-{item.dbId}</Text>
                <Text style={[styles.status, { backgroundColor: '#ff9800' }]}>
                    DRAFT
                </Text>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.name}>
                    {item.payload?.headerForm?.sppgId
                        ? `SPPG: ${item.payload.headerForm.sppgId}`
                        : `Draft ID ${item.dbId}`}
                </Text>
                <Text style={styles.description}>
                    Progress: {item.payload?.headerForm?.total_progress ?? 0}%
                </Text>
                <Text style={styles.description}>
                    {item.payload?.generalInformation?.obstacles || '(tidak ada deskripsi)'}
                </Text>
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#28a745' }]}
                    onPress={async () => {
                        try {
                            const state = await NetInfo.fetch();
                            if (!state.isConnected) {
                                alert('Tidak ada koneksi internet.');
                                return;
                            }
                            await sendOfflineReports();
                            await getOfflineData();
                        } catch (e) {
                            console.log('Error sending draft:', e);
                            alert('Gagal mengirim draft.');
                        }
                    }}
                >
                    <Text style={styles.actionText}>📤 Kirim</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#dc3545' }]}
                    onPress={async () => {
                        await deleteReport(item.dbId);
                        getOfflineData();
                    }}
                >
                    <Text style={styles.actionText}>🗑 Hapus</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // === UI ===
    if (loading) {
        return <SkeletonCard count={5} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeftGroup}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back-outline" size={24} color="#0d2143" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Lap. Progress SPPG</Text>
                </View>
            </View>

            {/* TAB SWITCHER */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'online' && styles.tabActive]}
                    onPress={() => setActiveTab('online')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'online' && styles.tabTextActive,
                        ]}
                    >
                        Online ({reports.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'draft' && styles.tabActive]}
                    onPress={() => {
                        setActiveTab('draft');
                        getOfflineData();
                    }}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'draft' && styles.tabTextActive,
                        ]}
                    >
                        Draft ({offlineReports.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.btnControlContainer}>
                <View style={styles.syncContainer}>
                    <TouchableOpacity
                        style={[styles.syncButton, syncing && { backgroundColor: '#999' }]}
                        onPress={() => handleSyncOfflineData(token)}
                        disabled={syncing}
                    >
                        <Text style={styles.syncButtonText}>
                            {syncing ? '⏳ Mengirim...' : '🔄 Sync Data'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.headerButton} onPress={handleSearchClick}>
                    <Text style={styles.headerButtonText}>＋ Tambah</Text>
                </TouchableOpacity>
            </View>

            {/* LIST */}
            <SafeAreaView style={ [styles.listContainer , { marginBottom: 70 }]}>
                {activeTab === 'online' ? (
                    reports.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Tidak ada laporan SPPG</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={handleSearchClick}
                            >
                                <Text style={styles.addButtonText}>＋ Tambahkan Data Baru</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={reports}
                            renderItem={renderOnlineItem}
                            keyExtractor={(item) => item.id.toString()}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    colors={['#0068A7']}
                                />
                            }
                        />
                    )
                ) : offlineReports.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Tidak ada draft offline</Text>
                    </View>

                    
                ) : (
                    <FlatList
                        data={offlineReports}
                        renderItem={renderOfflineItem}
                        keyExtractor={(item) => item.dbId.toString()}
                    />
                )}
            </SafeAreaView>

            {/* MODAL */}
            <Modal
                visible={searchModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSearchModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity
                            style={styles.modalCloseIcon}
                            onPress={() => setSearchModalVisible(false)}
                        >
                            <Text style={styles.modalCloseIconText}>✕</Text>
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>Pilih ID SPPG</Text>
                        <TextInput
                            style={styles.modalSearchInput}
                            placeholder="Cari ID / Nama proyek / Code..."
                            placeholderTextColor="#999"
                            value={searchText}
                            onChangeText={handleSearchChange}
                        />

                        {loadingSPPG ? (
                            <ActivityIndicator color="#0068A7" size="large" />
                        ) : (
                            <FlatList
                                data={filteredSPPG}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.modalItem,
                                            selectedSPPG?.id === item.id && {
                                                backgroundColor: '#e6f0ff',
                                            },
                                        ]}
                                        onPress={() => handleSelectSPPG(item)}
                                    >
                                        <Text style={styles.modalItemText}>{item.code}</Text>
                                        <Text style={styles.modalSubText}>{item.name}</Text>
                                        <Text style={styles.modalSubTextSmall}>{item.address}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}

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

// === STYLES ===
const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeftGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6, // jarak kecil antara icon & title
    },
    backButton: {
        padding: 4,
    },
    backIcon: {
        fontSize: 22,
        color: '#0d2143',
        fontWeight: 'bold',
    },
    btnControlContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0d2143',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#888',
    },
    headerButton: {
        backgroundColor: '#0068A7',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    headerButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#e0e5ec',
        borderRadius: 10,
        padding: 4,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#0d2143',
        borderRadius: 8,
        padding: 4,
        marginVertical: 10,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    tabActive: { backgroundColor: '#0068A7' },
    tabText: { color: '#ccc', fontWeight: '600' },
    tabTextActive: { color: '#fff', fontWeight: '700' },
    listContainer: { flex: 1, marginTop: 15 },
    searchInput: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginTop: 10,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#C4C4C4',
    },
    card: {
        backgroundColor: '#ccd3e9cc',
        borderRadius: 10,
        padding: 15,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    code: {
        backgroundColor: '#f8e9f8',
        color: '#C71585',
        fontWeight: 'bold',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 3,
        fontSize: 13,
    },
    status: {
        fontWeight: 'bold',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 3,
        fontSize: 12,
        color: '#fff',
    },
    statusActive: { backgroundColor: '#28a745' },
    statusProgress: { backgroundColor: '#f0ad4e' },
    name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    yayasan: { fontSize: 13, color: '#007bff', marginTop: 3 },
    wilayah: { fontSize: 13, color: '#555', marginTop: 3 },
    description: { fontSize: 12, color: '#333', marginTop: 5, fontStyle: 'italic' },
    cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 },
    actionButton: { borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
    actionText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#000', fontSize: 16, marginBottom: 10 },
    addButton: {
        backgroundColor: '#28a745',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        maxHeight: '80%',
        position: 'relative',
    },
    modalCloseIcon: { position: 'absolute', top: 10, right: 10, zIndex: 10, padding: 5 },
    modalCloseIconText: { fontSize: 18, fontWeight: 'bold', color: '#122E5F' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#122E5F' },
    modalSearchInput: {
        borderWidth: 1,
        borderColor: '#C4C4C4',
        borderRadius: 8,
        padding: 8,
        marginBottom: 10,
        fontSize: 14,
        color: '#000',
    },
    modalItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalItemText: { fontWeight: 'bold', color: '#000' },
    modalSubText: { color: '#555', fontSize: 12 },
    modalSubTextSmall: { color: '#777', fontSize: 11 },
    modalCreateButton: {
        backgroundColor: '#0068A7',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    modalCreateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#122E5F' },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center', // ⬅️ posisikan vertikal di tengah
        alignItems: 'center',     // ⬅️ posisikan horizontal di tengah
        paddingHorizontal: 20,
        minHeight: 400,           // agar tetap di tengah meski list kecil
    },
    emptyText: {
        textAlign: 'center',
        color: '#333',
        fontSize: 15,
        fontWeight: '600',
    },
    emptySubText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 13,
        marginTop: 4,
    },
    syncContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    syncButton: {
        backgroundColor: '#0068A7',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-end',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    syncButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default ConstructionReport;
