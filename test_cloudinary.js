require('dotenv').config({ path: './Backend/.env' });
const { uploadFromBuffer } = require('./Backend/config/cloudinary');
const fs = require('fs');

async function testUpload() {
  try {
    console.log('Testing Cloudinary upload...');
    // Create a tiny dummy buffer (a 1x1 transparent pixel)
    const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    const result = await uploadFromBuffer(buffer, {
      folder: 'jobyatra/test',
    });
    
    console.log('Upload successful!');
    console.log('URL:', result.secure_url);
    process.exit(0);
  } catch (error) {
    console.error('Upload failed!');
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.error('Error message:', error.message);
    process.exit(1);
  }
}

testUpload();
