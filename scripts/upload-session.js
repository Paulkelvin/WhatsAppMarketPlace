import 'dotenv/config';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

/**
 * Upload local auth_info_baileys session to MongoDB
 */
const uploadSession = async () => {
  try {
    console.log('📤 Uploading WhatsApp session to MongoDB...');
    
    const authDir = 'auth_info_baileys';
    
    if (!fs.existsSync(authDir)) {
      console.error('❌ No local session found. Please connect WhatsApp first.');
      process.exit(1);
    }
    
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('techhub');
    const collection = db.collection('whatsapp_auth');
    
    // Read all session files
    const files = fs.readdirSync(authDir);
    const sessionData = {};
    
    for (const file of files) {
      const filePath = path.join(authDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      try {
        sessionData[file] = JSON.parse(content);
      } catch (e) {
        console.warn(`⚠️ Skipping non-JSON file: ${file}`);
      }
    }
    
    // Prepare auth state structure
    const authState = {
      creds: sessionData['creds.json'] || {},
      keys: {}
    };
    
    // Add all keys
    for (const [filename, data] of Object.entries(sessionData)) {
      if (filename !== 'creds.json') {
        authState.keys[filename.replace('.json', '')] = data;
      }
    }
    
    // Upload to MongoDB
    await collection.updateOne(
      { sessionId: process.env.SESSION_NAME || 'techhub-session' },
      { 
        $set: { 
          authState,
          updatedAt: new Date(),
          uploadedFrom: 'local'
        } 
      },
      { upsert: true }
    );
    
    console.log('✅ Session uploaded successfully!');
    console.log(`📁 Files uploaded: ${Object.keys(sessionData).length}`);
    console.log('🚀 You can now deploy to Railway');
    
    await client.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Failed to upload session:', error);
    process.exit(1);
  }
};

uploadSession();
