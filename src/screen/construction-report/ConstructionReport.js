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

    // === PAGINATION STATES ===
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        getReports(1, true); // fetch halaman pertama
        getOfflineData();
        const interval = setInterval(() => getReports(1, true), 50000);
        return () => clearInterval(interval);
    }, []);

    // === FETCH ONLINE REPORTS (dengan pagination support) ===
    const getReports = async (pageNumber = 1, replace = false) => {
        try {
            if (pageNumber === 1) setLoading(true);

            const response = await axios.get(
                `${BASE_URL}/progres-sppg?perPage=10&page=${pageNumber}&search=&orderBy=date&sortBy=desc`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = response?.data?.response?.data ?? [];

            if (replace) {
                setReports(data);
            } else {
                setReports((prev) => [...prev, ...data]);
            }

            if (data.length < 10) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    // === LAZY LOAD / LOAD MORE ===
    const loadMoreReports = async () => {
        if (loadingMore || !hasMore || activeTab !== 'online') return;

        setLoadingMore(true);
        const nextPage = page + 1;
        await getReports(nextPage);
        setPage(nextPage);
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
        setPage(1);
        await getReports(1, true);
        await getOfflineData();
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

    const handleSelectSPPG = (item) => setSelectedSPPG(item);

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
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

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

    const renderOfflineItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: '#ccd3e9cc' }]}>
            <View style={styles.cardHeader}>
                <Text style={styles.code}>#D-{item.dbId}</Text>
                <Text style={[styles.status, { backgroundColor: '#ff9800' }]}>DRAFT</Text>
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

    if (loading) return <SkeletonCard count={5} />;

    return (
        <View style={styles.container}>
            {/* === HEADER === */}
            <View style={styles.header}>
                <View style={styles.headerLeftGroup}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back-outline" size={24} color="#0d2143" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lap. Progres SPPG</Text>
                </View>
            </View>

            {/* === TAB SWITCHER === */}
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

            {/* === SYNC & ADD BUTTON === */}
            <View style={styles.btnControlContainer}>
                <TouchableOpacity
                    style={[styles.syncButton, syncing && { backgroundColor: '#999' }]}
                    onPress={() => handleSyncOfflineData(token)}
                    disabled={syncing}
                >
                    <Text style={styles.syncButtonText}>
                        {syncing ? '⏳ Mengirim...' : '🔄 Sync Data'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerButton} onPress={handleSearchClick}>
                    <Text style={styles.headerButtonText}>＋ Update Progres</Text>
                </TouchableOpacity>
            </View>

            {/* === LIST === */}
            <SafeAreaView style={[styles.listContainer, { marginBottom: 70 }]}>
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
                            onEndReached={loadMoreReports}
                            onEndReachedThreshold={0.2}
                            ListFooterComponent={
                                loadingMore ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#0068A7"
                                        style={{ marginVertical: 10 }}
                                    />
                                ) : null
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

            {/* === SEARCH MODAL === */}
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

                        <Text style={styles.modalTitle}>Update Progres SPPG</Text>
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
                                        <Text style={styles.modalSubTextSmall}>
                                            {item.address}
                                        </Text>
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

// === STYLES === (tetap seperti sebelumnya)
const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerLeftGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#0d2143' },
    tabContainer: { flexDirection: 'row', backgroundColor: '#0d2143', borderRadius: 8, padding: 4, marginVertical: 10 },
    tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
    tabActive: { backgroundColor: '#0068A7' },
    tabText: { color: '#ccc', fontWeight: '600' },
    tabTextActive: { color: '#fff', fontWeight: '700' },
    card: { backgroundColor: '#ccd3e9cc', borderRadius: 10, padding: 15, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    code: { backgroundColor: '#f8e9f8', color: '#C71585', fontWeight: 'bold', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    status: { color: 'white', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, fontSize: 12 },
    statusActive: { backgroundColor: '#4CAF50' },
    statusProgress: { backgroundColor: '#007bff' },
    cardBody: { marginTop: 8 },
    name: { fontSize: 15, fontWeight: '700', color: '#0d2143' },
    description: { fontSize: 13, color: '#333', marginTop: 2 },
    yayasan: { fontSize: 13, color: '#666' },
    wilayah: { fontSize: 13, color: '#666' },
    cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 8 },
    actionButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
    actionText: { color: 'white', fontWeight: '600' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontSize: 15, color: '#333', marginBottom: 8 },
    addButton: { backgroundColor: '#0068A7', padding: 10, borderRadius: 8 },
    addButtonText: { color: 'white', fontWeight: '700' },
    listContainer: { flex: 1 },
    btnControlContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
    syncButton: { backgroundColor: '#4CAF50', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
    syncButtonText: { color: 'white', fontWeight: '600' },
    headerButton: { backgroundColor: '#0068A7', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
    headerButtonText: { color: 'white', fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: '#fff', width: '90%', borderRadius: 10, padding: 15, maxHeight: '80%' },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#0d2143', marginBottom: 10 },
    modalSearchInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, marginBottom: 10 },
    modalItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalItemText: { fontWeight: '700', color: '#0d2143' },
    modalSubText: { fontSize: 13, color: '#333' },
    modalSubTextSmall: { fontSize: 12, color: '#666' },
    modalCreateButton: { backgroundColor: '#0068A7', paddingVertical: 10, borderRadius: 8, marginTop: 10 },
    modalCreateButtonText: { textAlign: 'center', color: '#fff', fontWeight: '700' },
    modalCloseIcon: { position: 'absolute', right: 10, top: 10 },
    modalCloseIconText: { fontSize: 18, color: '#333' },
});

export default ConstructionReport;
