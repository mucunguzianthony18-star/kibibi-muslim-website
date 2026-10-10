import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAmAbfg8m4ltO_BO8JISoUYoQcTrz5CKGk',
  authDomain: 'kibibi-muslim-website.firebaseapp.com',
  projectId: 'kibibi-muslim-website',
  storageBucket: 'kibibi-muslim-website.firebasestorage.app',
  messagingSenderId: '715519920552',
  appId: '1:715519920552:web:839765ca77df318833759d',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

// Cloudinary (photo storage)
export const cloudinary = {
  cloudName: 'frzkvtu3',
  uploadPreset: 'kibibi_unsigned',
}
