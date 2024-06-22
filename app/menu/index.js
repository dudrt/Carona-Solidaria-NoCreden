import React, { useState, useEffect } from "react";
import { Link } from "expo-router";
import Menu from "../menu_navigation";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Text,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { GetSessao } from '../global/functions_global';


export default function UserPage() {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [curso, setCurso] = useState("");
  const [disponivel, setDisponivel] = useState("");
  const [bairro, setBairro] = useState("");

  useEffect(() => {
    start();
    // fetchInfo();
  }, []);

  const start = async () => {
    let sessao = await GetSessao();
    setNome(sessao.nome);
    setTipo(sessao.modo_login);
    setCurso(sessao.curso);
    setDisponivel(sessao.disponivel);
    setBairro(sessao.bairro);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#151718" style="light" />

      <View style={styles.profileContainer}>
        <Image
          style={styles.profileImage}
          source={require("../content/profile-user.png")}
        />
        <Text style={styles.infoText}>Nome: {nome}</Text>
        <Text style={styles.infoText}>
          Usuário: {tipo == 1 ? "Passageiro" : "Motorista"}
        </Text>
        <Text style={styles.infoText}>Curso: {curso}</Text>
        <Text style={styles.infoText}>
          Disponível: {disponivel ? "Sim" : "Não"}
        </Text>
        <Text style={styles.infoText}>Bairro: {bairro}</Text>
      </View>

      <Link href={"menu/view_viagens"} asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.buttonText}>
            {tipo === 1 ? "Pesquisar Motoristas" : "Pesquisar Passageiros"}
          </Text>
        </Pressable>
      </Link>

      <Menu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 80,
    backgroundColor: "#151718",
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
  },
  infoText: {
    fontSize: 18,
    color: "#FFF",
    marginTop: 10,
  },
  linkButton: {
    marginTop: 20,
    borderRadius: 30,
    backgroundColor: "gray",
    padding: 10,
  },
  buttonText: {
    fontSize: 20,
    color: "#FFF",
    textAlign: "center",
  },
  view_main: {
    justifyContent: "center",
    marginTop: 20,
    width: "90%",
    flexDirection: "row",
    backgroundColor: "gray",
    alignSelf: "center",
    borderRadius: 20,
  },
  user_image: {
    margin: 5,
    width: 90,
    height: 90,
  },
  view_info: {
    marginStart: 10,
    justifyContent: "center",
  },
  text_nome: {
    color: "#000",
    fontSize: 20,
  },
  text_localidade: {
    fontSize: 16,
  },
  text_periodo: {
    fontSize: 16,
  },
  loading: {
    marginTop: "30%",
    justifyContent: "center",
    alignSelf: "center",
  },
  noRequestsText: {
    marginTop: 8,
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
});
