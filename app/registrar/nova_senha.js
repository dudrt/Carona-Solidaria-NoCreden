import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Updates from 'expo-updates';
import { styles_global } from "../global/style_global";
import { doc, updateDoc,query, collection , where} from "firebase/firestore";
import db from '../config';
import {useLocalSearchParams} from "expo-router";

export default function NovSenha() {
    const [CorretoSenha, setCorretoSenha] = useState();
    const [MostrarSenha1, setMostrarSenha1] = useState(true)
    const [MostrarSenha2, setMostrarSenha2] = useState(true)
    const { cpf } = useLocalSearchParams();
    
    const [dados, setDados] = useState({
        senha: "",
        confirmacaoSenha: ""
    })


    useEffect(() => {   
        Start()
    }, []);

    const Start = async () => {
        
    }



    const TratarSenha = async (text) => {

        if (dados.senha == text && text.length >= 5) {
            setCorretoSenha(
                <Image source={require('../content/correto.png')} style={{ width: 30, height: 30 }} resizeMode='contain' />
            )
        } else {
            setCorretoSenha(
                <Image source={require('../content/errado.png')} style={{ width: 30, height: 30 }} resizeMode='contain' />
            )
        }
    }

    const validacaoSenha = async ()  => {
        if (dados.senha.length < 5) {
            ToastAndroid.show('Senha Curta!', ToastAndroid.SHORT);
            return false;
        }
        if (dados.senha !== dados.confirmacaoSenha) {
            ToastAndroid.show('As senhas são diferentes!', ToastAndroid.SHORT);
            return false;
        }

        const update = doc(db, "cities", where("cpf", "==", "09717835942"));

        // let update = query(collection(db, "usuario"), );
        await updateDoc(update, {
            senha: dados.senha
        });


        ToastAndroid.show('As senhas são iguais!', ToastAndroid.SHORT);


    };


    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#151718" style="light" />
            <TouchableOpacity style={[styles_global.btn_voltar, { position: 'absolute', top: 20, start: 20 }]} onPress={() => Updates.reloadAsync()}><Text style={styles_global.btn_voltar_txt}>Voltar</Text></TouchableOpacity>
            <ScrollView style={styles.scroll}>
                <View style={styles.view_scroll}>
                    <Text style={styles.red_txt}>Redefinição de Senha</Text>
                    <View style={styles.recomendacao_view_text}>
                        <Text style={styles.txt_req}>
                            • A senha deve conter no mínimo 5 caracteres!
                        </Text>
                        <Text style={styles.txt_nm}>
                            • Recomendamos colocar letras maiúsculas, números e caracteres especiais!
                        </Text>
                    </View>
                    <View style={styles.view_senha}>
                        <TextInput
                            style={styles.input}
                            placeholder="Senha"
                            maxLength={25}
                            secureTextEntry={MostrarSenha1}
                            placeholderTextColor={"#FFF"}
                            value={dados.senha}
                            onChangeText={(text) => {
                                setDados(prevDados => ({
                                    ...prevDados,
                                    senha: text
                                }));
                            }}
                        />
                        <TouchableOpacity onPress={() => { setMostrarSenha1(!MostrarSenha1); }}>
                            {MostrarSenha1 ?
                                (<Image style={styles.img} resizeMethod='resize' source={require('../content/hidden.png')} />) :
                                (<Image style={styles.img} resizeMethod='resize' source={require('../content/view.png')} />)
                            }
                        </TouchableOpacity>
                    </View>
                    <View style={styles.view_senha}>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirme a senha"
                            maxLength={25}
                            secureTextEntry={MostrarSenha2}
                            placeholderTextColor={"#FFF"}
                            value={dados.confirmacaoSenha}
                            onChangeText={(text) => {
                                setDados(prevDados => ({
                                    ...prevDados,
                                    confirmacaoSenha: text
                                }));
                                TratarSenha(text)
                            }}
                        />
                        <TouchableOpacity onPress={() => { setMostrarSenha2(!MostrarSenha2); }}>
                            {MostrarSenha2 ?
                                (<Image style={styles.img} resizeMethod='resize' source={require('../content/hidden.png')} />) :
                                (<Image style={styles.img} resizeMethod='resize' source={require('../content/view.png')} />)
                            }
                        </TouchableOpacity>
                    </View>
                    <View style={styles.img_senha_correta}>
                        {CorretoSenha}
                    </View>
                    <TouchableOpacity style={styles.conf_btn} onPress={() => validacaoSenha()}>
                        <Text style={styles.conf_txt}>Confirmar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    input: {
        width: "70%",
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingLeft: 8,
        borderRadius: 30,
        color: "#FFF"
    },
    img: {
        width: 40,
        height: 40,
        marginStart: 15,

    },
    view_senha: {
        flexDirection: "row"
    },
    recomendacao_view_text: {
        flexDirection: "column"
    },
    txt_req: {
        color: "red",
        fontSize: 16,
        marginBottom: "1%"
    },
    txt_nm: {
        color: "#FFF",
        marginBottom: "2%"
    },
    conf_btn: {
        backgroundColor: "#FFF",
        borderRadius: 30,
        padding: 10
    },
    conf_txt: {
        fontSize: 18
    },
    red_txt: {
        fontSize: 28,
        color: "#EDEDED",
        marginBottom:"5%"
    },
    scroll: {
        marginTop:"40%",
    },
    view_scroll:{
        justifyContent:"center",
        alignItems:"center"
    },
    img_senha_correta:{
        marginBottom:"5%"
    }
})