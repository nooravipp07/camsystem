import React, { useState, useEffect,useRef } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image
} from 'react-native';

const ChatRoom = () => {
	const [messages, setMessages] = useState([]);
	const [inputText, setInputText] = useState('');
	const flatListRef = useRef(null);

	const handleSend = () => {
		if (inputText.trim() === '') return;

		const newMessage = {
			id: messages.length + 1,
			text: inputText
		};

		setMessages([...messages, newMessage]);
		setInputText('');
  };

  useEffect(() => {
		// Menambahkan efek samping untuk menscroll ke bagian bawah daftar pesan
		scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
		if (messages.length > 0) {
				flatListRef.current.scrollToEnd({ animated: true });
		}
    }, 100);
  };

  const renderItem = ({ item }) => (
    <View style={styles.messageContainer}>
      	<Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
        <View style={{flexDirection: 'row', paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#adbcb1',}}>
				<Image
					style={{ width: 35, height: 35, marginRight: 5, tintColor: '#ffffff'}}
					source={require('../../assets/Icons/title.png')}
				/>
				<Text style={{fontWeight: 'bold',fontSize: 35, color: '#ffffff'}}>Chat</Text>
		</View>
        <View style={styles.profileContainer}>
			<Image
				style={styles.profileImage}
				source={require('../../assets/Images/sldr.jpg')}
			/>
			<View style={styles.profileName}>
				<Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 20 }}>OFFICER NAME</Text>
				<Text style={{ color: '#00aeef', fontWeight: 'bold', fontSize: 12 }}>Sedang Mengetik ...</Text>
			</View>
		</View>
        <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ref={flatListRef}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
        />
        <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inputContainer}
            >
                <TextInput
                style={styles.input}
                placeholder="Ketik..."
                placeholderTextColor={'black'}
                value={inputText}
                onChangeText={setInputText}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                  <Image style={{ width: 30, height: 30}} source={require('../../assets/Icons/kirim.png')}/>
                </TouchableOpacity>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,    
        padding: 15,
        backgroundColor: '#122E5F'
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
		paddingTop: 20,
		paddingLeft: 5
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 5,
        borderWidth: 2,
        marginRight: 8,
    },
    profileName: {
        flex: 3,
        paddingLeft: 7,
    },
    messageContainer: {
        padding: 10,
        backgroundColor: '#FFFFFF',
        marginVertical: 5,
        marginHorizontal: 10,
        borderRadius: 5,
    },
    messageText: {
        fontSize: 16,
        color: 'black'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 3,
        paddingHorizontal: 10,
        color: 'black',
        fontWeight: 'bold',
        backgroundColor: 'white'
    },
    sendButton: {
        marginLeft: 10,
        paddingHorizontal: 6,
        paddingVertical: 10
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default ChatRoom;
