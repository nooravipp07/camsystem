import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from 'react-native';

const ConstructionReport = ({ navigation }) => {
  const [reports] = useState([
    {
      id: 1,
      code: 'VLT69MA0',
      name: 'WONOSARI, WONOSOBO',
      yayasan: 'YAYASAN PERJUANGAN UNTUK KESEJAHTERAAN RAKYAT',
      wilayah: 'Jawa Tengah',
      status: 'SUDAH BEROPERASI',
    },
    {
      id: 2,
      code: '8H3ME4VG',
      name: 'WONOREJO, NABIRE',
      yayasan: 'YAYASAN MITRA CENDEKIA WASKITA',
      wilayah: 'Papua Tengah',
      status: 'ON PROGRESS',
    },
    {
      id: 3,
      code: 'ZQ14SF0M',
      name: 'WIROKERTEN, BANGUNTAPAN',
      yayasan: 'YAYASAN MITRA CENDEKIA WASKITA',
      wilayah: 'Daerah Istimewa Yogyakarta',
      status: 'SUDAH BEROPERASI',
    },
    {
      id: 4,
      code: 'HFBQ5672',
      name: 'WIRAKANAN, KANDANGHAUR',
      yayasan: 'YAYASAN PERJUANGAN UNTUK KESEJAHTERAAN RAKYAT',
      wilayah: 'Jawa Barat',
      status: 'SUDAH BEROPERASI',
    },
  ]);

  const handleEdit = (item) => {
    console.log('Edit clicked:', item);
    navigation.navigate('HeaderForm', { report: item });
  };

  const handleDownload = (item) => {
    console.log('Download report for:', item);
    alert(`Downloading report for ${item.name}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.code}>{item.code}</Text>
        <Text
          style={[
            styles.status,
            item.status === 'SUDAH BEROPERASI'
              ? styles.statusActive
              : styles.statusProgress,
          ]}
        >
          {item.status}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.yayasan}>{item.yayasan}</Text>
        <Text style={styles.wilayah}>{item.wilayah}</Text>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#f0ad4e' }]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.actionText}>✏️ Edit</Text>
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

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>LAP. PROGRES SPPG</Text>
      <Text style={styles.subheading}>Daftar Laporan</Text>

      <SafeAreaView style={styles.listContainer}>
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('HeaderForm')}
      >
        <Text style={styles.addButtonText}>+ TAMBAH LAPORAN</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#122E5F',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#ffffff',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#adbcb1',
  },
  subheading: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#ffffff',
    marginTop: 10,
  },
  listContainer: {
    flex: 1,
    marginTop: 15,
  },
  card: {
    backgroundColor: '#ffffffcc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  statusActive: {
    backgroundColor: '#28a745',
  },
  statusProgress: {
    backgroundColor: '#f0ad4e',
  },
  cardBody: {
    marginTop: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  yayasan: {
    fontSize: 13,
    color: '#007bff',
    marginTop: 3,
  },
  wilayah: {
    fontSize: 13,
    color: '#555',
    marginTop: 3,
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
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  addButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
  },
});

export default ConstructionReport;
