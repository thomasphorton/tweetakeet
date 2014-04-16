$(function() {

  $('.markov-generate-form').submit(function(e) {

    e.preventDefault();

    var query = $('.markov-generate-input').val();

    if (query !== '') {

      window.location = '/generate/' + query;

    } else {

      console.log('invalid query');

    }

  });

});
