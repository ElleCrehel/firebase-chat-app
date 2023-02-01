// DOM
const loginToRegister: any = document.querySelector(
  ".login-register__register-button"
);
const registerToLogin: any = document.querySelector(
  ".register-login__login-button"
);
const signInForm: any = document.querySelector(".loginForm");
const signInPage: any = document.querySelector(".login");
const registerPage: any = document.querySelector(".registerPage");
const loginbtn: any = document.querySelector(".login-button");
const registerbtn: any = document.querySelector(".register-button");
const loggedInPage: any = document.querySelector(".logged-in");
const logoutbtn: any = document.querySelector(".logout-button");
const registerForm: any = document.querySelector(".register");
const divWrongEmailOrPass = document.querySelector(".divWrongEmailOrPass");
const googlebutton = document.querySelector(".google-logo");
const addChatRoomForm: any = document.querySelector(".add");
const deleteChatRoomForm: any = document.querySelector(".delete");
const messageScreen: any = document.querySelector(".messages");
const showMessage: any = document.querySelector(".showMessages");
const addMessageForm: any = document.querySelector(".addMessage");

import { initializeApp } from "firebase/app";

import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  Query,
  DocumentData,
  orderBy,
  getDocs,
} from "firebase/firestore";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBlJ65agq-AQz6RtAuY89YsFtL6zUo-lJU",
  authDomain: "mobdevopdracht2.firebaseapp.com",
  databaseURL:
    "https://mobdevopdracht2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mobdevopdracht2",
  storageBucket: "mobdevopdracht2.appspot.com",
  messagingSenderId: "366483751333",
  appId: "1:366483751333:web:d021a9292044690c5ee84c",
  measurementId: "G-86RPEEMP8S",
};

// init firebase
initializeApp(firebaseConfig);

// init services
const auth = getAuth();
const db = getFirestore();

// collection reference
const colRef = collection(db, "groups");
const messagesRef = collection(db, "messages");

// REGISTER USER

registerForm?.addEventListener("submit", (e: any) => {
  // console.log('test');
  // console.log(registerForm);
  e.preventDefault();

  const email = registerForm.email.value;
  const password = registerForm.password.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log("user created:", cred.user);
      registerForm.reset();
    })
    .catch((err) => {
      console.log(err.message);
      let showErrorEmailAlreadyInUse = document.createElement("p");
      showErrorEmailAlreadyInUse.classList.add("error-messages");
      showErrorEmailAlreadyInUse.innerHTML = `<p> Sorry, this email is already in use</p>`;
      const divErrorMessage = document.querySelector(".error-message");
      divErrorMessage.appendChild(showErrorEmailAlreadyInUse);
    });
});

// LOGGING IN
signInForm.addEventListener("submit", (e: any) => {
  e.preventDefault();

  const email = signInForm.email.value;
  const password = signInForm.password.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log("user logged in:", cred.user);
      changeScreen(loggedInPage);
      signInForm.reset();
    })
    .catch((err) => {
      console.log(err.message);
      let wrongEmailOrPass = document.createElement("p");
      wrongEmailOrPass.classList.add("wrong-email-or-pass");
      wrongEmailOrPass.innerHTML = `<p> Wrong email or password</p>`;
      divWrongEmailOrPass.appendChild(wrongEmailOrPass);
      signInForm.reset();
    });
});

// LOGGING OUT
logoutbtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("user signed out");
      changeScreen(signInPage);
      signInForm.classList.remove(".hidden");
    })
    .catch((err) => {
      console.log(err.message);
    });
});

// SIGNING UP WITH GOOGLE

let loginWithGoogle = () => {
  let provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(() => {
      console.log("you are logged in with google");
    })
    .catch((err) => {
      console.log(err.message);
      console.log("try again");
    });
};
googlebutton.addEventListener("click", loginWithGoogle);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// CHANGING PAGES
// put all the pages here
const pages = [registerPage, loggedInPage, signInPage, messageScreen];

// function for navigating trough pages
const changeScreen = (destinationScreen: any) => {
  destinationScreen.classList.remove("hidden");

  pages.map((page) => {
    if (page !== destinationScreen) {
      page.classList.add("hidden");
    }
  });
};

// function to change between login and register page
function Changescreens() {
  loginToRegister.addEventListener("click", async function () {
    changeScreen(registerPage);
  });
  registerToLogin.addEventListener("click", async function () {
    changeScreen(signInPage);
  });

  registerbtn.addEventListener("click", async function () {
    changeScreen(loggedInPage);
  });

  googlebutton.addEventListener("click", async function () {
    changeScreen(loggedInPage);
  });

  
}

Changescreens();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* LOGGED IN */

// get collection data
onSnapshot(colRef, (snapchot) => {
  let groups: any = [];

  snapchot.docs.forEach((doc) => {
    groups.push({ ...doc.data(), id: doc.id });

    document.querySelector(".groups").innerHTML = "";

    groups.forEach((doc: any) => {
      // log the group id
      // console.log(doc.id)
      const groupId = doc?.id;

      const groupName = doc?.chatname;

      // show data in html

      let creategroup = document.createElement("p");
      creategroup.classList.add("html");
      creategroup.setAttribute("data-id", groupId);

      // creategroup.innerHTML = `<p>${groupId} </p>`
      creategroup.innerHTML = `<button class="oneGroup"><p class="showId hidden">${groupId}<p>Groupname: ${groupName}</button> `;

      let reference = document.querySelector(".groups");

      reference.appendChild(creategroup);
    });

    const ShowGoupId: any = document.querySelectorAll(".html");
    ShowGoupId.forEach((el: any) => {
      el.addEventListener("click", function () {
        // console.log(el.getAttribute('data-id'));
        localStorage.setItem("group_id", el.getAttribute("data-id"));
        const currentgroupid: any = localStorage.getItem("group_id");
        //console.log(currentgroupid);

        getMessages(currentgroupid);
      });
    });
  });
});

const getMessages = (chatroomId: string): void => {
  let q: Query<DocumentData> = query(
    messagesRef,
    where("chatroomId", "==", chatroomId));
  
    changeScreen(messageScreen);

onSnapshot(q,(snapchot)=> {
  let messages:any = [];
  snapchot.docs.forEach((doc)=> {
  messages.push({ ...doc.data(), id: doc.id})

     localStorage.setItem("all-messages",doc?.data().chat) ;
  
    
  })
 console.log('test');
 
})



addMessageForm.addEventListener("submit", (e: any) =>{
  
  e.preventDefault();
  
  addDoc(messagesRef, {
    chat: addMessageForm.message?.value,
    chatroomId: degroepid,
  }).then(() => {

    const allmessages =localStorage.getItem("all-messages")
console.log(allmessages);
      
      
      let createMessages = document.createElement("p");
      createMessages.classList.add("message");
      createMessages.setAttribute("chat-chat", allmessages);
      createMessages.innerHTML = `<p>${allmessages}</p>`;
     
      showMessage.appendChild(createMessages);
      const chat = addMessageForm.message.value;
      let createMessage = document.createElement("p");
      createMessage.classList.add("message");
      createMessage.setAttribute("chat-chat", chat);
      createMessage.innerHTML = `<p>${chat}</p>`;
      showMessage.appendChild(createMessage);

      console.log("gelukt");
      addMessageForm.reset();
      console.log(chat);

      });
})

};
/*
*/

// adding documents
const degroepid = localStorage.getItem("group_id");
console.log(degroepid);

addChatRoomForm.addEventListener("submit", (e: any) => {
  e.preventDefault();
  addDoc(colRef, {
    chatname: addChatRoomForm.chatname?.value,
    chatroom: degroepid,
  });
  addDoc(messagesRef, {
    chatroomId: degroepid,
  }).then(() => {
    // wat er dan moet gebeuren
    addChatRoomForm.reset();
  });
});

// deleting documents
deleteChatRoomForm.addEventListener("submit", (e: any) => {
  e.preventDefault();

  const docRef = doc(db, "groups", deleteChatRoomForm.id.value);
  //const deleteMessage = doc(db,'messages',groupId)
  deleteDoc(docRef)
    //deleteDoc(deleteMessage)
    .then(() => {
      deleteChatRoomForm.reset();
    });
});

// function to send a message