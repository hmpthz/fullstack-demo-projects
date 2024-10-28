const fs = require('fs');
console.log(process.cwd());

if (fs.existsSync('dist')) {
    fs.rmdirSync('dist', { recursive: true, force: true })
}
fs.renameSync('client/dist', 'dist');
if (!fs.existsSync('dist/api')) {
    fs.mkdirSync('dist/api');
}
fs.renameSync('server/dist/index.js', 'dist/api/index.js');

console.log('postintall completed.')
process.exit(0);