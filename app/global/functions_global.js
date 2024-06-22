import AsyncStorage from '@react-native-async-storage/async-storage';

export const GetSessao = async ()=> {
        try {
          const jsonValue = await AsyncStorage.getItem('sessao');
    
          return jsonValue != null ? JSON.parse(jsonValue) : null;
    
        } catch (e) {
          return null;
        }
    
      
}