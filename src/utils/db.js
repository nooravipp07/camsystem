import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(false);
SQLite.enablePromise(true);

const database_name = 'OfflineReports.db';
const database_version = '1.0';
const database_displayname = 'Offline Reports Database';
const database_size = 200000;

let db;

export const initDB = async () => {
    try {
        db = await SQLite.openDatabase(
        database_name,
        database_version,
        database_displayname,
        database_size
        );

        await db.executeSql(`
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT,
            token TEXT
        );
        `);

        console.log('✅ Database initialized');
        return db;
    } catch (error) {
        console.log('❌ Error initializing database:', error);
    }
};

// Simpan laporan ke database
export const saveReport = async (report, token) => {
    try {
        if (!db) await initDB();
        await db.executeSql(
        'INSERT INTO reports (data, token) VALUES (?, ?);',
        [JSON.stringify(report), token]
        );
        console.log('💾 Report saved to SQLite');
    } catch (error) {
        console.log('❌ Error saving report:', error);
    }
};

// Ambil semua laporan offline
export const getOfflineReports = async () => {
    try {
        if (!db) await initDB();
        const results = await db.executeSql('SELECT * FROM reports;');
        const rows = results[0].rows;
        const reports = [];
        for (let i = 0; i < rows.length; i++) {
        reports.push(rows.item(i));
        }
        return reports;
    } catch (error) {
        console.log('❌ Error fetching offline reports:', error);
        return [];
    }
};

// Hapus laporan setelah berhasil dikirim
export const deleteReport = async (id) => {
    try {
        if (!db) await initDB();
        await db.executeSql('DELETE FROM reports WHERE id = ?;', [id]);
        console.log(`🗑 Report ${id} deleted from SQLite`);
    } catch (error) {
        console.log('❌ Error deleting report:', error);
    }
};
