//
//  Bot
//  class for performing various twitter actions
//
var Twit = require('twit');

var markov = require('./routes/markov');

var Bot = module.exports = function(config) {
  this.twit = new Twit(config);
};

markov.generate("You", function(tweet) {
  console.log(tweet);
});

//
//  post a tweet
//
Bot.prototype.tweet = function (status, callback) {
  if(typeof status !== 'string') {
    return callback(new Error('tweet must be of type String'));
  } else if(status.length > 140) {
    return callback(new Error('tweet is too long: ' + status.length));
  }
  this.twit.post('statuses/update', { status: status }, callback);
};

Bot.prototype.reply = function (status, old_tweet, callback) {
  if(typeof status !== 'string') {
    return callback(new Error('tweet must be of type String'));
  } else if(status.length > 140) {
    return callback(new Error('tweet is too long: ' + status.length));
  }

  this.twit.post('statuses/update', {
    status: status,
    in_reply_to_status_id: old_tweet.id_str
  }, callback);
};

Bot.prototype.watch_mention = function (callback) {
  var stream = this.twit.stream('user', { track: '@tweetakeet', language: 'en' });

  stream.on('tweet', function(tweet) {

    if (tweet.user.screen_name === 'tweetakeet') {
      console.log('self tweet');
      return false;
    } else {
      console.log(tweet);
      callback(tweet);
    }

  });
}

//
//  choose a random friend of one of your followers, and follow that user
//
Bot.prototype.mingle = function (callback) {
  var self = this;

  this.twit.get('followers/ids', function(err, reply) {
      if(err) { return callback(err); }

      var followers = reply.ids
        , randFollower  = randIndex(followers);

      self.twit.get('friends/ids', { user_id: randFollower }, function(err, reply) {
          if(err) { return callback(err); }

          var friends = reply.ids
            , target  = randIndex(friends);

          self.twit.post('friendships/create', { id: target }, callback);
        })
    })
};

//
//  prune your followers list; unfollow a friend that hasn't followed you back
//
Bot.prototype.prune = function (callback) {
  var self = this;

  this.twit.get('followers/ids', function(err, reply) {
      if(err) return callback(err);

      var followers = reply.ids;

      self.twit.get('friends/ids', function(err, reply) {
          if(err) return callback(err);

          var friends = reply.ids
            , pruned = false;

          while(!pruned) {
            var target = randIndex(friends);

            if(!~followers.indexOf(target)) {
              pruned = true;
              self.twit.post('friendships/destroy', { id: target }, callback);
            }
          }
      });
  });
};

function randIndex (arr) {
  var index = Math.floor(arr.length*Math.random());
  return arr[index];
};
