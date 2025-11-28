
import * as firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBaczr5msWHwCZeV0d8P6NZyDyJbevYoT0",
  authDomain: "food-y5lvgh.firebaseapp.com",
  projectId: "food-y5lvgh",
  storageBucket: "food-y5lvgh.appspot.com",
  messagingSenderId: "667734786563",
  appId: "1:667734786563:web:c47fd0d1dcc563bf564436"
};

// Inicializa o Firebase (Compat)
// Acessando .default para garantir compatibilidade com import * as
const app = (firebase as any).default.initializeApp(firebaseConfig);
export const auth = app.auth();
export const db = app.firestore();

export default app;