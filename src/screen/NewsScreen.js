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
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import moment from 'moment';
import { BASE_URL, BASE_IMG_URL } from '../config/Config';
import { NewsContext } from '../context/NewsContext';
import Icon from 'react-native-vector-icons/Ionicons';
import SkeletonCard from '../components/SkeletonCard';

const NewsScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const { news, setNews } = useContext(NewsContext);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getNews();
        const interval = setInterval(() => {
            handleRefresh();
        }, 20000);
        return () => clearInterval(interval);
    }, []);

    const getNews = async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}/news?perPage=10&page=1&search=&orderBy=date&sortBy=desc`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = response.data.response.data;
            setNews(data || []);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (refreshing) return;
        setRefreshing(true);
        getNews();
    };

    const handleFilter = () => {
        console.log('Filter clicked');
        // TODO: implement your filter modal or dropdown
    };

    const handleSort = () => {
        console.log('Sort clicked');
        // TODO: implement your sort logic or modal
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                navigation.navigate('NewsDetailScreen', { newsId: item.id })
            }
        >
            {item.thumbnail ? (
                <Image
                    style={styles.cardImage}
                    // source={{ uri: `${BASE_IMG_URL}/${item.thumbnail}` }}
                    source={{ uri: `https://picsum.photos/300/200?random=1` }}
                />
            ) : (
                <Image
                    style={styles.cardImage}
                    source={require('../assets/Icons/kamera.png')}
                />
            )}

            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                </Text>

                <View style={styles.cardMeta}>
                    <Text style={styles.cardDate}>
                        {moment(item.date, 'YYYY-MM-DD').format('DD MMM YYYY')}
                    </Text>
                    <Text style={styles.cardAuthor}>Admin</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return <SkeletonCard count={5} />;
    }

    return (
        <View style={styles.container}>
            {/* ===== HEADER ===== */}
            <View style={styles.header}>
                <View style={styles.headerLeftGroup}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back-outline" size={24} color="#0d2143" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Buletin Berita</Text>
                </View>
            </View>

            {/* ===== FILTER & SORT BAR ===== */}
            <View style={styles.filterSortBar}>
                <TouchableOpacity style={styles.filterButton} onPress={handleFilter}>
                    <Icon name="funnel-outline" size={20} color="#0d2143" />
                    <Text style={styles.filterText}>Filter</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.filterButton} onPress={handleSort}>
                    <Icon name="swap-vertical-outline" size={20} color="#0d2143" />
                    <Text style={styles.filterText}>Urutkan</Text>
                </TouchableOpacity>
            </View>

            {/* ===== LIST ===== */}
            <SafeAreaView style={styles.listContainer}>
                <FlatList
                    data={news}
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
                        <Text style={styles.emptyText}>
                            Belum ada berita untuk ditampilkan.
                        </Text>
                    }
                />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeftGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0d2143',
    },
    /** FILTER & SORT BAR */
    filterSortBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        marginBottom: 8,
        gap: 10,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e6f0ff',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    filterText: {
        marginLeft: 6,
        color: '#0d2143',
        fontWeight: '600',
        fontSize: 14,
    },
    listContainer: {
        flex: 1,
    },
    card: {
        backgroundColor: '#ccd3e9cc',
        borderRadius: 10,
        padding: 15,
        marginBottom: 12,
    },
    cardImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
        borderRadius: 6,
    },
    cardContent: {
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#122E5F',
        marginBottom: 6,
    },
    cardMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardDate: {
        fontSize: 12,
        color: '#6c757d',
    },
    cardAuthor: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#007bff',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic',
        marginTop: 20,
    },
});

export default NewsScreen;
