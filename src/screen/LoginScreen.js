import React, { useState, useContext }  from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ImageBackground, ActivityIndicator, Image} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config/Config';

const LoginScreen = ({ navigation}) => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [imei, setImei] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { setToken, setUserInfo } = useContext(AuthContext);

    DeviceInfo.getAndroidId().then((uniqueId) => {
        setImei(uniqueId);
    });

    // const handleLogin = async () => {
	// 	await axios.post(`${BASE_URL}/authentication/login`, {
    //         username: username,
    //         password: password,
    //         imei: imei,
    //     })
    //     .then(res => {
    //         let data = res.data;
    //         // console.log(res.data)
    //         if(data.status == 200 && data.result == true){
    //             setToken(JSON.stringify(res.data.response.token));
    //             setUserInfo(JSON.stringify(res.data.response.data));
    //             navigation.navigate('MainNav', { screen: 'Dashboard' });
    //             setIsLoading(false);
    //         }else{
    //             alert(data.message);
    //             setIsLoading(false)
    //         }
    //     })
    //     .catch(error => {
    //         console.log(error)
    //     })
	// };

	const handleLogin = async () => {
		setIsLoading(true);
		try {
			const res = await axios.post(`${BASE_URL}/authentication/login`, {
			username,
			password,
			imei,
			});

			const data = res.data;

			if (data.status == 200 && data.result == true) {
				const token = data.response.token;
				const userData = data.response.data;

				setToken(token);
				setUserInfo(userData);

				await EncryptedStorage.setItem('token', token);
				await EncryptedStorage.setItem('userInfo', JSON.stringify(userData));

				navigation.navigate('MainNav', { screen: 'Dashboard' });
			} else {
				alert(data.message);
			}
		} catch (error) {
			console.error(error);
			alert('Login gagal');
		} finally {
			setIsLoading(false);
		}
	};


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return(
        <ImageBackground source={ require('../assets/Images/bg.png') } style={ styles.imgBackground }>
            <View style={styles.container}>
                <Image style={styles.logo} source={ require('../assets/Images/sintesa.png') }/>
                <TextInput
                    style={styles.input}
                    placeholder='Username'
                    placeholderTextColor='white'
                    autoCapitalize='none'
                    onChangeText={ (text) => setUsername(text)}
                    value={username}
                />
                <TextInput
                    style={styles.input}
                    placeholder='Password'
                    placeholderTextColor='white'
                    autoCapitalize='none'
                    secureTextEntry={!showPassword}
                    onChangeText={ (text) => setPassword(text)}
                    value={password}
                />
                <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Text style={{ color: '#fff' }}>{showPassword ? 'Hide Password' : 'Show Password'}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.buttonContainer} 
                    // onPress={() => login(username, password, imei)}
                    onPress={() => {
                        setIsLoading(true)
                        handleLogin()
                    }}
                >
                    {isLoading ? (<ActivityIndicator size="small" color="#ffff" />) : (<Text style={styles.buttonText}>LOGIN</Text>)}
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 40,
    },
    imgBackground: {
        flex: 1,
        resizeMode: 'over',
        justifyContent: 'center',
    },
    logo: {
        width: '100%', //320 for newest android version
        height: 140,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#2761a9',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 12,
        paddingHorizontal: 10,
        color: 'white',
    },
    buttonContainer: {
        backgroundColor: '#2761a9',
        paddingVertical: 15,
        borderRadius: 2,
        width: '100%',
        marginTop: 30,
    },
    buttonText: {
        textAlign: 'center',
        color: '#ffffff',
        fontWeight: '700',
    }
});

export default LoginScreen;