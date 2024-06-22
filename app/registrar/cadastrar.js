import React, { useState } from 'react';
import { ToastAndroid, View, Text, TextInput, Switch, TouchableOpacity, Alert, Image, StyleSheet, ScrollView } from 'react-native';
import db from '../config';
import { collection, addDoc, query, where, getCountFromServer } from "firebase/firestore";
import axios from 'axios';
import SelectDropdown from 'react-native-select-dropdown'
import MaskInput from 'react-native-mask-input';
import { router } from 'expo-router';
import { styles_global } from '../global/style_global';
import { StatusBar } from "expo-status-bar";

export default function Cadastro() {

    const [CorretoCEP, setCorretoCEP] = useState();
    const [CorretoSenha, setCorretoSenha] = useState();
    const [confirmacaoSenha, setConfirmacaoSenha] = useState()
    const [showTextInput, setShowTextInput] = useState(false);
    const [tipoCadastro, setTipoCadastro] = useState(false)
    const periodos = ["Matutino", "Vespertino", "Noturno"];
    const cursos = ["ADS", "Pedagogia", "Admnistração", "Outros"];

    const [dados, setDados] = useState(
        {
            nome: "",
            cep: "",
            bairro: "",
            cidade: "",
            cpf: "",
            email:"",
            senha: "",
            periodo: "",
            numero: "",
            veiculo_placa: "",
            veiculo_modelo: "",
            veiculo_cor: "",
            curso: "",
            disponivel: true,
            modo_login: "",
            latitude: 0,
            longitude: 0
        }
    )

    const handleCadastro = async () => {
        if (!validacaoCampos()) return
        if (!ValidarCPF_Numero()) return

        let testeTipo = tipoCadastro ? 2 : 1;

        setDados(prevDados => ({
            ...prevDados,
            modo_login: testeTipo
        }));

        

        try {
            let resposta = await getLatLong();

        
        if(dados.latitude== 0 || dados.longitude == 0){
            Alert.alert('Erro com o CEP!');
            return false
        }
            const docRef = addDoc(collection(db, "usuario"), dados)

            Alert.alert('Usuário cadastrado!');
            router.replace('/');
        } catch (error) {
            Alert.alert('Ocorreu um erro inesperado!');

        }



    }

    const getLatLong = async () => {
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${dados.cep}/json/`);
            const addres_json = response.data;
            const address = `${addres_json.cep},${addres_json.logradouro},${addres_json.bairro},${addres_json.localidade},Brazil`;
    
            const geoResponse = await axios({
                url: `https://api.geoapify.com/v1/geocode/search?text=${address}&lang=en&limit=1&format=json&apiKey=f97892ff9c254304aeb5a2ccceaf3614`,
            });
    
            setDados(prevDados => ({
                ...prevDados,
                bairro: addres_json.bairro,
                cidade: addres_json.localidade,
                longitude: geoResponse.data.results[0].lon,
                latitude: geoResponse.data.results[0].lat,
            }));
    
            return true;
        } catch (error) {
            showToastErroCEP();
            return false;
        }
    }

    const TratarCep = async (text) => {
        if (text.length < 8) {
            setCorretoCEP(
                <Image source={require('../content/errado.png')} style={{ width: 30, height: 30 }} resizeMode='contain' />
            )
        } else {
            axios.get(`https://viacep.com.br/ws/${text}/json/`)
                .then((response) => {
                    if (response.data.erro == true) {

                    } else if (response.data.erro == undefined) {
                        setCorretoCEP(
                            <Image source={require('../content/correto.png')} style={{ width: 30, height: 30 }} resizeMode='contain' />
                        )
                    }
                }).catch(function (error) {
                    showToastErroCEP()
                });
        }

    }

    const ValidarCPF_Numero = async () => {

        let q = query(collection(db, "usuario"), where("cpf", "==", dados.cpf));
        let querySnapshot = await getCountFromServer(q);
        if (querySnapshot.data().count >= 1) {
            ToastAndroid.showWithGravity(
                `Este CPF já está em uso!`,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            )

            return false
        } else {
            q = query(collection(db, "usuario"), where("numero", "==", dados.numero));
            querySnapshot = await getCountFromServer(q);
            if (querySnapshot.data().count >= 1) {
                ToastAndroid.showWithGravity(
                    `Este número já está em uso!`,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER
                )
                return false
            }
        }

        return true

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
    const showToastErroCEP = () => {
        ToastAndroid.showWithGravity(
            "CEP não encontrado!",
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
        )
    }




    const validacaoCampos = () => {

        if (!isValidCPF(dados.cpf)) {
            Alert.alert('CPF inválido. Insira um CPF válido.');
            return false;
        }

        if (!validacaoSenha()) {
            Alert.alert('A senha deve ter no mínimo 5 caracteres e serem iguais');
            return false;
        }

        const regexNumero = /^\d{1,11}$/;
        if (!regexNumero.test(dados.numero)) {
            Alert.alert('Número inválido. Insira um número válido.');
            return false;
        }


        return true;
    };

    //Formatar cpf
    function isValidCPF(cpf) {
        if (typeof cpf !== "string") return false
        cpf = cpf.replace(/[\s.-]*/igm, '')
        if (
            !cpf ||
            cpf.length != 11 ||
            cpf == "00000000000" ||
            cpf == "11111111111" ||
            cpf == "22222222222" ||
            cpf == "33333333333" ||
            cpf == "44444444444" ||
            cpf == "55555555555" ||
            cpf == "66666666666" ||
            cpf == "77777777777" ||
            cpf == "88888888888" ||
            cpf == "99999999999"
        ) {
            return false
        }
        var soma = 0
        var resto
        for (var i = 1; i <= 9; i++)
            soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i)
        resto = (soma * 10) % 11
        if ((resto == 10) || (resto == 11)) resto = 0
        if (resto != parseInt(cpf.substring(9, 10))) return false
        soma = 0
        for (var i = 1; i <= 10; i++)
            soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i)
        resto = (soma * 10) % 11
        if ((resto == 10) || (resto == 11)) resto = 0
        if (resto != parseInt(cpf.substring(10, 11))) return false
        return true
    }

    const validacaoSenha = () => {
        if (dados.senha.length < 5) return false
        if (dados.senha !== confirmacaoSenha) return false
        return true
    };
    return (
        <View style={[styles_global.container, { paddingHorizontal: 16 }]}>
            <StatusBar backgroundColor="#151718" style="light" />
            <TouchableOpacity style={[styles_global.btn_voltar, { width: "20%", marginTop: "3%" }]} onPress={() => router.back()}><Text style={styles_global.btn_voltar_txt}>Voltar</Text></TouchableOpacity>
            <ScrollView>
                <Text style={styles.title}>Cadastro</Text>
                <TextInput
                    required
                    style={styles.input}
                    placeholderTextColor={"#FFF"}
                    placeholder="Nome"
                    value={dados.nome}
                    onChangeText={(text) => {
                        setDados(prevDados => ({
                            ...prevDados,
                            nome: text
                        }));
                    }}
                />

                <MaskInput
                    value={dados.cep}
                    placeholder="CEP"
                    placeholderTextColor={"#FFF"}
                    keyboardType='numeric'
                    maxLength={10}
                    style={styles.input}
                    onChangeText={(masked, unmasked) => {
                        TratarCep(unmasked)
                        setDados(prevDados => ({
                            ...prevDados,
                            cep: unmasked
                        }));

                    }}
                    mask={[/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]}
                />

                <View style={styles.img_cep}>
                    {CorretoCEP}
                </View>

                <MaskInput
                    value={dados.cpf}
                    placeholder="CPF"
                    placeholderTextColor={"#FFF"}
                    keyboardType='numeric'
                    maxLength={14}
                    style={styles.input}
                    onChangeText={(mask, unmasked) => {
                        setDados(prevDados => ({
                            ...prevDados,
                            cpf: unmasked
                        }));

                    }}
                    mask={[/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    maxLength={25}
                    placeholderTextColor={"#FFF"}
                    value={dados.email}
                    onChangeText={(text) => {
                        setDados(prevDados => ({
                            ...prevDados,
                            email: text
                        }));
                    }}
                />
                <MaskInput
                    value={dados.numero}
                    placeholder="Número"
                    keyboardType='numeric'
                    maxLength={15}
                    placeholderTextColor={"#FFF"}
                    style={styles.input}
                    onChangeText={(mask, unmasked) => {
                        setDados(prevDados => ({
                            ...prevDados,
                            numero: unmasked
                        }));
                        setShowTextInput(false)
                    }}
                    mask={['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    maxLength={25}
                    secureTextEntry
                    placeholderTextColor={"#FFF"}
                    value={dados.senha}
                    onChangeText={(text) => {
                        setDados(prevDados => ({
                            ...prevDados,
                            senha: text
                        }));
                    }}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Confirme a senha"
                    maxLength={25}
                    secureTextEntry
                    placeholderTextColor={"#FFF"}
                    value={confirmacaoSenha}
                    onChangeText={(text) => {
                        setConfirmacaoSenha(text)
                        TratarSenha(text)
                    }}
                />
                <View style={styles.img_cep}>
                    {CorretoSenha}
                </View>

                <SelectDropdown
                    style={styles.input}
                    data={periodos}
                    onSelect={(selectedItem) => {
                        setDados(prevDados => ({
                            ...prevDados,
                            periodo: selectedItem
                        }));
                    }}
                    defaultButtonText={'Selecione Periodo na Faculdade'}
                    buttonStyle={styles.dropdown3BtnStyle}
                    buttonTextAfterSelection={(selectedItem) => {
                        return selectedItem;
                    }}
                    rowTextForSelection={(item) => {
                        return item;
                    }}


                />

                {/* <TextInput
                style={styles.textInput}
                placeholder="Período"
                value={periodo}
                onChangeText={(text) => setPeriodo(text)}
              /> */}

                <SelectDropdown
                    style={styles.input}
                    data={cursos}
                    onSelect={(selectedItem) => {
                        if (selectedItem != 'Outros') {
                            setDados(prevDados => ({
                                ...prevDados,
                                curso: selectedItem
                            }));
                            setShowTextInput(false)
                        } else {
                            setDados(prevDados => ({
                                ...prevDados,
                                curso: ''
                            }));
                            setShowTextInput(true)
                        }

                    }}
                    defaultButtonText={'Selecione seu Curso'}
                    buttonStyle={styles.dropdown3BtnStyle}
                    buttonTextAfterSelection={(selectedItem) => {
                        return selectedItem;
                    }}
                    rowTextForSelection={(item) => {
                        return item;
                    }}
                />

                {showTextInput && (
                    <TextInput
                        placeholderTextColor={"#FFF"}
                        value={dados.curso}
                        style={styles.input}
                        placeholder="Ocupação na Faculdade..."
                        onChangeText={(text) => {
                            setDados(prevDados => ({
                                ...prevDados,
                                curso: text
                            }));
                            setShowTextInput(false)
                        }}
                    />
                )}
                <View style={styles.view_deseja_motorista}>
                    <Text style={{ color: "#FFF", fontSize: 18 }}>Você deseja ser motorista?</Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#767577' }}
                        thumbColor={tipoCadastro ? '#f4f3f4' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => setTipoCadastro(!tipoCadastro)}
                        value={tipoCadastro}
                    />
                </View>
                {/* Caso esteja TRUE o usuari escolheu que gostaria de fazer o cadastro de motorista */}
                {tipoCadastro ? (
                    <>


                        <TextInput
                            style={styles.input}
                            placeholder="Placa"
                            placeholderTextColor={"#FFF"}
                            value={dados.veiculo_placa}
                            onChangeText={(text) => {
                                setDados(prevDados => ({
                                    ...prevDados,
                                    veiculo_placa: text
                                }));

                            }}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Modelo"
                            placeholderTextColor={"#FFF"}
                            value={dados.veiculo_cor}
                            maxLength={45}
                            onChangeText={(text) => {
                                setDados(prevDados => ({
                                    ...prevDados,
                                    veiculo_cor: text
                                }));
                            }}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Cor"
                            maxLength={20}
                            placeholderTextColor={"#FFF"}
                            value={dados.veiculo_cor}
                            onChangeText={(text) => {
                                setDados(prevDados => ({
                                    ...prevDados,
                                    veiculo_cor: text
                                }));
                            }}
                        />
                    </>
                ) : (<></>)}


                <TouchableOpacity style={styles.btn_cadastro} onPress={() => handleCadastro()}>
                    <Text style={styles.txt_cadastro}>Cadastrar</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};



const styles = StyleSheet.create({
    title: {
        fontSize: 28,
        marginBottom: 16,
        textAlign: 'center',
        color: "#FFF"
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingLeft: 8,
        borderRadius: 30,
        color: "#FFF"
    },

    dropdown3BtnStyle: {
        width: '100%',
        height: 50,
        backgroundColor: '#FFF',
        paddingHorizontal: 0,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        borderColor: '#444',
    },
    view_deseja_motorista: {

        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        margin: "5%"
    },
    btn_cadastro: {
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 30,
        width: "60%",
        backgroundColor: "#FFF",
        marginBottom: "6%"
    },
    txt_cadastro: {
        fontSize: 26
    }
});

