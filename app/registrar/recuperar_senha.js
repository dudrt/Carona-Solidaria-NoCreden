import { View, Text, TouchableOpacity, ToastAndroid, TextInput, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import db from "../config";
import MaskInput from 'react-native-mask-input';
import { collection, getDocs, query, where, getCountFromServer } from "firebase/firestore";
import emailjs, { EmailJSResponseStatus } from '@emailjs/react-native';
import { styles_global } from "../global/style_global";
import { router } from "expo-router";

export default function RecuperarSenha() {

    const [cpf, setCpf] = useState("");
    const [codigoEnviado, setCodigoEnviado] = useState(false)
    const [codigo, setCodigo] = useState("")
    const [codigoGerado, setCodigoGerado] = useState("")
    const [emailMask, setemailMask] = useState("")


    useEffect(()=>{
        router.replace({pathname:"registrar/nova_senha",params:{cpf:'09717835942'}})

    },[])


    const verificarCPF = async () => {
        let query_validar_cpf = query(collection(db, 'usuario'), where("cpf", "==", cpf));
        let querySnapshot = await getCountFromServer(query_validar_cpf);
        if (querySnapshot.data().count >= 1) {
            const q = query(collection(db, 'usuario'), where("cpf", "==", cpf));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                mandarEmail(doc.data())
            });
        }else{
            ToastAndroid.show('CPF não encontrado!', 300);
        }
    }

    const mandarEmail = async (data) => {
        
        if (data.email == "" || data.email == null || data.email == undefined) {
            ToastAndroid.show('Nenhum email cadastrado neste CPF!', ToastAndroid.SHORT);
            return false
        }

        let email = data.email
        let emailSplit = email.split("@")[0]

        if (emailSplit.length <= 6) {
            let emailSlice = emailSplit.slice(1)
            emailSlice = emailSlice.slice(0, -1)
            let mascara = "";
            for (let i = 0; i < emailSlice.length; i++) {
                mascara += "*"
            }
            let emailMask = emailSplit.slice(0, 1) + mascara + emailSplit.slice(-1) + "@" + email.split("@")[1]
            console.log(emailMask)
            setemailMask(emailMask)
        } else {
            let emailSlice = emailSplit.slice(3)
            emailSlice = emailSlice.slice(0, -3)
            let mascara = "";
            for (let i = 0; i < emailSlice.length; i++) {
                mascara += "*"
            }

            let emailMask = emailSplit.slice(0, 3) + mascara + emailSplit.slice(-3) + "@" + email.split("@")[1]
            console.log(emailMask)
            setemailMask(emailMask)
        }

        const minCeiled = Math.ceil(111111);
        const maxFloored = Math.floor(999999);
        const codigoAtivacao = Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // 

        setCodigoGerado(codigoAtivacao);
        
        var templateParams = {
            'to_name': data.nome,
            'message':codigoAtivacao,
            'reply_to': email
          };
          
          emailjs
            .send('service_b5sm0mg', 'template_6aye719', templateParams, {
              publicKey: '3eizoWFKv5GBN4ri-',
            })
            .then(
              function (response) {
                setCodigoEnviado(true)
              },
              function (err) {
                ToastAndroid.show('Ocorreu um erro inesperado!', ToastAndroid.SHORT);
              },
            );
    }

    const VerificarCod = async () =>{
        if(codigo == codigoGerado){
            router.replace({pathname:"registrar/nova_senha",params:{cpf:cpf}})
        }else{
            ToastAndroid.show('Código incorreto!', 300);
            setCpf("")
            setCodigoEnviado(false)
        }
    }





    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#151718" style="light" />
            <TouchableOpacity style={[styles_global.btn_voltar,{position:'absolute',top:20,start:20}]} onPress={()=>router.back()}><Text style={styles_global.btn_voltar_txt}>Voltar</Text></TouchableOpacity>
            {!codigoEnviado ? (
                <View style={styles.view_send_cod}>
                    <Text style={styles.text_cod}>Um código de verificação será enviado para o email vinculado a esse CPF.</Text>
                    <MaskInput
                        placeholderTextColor={'white'}
                        value={cpf}
                        placeholder="CPF"
                        keyboardType='numeric'
                        maxLength={14}
                        style={styles.input}
                        onChangeText={(mask, unmasked) => {
                            setCpf(unmasked);
                        }}
                mask={[/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]}
            />
                    <TouchableOpacity style={styles.btn_send} onPress={() => verificarCPF()}>
                        <Text style={styles.btn_send_text}>Enviar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.view_send_cod}>
                    <Text style={styles.text_cod}>Código enviado para <Text style={{fontWeight:600}}>{emailMask}</Text>.Verifique a caixa de Spam.</Text>
                    
                    <TextInput
                        style={styles.input}
                        value={codigo}
                        placeholder="Digite o código"
                        keyboardType='numeric'
                        placeholderTextColor={"#FFF"}
                        onChangeText={(text) => setCodigo(text)}
                    />
                    <TouchableOpacity style={styles.btn_send} onPress={()=>VerificarCod()}>
                        <Text style={styles.btn_send_text}>
                            Confirmar
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
}



const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#151718",
        justifyContent:"center",
        alignItems:"center"
    },
    input: {
        width:"50%",
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingLeft: 8,
        borderRadius: 30,
        color: "#FFF"
    },
    view_send_cod:{
        width:"90%",
        justifyContent:"center",
        alignItems:"center"
    },
    btn_send_text:{
        fontSize:20
    },
    btn_send:{
        backgroundColor:"white",
        borderRadius:30,
        padding:10 
    },
    text_cod:{
        color:"white",
        fontSize:15,
        textAlign:"center",
        marginBottom:28
    }


})