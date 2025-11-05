import React, { useEffect, useContext, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import { AuthContext } from '../context/AuthContext';
import { ReportContext } from '../context/ReportContext';
import { BASE_URL, BASE_IMG_URL } from '../config/Config';

const ReportScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const { reports, setReports } = useContext(ReportContext);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getReports();
        const interval = setInterval(() => {
            getReports();
        }, 20000);
        return () => clearInterval(interval);
    }, []);

    const getReports = async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}/reports?perPage=50&page=1&search=&orderBy=created_at&sortBy=desc`,
                {
                    headers: {
                        Authorization: `Bearer ${JSON.parse(token)}`,
                    },
                }
            );
            const data = response.data.response.data;
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (refreshing) return;
        setRefreshing(true);
        getReports();
    };

    const renderItem = ({ item }) => {
        const image =
            item.photos.find(
                (val) =>
                    val.extension_file !== 'application/pdf' &&
                    val.extension_file !== 'video/mp4'
            ) || null;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() =>
                    navigation.navigate('ReportDetailScreen', { reportId: item.id })
                }
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.code}>#{item.id}</Text>
                    <Text style={styles.status}>Laporan</Text>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tanggal:</Text>
                        <Text style={styles.value}>
                            {moment(item.date, 'YYYY-MM-DD').format('DD MMM YYYY')}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Waktu:</Text>
                        <Text style={styles.value}>{item.hour?.substring(0, 5)}</Text>
                    </View>
                    <View style={styles.imageWrapper}>
                        {image ? (
                            <Image
                                source={{ uri: `${BASE_IMG_URL}${image.file}` }}
                                style={styles.image}
                            />
                        ) : (
                            <Image
                                source={require('../assets/Icons/kamera.png')}
                                style={styles.image}
                            />
                        )}
                    </View>
                    <Text style={styles.description}>
                        {item.desc?.substring(0, 120)}...
                    </Text>
                </View>

                <View style={styles.cardFooter}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#17a2b8' }]}
                        onPress={() =>
                            navigation.navigate('ReportDetailScreen', { reportId: item.id })
                        }
                    >
                        <Text style={styles.actionText}>👁️ Lihat Detail</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={{ color: '#fff', marginTop: 10 }}>
                    Memuat laporan...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>LAPORAN KEJADIAN</Text>

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
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Belum ada laporan.</Text>
                    }
                />
            </SafeAreaView>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('ReportFormStep1')}
            >
                <Text style={styles.addButtonText}>＋ Tambah Laporan</Text>
            </TouchableOpacity>
        </View>
    );
};

// ===== STYLES =====
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#122E5F',
    },
    heading: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#fff',
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#adbcb1',
    },
    listContainer: { flex: 1, marginTop: 15 },
    card: {
        backgroundColor: '#ffffffcc',
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
        backgroundColor: '#e6f0ff',
        color: '#0068A7',
        fontWeight: 'bold',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 3,
        fontSize: 13,
    },
    status: {
        backgroundColor: '#17a2b8',
        color: '#fff',
        fontWeight: 'bold',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 3,
        fontSize: 12,
    },
    cardBody: { marginTop: 10 },
    row: { flexDirection: 'row', marginBottom: 5 },
    label: { fontWeight: 'bold', color: '#333', width: 70 },
    value: { color: '#333' },
    description: {
        fontSize: 13,
        color: '#333',
        marginTop: 10,
        fontStyle: 'italic',
    },
    imageWrapper: {
        alignItems: 'center',
        marginTop: 10,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        gap: 10,
    },
    actionButton: {
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    actionText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    addButton: {
        backgroundColor: '#0068A7',
        paddingVertical: 14,
        borderRadius: 8,
        marginTop: 15,
        marginBottom: 80
    },
    addButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#122E5F',
    },
    emptyText: {
        textAlign: 'center',
        color: '#fff',
        fontStyle: 'italic',
        marginTop: 20,
    },
});

export default ReportScreen;
