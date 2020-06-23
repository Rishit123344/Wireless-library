import React from 'react'
import {Text,View,TouchableOpacity,StyleSheet,TextInput,Image} from 'react-native'
import * as Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner'
import firebase from 'firebase'
import db from '../config'

export default class TransactionScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            hasCameraPermissions:null,
            scanned:false,
scannedBookId:'',
scannedStudentId:'',
buttonState:'normal',
transactionMessage:''
        }
    }
    getPermissionsAsync = async (id) => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermissions: status === 'granted',buttonState:id,scanned:false});
      };
      handleBarCodeScanned=async({type,data})=>{
          const {buttonState}=this.state
          if(buttonState==='BookId'){

          this.setState({
              scanned:true,
              scannedBookId:data,
              buttonState:'normal'
              
          })
        }
        else if(buttonState==='StudentId'){

            this.setState({
                scanned:true,
                scannedStudentId:data,
                buttonState:'normal'
            })
          }
      }
      handletransaction=async()=>{
var transactionMessage=null
db.collection("books").doc(this.state.scannedBookId).get().then((doc)=>{
    var book = doc.data()
    if(book.bookAvailability){
        this.initiateBookIssue();
        transactionMessage='Book Issued'
    }
    else{
        this.initiateBookReturn();
    transactionMessage='Book Returned'
    }
})
this.setState({
    transactionMessage:transactionMessage
})
    }
    initiateBookIssue=async()=>{
        db.collection("transactions").add({
            'studentID':this.state.scannedStudentId,
'bookID':this.state.scannedBookId,
'date':firebase.firestore.Timestamp.now().toDate(),
'transactionType':'Issue'
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailibility':false
        })
        db.collection("students").doc(this.state.scannedstudentId).update({
            'NumberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
        })
        this.setState({
            scannedStudentId:'',
            scannedBookId:''
        })
    }
    initiateBookReturn=async()=>{
        db.collection("transactions").add({
            'studentID':this.state.scannedStudentId,
'bookID':this.state.scannedBookId,
'date':firebase.firestore.Timestamp.now().toDate(),
'transactionType':'Return'
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailibility':true
        })
        db.collection("students").doc(this.state.scannedstudentId).update({
            'NumberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
        })
        this.setState({
            scannedStudentId:'',
            scannedBookId:''
        })
    }
    render(){
        const hasCameraPermissions=this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;
        if (buttonState!=='normal'&&hasCameraPermissions){
            return(
               <BarCodeScanner onBarCodeScanned={scanned ?undefined:this.handleBarCodeScanned}style={StyleSheet.absoluteFillObject}></BarCodeScanner>
            )
        }
        else if(buttonState==='normal'){
return(
<View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
    <View>
        <Image source={require("../assets/booklogo.jpg")}style={{width:200,height:200}}/>
    </View>
<View style={styles.inputView}>
<TextInput style={styles.inputbox}placeholder="Book ID"value={this.state.scannedBookId}></TextInput>
<TouchableOpacity style={styles.ScanButton}onPress={()=>{this.getPermissionsAsync("BookId")}}>
<Text style={styles.buttontext}>Scan</Text>
</TouchableOpacity>
</View>
<View style={styles.inputView}>
<TextInput style={styles.inputbox}placeholder="Student ID"value={this.state.scannedStudentId}></TextInput>
<TouchableOpacity style={styles.ScanButton}onPress={()=>{this.getPermissionsAsync("StudentId")}}>
<Text style={styles.buttontext}>Scan</Text>
</TouchableOpacity>
</View>
<Text>{this.state.transactionMessage}</Text>
<TouchableOpacity style={styles.submitButton}onPress={async ()=>{var transactionMessage=await this.handletransaction()}}>
    <Text style={styles.submitButtonText}>Submit</Text>
</TouchableOpacity>
</View>
);
}
    }
}
const styles = StyleSheet.create({
    buttontext:{
        fontSize:20,
        textAlign:'center',
marginTop:10
    },
    ScanButton:{
        backgroundColor:"blue",
        padding:10,
        margin:10
    },
inputView:{
    flexDirection:'row',
    margin:20
},
inputbox:{
    width:200,
    height:40,
    borderWidth:1.5,
    borderRightWidth:0,
    fontSize:20
},
ScanButton:{
    backgroundColor:"green",
    width:50,
    borderWidth:1.5,
    borderLeftWidth:0
},
submitButton:{
    backgroundColor:'#0faf6d',
    width:100,
    height:50
},
submitButtonText:{
    padding:10,
    textAlign:'center',
    fontSize:20,
    fontWeight:'bold',
    color:'white'
}
})
