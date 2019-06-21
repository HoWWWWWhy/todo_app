import React, { Component } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Dimensions, TextInput
} from 'react-native';
import PropTypes from 'prop-types';

const { height, width } = Dimensions.get("window");

class ToDo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      toDoValue: props.text
    };
  }

  static propTypes = {
    text: PropTypes.string.isRequired,
    isCompleted: PropTypes.bool.isRequired,
    deleteToDo: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    uncompleteToDo: PropTypes.func.isRequired,
    completeToDo: PropTypes.func.isRequired,
    updateToDo: PropTypes.func.isRequired
  }

  render() {
    const { isEditing, toDoValue } = this.state;
    const { text, id, deleteToDo, isCompleted } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.todoList}>
          <TouchableOpacity onPress={this._toggleComplete}>
            <View style={[
              styles.circle,
              isCompleted? styles.completedCircle : styles.unCompletedCircle
              ]}
            />
          </TouchableOpacity>
          {isEditing ? (
            <TextInput
              style={styles.text}
              value={toDoValue}
              multiline={true}
              onChangeText={this._controlEditToDo}
              autoCorrect={false}
              returnKeyType={"done"}
              onBlur={this._finishEditing}
            />
          ) : (
            <Text style={[
              styles.text,
              isCompleted? styles.completedText : styles.unCompletedText
              ]}
            >{text}</Text>
          )}
        </View>

        {isEditing ? (
          <View style={styles.actions}>
            <TouchableOpacity onPress={this._finishEditing}>
              <View style={styles.actionContainer}>
                <Text style={styles.actionText}>✔</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity onPress={this._startEditing}>
              <View style={styles.actionContainer}>
                <Text style={styles.actionText}>✏</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPressOut={(event) => {
              event.stopPropagation();
              deleteToDo(id);
              }}
            >
              <View style={styles.actionContainer}>
                <Text style={styles.actionText}>❌</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  _toggleComplete = (event) => {
    event.stopPropagation();
    const { isCompleted, uncompleteToDo, completeToDo, id } = this.props;
    if(isCompleted) {
      uncompleteToDo(id);
    } else {
      completeToDo(id);
    }
  };
  _startEditing = (event) => {
    event.stopPropagation();
    this.setState({
      isEditing: true
    });
  };
  _finishEditing = (event) => {
    event.stopPropagation();
    const { toDoValue } = this.state;
    const { id, updateToDo } = this.props;
    updateToDo(id, toDoValue);
    this.setState({
      isEditing: false
    });
  };
  _controlEditToDo = text => {
    this.setState({
      toDoValue: text
    })
  };
}

const styles = StyleSheet.create({
  container: {
    width: width - 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#bbb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  text: {
    fontWeight: "600",
    fontSize: 20,
    marginVertical: 10
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    marginRight: 15
  },
  completedCircle: {
    borderColor: "#bbb"
  },
  unCompletedCircle: {
    borderColor: "black"
  },
  completedText: {
    color: "#bbb",
    textDecorationLine: "line-through"
  },
  unCompletedText: {
    color: "black"
  },
  todoList: {
    flexDirection: "row",
    alignItems: "center"
  },
  actions: {
    flexDirection: "row"
  },
  actionContainer: {
    marginVertical: 10,
    marginHorizontal: 10
  }
});

export default ToDo;
