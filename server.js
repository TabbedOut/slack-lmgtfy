var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var request = require('request');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 8000;

function msg(channel, text, callback) {
  var hookURL = process.env.SLACK_INCOMING_WEBHOOK;
  if (!hookURL) {
    // throw
    return;
  }
  request.post(
    hookURL,
    {
      json: true,
      body: {
        username: 'lmgtfy',
        icon_emoji: ':ghost:',
        // heroku's node doesn't do default params
        channel: channel || '#tobot-debug',
        text
      }
    },
    callback
  )
}

app.post('/lmgtfy', upload.array(), (req, res) => {
  console.log(req.body);
  // token, team_id, channel_id, channel_name, user_id, team_domain, user_name, command, text
  // TODO assert req.body.token == process.env.SLACK_TOKEN
  // TODO assert req.body.text is not null
  const base = 'http://letmegooglethatforyou.com/?l=1&q=';
  if (req.body.channel_name === 'directmessage') {
    var text = `<${base}${encodeURI(req.body.text)}|${req.body.text}>`;
  } else {
    var text = `${req.body.user_name} suggests: <${base}${encodeURI(req.body.text)}|${req.body.text}>`;
  }
  msg(req.body.channel_id, text)
  res.send();
});


var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
