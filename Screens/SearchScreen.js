import React from 'react'
import {Text,View,TextInput,TouchableOpacity,FlatList,StyleSheet} from 'react-native'
import db from '../config'

export default class SearchScreen extends React.Component{
    constructor(props){
        super(props);
this.state = {
    alltransaction:[],
    search:'',
    lastVisibleTransaction:null
}
    }
    searchTransaction=async(text)=>{
var enteredText = text.split("")
var text = text.toUpperCase()
if(enteredText[0].toUpperCase()==='B'){
    const transaction = await db.collection("transactions").where("bookId",'==',text).get()
    transaction.docs.map((doc)=>{
        this.setState({
            alltransaction:[...this.state.alltransaction,doc.data()],
            lastVisibleTransaction:doc
        })
    })
}
    if(enteredText[0].toUpperCase()==='S'){
        const transaction = await db.collection("transactions").where("studentId",'==',text).get()
        transaction.docs.map((doc)=>{
            this.setState({
                alltransaction:[...this.state.alltransaction,doc.data()],
                lastVisibleTransaction:doc
            })
        })
    }
    }
    fetchMoreTransaction=async()=>{
        var text = this.state.search.toUpperCase()
        var enteredText = text.split("")
        if(enteredText[0].toUpperCase()==='B'){
            const transaction = await db.collection("transactions").where("bookId",'==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
            transaction.docs.map((doc)=>{
                this.setState({
                    alltransaction:[...this.state.alltransaction,doc.data()],
                    lastVisibleTransaction:doc
                })
            })
        }
            if(enteredText[0].toUpperCase()==='S'){
                const transaction = await db.collection("transactions").where("studentId",'==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
                transaction.docs.map((doc)=>{
                    this.setState({
                        alltransaction:[...this.state.alltransaction,doc.data()],
                        lastVisibleTransaction:doc
                    })
                })
            }
            }
      componentDidMount=async()=>{
          const query = await db.collection("transactions").limit(10).get(
              query.docs.map((doc)=>{
                  this.setState({
                     alltransaction:[],
                     lastVisibleTransaction:doc
                  })
              })
          )
      }
   
    render(){
return(
<View style={styles.container}>
<View style={styles.searchbar}>
    <TextInput style={styles.bar}placeholder="Book ID or Student ID"onChangeText={(text)=>{this.setState({
        search:text
    })}}></TextInput>
    <TouchableOpacity style={styles.searchbutton}onPress={()=>{
        this.searchTransaction(this.state.search)
        
    }}>
        <Text>Search</Text>
    </TouchableOpacity>
</View>
<FlatList data={this.state.alltransaction}
renderItem={({item})=>(
<View style={{borderBottomWidth:2}}>
<Text>{'Book ID:'+item.bookId}</Text>
<Text>{'Student Id:'+item.studentId}</Text>
<Text>{'Transaction Type:'+item.transactionType}</Text>
<Text>{'Date:'+item.date.toDate()}</Text>
</View>
)} keyExtractor={(item,index)=>index.toString()} onEndReached={this.fetchMoreTransactions} onEndReachedThreshold={0.7}>
    
</FlatList>
</View>
);
    }
}
const styles = StyleSheet.create({
    container:{
        flex:1,
        marginTop:20
    },
    searchbar:{
flexDirection:'row',
height:40,
width:'auto',
borderWidth:0.5,
alignItems:'center',
backgroundColor:'gray'
    },
    bar:{
borderWidth:2,
height:30,
width:300,
paddingLeft:10
    },
    searchbutton:{
        borderWidth:1,
        height:30,
        width:50,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'green'
    }
})