import React, { useContext } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config/Config';
import { getOfflineReports, deleteReport } from './db';

export const sendOfflineReports = async (token) => {
    const reports = await getOfflineReports();
    let sentCount = 0;

    if (reports.length === 0) {
        console.log('📭 No offline reports to send');
        return sentCount;
    }

    console.log(`📤 Found ${reports.length} offline reports, sending...`);

    for (let report of reports) {
        try {
        const payload = JSON.parse(report.data);

        console.log('DEBUG report.data:', report.data);

        console.log('DEBUG token:', token);

        await axios.post(`${BASE_URL}/progres-sppg/insert`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            timeout: 15000,
        });

        await deleteReport(report.id);
            console.log(`✅ Report ${report.id} sent successfully`);
            sentCount++;
        } catch (e) {
            console.log(`❌ Failed to send report ${report.id}:`, e.message);
        }
    }

    console.log(`📦 Total reports sent: ${sentCount}`);
    return sentCount;
};
