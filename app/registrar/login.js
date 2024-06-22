import { useState, useEffect } from 'react';
import { StyleSheet, ToastAndroid, View, Switch, Text, TextInput, Image, Button, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { collection, getDocs, query, where, getCountFromServer } from "firebase/firestore";
import db from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from "expo-status-bar";
import MaskInput from 'react-native-mask-input';
import { styles_global } from '../global/style_global';

export default function Index() {

    const [CPF, setCPF] = useState()
    const [Senha, setSenha] = useState()
    const [MostrarSenha, setMostrarSenha] = useState(true)
    const [SenhaHiddenImg, setSenhaHiddenImg] = useState()

    useEffect(() => {
        Start()
    }, []);

    const Start = async () => {
        setSenhaHiddenImg(
            <Image style={styles.img} resizeMethod='resize' source={require('../content/hidden.png')} />
        )
    }

    const ModSenhaHidden = async () => {
        if (MostrarSenha) {
            setSenhaHiddenImg(
                <Image style={styles.img} resizeMethod='resize' source={require('../content/view.png')} />
            )
        } else {
            setSenhaHiddenImg(
                <Image style={styles.img} resizeMethod='resize' source={require('../content/hidden.png')} />
            )
        }
    }
    const SalvarInfoLogin = async (data,id) => {
        data.id = id;
        if(Senha == data.senha){
            const jsonValue = JSON.stringify(data);
            await AsyncStorage.setItem('sessao', jsonValue);
            router.replace(`/`);
            return
        }else{
            ToastAndroid.showWithGravity(
                `Senha ou CPF incorreto!`,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
              )
        }
    }

    const FazerLogin = async () => {
        let query_validar_cpf = query(collection(db, 'usuario'), where("cpf", "==", CPF));
        let querySnapshot = await getCountFromServer(query_validar_cpf);
        if (querySnapshot.data().count >= 1) {
            const q = query(collection(db, 'usuario'), where("cpf", "==", CPF));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                SalvarInfoLogin(doc.data(),doc.id)
            });
        }else{
            ToastAndroid.showWithGravity(
                `Senha ou CPF incorreto!`,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
              )
        }
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={[styles_global.btn_voltar,{position:'absolute',top:20,start:20}]} onPress={()=>router.back()}><Text style={styles_global.btn_voltar_txt}>Voltar</Text></TouchableOpacity>
            <StatusBar backgroundColor="#151718" style="light" />
            <MaskInput
                placeholderTextColor={'white'}
                value={CPF}
                placeholder="CPF"
                keyboardType='numeric'
                maxLength={14}
                style={styles.input}
                onChangeText={(mask, unmasked) => {
                    setCPF(unmasked);
                }}
                mask={[/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]}
            />
            <View style={styles.view_senha}>
                <TextInput
                    value={Senha}
                    placeholder="Senha"
                    style={styles.input_senha}
                    secureTextEntry={MostrarSenha}
                    placeholderTextColor={'white'}
                    onChangeText={(text) => setSenha(text)}
                />
                <TouchableOpacity onPress={() => { setMostrarSenha(!MostrarSenha); ModSenhaHidden() }}>
                    {SenhaHiddenImg}
                </TouchableOpacity>
            </View>
            <Button title="Fazer Login" onPress={() => FazerLogin()} />
            <TouchableOpacity style={{marginTop:"4%"}} onPress={()=> router.push('registrar/recuperar_senha')}>
            <Text style={styles.senha_txt}>Esqueci a senha</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: "center",
        paddingHorizontal: 16,
        backgroundColor: "#151718",
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingLeft: 8,
        borderRadius: 30,
        color: "white",
        width: '80%'
    },
    input_senha: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingLeft: 8,
        borderRadius: 30,
        color: "white",
        width: '80%',
        marginBottom: 20,

    },
    img: {
        width: 40,
        height: 40,
        marginStart: 15,

    },
    view_senha: {
        flexDirection: "row",
        width: "80%"
    },
    view_switch: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    text_switch: {
        color: "#FFF",
        fontSize: 20
    },
    senha_txt:{
        color:"#9AB3E3"
    }





})