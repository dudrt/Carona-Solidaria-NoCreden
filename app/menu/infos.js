import { useLocalSearchParams, router } from "expo-router"; // Importe o router se estiver disponível
import { useEffect, useState } from "react";
import { View, Text,Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { collection, addDoc } from "firebase/firestore"; // Importe as funções necessárias do Firestore
import db from '../config'; // Importe a instância do Firestore
import { GetSessao } from '../global/functions_global';
import { StatusBar } from "expo-status-bar";


export default function Infos  () {
    const { data } = useLocalSearchParams();
    const [info, setInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const [sessao, setSessao] = useState()
    const [dados, setDados] = useState({
        cpf_solicitado: '',
        cpf_solicitador: '',
        cep_solicitado: '',
        cep_solicitador: '',
        modo_login_solicitado: '',
        modo_login_solicitador: ''
    });

    useEffect(() => { 
        start();
    }, []);

    useEffect(() => {
        pegarInfos();
    }, [info,sessao]);
    
    const start = async () => {
        let sessao = await GetSessao();
            setSessao(sessao);
            let dataJson = JSON.parse(data);
            setInfo(dataJson); 
    };

    const pegarInfos = async () => {
        if (info.cpf != undefined ) {
            setDados({
                cpf_solicitado: info.cpf,
                cpf_solicitador: sessao.cpf,
                cep_solicitado: info.cep,
                cep_solicitador: sessao.cep,
                modo_login_solicitado: info.modo_login,
                modo_login_solicitador: sessao.modo_login
            });
        }
    };
    
    const enviarSolicitacao = async () => {
        setLoading(true);
        try {
            console.log(dados)
            const docRef = await addDoc(collection(db, "solicitacoes"), dados);
            Alert.alert('Solicitação enviada com sucesso!');
            router.replace('/');
        } catch (error) {
            Alert.alert('Ocorreu um erro ao enviar a solicitação!');
            console.error("Erro ao enviar solicitação:", error);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
        <StatusBar backgroundColor="#151718" style="light" />
        <View style={styles.profileContainer}>
            <Image source={require('../content/profile-user.png')} style={styles.profileImage} />
            <View style={styles.nomeWppView}>
                <Text style={styles.nome}>{info.nome}</Text>
                <TouchableOpacity onPress={() => abrirWpp()}>
                    <Image source={require('../content/whatsapp.png')} resizeMode='contain' style={styles.wppImg} />
                </TouchableOpacity>
            </View>
            <Text style={styles.descricao}>Período: {info.periodo}</Text>
            <Text style={styles.descricao}>CEP: {info.cep}</Text>
            <Text style={styles.descricao}>Tipo Pessoa:  {info.modo_login == 1 ? 'Motorista' : 'Passageiro' }</Text>
        </View>
        <TouchableOpacity
            style={styles.button}
            onPress={enviarSolicitacao}
            disabled={dados.cpf_solicitado == ""}
        >
            <Text style={styles.buttonText}>{loading ? "Enviando..." : "Enviar Solicitação"}</Text>
        </TouchableOpacity>
    </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#151718",
        padding: 20,
        justifyContent: "center",
    },
    button: {
        backgroundColor: "#2ECC71",
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#FFF",
        fontSize: 16,
    },
    profileContainer: {
        alignItems: 'center',
        padding: 20,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 10,
    },
    nome: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: "#FFF"
    },
    descricao: {
        fontSize: 16,
        color: 'gray',
    },
    wppImg: {
        marginStart: 10,
        width: 30,
        height: 30
    },
    nomeWppView: {
        flexDirection: "row"
    },
});

// export default Infos;
