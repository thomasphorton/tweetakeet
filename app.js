
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var markov = require('./routes/markov');
var http = require('http');
var path = require('path');

var Bot = require("./bot");

console.log();

var bot = new Bot({
  consumer_key:         process.env.TWITTER_consumer_key,
  consumer_secret:      process.env.TWITTER_consumer_secret,
  access_token:         process.env.TWITTER_access_token,
  access_token_secret:  process.env.TWITTER_access_token_secret
});

bot.watch_mention(function(tweet) {

  var tweet_text = tweet.text;

  console.log(tweet_text);

  markov.add_tweet(tweet_text, function() {

    markov.generate("I", function(chain) {

      var status = "@" + tweet.user.screen_name + " " + chain;
      bot.reply(status, tweet, function() {
        console.log(status);
      });
    });

  });

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
app.get('/add', markov.add);
app.get('/addtweet', markov.add_tweet);
app.get('/clear', markov.clear);
app.get('/node/:query', markov.node);
app.get('/generate/:query', markov.generate_page);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
