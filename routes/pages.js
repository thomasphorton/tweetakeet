
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {
    title: '@tweetakeet',
    content: 'A markov chain generator based off of some of the weirdest people on twitter.'
  });
};

exports.generate = function(req, res) {
  res.render('generate', {
    title: 'Generate a Chain',
    content: 'Provide a starting word to generate a chain based off of Tweetakeet\'s Dictionary.'
  });
}

exports.dictionary = function(req, res) {
  res.render('dictionary', {
    title: 'Look Up a Word',
    content: 'View a page from Tweetakeet\'s Dictionary.'
  });
}
