import React from 'react';

import {AsyncStorage} from 'react-native';

export default class StorageManager {
    constructor(){
    }

    dismissDataPoint(position) {
        AsyncStorage.setItem('@Locations:' + position[0] + '_' + position[1], 'true');
    }

    async shouldShowDataPoint(position) {
        try {
        const value = await AsyncStorage.getItem('@Locations:' + position[0] + '_' + position[1]);
            if (value !== null) {
                // We have data!!
                return false;
            } else {
                return true;
            }
        } catch (error) {
        // Error retrieving data
        }
    }
}