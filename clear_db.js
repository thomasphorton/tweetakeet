var monk = require('monk')
  , db = monk(process.env.MONGOLAB_URI)
  , dictionary = db.get('dictionary');

dictionary.remove(function() {
  console.log('dictionary dropped');
});
