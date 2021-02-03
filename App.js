import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import MainItems from "./screens/MainItems"
import Icon from "./assets/Icons/Icon"
import CircleButton from "./components/CircleButton"

export default function App() {

  return (
    <View style={styles.container}>
      <MainItems/>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "flex-start",
    justifyContent: "center",
  },
});
