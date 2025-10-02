import React, { createContext, useState } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [formData, setFormData] = useState({
        date: '',
        hour: '',
        title: '',
        province_id: '',
        regency_id: '',
        district_id: '',
        village_id: '',
        desc: '',
        keterangan: '',
        nilai: '0',
        regarding_id: '1',
        kodam_id: '',
        user_id: '',
        file: [],
    });

    const updateFormData = (data) => {
        setFormData((prevData) => ({ ...prevData, ...data }));
    };

    return (
        <DataContext.Provider value={{ formData, updateFormData }}>
            {children}
        </DataContext.Provider>
    );
};