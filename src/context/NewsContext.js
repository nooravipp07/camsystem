import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config/Config';

export const NewsContext = createContext();

export const NewsProvider = ({children}) => {
    const [news, setNews] = useState(null);

    const getNews = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/news?perPage=10&page=1&search=&orderBy=date&sortBy=desc`, {
                headers: {
                    Authorization: `Bearer ${JSON.parse(token)}`,
                },
            });

            if(response){
                setReports(response.data.response.data);
                console.log('berhasil fetch data: ', news)

            }else{
                console.log('gagal fetch data')
            }
        } catch (error) {
            console.error(error);
        }				
    }

    useEffect(() => {
        console.log('News Context Triggered !!!')
    }, [news]);

    return (
        <NewsContext.Provider value={{ news, setNews}}>
            {children}
        </NewsContext.Provider>
    );
}