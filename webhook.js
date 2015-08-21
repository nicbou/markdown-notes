// Watches GitHub webhooks sent on port 9001 and calls deploy.sh
// Requires `gith`

// Usage: `node webhook.js`
// Alternative usage: install `forever` from NPM and run `forever start webhook.js`

var gith = require('gith').create( 9001 );
var execFile = require('child_process').execFile;

console.log('Waiting for webhooks...');

gith({
    repo: 'nicbou/markdown-notes'
}).on( 'all', function( payload ) {
    console.log('Webhook received');
    execFile('./deploy.sh', function(error, stdout, stderr) {});
});
