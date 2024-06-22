import { StyleSheet, Pressable, View, Text } from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { styles_global } from './global/style_global';


export default function Opcoes() {
  

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#151718" style="light" />
      <Link href="registrar/login" asChild>
        <Pressable style={styles.botao_link}>
          <Text style={styles.botao_text}>Login</Text>
        </Pressable>
      </Link>

      <Link href="registrar/cadastrar" asChild>
        <Pressable style={styles.botao_link}>
          <Text style={styles.botao_text}>Cadastro</Text>
        </Pressable>
      </Link>
    </View>
  )

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151718",
    justifyContent: "center",
    alignItems: "center"
  },
  botao_link: {
    backgroundColor: "gray",
    width: "70%",
    margin: 10,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center"
  },
  botao_text: {
    color: "#FFF",
    fontSize: 25,
    padding: 10
  }



})