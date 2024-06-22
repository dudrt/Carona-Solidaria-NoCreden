import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetSessao } from '../global/functions_global';
export default function Menu() {

  return (
    <View style={styles.container}>
      <Link replace href={`../menu/`} asChild>
        <Pressable style={styles.botao_link}>
          <Image
            resizeMode="contain"
            style={styles.img}
            source={require("../content/menu_navegate/home.png")}
          />
        </Pressable>
      </Link>
      <Link href={`../menu/view_viagens`} asChild>
        <Pressable replace style={styles.botao_link}>
          <Image
            resizeMode="contain"
            style={styles.img}
            source={require("../content/menu_navegate/find.png")}
          />
        </Pressable>
      </Link>
      <Link replace href={`../configuracoes/config`} asChild>
        <Pressable style={styles.botao_link}>
          <Image
            resizeMode="contain"
            style={styles.img}
            source={require("../content/menu_navegate/config.png")}
          />
        </Pressable>
      </Link>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    bottom: 0,
    marginBottom: 20,
    position: "absolute",
    flexDirection: "row",
    alignSelf: "center",
  },
  img: {
    margin: 20,
    height: 40,
    width: 40,
  },
});
