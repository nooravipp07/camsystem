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
  Dimensions,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import moment from 'moment';
import { BASE_URL, BASE_IMG_URL } from '../config/Config';
import { NewsContext } from '../context/NewsContext';
import Icon from 'react-native-vector-icons/Ionicons';
import SkeletonCard from '../components/SkeletonCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // spacing 24 padding total (15 + margin)

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
          headers: { Authorization: `Bearer ${token}` },
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
      activeOpacity={0.85}
      onPress={() => navigation.navigate('NewsDetailScreen', { newsId: item.id })}
    >
      <Image
        style={styles.cardImage}
        source={
          item.thumbnail
            ? { uri: `https://picsum.photos/300/200?random=${item.id}` }
            : { uri: `https://picsum.photos/300/200?random=${item.id}` }
        }
      />
      <View style={styles.cardContent}>
        <View style={styles.cardMeta}>
          <Text style={styles.cardDate}>
            {moment(item.date, 'YYYY-MM-DD').format('DD MMM YYYY')}
          </Text>
          <Text style={styles.cardAuthor}>Admin</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <SkeletonCard count={5} />;

  return (
    <SafeAreaView style={styles.container}>
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

      {/* ===== GRID LIST ===== */}
      <FlatList
        data={news}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#0068A7']} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada berita untuk ditampilkan.</Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
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
  filterSortBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginBottom: 10,
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
  row: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#f8faff',
    borderRadius: 12,
    overflow: 'hidden',
    width: CARD_WIDTH,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  cardContent: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#122E5F',
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 11,
    color: '#6c757d',
  },
  cardAuthor: {
    fontSize: 11,
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
