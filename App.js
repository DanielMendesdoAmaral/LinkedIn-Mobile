import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

import * as Location from 'expo-location';

const hubEndpoint = "http://192.168.1.103:5000/hubs/users";

export default function App() {
    const [location, setLocation] = useState(0);

    const [connection, setConnection] = useState(null);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl(hubEndpoint)
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Debug)
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log("Acess denied!");
          return;
        }
    
        let location = await Location.watchPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1
        },
          l => {
            setLocation(l.coords);
            mudarLocalizacao();
          })
      })();
    }, []);

    const mudarLocalizacao = async () => {
        let command = {
            id: "d7f9ce6b-dea6-4aa8-8d3f-2f6145ff2ec9",
            latitude: location.latitude,
            longitude: location.longitude
        };

        connection.start();

        connection
            .invoke('MudarLocalizacao', command)
            .catch(err => {
                console.log(err);
            });
    }

    return (
        <View style={styles.container}>
            <Text>Latitude: {location.latitude}</Text>
            <Text>Longitude: {location.longitude}</Text>
            <TouchableOpacity onPress={() => {
                let command = {
                    id: "d7f9ce6b-dea6-4aa8-8d3f-2f6145ff2ec9",
                    qtd: 1
                };

                connection.start();

                connection
                    .invoke("AlterarEntregas", command)
                    .catch(err => {
                        console.log(err);
                    });
            }}>
                <Text>Entregar 1 pacote</Text>
            </TouchableOpacity>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
