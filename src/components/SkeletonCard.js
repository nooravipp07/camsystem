import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

const SkeletonCard = ({ count = 5, style }) => {
    return (
        <ScrollView contentContainerStyle={{ padding: 15 }}>
            {[...Array(count)].map((_, i) => (
                <View
                    key={i}
                    style={[styles.card, style]}
                >
                    {/* Header */}
                    <View style={styles.header} />
                    <View style={styles.subHeader} />

                    {/* Image */}
                    <View style={styles.image} />

                    {/* Description lines */}
                    <View style={styles.descLine} />
                    <View style={styles.descLineShort} />

                    {/* Button */}
                    <View style={styles.button} />
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#eee',
        borderRadius: 10,
        padding: 15,
        marginBottom: 12,
    },
    header: {
        width: '30%',
        height: 20,
        backgroundColor: '#ddd',
        marginBottom: 6,
        borderRadius: 4,
    },
    subHeader: {
        width: '50%',
        height: 20,
        backgroundColor: '#ddd',
        marginBottom: 10,
        borderRadius: 4,
    },
    image: {
        width: '100%',
        height: 150,
        backgroundColor: '#ddd',
        borderRadius: 8,
        marginBottom: 10,
    },
    descLine: {
        width: '90%',
        height: 20,
        backgroundColor: '#ddd',
        marginBottom: 6,
        borderRadius: 4,
    },
    descLineShort: {
        width: '70%',
        height: 20,
        backgroundColor: '#ddd',
        marginBottom: 6,
        borderRadius: 4,
    },
    button: {
        width: '40%',
        height: 30,
        backgroundColor: '#ddd',
        borderRadius: 6,
    },
});

export default SkeletonCard;
