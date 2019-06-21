import React from 'react';
import {
  StyleSheet, Text, View, StatusBar, Dimensions, TextInput, Platform, ScrollView,
  AsyncStorage, TouchableOpacity
} from 'react-native';
import { AppLoading } from 'expo';
import styled, { ThemeProvider, css } from "styled-components";
import ToDo from "./ToDo";

import uuidv1 from "uuid/v1";
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import Dialog, { 
  DialogContent, DialogTitle
} from 'react-native-popup-dialog';
import { propTypes } from 'react-native/Libraries/Experimental/SwipeableRow/SwipeableFlatList';

const { height, width } = Dimensions.get("window");

export default class App extends React.Component {
  state = {
    newToDo: "",
    loadedThings: false,
    toDos: {},
    userName: "HoWWWWWhy",
    visible: false,
    colorNum: 0,
    colorList: {
      mainColor: "#1abc9c",
      warmColor: "#ff6b6b",
      coolColor: "#54a0ff",
      yellowColor: "#ffeaa7",
      darkColor: "#2d3436"
    }
  };

  componentDidMount = () => {
    this._loadThings();
  }

  render() {
    const { newToDo, loadedThings, toDos, userName, colorList, colorNum } = this.state;
    const colorKeys = Object.keys(colorList);
    //console.log(colorNum,':',colorKeys[colorNum],'->',colorList[colorKeys[colorNum]]);

    if(!loadedThings) {
      return <AppLoading />;
    }
    else {
      return (
        <Container nextColor={colorList[colorKeys[colorNum]]}>
          <StatusBar barStyle="light-content" />
          <View style={styles.setting}>
            <Dialog
              visible={this.state.visible}
              onTouchOutside={() => {
                this._setUserName(false, userName);
              }}
              dialogTitle={<DialogTitle title="What's your name?" />}             
            >
              <DialogContent>
                <Text>My name is</Text>
                <TextInput
                  placeholder={userName}
                  value={userName}
                  onChangeText={this._changeUserName}
                />
              </DialogContent>
            </Dialog>

            <TouchableOpacity
              onPress={() => {
                this._setUserName(true, userName);
              }}>
              <View style={styles.settingUser}> 
                <AntDesign name="user" size={32}/> 
              </View>
            </TouchableOpacity>    
            <TouchableOpacity
              onPress={() => {
                this._setBackgroundColor();
              }}>
              <View> 
                <MaterialCommunityIcons name="palette" size={32}/> 
              </View>
            </TouchableOpacity>                  
            <TouchableOpacity onPress={this._clearToDo}>
              <View style={styles.settingClear}> 
                <MaterialCommunityIcons name="broom" size={32}/>
              </View>
            </TouchableOpacity>
            
          </View>
          <Text style={styles.title}>{userName}'s To Do List</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder={"New To Do"}
              placeholderTextColor={"#999"}
              value={newToDo}
              onChangeText={this._controlNewToDo}
              autoCorrect={false}
              returnKeyType={"done"}
              autoCorrect={false}
              onSubmitEditing={this._addToDo}
            />
            <ScrollView contentContainerStyle={styles.toDos}>
              {Object.values(toDos)
              .sort(function (a, b) {
                if(a.hasOwnProperty('createAt')){
                  return a.createAt - b.createAt;
                }  
              })
              .map(toDo => (
                <ToDo
                  key={toDo.id}
                  deleteToDo={this._deleteToDo}
                  uncompleteToDo={this._uncompleteToDo}
                  completeToDo={this._completeToDo}
                  updateToDo={this._updateToDo}
                  {...toDo}
                />
              ))}
            </ScrollView>
          </View>
        </Container>    
      );
    }
  }

  _setBackgroundColor() {
    const { colorNum, colorList } = this.state;

    newColorNum = colorNum + 1;
    if(newColorNum >= Object.keys(colorList).length) {
      newColorNum = 0;
    }
    this.setState({
      colorNum: newColorNum
    });    
    this._saveBackgroundColor(newColorNum);
  }
  _saveBackgroundColor = (NewColorNum) => {
    const saveBackgroundColor = AsyncStorage.setItem("bgColorNum", NewColorNum.toString());
  };

  _setUserName(visibleState) {
    const { userName } = this.state;
    this.setState({
      visible: visibleState
    });
    if(!visibleState) {
      this._saveUserName(userName);
    }
  }
  _changeUserName = text => {
    this.setState({
      userName: text
    });
  };
  _saveUserName = (NewUserName) => {
    //console.log(JSON.stringify(newToDos));
    const saveUserName = AsyncStorage.setItem("userName", NewUserName);
  };

  _controlNewToDo = text => {
    this.setState({
      newToDo: text
    });
  };

  _loadThings = async () => {
    try {
      const toDos = await AsyncStorage.getItem("toDos");
      const userName = await AsyncStorage.getItem("userName");
      const bgColorNum = await AsyncStorage.getItem("bgColorNum");

      const parsedToDos = JSON.parse(toDos);
      //console.log(parsedToDos);

      this.setState({
        loadedThings: true,
        userName: userName || "HoWWWWWhy",
        toDos: parsedToDos || {},
        colorNum: Number(bgColorNum) || 0
      });       
    } catch(err) {
      console.log(err);
    }

  };

  _clearToDo = () => {
    this.setState(prevState => {
      const toDos = prevState.toDos;
      for( let key in toDos ) {
        //console.log( toDos[key].text );
        delete toDos[key];
      }      
      const newState = {
        ...prevState,
        ...toDos
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  };
  _addToDo = () => {
    const { newToDo } = this.state;
    if(newToDo !== "") {
      this.setState(prevState => {
        const ID = uuidv1();
        const newToDoObject = {
          [ID]: {
            id: ID,
            isCompleted: false,
            text: newToDo,
            createAt: Date.now()
          }
        };
        const newState = {
          ...prevState,
          newToDo: "",
          toDos: {
            ...prevState.toDos,
            ...newToDoObject
          }
        }
        this._saveToDos(newState.toDos);
        return { ...newState};
      });
    }
  };

  _deleteToDo = (id) => {
    this.setState(prevState => {
      const toDos = prevState.toDos;
      delete toDos[id];
      const newState = {
        ...prevState,
        ...toDos
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  };

  _uncompleteToDo = (id) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: false
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  };
  _completeToDo = (id) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: true
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  };  
  _updateToDo = (id, text) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            text: text
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  }; 

  _saveToDos = (newToDos) => {
    //console.log(JSON.stringify(newToDos));
    const saveToDos = AsyncStorage.setItem("toDos", JSON.stringify(newToDos));
  };
}

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  ${props => {
    return css `background-color: ${props.nextColor}`;
  }};
`;

const styles = StyleSheet.create({

  setting: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    marginTop: 50
  },
  settingUser: {
    paddingRight: 10,
  },
  settingClear: {
    paddingLeft: 10,
  },  
  title: {
    color: 'white',
    fontSize: 30,
    marginTop: 10,
    marginBottom: 30,
    fontWeight: '500'
  },
  card: {
    backgroundColor: 'white',
    marginBottom: 20,
    flex: 1,
    width: width - 30,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "rgb(50, 50, 50)",
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowOffset: {
          height: -1,
          width: 0
        }
      },
      android: {
        elevation: 5
      }
    })
  },
  input: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#bbb",
    fontSize: 20
  },
  toDos: {
    alignItems: 'center'
  }
});
