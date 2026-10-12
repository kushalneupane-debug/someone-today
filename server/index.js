var express = require('express');
var path = require('path');
var lettersRouter = require('./letters');
var presenceRouter = require('./presence');
var push = require('./push');

var app = express();
var PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '16kb' }));

app.get('/api/health', function(req, res) {
  res.json({ status: 'ok' });
});

app.use('/api/letters', lettersRouter);
app.use('/api/presence', presenceRouter);
app.use('/api/push', push.router);

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, function() {
  console.log('Someone Today listening on port ' + PORT);
});
