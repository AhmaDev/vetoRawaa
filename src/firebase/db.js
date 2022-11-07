import firebase from 'firebase/app'
import 'firebase/firestore'


// var firebaseConfig = {
//   apiKey: "AIzaSyANUWMquGGkYJtSPZf6vOeBiHKf950x2c4",
//   authDomain: "vetoapp-314717.firebaseapp.com",
//   databaseURL: "https://vetoapp-314717-default-rtdb.firebaseio.com",
//   projectId: "vetoapp-314717",
//   storageBucket: "vetoapp-314717.appspot.com",
//   messagingSenderId: "460211909806",
//   appId: "1:460211909806:web:48239103b0b37a1781293f",
//   measurementId: "G-8CX9C3SWNE"
// };

export const db = firebase
  .initializeApp({ projectId: 'vetoapp-314717' })
  .firestore()