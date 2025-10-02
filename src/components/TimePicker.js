import React, { useState } from 'react';
import { View, Platform, TouchableOpacity, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const TimePickerField = () => {
    const [time, setTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    const onChangeTime = (event, selectedTime) => {
        const currentTime = selectedTime || time;
        setShowTimePicker(Platform.OS === 'ios');
        setTime(currentTime);
    };

    const showPicker = () => {
        setShowTimePicker(true);
    };

    return (
        <View>
        <TouchableOpacity onPress={showPicker}>
            <Text>{time.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showTimePicker && (
            <DateTimePicker
            testID="timePicker"
            value={time}
            mode="date"
            is24Hour={true}
            display="spinner"
            onChange={onChangeTime}
            />
        )}
        </View>
    );
};

export default TimePickerField;
