
/*
 * Markov Chain Generator
 */

var _ = require('lodash')
  , mongo = require('mongodb')
  , monk = require('monk')
  , db = monk(process.env.MONGOLAB_URI)
  , dictionary = db.get('dictionary');

var chain = [];

exports.add = function(input, cb) {

  input = input.toLowerCase();

  var input_array = input.split(/\s+/);

  input_array = _.reject(input_array, function(elem) {
    if (
      elem.indexOf('@') > -1 ||
      elem.indexOf('http') > -1 ||
      elem === "rt"
    ) {
      return true;
    }
    return false;
  });

  input_array.unshift("{{beg}}");

  _.each(input_array, function(node, i) {

    var next_node = input_array[i + 1];

    if (!next_node) {
      next_node = "{{end}}"
    }

    node = node.toLowerCase();

    dictionary.findOne({ _id: node}, function(e, result) {

      if (result) {

        dictionary.update(
          { _id: node },
          { $push: { "next": next_node }}
        );

      } else {

        dictionary.insert({ _id: node, next: []}, function() {

          dictionary.update(
            { _id: node },
            { $push: { "next": next_node }}
          );

        });

      }

    });

  });

  if (typeof(cb) === "function") {
      cb();
  }

};

exports.clear = function(req, res) {

  dictionary.remove(function() {
    res.render('index', { title: 'Data Cleared', content: "Collection dropped." });
  });

};

exports.dictionary = function(req, res) {

  var seed = req.params.query;

  dictionary.findOne({ _id: seed}, function(e, node) {

    if (!node) {

      res.render('dictionary_entry', {
        title: '"' + seed + '" not found',
        content: "Sorry about that.",
        dictionary: { entries: [], count: 0, unique: 0 }
      });

    } else {

      var count = node.next.length;

      var entries = _.chain(node.next.sort())
        .reject(function(elem) {
          if (elem === "{{end}}") {
            return true;
          }
          return false;
        })
        .groupBy(function(elem) {
          return elem;
        })
        .map(function(elem) {
          return ({
            id: elem[0],
            count: elem.length,
            probability: (elem.length / count * 100).toFixed(2)
          });
        }).value();

      res.render('dictionary_entry', {
        title: node._id,
        content: 'Possible words that follow "' + seed + '"',
        dictionary: {
          entries: entries,
          count: count,
          unique: entries.length
        }
      });

    }

  });

};

exports.generate = function(seed, cb) {

  seed = seed.toLowerCase();

  dictionary.findOne({ _id: seed}, function(e, node) {

    if (!node) {
      return false;
    } else {

      chain.push(node);

      generate_chain( function(node) {

        node = _.reject(node, function(elem) {
          return (elem["_id"] === "{{beg}}");
        });

        var new_sentence_array = _.pluck(node, "_id")
          , content = (new_sentence_array.join(" "));

        if (content.length > 130) {
          // Try and keep tweets under 140 char (remember we're adding @mentions)
          exports.generate(seed, cb);
        } else {

          if (typeof(cb) === "function") {
            cb(content);
          }

        }

        chain = [];

      });

    }

  });

}

exports.generate_page = function(req, res) {

  var seed = req.params.query;

  exports.generate(seed, function(chain) {
    res.render('generate', {
      title: 'Chain beginning with "' + seed + '"',
      content: chain
    });
  });

};

function get_next_node(node, cb) {

  var next_node = node.next[Math.floor(Math.random() * node.next.length)];

  if (next_node === "{{end}}") {

    if (typeof(cb) === 'function') {
      cb();
    }

  } else {

    dictionary.findOne({ _id: next_node}, function(e, new_node) {
      chain.push(new_node);

      if (typeof(cb) === 'function') {
        cb(new_node);
      }

    });

  }

}

function generate_chain(cb) {
  get_next_node(chain[chain.length-1], function(result) {
    if (result === undefined) {
      cb(chain);
    } else {
      generate_chain(cb);
    }
  });
}
