import React from 'react'
import {Text,View,TouchableOpacity,StyleSheet,TextInput,Image,KeyboardAvoidingView, Alert} from 'react-native'
import firebase from 'firebase'

export default class LoginScreen extends React.Component{
constructor(){
    super();
    this.state = {
        emailID :'',
        password:''
    }
}
login = async(email,password)=>{
    if(email&&password){
        try{
            const response = firebase.auth().signInWithEmailAndPassword(email,password)
            if(response){
                this.props.navigation.navigate('Transaction')
            }
        }
        catch(error){
            switch(error.code){
            case 'auth/user-not-found':Alert.alert("User Does Not Exist")
            break;
            case 'auth/invalid-email':Alert.alert("Incorrect User Name")
            break;
            }
        }
    }
    else{
        Alert.alert("Enter Email And Password")
    }
}
render(){
    return(
        <KeyboardAvoidingView style={{alignItems:'center',marginTop:20}}>
            <View>
                <Image source={require("../assets/booklogo.jpg")}style={{width:200,height:200}}/><Text style={{textAlign:'center',fontSize:30}}>WILY</Text>
            </View>
            <View>
                <TextInput style={{width:300,height:40,borderWidth:1.5,fontSize:20,margin:10,paddingLeft:10}}placeholder="abc@example.com"keyboardType='email-address'onChangeText={(text)=>{this.setState({
                    emailID:text
                })}}></TextInput>
                 <TextInput style={{width:300,height:40,borderWidth:1.5,fontSize:20,margin:10,paddingLeft:10}}placeholder="Password"secureTextEntry={true} onChangeText={(text)=>{this.setState({
                    password:text
                })}}></TextInput>
            </View>
            <View>
                <TouchableOpacity style={{height:30,width:90,borderWidth:1,marginTop:20,paddingTop:5,borderRadius:7}}onPress={()=>{this.login(this.state.emailID,this.state.password)}}>
                    <Text style={{textAlign:"center"}}>LOGIN</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
}