import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const login = async (username, password, imei) => {
        setIsLoading(true);
        await axios.post(`http://103.176.44.189/pamsystem-api/api/authentication/login`, {
            username, 
            password, 
            imei
        })
        .then(res => {
            console.log(res.data);
            let userInfo = AsyncStorage.setItem('userInfo', JSON.stringify(res.data.response.data));
            let token = AsyncStorage.setItem('token', JSON.stringify(res.data.response.token));

            if( res.data.status == 200 ){
                setToken(token);
                setUserInfo(userInfo);
            }

            setIsLoading(false);
        })
        .catch(e => {
            console.log(`Login error : ${e}`);
        })
    }

    const logout = () => {
        setIsLoading(true);
        setToken(null);
        AsyncStorage.removeItem('userToken');
        setIsLoading(false);
    }

    const isLoggedIn = async () => {
        try{
            setIsLoading(true);
            let userToken = await AsyncStorage.getItem('token');
            let userInfo = await AsyncStorage.getItem('userInfo');
            setIsLoading(false);
        }catch(e) {
            console.log(`isLogged in error ${e}`);
        }
    }

    const updateProile = async (data) => {
        await AsyncStorage.setItem('userInfo', JSON.stringify(data));
    }

    useEffect(() => {
        isLoggedIn();
    }, [token]);

    return (
        <AuthContext.Provider value={{ login, logout, isLoading, token, setToken, userInfo , setUserInfo}}>
            {children}
        </AuthContext.Provider>
    );
}