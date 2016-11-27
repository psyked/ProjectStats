var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname + "/serve")).listen(9000);