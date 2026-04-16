var fs = require('fs');
var code = fs.readFileSync('server/index.js', 'utf8');
var oldBlock = code.match(/app\.get\('\/api\/test-telegram'[\s\S]*?\}\);/);
if (oldBlock) {
  var newBlock = "app.get('/api/test-telegram', function(req, res) {\n" +
    "  var botToken = process.env.TELEGRAM_BOT_TOKEN;\n" +
    "  var chatId = process.env.TELEGRAM_CHAT_ID;\n" +
    "  if (!botToken || !chatId) {\n" +
    "    return res.json({ ok: false, error: 'Missing env vars', hasBotToken: Boolean(botToken), hasChatId: Boolean(chatId) });\n" +
    "  }\n" +
    "  var text = 'Test notification - Someone Today is working';\n" +
    "  var body = JSON.stringify({ chat_id: chatId, text: text });\n" +
    "  var options = {\n" +
    "    hostname: 'api.telegram.org',\n" +
    "    path: '/bot' + botToken + '/sendMessage',\n" +
    "    method: 'POST',\n" +
    "    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }\n" +
    "  };\n" +
    "  var r = require('https').request(options, function(resp) {\n" +
    "    var d = '';\n" +
    "    resp.on('data', function(c) { d += c; });\n" +
    "    resp.on('end', function() {\n" +
    "      res.json({ ok: resp.statusCode === 200, statusCode: resp.statusCode, telegram: JSON.parse(d) });\n" +
    "    });\n" +
    "  });\n" +
    "  r.on('error', function(e) { res.json({ ok: false, error: e.message }); });\n" +
    "  r.write(body);\n" +
    "  r.end();\n" +
    "});";
  code = code.replace(oldBlock[0], newBlock);
  fs.writeFileSync('server/index.js', code);
  console.log('Done - test endpoint updated');
} else {
  console.log('Could not find test endpoint');
}
