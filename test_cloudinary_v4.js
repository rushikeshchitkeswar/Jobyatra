const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'Backend', '.env') });
const { uploadFromBuffer } = require('./Backend/config/cloudinary');

async function testUpload() {
  try {
    // console.log('Testing Cloudinary upload...');
    const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

    const result = await uploadFromBuffer(buffer, {
      folder: 'jobyatra/test',
    });

    // console.log('Upload successful!');
    // console.log('URL:', result.secure_url);
    process.exit(0);
  } catch (error) {
    console.error('Upload failed!');
    console.error('Error:', error);
    process.exit(1);
  }
}

testUpload();
