const fs = require('fs');
const [file, b64] = process.argv.slice(2);
fs.writeFileSync(file, Buffer.from(b64, 'base64').toString('utf8'));
console.log('Wrote ' + file);