const express = require('express');
const router = express.Router();
const request = require('request');
const cheerio = require('cheerio');

// The URL we will scrape from - in our example assist-software.
/* because our page for has index 3 */
const numberOfPages = 3;
const url = 'https://assist-software.net/testimonials/';

router.get('/', (req, res) => {

  const testimonials = [];
  let pagesDone = 0;

  for (let index = 0; index <= numberOfPages; index++) {
    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html
    request(`${url}?page=${index}`, (error, response, html) => {

      // First we'll check to make sure no errors occurred when making the request

      if (!error) {
        // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

        const $ = cheerio.load(html);

        $('.view-testimonial-author').filter(function () {

          // Let's store the data we filter into a variable so we can easily see what's going on.
          const data = $(this);
          // In examining the DOM we notice that the title rests within the first child element of the header tag.
          // Utilizing jQuery we can easily navigate and get the text by writing the following code:
          const card = data.children().first().children();
          card.each(function (i, el) {
            let $testimonialDiv = $(this).children().find('.testimonial-author');
            testimonials.push({
              author: $testimonialDiv.children('p.testimonial-author').text(),
              country: $testimonialDiv.children('p.testimonial-country').text(),
              url: $testimonialDiv.find('img').attr('src'),
            })
          })
        });

        //after iterating over all desired pages send the information that we found
        if (pagesDone == numberOfPages) {
          res.statusCode = 200;
          res.type('application/json');
          const body = {
            testimonials: testimonials,
            no: testimonials.length
          }
          res.send(JSON.stringify(body))
        }

      } else {
        console.log('Error: ', error);
        res.send('Check your console for errors!')
      }
      pagesDone++;
    });

  }
})


module.exports = router;
