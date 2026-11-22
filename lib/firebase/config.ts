import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:000000000000',
}

class FirebaseConfig {
  private static _instance: FirebaseConfig
  private _app: FirebaseApp
  private _auth: Auth
  private _db: Firestore
  private _storage: FirebaseStorage

  private constructor() {
    this._app = initializeApp(firebaseConfig)
    this._auth = getAuth(this._app)
    this._db = getFirestore(this._app)
    this._storage = getStorage(this._app)
  }

  public static getInstance(): FirebaseConfig {
    if (!FirebaseConfig._instance) {
      FirebaseConfig._instance = new FirebaseConfig()
    }
    return FirebaseConfig._instance
  }

  public get app(): FirebaseApp {
    return this._app
  }

  public get auth(): Auth {
    return this._auth
  }

  public get db(): Firestore {
    return this._db
  }

  public get storage(): FirebaseStorage {
    return this._storage
  }
}

const firebaseInstance = FirebaseConfig.getInstance()

export const app = firebaseInstance.app
export const auth = firebaseInstance.auth
export const db = firebaseInstance.db
export const storage = firebaseInstance.storage

export default FirebaseConfig
