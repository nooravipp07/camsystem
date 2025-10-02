import React from 'react';
import { StyleSheet, View , Image, Text} from 'react-native';
import Pdf from 'react-native-pdf';


const PDFViewer = ({route}) => {
    const { uri } = route.params;
    const source = { uri: `${uri}`, cache: true };

    return (
        <View style={styles.container}>
            <View style={{flexDirection: 'row', paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#adbcb1',}}>
				<Image
					style={{ width: 35, height: 35, marginRight: 5, tintColor: '#ffffff'}}
					source={require('../assets/Icons/title.png')}
				/>
				<Text style={{fontWeight: 'bold',fontSize: 35, color: '#ffffff'}}>Laporan</Text>
			</View>
            <Text style={styles.welcomeText}>Lampiran Dokumen</Text>
            <Pdf
                trustAllCerts={false}
                source={source}
                onLoadComplete={(numberOfPages,filePath) => {
                    console.log(`Number of pages: ${numberOfPages}`);
                }}
                onPageChanged={(page,numberOfPages) => {
                    console.log(`Current page: ${page}`);
                }}
                onError={(error) => {
                    console.log(error);
                }}
                onPressLink={(uri) => {
                    console.log(`Link pressed: ${uri}`);
                }}
                style={styles.pdf}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
		backgroundColor: '#122E5F'
    },
    welcomeText: {
		fontWeight: 'bold',
		fontSize: 26,
		color: '#ffffff',
		paddingTop: 10,
		paddingBottom: 10,
	},
    pdf: {
        flex:1,
    }
});

export default PDFViewer;