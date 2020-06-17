import React from 'react'
import {Text,View,TouchableOpacity,StyleSheet} from 'react-native'
import * as Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner'

export default class TransactionScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            hasCameraPermissions:null,
            scanned:false,
scannedData:"",
buttonState:'normal'
        }
    }
    getPermissionsAsync = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermissions: status === 'granted',buttonState:'clicked',scanned:false});
      };
      handleBarCodeScanned=async({type,data})=>{
          this.setState({
              scanned:true,
              scannedData:data,
              buttonState:'normal'
          })
      }
    render(){
        const hasCameraPermissions=this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;
        if (buttonState==='clicked'&&hasCameraPermissions){
            return(
               <BarCodeScanner onBarCodeScanned={scanned ?undefined:this.handleBarCodeScanned}style={StyleSheet.absoluteFillObject}></BarCodeScanner>
            )
        }
        else if(buttonState==='normal'){

        
return(
<View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
<Text style={{fontSize:15,textDecorationLine:'underline'}}>{hasCameraPermissions===true ? this.state.scannedData:"request camera permissions"}</Text>
<TouchableOpacity style={styles.ScanButton}onPress={this.getPermissionsAsync}>
<Text style={styles.buttontext}>Scan QR Code</Text>
</TouchableOpacity>
</View>
);
        }
    }
}
const styles = StyleSheet.create({
    buttontext:{
        fontSize:20
    },
    ScanButton:{
        backgroundColor:"blue",
        padding:10,
        margin:10
    },
})