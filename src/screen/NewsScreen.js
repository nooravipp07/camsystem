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
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import moment from 'moment';
import { BASE_URL, BASE_IMG_URL } from '../config/Config';
import { NewsContext } from '../context/NewsContext';

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
                        Authorization: `Bearer ${JSON.parse(token)}`,
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

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                navigation.navigate('NewsDetailScreen', { newsId: item.id })
            }
        >
            <View style={styles.imageContainer}>
                {item.thumbnail ? (
                    <Image
                        style={styles.image}
                        source={{ uri: `${BASE_IMG_URL}/${item.thumbnail}` }}
                    />
                ) : (
                    <Image
                        style={styles.image}
                        source={require('../assets/Icons/kamera.png')}
                    />
                )}
            </View>

            <View style={styles.textContainer}>
                <View style={styles.rowBetween}>
                    <Text style={styles.date}>
                        {moment(item.date, 'YYYY-MM-DD').format('DD MMM YYYY')}
                    </Text>
                    <Text style={styles.author}>Admin</Text>
                </View>
                <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={{ color: '#fff', marginTop: 10 }}>Memuat berita...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    style={styles.headerIcon}
                    source={require('../assets/Icons/title.png')}
                />
                <Text style={styles.headerTitle}>Buletin Berita</Text>
            </View>

            <Text style={styles.subTitle}>Daftar Berita Terkini</Text>

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
        backgroundColor: '#122E5F',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#adbcb1',
        paddingBottom: 5,
    },
    headerIcon: {
        width: 35,
        height: 35,
        tintColor: '#ffffff',
        marginRight: 8,
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 28,
        color: '#ffffff',
    },
    subTitle: {
        fontSize: 18,
        color: '#ffffff',
        fontWeight: '500',
        marginTop: 10,
        marginBottom: 15,
    },
    listContainer: {
        flex: 1,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#ffffffcc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 10,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    date: {
        fontSize: 12,
        color: '#6c757d',
    },
    author: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#00aeef',
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    emptyText: {
        textAlign: 'center',
        color: '#fff',
        fontStyle: 'italic',
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#122E5F',
    },
});

export default NewsScreen;
