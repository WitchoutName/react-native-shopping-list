import React, {useEffect, useState, useRef} from 'react';
import { StyleSheet, View, FlatList, Text, Dimensions, Keyboard } from 'react-native';
import Header from "../components/Header"
import Item from "../components/Item"
import CircleButton from "../components/CircleButton"
import OpacityCircleButton from "../components/OpacityCircleButton"
import BottomInput from "../components/BottomInput"
import EmptyMainList from "../components/EmptyMainList"
import {OptimizedFlatList} from 'react-native-optimized-flatlist'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Color from '../classes/Color';


function useForceUpdate(){
    const [value, setValue] = useState(0);
    return () => setValue(value => value + 1);
}

const Storage = {
    keys: {
        allItems: "allitems",
        favourite: "favourite"
    },
    all: {
        set: (items)=>{
        try { AsyncStorage.setItem("allitems", JSON.stringify({items: items})).then((value)=>{console.log(`set all ${value}`)});} 
        catch (error) { console.log("error",error); }
        },
        remove: async (itemId) => {
            try { await AsyncStorage.setItem("allitems", JSON.stringify({items: [...Items.filter(e => e.id !== itemId)]})); }
            catch (error) { console.log("error",error); }
        },
        delete: async () => {
            try { await AsyncStorage.removeItem("allitems"); console.log("all deleted") }
            catch (error) { console.log("error",error); }
        },
        get: () => {
            try {
                AsyncStorage.getItem("allitems").then(value => {
                    if (value !== null) {
                        let fetched = JSON.parse(value)
                        console.log("fetch succesfull")
                        console.log(fetched.items)
                        return fetched.items
                    }
                })

                
            }
            catch (error) {
                console.log("error",error)
            }
        }
    }
}



function MainItems(props){
    const add = {icon: {name: "plus", width: 35, height: 35, color: {f: Color.plusGeen, s: Color.grayPlus}}, getValues: addItem}
    const edit = {icon: {name: "edit", width: 25, height: 25, color: {f: Color.secondary, s: Color.secondary}}, getValues: editItem}

    const [Items, setItems] = useState([])
    const [active, setActive] = useState(false)
    const [ShowInput, setShowInput] = useState(false)
    const [ShowDelete, setShowDelete] = useState(false)
    const [InputMode, setInputMode] = useState(add)
    const [fetchedData, setfetchedData] = useState(add)
    let faltList = useRef()
    let editedId = useRef()
    let forceUpdate = useForceUpdate()

    function setItemsFromStorage(){
        AsyncStorage.getItem("allitems").then(value => {setItems(JSON.parse(value).items)})
    }

    useEffect(()=>{
        setItemsFromStorage()
        
    },[])

    useEffect(()=>{
        console.log("rerender")

        Keyboard.addListener("keyboardDidHide", ()=>{setShowInput(false)});
        return () => { Keyboard.removeListener("keyboardDidHide"); }
    })

    useEffect(()=>{
        console.log("items",Items)
    },[Items])

    function setActiveTo(value){
        setActive(value)
    }

    function onPressPlus(){
        withdrawInput("add")
        setActiveTo(-1);
    }

    function onPressEdit(itemId){
        editedId.current = itemId
        withdrawInput("edit")
    }

    function onPressDelete(){
        Storage.all.set(Items.filter(item => !item.checked))
        setItemsFromStorage()
        setShowDelete(false)
    }

    function addItem(count, title){
        let newId = Items.length > 0 ? Items[0].id + 1 : 0 
        let newItem = {id: newId, count: count, title: title, checked: false}
        console.log(`old list of all ${Items} end`)
        console.log(`middle list of all ${[newItem, ...Items]}, ${JSON.stringify({items: [newItem, ...Items]})} end`)
        AsyncStorage.setItem("allitems", JSON.stringify({items: [newItem, ...Items]})).then(()=>{
            let list = [newItem, ...Items]
            console.log(`new list of all ${list} end`)
            console.log(`new item: ${newItem} end`)
            setItems(list)
        })
    }

    function deleteItem(itemId){
        Storage.all.remove(itemId)
        setItemsFromStorage()
    }

    function editItem(count, title){
        console.log("items in editing",Items)
        let local = [...Items]
        for (let item of local){
            if (item.id === editedId.current){
                console.log("hehe bingo")
                item.count = count
                item.title = title
            }
        }
        Storage.all.set(local)
        setItemsFromStorage()
        Keyboard.dismiss()
    }

    function editItemChecked(bool, itemId){
        let local = [...Items]
        let check = false
        for (let item of local){
            if (item.id === itemId){
                item.checked = bool
            }
            if (item.checked) 
                check = true
        }

        Storage.all.set(local)
        setItemsFromStorage()  
        setShowDelete(check)
    }

    function withdrawInput(mode){
        if (mode === "add"){
            setInputMode(add)
            console.log("add mode selected")
        }
        else if (mode === "edit"){
            setInputMode(edit)
            console.log("edit mode selected")
        }
        setShowInput(true)
    }

	return (
        <View style={styles.container}>
            <Header title={"All needed items"}/>
            <FlatList
                data={Items}
                style={{backgroundColor: "#b3f0ff", width: Dimensions.get("window").width, paddingBottom: 5}}
                renderItem={({item}) => (<Item
                                            id={item.id} 
                                            count={item.count} 
                                            title={item.title} 
                                            isVisible={active === item.id} 
                                            onPressDots={bool => {setActiveTo(bool ? item.id : -1)}}   
                                            onPressDelete={deleteItem}
                                            onPressEdit={onPressEdit}
                                            onPressCheckbox={bool => editItemChecked(bool, item.id)}
                                            isChecked={Items.filter(x =>{return x.id === item.id})[0].checked}
                                        />)}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={<EmptyMainList onPress={()=>{withdrawInput("add")}}/>}
                ref={faltList}
            />
            <OpacityCircleButton 
                isVisible={!ShowInput && ShowDelete} 
                style={{ position: "absolute", bottom: 10, left: 10}} 
                icon={{name: "delete", width: 30, height: 30}} 
                onPress={onPressDelete}
            />
            <OpacityCircleButton 
                isVisible={!ShowInput} 
                style={{ position: "absolute", bottom: 10, left: Dimensions.get("window").width - 85}} 
                icon={{name: "plus"}} 
                onPress={onPressPlus}
            />
            <BottomInput isVisible={ShowInput} getValues={InputMode.getValues} icon={InputMode.icon}/>
        </View>
	);
};

const styles = StyleSheet.create({
	container: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "flex-start",
        justifyContent: "center",
    },
})

export default MainItems;