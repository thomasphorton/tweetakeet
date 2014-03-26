
/*
 * Markov Chain Generator
 */

var _ = require('lodash')
  , mongo = require('mongodb')
  , monk = require('monk')
  , db = monk('localhost:27017/nodetest1')
  , dictionary = db.get('dictionary');

var chain = [];

exports.add = function(req, res) {

  var input = require('../input').jesse()
    , input_array = input.split(/\s+/);

  _.each(input_array, function(node, i) {

    var next_node = input_array[i + 1];

    if (!next_node) {
      next_node = "{{END}}"
    }

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

  res.render('index', { title: 'Data Added', content: "Data Added" });

};

exports.clear = function(req, res) {

  dictionary.remove(function() {
    res.render('index', { title: 'Data Cleared', content: "Collection dropped." });
  });

};

exports.node = function(req, res) {

  var seed = req.params.query;

  dictionary.findOne({ _id: seed}, function(e, node) {

    if (!node) {
      res.render('index', { title: seed + " not found", content: "Sorry about that."});
    } else {

      res.send(node);

    }

  });

};

exports.generate = function(req, res) {

  var seed = req.params.query;

  dictionary.findOne({ _id: seed}, function(e, node) {

    if (!node) {
      res.render('index', { title: seed + " not found", content: "Sorry about that."});
    } else {

      chain.push(node);

      generate_chain( function(node) {

        var new_sentence_array = _.pluck(node, "_id")
          , content = (new_sentence_array.join(" "));

        // res.send(content);

        res.render('index', { title: seed, content: content });

        chain = [];

      });

    }

  });

};

function get_next_node(node, cb) {

  var next_node = node.next[Math.floor(Math.random() * node.next.length)];

  dictionary.findOne({ _id: next_node}, function(e, new_node) {

    chain.push(new_node);

    if (typeof(cb) === 'function') {
      cb(new_node);
    }

  });

}

function generate_chain(cb){

    get_next_node(chain[chain.length-1], function(result) {

      if (!result._id.match(/[\.!]$/) && result._id) {

        generate_chain(cb);

      } else {

        if(typeof(cb) === 'function') {
          cb(chain);
        }

      }

    });

}

// function generate_chain(seed_record, cb){
