import React from 'react'
import {Text,View,TouchableOpacity,StyleSheet,TextInput,Image,KeyboardAvoidingView, Alert} from 'react-native'
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
          var transactionType=await this.checkBookEligibility();
          if(!transactionType){
              Alert.alert("The Book Does Not Exist In The Library")
              this.setState({
                  scannedStudentId:'',
                  scannedBookId:''
              })
          }
          else if(transactionType==='Issue'){
              var isStudentEligible=await this.checkStudentEligibilityForBookIssue();
              if(isStudentEligible){
                  this.initiateBookIssue()
                  Alert.alert("Book Issued To The Student")
              }
          }
          else{
              var isStudentEligible=await this.checkStudentEligibilityForBookReturn();
              if(isStudentEligible){
                this.initiateBookReturn()
                Alert.alert("Book Returned To The Student")
            }
          }
    }
    checkBookEligibility=async()=>{
        const bookref = await db.collection("books").where("bookId","==",this.state.scannedBookId).get();
        var transactionType = ''
        if(bookref.docs.length===0){
            transactionType=false;
        }
        else{
            bookref.docs.map((doc)=>{
var book = doc.data();
if(book.bookAvailability){
    transactionType = 'Issue'
}
else{transactionType = 'Return'}
            })
        }
        return transactionType;
    }
    checkStudentEligibilityForBookIssue = async()=>{
        const studentref = await db.collection("students").where("studentId","==",this.state.scannedStudentId).get();
        var isStudentEligible = ''
        if(studentref.docs.length===0){
           this.setState({
               scannedStudentId:'',
               scannedBookId:''            
           })
           isStudentEligible = false
           Alert.alert("The Student Id Does Not Exist In The DataBase")
        }
        else{
            studentref.docs.map((doc)=>{
                var student=doc.data();
                if(student.numberOfBooksIssued<2){
                    isStudentEligible=true
                }
                else{
                    isStudentEligible=false
                    Alert.alert("The Student Has Already Issued Two Books")
                    this.setState({
                        scannedBookId:'',
                        scannedStudentId:''
                    })
                }
            })
        }
        return isStudentEligible;
    }
    checkStudentEligibilityForBookReturn = async()=>{
        const transactionref = await db.collection("transactions").where("bookId","==",this.state.scannedBookId).limit(1).get();
      var isStudentEligible = ''
      transactionref.docs.map((doc)=>{
var lastbooktransaction = doc.data();
if(lastbooktransaction.studentId===this.state.scannedStudentId){
    isStudentEligible=true
}
else{
    isStudentEligible=false
    Alert.alert("The Book Was Not Issued By The Student")
    this.setState({
        scannedStudentId:'',
        scannedBookId:''
    })
}
      })
      return isStudentEligible;
    }
    initiateBookIssue = async ()=>{
        //add a transaction
        db.collection("transactions").add({
          'studentId' : this.state.scannedStudentId,
          'bookId' : this.state.scannedBookId,
          'date' : firebase.firestore.Timestamp.now().toDate(),
          'transactionType' : "Issue"
        })
    
        //change book status
        db.collection("books").doc(this.state.scannedBookId).update({
          'bookAvailability' : false
        })
        //change number of issued books for student
        db.collection("students").doc(this.state.scannedStudentId).update({
          'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(1)
        })
    
        this.setState({
          scannedStudentId : '',
          scannedBookId: ''
        })
      }
    
      initiateBookReturn = async ()=>{
        //add a transaction
        db.collection("transactions").add({
          'studentId' : this.state.scannedStudentId,
          'bookId' : this.state.scannedBookId,
          'date'   : firebase.firestore.Timestamp.now().toDate(),
          'transactionType' : "Return"
        })
    
        //change book status
        db.collection("books").doc(this.state.scannedBookId).update({
          'bookAvailability' : true
        })
    
        //change book status
        db.collection("students").doc(this.state.scannedStudentId).update({
          'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(-1)
        })
    
        this.setState({
          scannedStudentId : '',
          scannedBookId : ''
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
    <KeyboardAvoidingView behavior='padding'style={styles.container}>
    <View>
        <Image source={require("../assets/booklogo.jpg")}style={{width:200,height:200}}/>
    </View>
<View style={styles.inputView}>
<TextInput style={styles.inputbox}placeholder="Book ID"value={this.state.scannedBookId}onChangeText={(text)=>{
this.setState({
    scannedBookId:text
})
}}></TextInput>
<TouchableOpacity style={styles.ScanButton}onPress={()=>{this.getPermissionsAsync("BookId")}}>
<Text style={styles.buttontext}>Scan</Text>
</TouchableOpacity>
</View>
<View style={styles.inputView}>
<TextInput style={styles.inputbox}placeholder="Student ID"value={this.state.scannedStudentId}onChangeText={(text)=>{
    this.setState({
        scannedStudentId:text
    })
}}></TextInput>
<TouchableOpacity style={styles.ScanButton}onPress={()=>{this.getPermissionsAsync("StudentId")}}>
<Text style={styles.buttontext}>Scan</Text>
</TouchableOpacity>
</View>
<Text>{this.state.transactionMessage}</Text>
<TouchableOpacity style={styles.submitButton}onPress={async ()=>{var transactionMessage=await this.handletransaction()}}>
    <Text style={styles.submitButtonText}>Submit</Text>
</TouchableOpacity>
</KeyboardAvoidingView>
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
},
container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
},
})