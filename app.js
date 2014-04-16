require('newrelic');

var express = require('express'),
    routes = require('./routes'),
    markov = require('./routes/markov'),
    http = require('http'),
    path = require('path'),
    Bot = require("./bot");

var bot = new Bot({
  consumer_key:         process.env.TWITTER_consumer_key,
  consumer_secret:      process.env.TWITTER_consumer_secret,
  access_token:         process.env.TWITTER_access_token,
  access_token_secret:  process.env.TWITTER_access_token_secret
});

bot.watch_mention(function(tweet) {
  if (tweet.user.screen_name === 'tweetakeet') {
    return false;
  } else {
    markov.add(tweet.text, function() {
      if (tweet.text.indexOf('@tweetakeet') > -1) {
        markov.generate("{{beg}}", function(chain) {
          var response = "@" + tweet.user.screen_name.toLowerCase() + " " + chain;
          bot.reply(response, tweet, function() {});
        });
      }
    });
  }
});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
//app.get('/clear', markov.clear);
app.get('/dictionary/:query', markov.dictionary);
app.get('/generate/:query', markov.generate_page);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
