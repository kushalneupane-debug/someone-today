var fs = require('fs');
var code = fs.readFileSync('server/index.js', 'utf8');
code = code.replace("r.end();\n});\n});", "r.end();\n});");
fs.writeFileSync('server/index.js', code);
console.log('Fixed - extra }); removed');
