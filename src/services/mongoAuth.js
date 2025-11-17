import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

let client;
let db;
let collection;

/**
 * Initialize MongoDB auth storage
 */
export const initMongoAuth = async (mongoUri) => {
  if (!client) {
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db('techhub');
    collection = db.collection('whatsapp_auth');
    console.log('✅ MongoDB auth storage initialized');
  }
  return { saveAuth, loadAuth };
};

/**
 * Save auth state to MongoDB
 */
const saveAuth = async (sessionId, authState) => {
  try {
    await collection.updateOne(
      { sessionId },
      { 
        $set: { 
          authState, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );
    console.log('✅ Auth state saved to MongoDB');
  } catch (error) {
    console.error('❌ Failed to save auth state:', error);
  }
};

/**
 * Load auth state from MongoDB
 */
const loadAuth = async (sessionId) => {
  try {
    const doc = await collection.findOne({ sessionId });
    if (doc && doc.authState) {
      console.log('✅ Auth state loaded from MongoDB');
      return doc.authState;
    }
    console.log('ℹ️ No auth state found in MongoDB');
    return null;
  } catch (error) {
    console.error('❌ Failed to load auth state:', error);
    return null;
  }
};

/**
 * Use MongoDB for Baileys auth state
 */
export const useMongoAuthState = async (mongoUri, sessionId = 'default') => {
  const { saveAuth, loadAuth } = await initMongoAuth(mongoUri);
  
  // Load existing auth from MongoDB
  const savedState = await loadAuth(sessionId);
  
  let creds;
  let keys = {};

  if (savedState) {
    creds = savedState.creds || { noiseKey: null, signedIdentityKey: null, signedPreKey: null };
    keys = savedState.keys || {};
  } else {
    // Initialize new credentials
    creds = { noiseKey: null, signedIdentityKey: null, signedPreKey: null };
  }

  const saveCreds = async () => {
    await saveAuth(sessionId, { creds, keys });
  };

  return {
    state: { creds, keys },
    saveCreds
  };
};
