import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConstructionReport from '../screen/construction-report/ConstructionReport';
import HeaderForm from '../screen/construction-report/HeaderForm';
import ProgressForm from '../screen/construction-report/ProgressForm';
import GeneralInformationForm from '../screen/construction-report/GeneralInformationForm';
import { ReportProvider } from '../context/ReportContext';

const ConstructionReportStack = createNativeStackNavigator();

const ConstructionReportNav= () => {
    return(
        <ReportProvider>
            <ConstructionReportStack.Navigator 
                initialRouteName="ConstructionReport"
                screenOptions={{ headerShown: false}}
            >
                <ConstructionReportStack.Screen name="ConstructionReport" component={ConstructionReport} />
                <ConstructionReportStack.Screen name="HeaderForm" component={HeaderForm} />
                <ConstructionReportStack.Screen name="ProgressForm" component={ProgressForm} />
                <ConstructionReportStack.Screen name="GeneralInformationForm" component={GeneralInformationForm} />
            </ConstructionReportStack.Navigator>
        </ReportProvider>
    );
};

export default ConstructionReportNav;