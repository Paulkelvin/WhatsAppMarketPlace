import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import fs from 'fs';
import { handleIncomingMessage } from './handlers/message.js';
import { connectDB } from '../services/database.js';
import { initializeGemini } from '../services/gemini.js';
import { updateQR } from '../index.js';
import { useMongoAuthState } from '../services/mongoAuth.js';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info'
});

let sock;
let isConnected = false;
let hasNotifiedAdmin = false; // Track if admin was notified

/**
 * Initialize WhatsApp Bot
 */
export const initializeBot = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Initialize AI
    initializeGemini();

    // Clear MongoDB auth if forced reset
    if (process.env.RESET_AUTH === 'true') {
      logger.info('🔄 Clearing MongoDB authentication...');
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db('techhub');
      await db.collection('whatsapp_auth').deleteMany({});
      await client.close();
      logger.info('✅ MongoDB auth cleared');
    }

    // Use MongoDB for auth state (persists across Railway restarts)
    const { state, saveCreds } = await useMongoAuthState(
      process.env.MONGODB_URI,
      process.env.SESSION_NAME || 'techhub-session'
    );
    
    // Fetch latest Baileys version
    const { version, isLatest } = await fetchLatestBaileysVersion();
    logger.info(`Using Baileys v${version.join('.')}, isLatest: ${isLatest}`);

    // Use pairing code if phone number is provided
    const usePairingCode = true; // Switch back to pairing code
    const pairingNumber = process.env.BUSINESS_PHONE?.replace(/[^0-9]/g, ''); // Remove non-digits

    logger.info(`Pairing mode: ${usePairingCode ? 'CODE' : 'QR'}, Phone: ${pairingNumber || 'N/A'}`);

    // Create WhatsApp socket
    sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: true, // Always print QR
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger)
      },
      generateHighQualityLinkPreview: true,
      markOnlineOnConnect: true,
      defaultQueryTimeoutMs: 60000,
      browser: ['TechHub Marketplace', 'Chrome', '1.0.0']
    });

    // Save credentials whenever they're updated
    sock.ev.on('creds.update', saveCreds);

    // Request pairing code if enabled
    if (usePairingCode && !sock.authState.creds.registered && pairingNumber) {
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(pairingNumber);
          logger.info(`🔐 Pairing Code: ${code}`);
          console.log('\n═══════════════════════════════════════');
          console.log('📱 PAIRING CODE FOR WHATSAPP');
          console.log('═══════════════════════════════════════');
          console.log(`\n   CODE: ${code}\n`);
          console.log('Instructions:');
          console.log('1. Open WhatsApp on phone: ' + pairingNumber);
          console.log('2. Go to Settings > Linked Devices');
          console.log('3. Tap "Link a Device"');
          console.log('4. Tap "Link with phone number instead"');
          console.log('5. Enter this code: ' + code);
          console.log('\n🌐 Or visit: https://web-whatsappmarketplace-env.up.railway.app/code');
          console.log('═══════════════════════════════════════\n');
          
          // Send code to web endpoint
          updateQR(code);
        } catch (error) {
          logger.error('Failed to request pairing code:', error);
        }
      }, 3000);
    }

    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // Show QR code for pairing (fallback)
      if (qr && !usePairingCode) {
        // Send QR to web endpoint
        updateQR(qr);
        
        console.log('\n📱 Scan this QR code with WhatsApp:\n');
        qrcode.generate(qr, { small: true });
        console.log('\nOpen WhatsApp > Linked Devices > Link a Device\n');
        console.log(`\n🌐 Or visit: https://web-whatsappmarketplace-env.up.railway.app/qr\n`);
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        
        logger.info(`Connection closed. Status code: ${statusCode}, Reconnect: ${shouldReconnect}`);
        
        if (shouldReconnect) {
          // Reconnect after 10 seconds to avoid rapid reconnects
          setTimeout(() => {
            logger.info('Attempting to reconnect...');
            initializeBot();
          }, 10000);
        } else {
          logger.error('Logged out. Please delete auth_info_baileys folder and restart.');
          process.exit(0);
        }
        
        isConnected = false;
      } else if (connection === 'open') {
        isConnected = true;
        logger.info('✅ WhatsApp Bot Connected Successfully!');
        console.log('\n🚀 TechHub WhatsApp Marketplace is now LIVE!\n');
        console.log('Ready to receive messages...\n');
        
        // Send startup notification to admin only once
        const adminPhone = process.env.ADMIN_PHONE;
        if (adminPhone && !hasNotifiedAdmin) {
          hasNotifiedAdmin = true;
          await sendMessage(adminPhone, '🤖 *TechHub Bot Online*\n\nMarketplace automation is now active and ready to serve customers! 🚀');
        }
      }
    });

    // Handle incoming messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type === 'notify') {
        for (const message of messages) {
          // Ignore messages from self
          if (message.key.fromMe) continue;
          
          // Ignore group messages (optional - comment out to allow groups)
          if (message.key.remoteJid.includes('@g.us')) continue;

          // Handle the message
          await handleIncomingMessage(sock, message);
        }
      }
    });

    // Handle message updates (read receipts, etc.)
    sock.ev.on('messages.update', (updates) => {
      for (const update of updates) {
        logger.debug('Message update:', update);
      }
    });

    // Handle presence updates (online/offline)
    sock.ev.on('presence.update', ({ id, presences }) => {
      logger.debug(`Presence update for ${id}:`, presences);
    });

  } catch (error) {
    logger.error('Bot initialization error:', error);
    
    // Retry after 10 seconds
    setTimeout(() => {
      logger.info('Retrying bot initialization...');
      initializeBot();
    }, 10000);
  }
};

/**
 * Send text message
 * @param {string} jid - WhatsApp JID (phone number)
 * @param {string} text - Message text
 * @returns {Promise<Object>} Sent message
 */
export const sendMessage = async (jid, text) => {
  try {
    if (!isConnected) {
      throw new Error('Bot is not connected');
    }

    // Ensure JID is properly formatted
    const formattedJid = jid.includes('@s.whatsapp.net') ? jid : `${jid}@s.whatsapp.net`;

    const message = await sock.sendMessage(formattedJid, { text });
    logger.info(`Message sent to ${jid}`);
    
    return message;
  } catch (error) {
    logger.error(`Failed to send message to ${jid}:`, error);
    throw error;
  }
};

/**
 * Send message with image
 * @param {string} jid - WhatsApp JID
 * @param {string} imageUrl - Image URL
 * @param {string} caption - Image caption
 * @returns {Promise<Object>} Sent message
 */
export const sendImageMessage = async (jid, imageUrl, caption = '') => {
  try {
    if (!isConnected) {
      throw new Error('Bot is not connected');
    }

    const formattedJid = jid.includes('@s.whatsapp.net') ? jid : `${jid}@s.whatsapp.net`;

    const message = await sock.sendMessage(formattedJid, {
      image: { url: imageUrl },
      caption
    });
    
    logger.info(`Image message sent to ${jid}`);
    return message;
  } catch (error) {
    logger.error(`Failed to send image to ${jid}:`, error);
    throw error;
  }
};

/**
 * Send message with buttons
 * @param {string} jid - WhatsApp JID
 * @param {string} text - Message text
 * @param {Array} buttons - Array of button objects
 * @returns {Promise<Object>} Sent message
 */
export const sendButtonMessage = async (jid, text, buttons) => {
  try {
    if (!isConnected) {
      throw new Error('Bot is not connected');
    }

    const formattedJid = jid.includes('@s.whatsapp.net') ? jid : `${jid}@s.whatsapp.net`;

    const buttonMessage = {
      text,
      footer: 'TechHub Nigeria',
      buttons: buttons.map((btn, index) => ({
        buttonId: `btn_${index}`,
        buttonText: { displayText: btn },
        type: 1
      })),
      headerType: 1
    };

    const message = await sock.sendMessage(formattedJid, buttonMessage);
    logger.info(`Button message sent to ${jid}`);
    
    return message;
  } catch (error) {
    logger.error(`Failed to send button message to ${jid}:`, error);
    // Fallback to regular message
    return sendMessage(jid, text);
  }
};

/**
 * Send typing indicator
 * @param {string} jid - WhatsApp JID
 * @param {boolean} isTyping - Whether typing or not
 */
export const sendTyping = async (jid, isTyping = true) => {
  try {
    if (!isConnected) return;

    const formattedJid = jid.includes('@s.whatsapp.net') ? jid : `${jid}@s.whatsapp.net`;

    await sock.sendPresenceUpdate(isTyping ? 'composing' : 'paused', formattedJid);
  } catch (error) {
    logger.error('Failed to send typing indicator:', error);
  }
};

/**
 * Mark message as read
 * @param {string} jid - WhatsApp JID
 * @param {Object} messageKey - Message key
 */
export const markAsRead = async (jid, messageKey) => {
  try {
    if (!isConnected) return;

    await sock.readMessages([messageKey]);
  } catch (error) {
    logger.error('Failed to mark message as read:', error);
  }
};

/**
 * Get connection status
 * @returns {Object} Connection status
 */
export const getConnectionStatus = () => {
  return {
    isConnected,
    socket: sock ? 'initialized' : 'not initialized'
  };
};

/**
 * Broadcast message to multiple recipients
 * @param {Array} jids - Array of WhatsApp JIDs
 * @param {string} text - Message text
 * @returns {Promise<Array>} Array of sent messages
 */
export const broadcastMessage = async (jids, text) => {
  try {
    const promises = jids.map(jid => sendMessage(jid, text));
    const results = await Promise.allSettled(promises);
    
    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    logger.info(`Broadcast complete: ${sent} sent, ${failed} failed`);
    return results;
  } catch (error) {
    logger.error('Broadcast error:', error);
    throw error;
  }
};

/**
 * Download media from message
 * @param {Object} message - WhatsApp message
 * @returns {Promise<Buffer>} Media buffer
 */
export const downloadMedia = async (message) => {
  try {
    const buffer = await sock.downloadMediaMessage(message);
    return buffer;
  } catch (error) {
    logger.error('Media download error:', error);
    throw error;
  }
};

export default {
  initializeBot,
  sendMessage,
  sendImageMessage,
  sendButtonMessage,
  sendTyping,
  markAsRead,
  getConnectionStatus,
  broadcastMessage,
  downloadMedia
};
