var swig = require('swig'),
    fs = require('fs');

var obj;
fs.readFile('output.json', 'utf8', function (err, data) {
    if (err) throw err;
    obj = JSON.parse(data);
    fs.writeFile('serve/index.html', swig.renderFile('templates/index.html', obj), function (err) {
        console.error(err)
    });
});


