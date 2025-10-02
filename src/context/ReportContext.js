import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config/Config';

export const ReportContext = createContext();

export const ReportProvider = ({children}) => {
    const [reports, setReports] = useState(null);

    const getReports = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/reports?perPage=20&page=1&search=&orderBy=created_at&sortBy=desc`, {
                headers: {
                    Authorization: `Bearer ${JSON.parse(token)}`,
                },
            });

            if(response){
                setReports(response.data.response.data);
                console.log('berhasil fetch data: ', reports)

            }else{
                console.log('gagal fetch data')
            }
        } catch (error) {
            console.error(error);
        }				
    }

    useEffect(() => {
        
    }, [reports]);

    return (
        <ReportContext.Provider value={{ reports, setReports}}>
            {children}
        </ReportContext.Provider>
    );
}