import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { HubConnectionBuilder } from '@microsoft/signalr';

import * as Location from 'expo-location';

export default function App() {
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl('http://192.168.1.103:5000/hubs/users')
      .withAutomaticReconnect()
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
        timeInterval: 10000,
        distanceInterval: 1
      },
        (location) => {
          setLatitude(location.coords?.latitude);
          setLongitude(location.coords?.longitude);
          mudarLocalizacao();
        })
    })();
  }, []);

  const mudarLocalizacao = async () => {
    let command = {
      id: "d7f9ce6b-dea6-4aa8-8d3f-2f6145ff2ec9",
      latitude: latitude,
      longitude: longitude
    };

    if (connection.connectionStarted) {
      try {
        await connection.send('MudarLocalizacao', command);
      }
      catch (e) {
        console.log(e);
      }
    }
    else {
      console.log('No connection to server yet.');
    }
  }

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(result => {
          console.log('Connected!');
          connection.on('ReceberLocalizacao', dados => {
            console.log(dados)
          });
        })
        .catch(e => console.log('Connection failed: ', e));
    }
  }, [connection]);

  return (
    <View style={styles.container}>
      <Text>Latitude: {latitude}</Text>
      <Text>Longitude: {longitude}</Text>
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
