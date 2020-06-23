import * as firebase from 'firebase'
require ('@firebase/firestore')
 // Your web app's Firebase configuration
 var firebaseConfig = {
    apiKey: "AIzaSyBbJHe_oJaLqCoG5OiGwKRZymmsg6-8p0Y",
    authDomain: "wily-b112c.firebaseapp.com",
    databaseURL: "https://wily-b112c.firebaseio.com",
    projectId: "wily-b112c",
    storageBucket: "wily-b112c.appspot.com",
    messagingSenderId: "144528358994",
    appId: "1:144528358994:web:337d48428daf9a21ebe98b"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore()