
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {
    title: 'Tweetakeet',
    content: 'A markov chain generator based off of some of the weirdest people on twitter.'
  });
};
