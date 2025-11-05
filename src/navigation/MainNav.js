import React, { useContext, useEffect } from 'react';
import { Platform, Image, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screen/HomeScreen';
import BuletinBeritaNav from './BuletinBeritaNav';
import PelaporanNav from './PelaporanNav';
import ProfileScreen from '../screen/profile/ProfileScreen';
import ConstructionReportNav from './ConstructionReportNav';
import { AuthContext } from '../context/AuthContext';
import Geolocation from '@react-native-community/geolocation';
import Contacts from 'react-native-contacts';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { BASE_URL } from '../config/Config';
import { PERMISSIONS, RESULTS, check, requestMultiple } from 'react-native-permissions';

const Tab = createBottomTabNavigator();

function MainNav() {
  const { token } = useContext(AuthContext);

  useEffect(() => {
    requestPermissions();
    const interval = setInterval(() => {
      getGeolocation();
    }, 60000);
    getContacts();
    return () => clearInterval(interval);
  }, []);

  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        await requestMultiple([
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          PERMISSIONS.ANDROID.READ_CONTACTS,
          PERMISSIONS.ANDROID.CAMERA,
          PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        ]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getGeolocation = () => {
    check(
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    ).then((result) => {
      if (result === RESULTS.GRANTED) {
        Geolocation.getCurrentPosition((info) => {
          postLocation(info.coords.latitude, info.coords.longitude);
        });
      }
    });
  };

  const getContacts = async () => {
    check(
      Platform.OS === 'android' ? PERMISSIONS.ANDROID.READ_CONTACTS : PERMISSIONS.IOS.CONTACTS
    ).then((result) => {
      if (result === RESULTS.GRANTED) {
        Contacts.getAll().then((contacts) => postContact(contacts));
      }
    });
  };

  const postLocation = async (lat, lon) => {
    const params = { lat, lon };
    try {
      await axios.post(`${BASE_URL}/positions/update`, params, {
        headers: { Authorization: `Bearer ${JSON.parse(token)}` },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const postContact = async (contacts) => {
    const payload = { contacts };
    try {
      await axios.post(`${BASE_URL}/contacts/store`, JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const renderTabIcon = (route, focused) => {
    let iconSource;
    switch (route.name) {
      case 'Dashboard':
        iconSource = require('../assets/Icons/dashboard.png');
        break;
      case 'Pelaporan':
        iconSource = require('../assets/Icons/pelaporan.png');
        break;
      case 'Buletin Berita':
        iconSource = require('../assets/Icons/buletin-berita.png');
        break;
      default:
        iconSource = require('../assets/Icons/sos.png');
    }

    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: focused ? '#fff' : 'transparent',
          padding: focused ? 10 : 0,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation: focused ? 6 : 0,
        }}
      >
        <Image
          source={iconSource}
          style={{
            width: focused ? 28 : 22,
            height: focused ? 28 : 22,
            tintColor: focused ? '#122E5F' : '#ffffffcc',
          }}
        />
        {focused && (
          <Text
            style={{
              color: '#122E5F',
              fontSize: 11,
              marginTop: 4,
              fontWeight: '600',
            }}
          >
            {route.name}
          </Text>
        )}
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 15,
          left: 20,
          right: 20,
          backgroundColor: '#122E5F',
          borderRadius: 25,
          height: 70,
          paddingBottom: 10,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 6,
          elevation: 10,
        },
        tabBarIcon: ({ focused }) => renderTabIcon(route, focused),
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Pelaporan" component={PelaporanNav} />
      <Tab.Screen name="Buletin Berita" component={BuletinBeritaNav} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Construction Report"
        component={ConstructionReportNav}
        options={{ tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}

export default MainNav;
