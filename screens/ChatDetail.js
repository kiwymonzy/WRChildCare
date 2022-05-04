// @refresh reset

import React, { useState, useEffect, useCallback } from 'react';
import { Bubble,Day,GiftedChat } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, TextInput, View, YellowBox, Button, KeyboardAvoidingView } from 'react-native';
import firebase from 'firebase';
import { COLORS, FONTS, SIZES, icons, images } from '../constants';
import Fire from '../screens/Fire';

const ChatPage = ({ navigation }) => {
    
    const db = firebase.firestore();
    const chatsRef = db.collection('chats');
    const [messages, setMessages] = useState([]);
    const [userChat, setUser] = useState(Fire.shared.uid);
    const [name, setName] = useState(Fire.shared.name);

    useEffect(() => {
        readUser()
        const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
            const messagesFirestore = querySnapshot
                .docChanges()
                .filter(({ type }) => type === 'added')
                .map(({ doc }) => {
                    const message = doc.data()
                    return { ...message, createdAt: message.createdAt.toDate() }
                })
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            appendMessages(messagesFirestore)
        })
        return () => unsubscribe()
    }, [])

    const appendMessages = useCallback(
        (messages) => {
            setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
        },
        [messages]
    )

    async function readUser() {
        const user = await AsyncStorage.getItem('user')
        if (user) {
            setUser(JSON.parse(user))
        }
    }
    async function handlePress() {
        const _id = Math.random().toString(36).substring(7)
        const user = { _id, name }
        await AsyncStorage.setItem('user', JSON.stringify(user))
        setUser(user)
    }
    async function handleSend(messages) {
        const writes = messages.map((m) => chatsRef.add(m))
        await Promise.all(writes)
    }

    const renderBubble = (props) => {
    const { currentMessage } = props;
    console.log(props.currentMessage);
    return <Bubble {...props} />;
  };
    if (userChat) {
        return (
                 <KeyboardAvoidingView style={{flex:1}} keyboardVerticalOffset={10} enabled>
                <View style={{ flex: 1, justifyContent: 'top',backgroundColor: COLORS.black }}>
                            <GiftedChat
                            renderBubble={renderBubble}
                            messages={messages}
                            onSend={handleSend}
                            user={userChat}
                            placeholder="Type here..."
                            bottomOffset={40}
                            showAvatarForEveryMessage={true}
                            showUserAvatar={true}       
                            isCustomViewBottom={true}
                            renderAvatarOnTop={true}
                            renderUsernameOnMessage={false}
                            alwaysShowSend={true}
                            scrollToBottom={true}  
                          /> 
                </View>
      </KeyboardAvoidingView>  
        )
    }else{
        navigation.replace("LoginScreen");
    }
    return null;
}
export default ChatPage;
