// Listen on port 9001
var gith = require('gith').create( 9001 );
// Import execFile, to run our bash script
var execFile = require('child_process').execFile;

console.log('Waiting for webhooks');

gith({
    repo: 'nicbou/markdown-notes'
}).on( 'all', function( payload ) {
    console.log('hook received');
    execFile('./deploy.sh', function(error, stdout, stderr) {});
});
