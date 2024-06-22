import { View, ActivityIndicator } from "react-native";
import { useEffect } from 'react';
import { getDoc, doc } from "firebase/firestore";
import db from './config';
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { GetSessao } from "./global/functions_global";
export default function Index() {
  useEffect(() => {
    Start()
  }, []);

  const Start = async () => {
    
    let sessao = await GetSessao()
    if (sessao == null || sessao == "") {
      router.replace(`tela_opcoes`);
      return
    }
    const docRef = doc(db, "usuario", sessao.id);
    const docSnap = await getDoc(docRef);
    const json = docSnap.data()
    if (json != undefined) {
      ValidaLogin(json, sessao)
    } else {
      router.replace(`tela_opcoes`);
      return
    }
  }

  const ValidaLogin = async (data, sessao) => {
    if (data.cpf == sessao.cpf && data.senha == sessao.senha) {
      router.replace(`menu/`);
    } else {
      router.replace(`tela_opcoes`);
      return
    }
  }

  return (

    <View style={{
      width: "100%",
      height: "100%",
      flex: 1,
      alignSelf: "center",
      justifyContent: "center",
      backgroundColor: "#151718",

    }}>
      <StatusBar backgroundColor="#151718" style="light" />

      <ActivityIndicator style={{}} size="large" color="gray" />
    </View>
  )
}


