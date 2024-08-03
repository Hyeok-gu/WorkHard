import { StatusBar } from "expo-status-bar";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "./colors";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Fontisto from "@expo/vector-icons/Fontisto";
import Entypo from "@expo/vector-icons/Entypo";

const STORAGE_KEY = "@toDos";
const STORAGE_Tab = "@tabActive";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [editText, setEditText] = useState("");

  useEffect(() => {
    loadTabActive();
    loadToDos();
  }, []);

  useEffect(() => {
    saveTabActive();
  }, [working]);

  const travel = () => {
    setWorking(false);
  };

  const work = () => {
    setWorking(true);
  };

  const onChangeText = (payload) => setText(payload);
  const onChangeEditText = (payload) => setEditText(payload);

  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)); //오브젝트를 string으로 변경 후 저장 가능함.
  };

  const saveTabActive = async () => {
    await AsyncStorage.setItem(STORAGE_Tab, JSON.stringify(working));
  };

  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    setToDos(JSON.parse(s)); // string을  Object로 바꿔줌.
  };

  const loadTabActive = async () => {
    const s = await AsyncStorage.getItem(STORAGE_Tab);
    setWorking(s === "true" ? true : false);
  };

  const editInputRef = useRef(null);

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, finished: false, edit: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const deleteToDo = (key) => {
    Alert.alert("Delete To Do?", "are you sure?", [
      { text: "Cancel" },
      {
        text: "Sure",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
    return;
  };

  const finishedToDo = (key) => {
    const newToDos = { ...toDos };
    newToDos[key] = {
      ...newToDos[key],
      finished: newToDos[key].finished ? false : true,
    };
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  const editToDo = (key) => {
    const newToDos = { ...toDos };
    setEditText(newToDos[key].text);
    newToDos[key] = {
      ...newToDos[key],
      edit: true,
    };
    setToDos(newToDos);
    setTimeout(() => {
      editInputRef.current.focus();
    }, 100);
  };

  const editComplate = (key) => {
    const newToDos = { ...toDos };
    newToDos[key] = {
      ...newToDos[key],
      text: editText,
      edit: false,
    };
    setToDos(newToDos);
    saveToDos(newToDos);
    setEditText("");
  };

  const cancelEdit = (key) => {
    const newToDos = { ...toDos };
    newToDos[key] = {
      ...newToDos[key],
      edit: false,
    };
    setToDos(newToDos);
    saveToDos(newToDos);
    setEditText("");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          returnKeyType="done"
          onSubmitEditing={addToDo}
          onChangeText={onChangeText}
          value={text}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={styles.input}
        />
      </View>
      <ScrollView>
        {toDos === null ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>no data</Text>
          </View>
        ) : (
          <>
            {Object.keys(toDos).map((key) =>
              toDos[key].working === working ? (
                <View key={key} style={styles.toDo}>
                  {toDos[key].edit ? (
                    <TextInput
                      multiline
                      ref={editInputRef}
                      style={styles.editInput}
                      returnKeyType="done"
                      onChangeText={onChangeEditText}
                      value={editText}
                    />
                  ) : (
                    <Text
                      style={{
                        ...styles.toDoText,
                        color: toDos[key].finished ? "#707070" : "#fff",
                      }}
                    >
                      {toDos[key].text}
                    </Text>
                  )}
                  <View style={styles.toDoBtnWrapper}>
                    {toDos[key].edit && (
                      <TouchableOpacity onPress={() => cancelEdit(key)}>
                        <Text style={styles.editBtn}>취소</Text>
                      </TouchableOpacity>
                    )}
                    {!toDos[key].finished && (
                      <>
                        {toDos[key].edit ? (
                          <TouchableOpacity onPress={() => editComplate(key)}>
                            <Text style={styles.editBtn}>편집완료</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity onPress={() => editToDo(key)}>
                            <Text style={styles.editBtn}>편집</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}

                    {!toDos[key].edit && (
                      <>
                        <TouchableOpacity onPress={() => finishedToDo(key)}>
                          <Text style={styles.editBtn}>
                            {toDos[key].finished ? "미완료" : "완료"}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteToDo(key)}>
                          <Fontisto name="trash" size={18} color="#707070" />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ) : null
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 100,
  },
  btnText: {
    color: "white",
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 16,
  },
  toDo: {
    backgroundColor: theme.grey,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 6,
    borderRadius: 15,
    alignItems: "flex-start",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  toDoBtnWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  empty: {
    flexDirection: "row",
    justifyContent: "center",
  },
  emptyText: {
    color: "white",
  },
  editBtn: {
    color: "white",
  },
  editInput: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
