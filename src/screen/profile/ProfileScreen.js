import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Image,
    Text,
    TouchableOpacity,
	Platform
} from 'react-native'; 
import { BASE_URL, BASE_IMG_URL } from '../../config/Config';
import { AuthContext } from '../../context/AuthContext';
import { launchCamera } from 'react-native-image-picker';
import {PERMISSIONS, RESULTS, check} from 'react-native-permissions';
import axios from 'axios';

const ProfileScreen = ({navigation}) => {
    const [imageCamera, setImageCamera] = useState(null);
	const { token, setUserInfo, userInfo } = useContext(AuthContext);
	const user = JSON.parse(userInfo);

    const captureImage = async () => {
		try{
			check(Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA)
            .then((result) => {
                if(result === RESULTS.GRANTED) {
                    let options = {
						mediaType: 'photo', 
						quality: 0.5,
						cameraType: 'front',
						cropping: true,
						cropperCircleOverlay: false,
						includeExif: true,
					};

					launchCamera(options, (response) => {		
						if (response.didCancel) {
							return;
						} else if (response.errorCode == 'camera_unavailable') {
							alert('Camera not available on device');
							return;
						} else if (response.errorCode == 'permission') {
							alert('Permission not satisfied');
							return;
						} else if (response.errorCode == 'others') {
							alert(response.errorMessage);
							return;
						} else {
							const data = response.assets[0];
							if(data.fileSize < 2000000){
								console.log(data);
								setImageCamera(data);
							}else{
								setImageCamera(null);
								alert('Foto / Gambar harus kurang atau sama dengan 2 MB !')
							}
						}
					});
                } else {
                    console.log('Permission Denied')
                }
            })
            .catch((error) => {
                console.log(error);
            });
		} catch(error) {
			console.log(error)
		}
	};

	const updateProfile = async () => {
		let payload = new FormData();
		payload.append("file", {
			uri: imageCamera.uri,
			type: imageCamera.type,
			name: imageCamera.fileName
		});
		
        try {
			const response = await axios.post(`${BASE_URL}/user/update`, payload,
            {
				headers: {
                    "Content-Type" : "multipart/form-data",
					Authorization: `Bearer ${JSON.parse(token)}`,
				},
			});
			setUserInfo(JSON.stringify(response.data.response));
			navigation.navigate('Dashboard');
			setImageCamera(null);

			console.log(response)
		} catch (error) {
			console.error(error);
		}
	}

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}> 
                {imageCamera !== null ? (
						<>
							<Image
								source={{ uri:imageCamera.uri }}
								style={styles.img}
							/>
						</>
						) : (
						<>
							{
								user.avatar ?(
									<Image
										source={{ uri: `${BASE_IMG_URL}${user.avatar}` }}
										style={styles.img}
									/>
								):(
									<Image
										source={require('../../assets/Icons/avatar.png')}
										style={styles.img}
									/>
								)
							}
						</>
				)}
                <Text style={styles.text}>Silahkan ambil gambar swafoto anda untuk melanjutkan</Text>
                <TouchableOpacity 
                    onPress={ () => captureImage() }
                    style={styles.button}>
                    <Text style={styles.btnText}>AKTIFKAN KAMERA</Text>
                </TouchableOpacity>
				{imageCamera !== null ? (
						<TouchableOpacity 
							onPress={ () => updateProfile() }
							style={styles.buttonSimpan}>
							<Text style={styles.btnText}>SIMPAN PERUBAHAN</Text>
						</TouchableOpacity>
						) : (
						<>
						</>
				)}
            </View>
		</View>
    );
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 15,
		backgroundColor: '#122E5F',
	},
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }, 
    img: {
        width: 250,
        height: 250, 
        borderWidth: 2, 
        borderColor: '#0068A7', 
        borderRadius: 5
    },
    text: {
        color: '#ffffff',
        marginTop: 20,
        fontWeight: 'bold'
    },
    button: {
		backgroundColor: '#0068A7',
		justifyContent: 'center',
		paddingHorizontal: 70,
		borderRadius: 2,
		marginTop: 50,
		height: 50,
    },
	buttonSimpan: {
		backgroundColor: '#0068A7',
		justifyContent: 'center',
		paddingHorizontal: 65,
		borderRadius: 2,
		marginTop: 10,
		height: 50,
	},
    btnText: {
        textAlign: 'center',
		color: '#ffff',
		fontWeight: '700',
    }

});

export default ProfileScreen;