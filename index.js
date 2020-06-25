import './style.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from 'firebaseui';

const startRsvpButton = document.getElementById('startLogin');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

var rsvpListener = null;
var guestbookListener = null;

var firebaseConfig = {
    apiKey: "AIzaSyASKFYJa7hdAC1l_MbRrDwKTQtDrntedzo",
    authDomain: "fir-web-codelab-5313b.firebaseapp.com",
    databaseURL: "https://fir-web-codelab-5313b.firebaseio.com",
    projectId: "fir-web-codelab-5313b",
    storageBucket: "fir-web-codelab-5313b.appspot.com",
    messagingSenderId: "158087382594",
    appId: "1:158087382594:web:ccb63797165b92f7fb0fdb",
    measurementId: "G-3P4NWMFW6D"
  };
firebase.initializeApp(firebaseConfig);

const uiConfig = {
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl){
      return false;
    }
  }
};

const ui = new firebaseui.auth.AuthUI(firebase.auth());

startRsvpButton.addEventListener("click",
 () => {
    if (firebase.auth().currentUser) {
      firebase.auth().signOut();
    } else {
      ui.start("#firebaseui-auth-container", uiConfig);
    }
});

firebase.auth().onAuthStateChanged((user)=> {
  if (user){
  startRsvpButton.textContent = "LOGOUT";
  guestbookContainer.style.display = "block";
  subscribeGuestbook();
  subscribeCurrentRSVP(user);
}
else{
  startRsvpButton.textContent = "Login";
  guestbookContainer.style.display = "none";
  unsubscribeGuestbook();
  unsubscribeCurrentRSVP();
}
});

form.addEventListener("submit", (e) => {
 e.preventDefault();
 firebase.firestore().collection("guestbook").add({
   text: input.value,
   timestamp: Date.now(),
   name: firebase.auth().currentUser.displayName,
   userId: firebase.auth().currentUser.uid
 })
 input.value = ""; 
 return false;
});

firebase.firestore().collection("guestbook")
.orderBy("timestamp","desc")
.onSnapshot((snaps) => {
 guestbook.innerHTML = "";
 snaps.forEach((doc) => {
   const entry = document.createElement("p");
   entry.textContent = doc.data().name + ": " + doc.data().text;
   guestbook.appendChild(entry);
 });
});
function subscribeGuestbook(){
   // Create query for messages
 guestbookListener = firebase.firestore().collection("guestbook")
 .orderBy("timestamp","desc")
 .onSnapshot((snaps) => {
   // Reset page
   guestbook.innerHTML = "";
   // Loop through documents in database
   snaps.forEach((doc) => {
     // Create an HTML entry for each document and add it to the chat
     const entry = document.createElement("p");
     entry.textContent = doc.data().name + ": " + doc.data().text;
     guestbook.appendChild(entry);
   });
 });
};
function unsubscribeGuestbook(){
 if (guestbookListener != null)
 {
   guestbookListener();
   guestbookListener = null;
 }
};
rsvpYes.onclick = () => {
 const userDoc = firebase.firestore().collection('attendees').doc(firebase.auth().currentUser.uid);
 userDoc.set({
   attending: true
 }).catch(console.error)
}
rsvpNo.onclick = () => {
 const userDoc = firebase.firestore().collection('attendees').doc(firebase.auth().currentUser.uid);
 userDoc.set({
   attending: false
 }).catch(console.error)
}
function subscribeCurrentRSVP(user){
 rsvpListener = firebase.firestore()
 .collection('attendees')
 .doc(user.uid)
 .onSnapshot((doc) => {
   if (doc && doc.data()){
     const attendingResponse = doc.data().attending;
     if (attendingResponse){
       rsvpYes.className="clicked";
       rsvpNo.className="";
     }
     else{
       rsvpYes.className="";
       rsvpNo.className="clicked";
     }
   }
 });
}
function unsubscribeCurrentRSVP(){
 if (rsvpListener != null)
 {
   rsvpListener();
   rsvpListener = null;
 }
 rsvpYes.className="";
 rsvpNo.className="";
}