import SelectDropdown from 'react-native-select-dropdown'
import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, ScrollView, Dimensions, Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import axios from 'axios';
import { collection, getDocs, query, where } from "firebase/firestore";
import db from '../config';

import { styles_global } from '../global/style_global'
import { GetSessao } from '../global/functions_global';
import { router } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


const VerViagens = () => {

    const [mapa, setMapa] = useState(null)
    const [sessao, setSessao] = useState()
    const [infoViagens, setInfoViagens] = useState([])
    const [markersArray, setmarkersArray] = useState([])
    const [cidadeFiltro, setCidadeFiltro] = useState(["Todas"])
    const [bairroFiltro, setBairroFiltro] = useState(["Todas"])
    const [cidadeSelecionada, setCidadeSelecionada] = useState("Todas")
    const [bairroSelecionada, setBairroSelecionada] = useState("Todas")
    const [turnoSelecionado, setTurnoSelecionado] = useState("Todos")
    const [modalVisivel, setModalVisivel] = useState(false)
    const [viewModal, setViewModal] = useState()
    const [modalDiversasPessoasVisivel, setModalDiversasPessoasVisivel] = useState(false)
    const [viewModalDiversasPessoas, setViewModalDiversasPessoas] = useState()

    const Turnos = ["Todos", "Matutino", "Vespertino", "Noturno"]
    useEffect(() => {

        start()

    }, []);
    useEffect(() => {
        montarMapa()
    }, [markersArray]);

    const start = async () => {
        let sessao = await GetSessao()
        setSessao(sessao)
        pegarInfos()

    }

    const pegarInfos = async () => {
        //adicionar condição where disponivel seja true
        const querySnapshot = await getDocs(collection(db, "usuario"));
        querySnapshot.forEach((doc) => {
            montarFiltro(doc.data())
            montarInfo(doc.data(), doc.id)
        });
        montarMarkers()


    }
    const montarInfo = async (data, id) => {
        if (data.disponivel) {
            let array = infoViagens
            data.id = id
            array.push(data)
            setInfoViagens(array)
        }
    }

    const montarFiltro = async (data) => {
        let cidades = cidadeFiltro.slice()
        let bairros = bairroFiltro.slice()

        let contem = false
        cidades.forEach(cidade => {
            if (cidade == data.cidade) {
                contem = true;
            }
        });

        if (!contem) {
            cidades.push(data.cidade)
            setCidadeFiltro(cidades)
        }

        contem = false
        bairros.forEach(bairro => {
            if (bairro == data.bairro) {
                contem = true;
            }
        });

        if (!contem) {
            bairros.push(data.bairro)
            setBairroFiltro(bairros)
        }
    }
    const chamarTelaDiversasPessoas = async (infos) => {
        setViewModalDiversasPessoas(
            <ScrollView>
                {infos.map((data, index) =>
                    <TouchableOpacity onPress={() => router.push({ pathname: "menu/infos", params: { data:  JSON.stringify(data) } })} key={index} style={styles.view_diversas_pessoas}>
                        <Text style={styles.text_diversas_pessoas}>{data.nome}</Text>
                        <Text style={styles.text_diversas_pessoas}>Período:{data.periodo}</Text>
                        <Text style={styles.text_diversas_pessoas}>Ocupação:{data.curso}</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        )
        setModalDiversasPessoasVisivel(true)
    }

    const chamarModalDiversasPessoas = async (infos, titulo) => {
        setViewModal(
            <TouchableOpacity onPress={() => chamarTelaDiversasPessoas(infos)} style={styles.modalInfos}>
                <Text>{titulo}</Text>
            </TouchableOpacity>
        )
        setModalVisivel(true)
    }

    const chamarModal = async (id) => {
        setModalVisivel(true)
        let pessoaSelecionada
        infoViagens.forEach(pessoa => {
            if (pessoa.id == id) {
                pessoaSelecionada = pessoa
            }
        });

        let dataParam = JSON.stringify(pessoaSelecionada)
        setViewModal(
            <TouchableOpacity onPress={() => router.push({ pathname: "menu/infos", params: { data: dataParam } })} style={styles.modalInfos}>
                <Text>{pessoaSelecionada.nome}</Text>
                <Text>Período:{pessoaSelecionada.periodo}</Text>
                <Text>Ocupação:{pessoaSelecionada.curso}</Text>
            </TouchableOpacity>
        )
    }



    const montarMarkers = () => {

        let infos = infoViagens
        let key = 0
        let array = []
        let arrayCepIgual = []
        let salvarCeps = []
        infos.forEach(element => {
            if (salvarCeps.includes(element.cep)) {
                arrayCepIgual.push(element.cep)
            } else {
                salvarCeps.push(element.cep)
            }
        })
        let arraySemDuplicatas = arrayCepIgual.filter((element, index) => {
            return arrayCepIgual.indexOf(element) === index;
        });

        infos.forEach(element => {
            if (cidadeSelecionada === "Todas"
                || element.cidade === cidadeSelecionada
                && bairroSelecionada === "Todas"
                || element.bairro === bairroSelecionada) {

                if (element.periodo === turnoSelecionado || turnoSelecionado === "Todos") {

                    if (arraySemDuplicatas.includes(element.cep)) {
                        return
                    } else {
                        array.push(
                            <Marker
                                key={key}
                                coordinate={{
                                    latitude: element.latitude,
                                    longitude: element.longitude
                                }}
                                title={element.nome}
                                image={{ uri: 'https://img.icons8.com/?size=100&id=21830&format=png' }}
                                onPress={() => chamarModal(element.id)}
                            />
                        )
                    }
                    key++
                }
            }
        });

        if (arrayCepIgual.length > 0) {
            let arraySemDuplicatas = arrayCepIgual.filter((element, index) => {
                return arrayCepIgual.indexOf(element) === index;
            });

            let cepJaFeito = {}
            for (let i = 0; i < arraySemDuplicatas.length; i++) {
                cepJaFeito[arraySemDuplicatas[i]] = [];
                infoViagens.forEach(element => {
                    if (arraySemDuplicatas[i] == element.cep) {
                        cepJaFeito[arraySemDuplicatas[i]].push(element)
                    }
                })
            }

            let key = 10000
            arraySemDuplicatas.forEach(element => {
                let arrayPessoas = cepJaFeito[element]
                let titulo = `${arrayPessoas.length} Pessoas nessa rua.`
                array.push(
                    <Marker
                        key={key}
                        coordinate={{
                            latitude: cepJaFeito[element][0].latitude,
                            longitude: cepJaFeito[element][0].longitude
                        }}
                        title={titulo}
                        image={{ uri: 'https://img.icons8.com/?size=100&id=21830&format=png' }}
                        onPress={() => chamarModalDiversasPessoas(arrayPessoas, titulo)}
                    />
                )
                key++
            });

        }
        setmarkersArray(array)
    }

    const montarMapa = async () => {
        setMapa(
            <MapView
                onRegionChange={this.onRegionChange}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: -27.637559,
                    longitude: -48.651728,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.05,
                }}
            >
                <Marker
                    coordinate={{
                        latitude: -27.637559,
                        longitude: -48.651728
                    }}
                    title="FMPSC"
                    description="Faculdade Municipal de Palhoça"
                    image={{ uri: 'https://img.icons8.com/?size=100&id=9887&format=png' }}
                />
                {markersArray.map((markers, index) =>
                    markers
                )}


            </MapView>
        )

    }


    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#151718" style="light" />
            <TouchableOpacity style={[styles_global.btn_voltar, { width: "20%", margin: "3%"}]} onPress={() => router.back()}><Text style={styles_global.btn_voltar_txt}>Voltar</Text></TouchableOpacity>
            <View style={styles.view_filtro}>

                <View style={styles.view_filtro_localidade}>
                    <SelectDropdown
                        buttonStyle={styles.dropdown_btn}
                        data={cidadeFiltro}
                        // defaultValueByIndex={8} // use default value by index or default value
                        // defaultValue={'Todas'} 
                        onSelect={(selectedItem, index) => {
                            setCidadeSelecionada(selectedItem)
                        }}
                        renderButton={(selectedItem, isOpen) => {
                            return (
                                <View style={styles.dropdownButtonStyle}>
                                    <Text style={styles.dropdownButtonTxtStyle}>{selectedItem || 'Cidade'}</Text>
                                </View>
                            );
                        }}
                        renderItem={(item, index, isSelected) => {
                            return (
                                <View
                                    style={{
                                        ...styles.dropdownItemStyle,
                                        ...(isSelected && { backgroundColor: '#D2D9DF' }),
                                    }}>
                                    <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                                </View>
                            );
                        }}
                        dropdownStyle={styles.dropdownMenuStyle}
                        search
                        defaultButtonText={'Cidade'}
                        searchInputStyle={styles.dropdownSearchInputStyle}
                        searchInputTxtColor={'#151E26'}
                        searchPlaceHolder={'Pesquisar'}
                        searchPlaceHolderColor={'#72808D'}

                    />
                    <SelectDropdown
                        buttonStyle={styles.dropdown_btn}
                        data={bairroFiltro}
                        // defaultValueByIndex={8} // use default value by index or default value
                        // defaultValue={'kiss'} // use default value by index or default value
                        onSelect={(selectedItem, index) => {
                            setBairroSelecionada(selectedItem)
                        }}
                        renderButton={(selectedItem, isOpen) => {
                            return (
                                <View style={styles.dropdownButtonStyle}>
                                    <Text style={styles.dropdownButtonTxtStyle}>{selectedItem || 'Bairro'}</Text>
                                </View>
                            );
                        }}
                        renderItem={(item, index, isSelected) => {
                            return (
                                <View
                                    style={{
                                        ...styles.dropdownItemStyle,
                                        ...(isSelected && { backgroundColor: '#D2D9DF' }),
                                    }}>
                                    <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                                </View>
                            );
                        }}
                        dropdownStyle={styles.dropdownMenuStyle}
                        search
                        defaultButtonText={'Bairro'}
                        searchInputStyle={styles.dropdownSearchInputStyle}
                        searchInputTxtColor={'#151E26'}
                        searchPlaceHolder={'Pesquisar'}
                        searchPlaceHolderColor={'#72808D'}

                    />
                </View>
                <View style={styles.view_filtro_mais}>
                    <SelectDropdown
                        buttonStyle={styles.dropdown_btn}
                        data={Turnos}
                        // defaultValueByIndex={8} // use default value by index or default value
                        // defaultValue={'kiss'} // use default value by index or default value
                        onSelect={(selectedItem, index) => {
                            setTurnoSelecionado(selectedItem)
                        }}
                        renderButton={(selectedItem, isOpen) => {
                            return (
                                <View style={styles.dropdownButtonStyle}>
                                    <Text style={styles.dropdownButtonTxtStyle}>{selectedItem || 'Periodo'}</Text>
                                </View>
                            );
                        }}
                        renderItem={(item, index, isSelected) => {
                            return (
                                <View
                                    style={{
                                        ...styles.dropdownItemStyle,
                                        ...(isSelected && { backgroundColor: '#D2D9DF' }),
                                    }}>
                                    <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                                </View>
                            );
                        }}
                        dropdownStyle={styles.dropdownMenuStyle}

                        defaultButtonText={'Periodo'}

                    />
                </View>

                <TouchableOpacity style={styles.btn_pesq} onPress={() => montarMarkers()}>
                    <Text style={styles.btn_pesq_txt}>Pesquisar</Text>
                </TouchableOpacity>

            </View>
            <ScrollView onTouchStart={() => setViewModal(false)} style={styles.scroll_mapa} scrollEnabled={false}>
                <View style={styles.view_mapa}>
                    {mapa != null ? (
                        <>{mapa}</>
                    ) : <><ActivityIndicator style={{}} size="large" color="gray" /></>}
                </View>
            </ScrollView>
            {modalVisivel ? viewModal : <></>}
            <Modal style={styles.modal} visible={modalDiversasPessoasVisivel}>
                <View style={{backgroundColor:"#151718",flex:1}}>
                    <TouchableOpacity style={[styles_global.btn_voltar,{width:"50%",alignSelf:"center",marginTop:"8%" }]} onPress={()=>setModalDiversasPessoasVisivel(false)}>
                        <Text style={styles_global.btn_voltar_txt}>Voltar</Text>
                    </TouchableOpacity>
                    {viewModalDiversasPessoas}
                </View>
            </Modal>
        </View>
    )
}
export default VerViagens;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#151718",
        flex: 1
    },
    map: {
        alignSelf: "center",
        height: 0.7 * screenHeight,
        width: screenWidth
    },
    view_filtro: {
        alignItems: "center",
        flexDirection: "column",
        top: 0,
        width: "100%",
        height: "30%"
    },
    dropdown_btn: {
        height: "70%",
        margin: "2%",
        width: "50%",
        borderRadius: 30
    },
    scroll_mapa: {
        bottom: 0,
        position: "absolute",
        width: '100%',
        height: "70%"
    },
    view_mapa: {
        width: '100%',
        height: "100%"
    },
    btn_pesq_txt: {
        color: "#000",
        fontSize: 20
    },
    btn_pesq: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E9ECEF",
        height: "15%",
        width: "50%",
        margin: "2%",
        borderRadius: 30
    },
    modalInfos: {
        position: "absolute",
        bottom: 0,
        height: "20%",
        width: "100%",
        backgroundColor: "#FFF",
        justifyContent:"center",
        alignItems:"center"
    },
    view_filtro_localidade: {
        flexDirection: "row",
        marginHorizontal: "5%"
    },
    view_filtro_mais: {
        flexDirection: "row",
        marginHorizontal: "5%"
    },
    modal:{
        backgroundColor:"#151718",
        flex:1
    },
    view_diversas_pessoas:{
        width:"80%",
        alignSelf:"center",
        backgroundColor:"#FFF",
        margin:"4%",
        borderRadius:20,
        padding:15
    },
    text_diversas_pessoas:{
        margin:"1%"
    },














    dropdownButtonStyle: {
        width: 350,
        height: 50,
        backgroundColor: '#E9ECEF',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#151E26',
        textAlign: 'center',
    },
    dropdownMenuStyle: {
        textAlign: 'center',
        alignSelf: "center",
        backgroundColor: '#E9ECEF',
        borderRadius: 8,
    },
    dropdownSearchInputStyle: {
        backgroundColor: '#E9ECEF',
        borderRadius: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#B1BDC8',
    },
    dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#B1BDC8',
    },
    dropdownItemTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#151E26',
        textAlign: 'center',
    },
    dropdownItemIconStyle: {
        fontSize: 28,
        marginRight: 8,
    },
    ////////////// dropdown1
    dropdown1ButtonStyle: {
        width: '80%',
        height: 50,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        backgroundColor: '#444444',
    },
    dropdown1ButtonTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    dropdown1ButtonArrowStyle: {
        fontSize: 28,
        color: '#FFFFFF',
    },
    dropdown1ButtonIconStyle: {
        fontSize: 28,
        marginRight: 8,
        color: '#FFFFFF',
    },
    dropdown1MenuStyle: {
        backgroundColor: '#444444',
        borderRadius: 8,
    },
    dropdown1SearchInputStyle: {
        backgroundColor: '#444444',
        borderBottomWidth: 1,
        borderBottomColor: '#FFFFFF',
    },
    dropdown1ItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#B1BDC8',
    },
    dropdown1ItemTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    dropdown1ItemIconStyle: {
        fontSize: 28,
        marginRight: 8,
        color: '#FFFFFF',
    },
    ////////////// dropdown2
    dropdown2ButtonStyle: {
        width: '80%',
        height: 50,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#B1BDC8',
    },
    dropdown2ButtonTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#151E26',
    },
    dropdown2ButtonArrowStyle: {
        fontSize: 28,
    },
    dropdown2ButtonIconStyle: {
        fontSize: 28,
        marginRight: 8,
    },
    dropdown2MenuStyle: {
        backgroundColor: '#FFF',
        borderRadius: 8,
    },
    dropdown2SearchInputStyle: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#B1BDC8',
    },
    dropdown2ItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#B1BDC8',
    },
    dropdown2ItemTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#151E26',
    },
    dropdown2ItemIconStyle: {
        fontSize: 28,
        marginRight: 8,
    },
})