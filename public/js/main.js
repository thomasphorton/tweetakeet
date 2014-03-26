$(function() {

  $('.markov-button').click(function() {

    var query = $('.markov-input').val();

    if (query !== '') {

      window.location = '/generate/' + query;

    } else {

      console.log('invalid query');

    }

  });

});
