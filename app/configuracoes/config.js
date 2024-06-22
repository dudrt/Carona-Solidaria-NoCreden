import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import Menu from "../menu_navigation";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import * as Updates from 'expo-updates';


export default function Config() {

    const [ModalVisivel, setModalVisivel] = useState(false)
    const [MostrarMenu, setMostrarMenu] = useState(true)

    const Desconectar = async () => {
        await AsyncStorage.removeItem('sessao');
        Updates.reloadAsync()
    }





    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#151718" style="light" />


            <TouchableOpacity style={styles.desc_btn} onPress={() => { setMostrarMenu(false); setModalVisivel(true) }}>
                <Text style={styles.desc_text}>
                    Desconectar
                </Text>
                <Modal
                    style={styles.modal}
                    animationType="slide"
                    transparent={true}
                    visible={ModalVisivel}
                    onRequestClose={() => {
                        setModalVisivel(!ModalVisivel);
                        setMostrarMenu(true)
                    }}
                >
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <View style={styles.view_modal}>
                            <Text style={styles.desconect_modal_text}>Você realmente deseja se desconectar?</Text>
                            <View style={{ flexDirection: "row" }}>
                                <TouchableOpacity style={styles.modal_button_cancel} onPress={() => { setMostrarMenu(true); setModalVisivel(!ModalVisivel) }}><Text style={styles.text_button_modal_cancel}>Cancelar</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.modal_button_desconect} onPress={() => { setMostrarMenu(true); Desconectar() }}><Text style={styles.text_button_modal_desconect}>Confirmar</Text></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </TouchableOpacity>




            {MostrarMenu ? <Menu /> : <></>}
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: "#151718",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: 'center'
    },
    desconect_modal_text: {
        color: "#FF2626",
        padding: 10,
        fontSize: 20
    },
    modal: {
        flex: 1,
    },
    view_modal: {
        backgroundColor: "#5B5B5B",
        width: "60%",
        height: "20%",
        alignSelf: "center",
        alignItems: 'center',
        marginHorizontal: "auto",
        marginVertical: "auto",
        borderRadius: 40
    },
    modal_button_cancel: {
        padding: 8,
        backgroundColor: "#151718",
        margin: 10,
        borderRadius: 20
    },
    modal_button_desconect: {
        padding: 8,
        backgroundColor: "#151718",
        margin: 10,
        borderRadius: 20

    },
    text_button_modal_cancel: {
        color: "#FFF",
        fontSize: 15
    },
    text_button_modal_desconect: {
        color: "#FFF",
        fontSize: 15
    },
    desc_btn: {
        padding: 8,
        backgroundColor: "gray",
        margin: 10,
        borderRadius: 20
    },
    desc_text: {
        fontSize: 25,
        color: "#FFF"
    }



})