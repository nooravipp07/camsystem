import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatList = ( {navigation} ) => {

	const [search, setSearch] = useState();
	useEffect(() => {
		removeToken();
    }, []);

	const DATA = [
		{
			id: '0',
			title: 'First Item',
		},
		{
			id: '1',
			title: 'Second Item',
		},
		{
			id: '2',
			title: 'First Item',
		},
		{
			id: '3',
			title: 'Second Item',
		},
		{
			id: '4',
			title: 'First Item',
		},
		{
			id: '5',
			title: 'Second Item',
		},
		{
			id: '6',
			title: 'First Item',
		},
		{
			id: '7',
			title: 'Second Item',
		},
		{
			id: '8',
			title: 'First Item',
		},
		{
			id: '10',
			title: 'Second Item',
		}
	];

	const removeToken = async () => {
        try {
            await AsyncStorage.removeItem('token')
        } catch (error) {
            console.log(error);
        }
    };

	const Item = ({ title }) => (
		<TouchableOpacity 
			style={styles.newsContainer}
			onPress={() => navigation.navigate('ChatRoom')}
		>
			<Image
				style={styles.newsImage}
				source={require('../../assets/Images/sldr.jpg')}
			/>
			<View style={{ flex:3, flexDirection: 'column' }}>
				<View style={styles.newsDescription}>
					<Text style={{ flex: 1, color: '#ffffff', fontWeight: 'bold' }}>OFFICER NAME</Text>
					<Text style={{ color: '#00cea6'}}>20:30 PM</Text>
				</View>
				<View style={styles.newsTitle}>
						<Text style={{ flex: 1, color: '#ffffff', textAlign: 'left' }}>Saya harap kegiatan yang kita lakukan besok tidak ada hambatan apapun...</Text>
				</View>
			</View>
		</TouchableOpacity >
	);

	return (
		<View style={styles.container}>
			<View style={{flexDirection: 'row', paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#adbcb1',}}>
				<Image
					style={{ width: 35, height: 35, marginRight: 5, tintColor: '#ffffff'}}
					source={require('../../assets/Icons/title.png')}
				/>
				<Text style={{fontWeight: 'bold',fontSize: 35, color: '#ffffff'}}>Chat</Text>
			</View>
			<View style={styles.searchBox}>
				<TextInput
					style={styles.input}
					value={search}
					placeholder='Cari ...'
					onChangeText={ (text) => {setSearch(text)}}
				/>
			</View>
			<SafeAreaView style={styles.newsListContainer}>
				<FlatList
					data={DATA}
					renderItem={({ item }) => <Item title={item.title} />}
					keyExtractor={item => item.id}
				/>
			</SafeAreaView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 15,
		backgroundColor: '#122E5F'
	},
	heading: {
		fontWeight: 'bold',
		fontSize: 35,
		color: '#ffffff',
		paddingBottom: 5,
		borderBottomWidth: 1,
		borderBottomColor: '#adbcb1',
	},
	searchBox: {
		justifyContent: 'center',
		paddingTop: 10,
		padding: 10
	},
	newsListContainer: {
		flex: 1,
		borderRadius: 3,
	},
	newsContainer: {
		flex: 1,
		flexDirection: 'row',
		padding: 8,
		marginBottom: 15
	},
	newsImage: {
		width: 40,
		height: 40,
		marginRight: 8,
	},
	newsDescription: {
		flexDirection: 'row', 
		justifyContent: 'space-between',
		paddingLeft: 7
	},
	newsTitle: {
		flexDirection: 'row',
		justifyContent: 'center',
		paddingLeft: 7,
		paddingTop: 5,
	},
	input: {
        width: '100%',
        height: 40,
        borderColor: '#00cea6',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 12,
        paddingHorizontal: 10,
        color: 'white',
    },

});

export default ChatList;