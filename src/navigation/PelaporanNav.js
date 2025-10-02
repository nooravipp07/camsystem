import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ReportScreen from '../screen/ReportScreen';
import ReportFormStep1 from '../screen/ReportFormStep1';
import ReportFormStep2 from '../screen/ReportFormStep2';
import ReportFormStep3 from '../screen/ReportFormStep3';
import ReportDetailScreen from '../screen/ReportDetailScreen';
import PDFViewer from '../screen/PDFViewer';
import { ReportProvider } from '../context/ReportContext';

const BuletinStack = createNativeStackNavigator();

const PelaporanNav = () => {
    return(
        <ReportProvider>
            <BuletinStack.Navigator 
                initialRouteName="ReportScreen"
                screenOptions={{ headerShown: false}}
            >
                <BuletinStack.Screen name="ReportScreen" component={ReportScreen} />
                <BuletinStack.Screen name="ReportDetailScreen" component={ReportDetailScreen} />
                <BuletinStack.Screen name="PDFViewer" component={PDFViewer} />
                <BuletinStack.Screen name="ReportFormStep1" component={ReportFormStep1} />
                <BuletinStack.Screen name="ReportFormStep2" component={ReportFormStep2} />
                <BuletinStack.Screen name="ReportFormStep3" component={ReportFormStep3} />
            </BuletinStack.Navigator>
        </ReportProvider>
    );
};

export default PelaporanNav;