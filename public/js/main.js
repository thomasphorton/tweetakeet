$(function() {

  $('.markov-form').submit(function(e) {
    e.preventDefault();

    var $this = $(this),
        type = $this.data('type'),
        query = $this.find('.markov-input').val();

    if (query !== '') {
      window.location = '/' + type + '/' + query;
    } else {
      console.log('invalid query');
    }
  });

});
