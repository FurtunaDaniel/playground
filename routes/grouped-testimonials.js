var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/', (req, res) => {
  const serverURL = `${req.protocol}://${req.get('host')}`;
  request(`${serverURL}/testimonials`, (error, response, html) => {

    if (!error) {
      const responseBody = JSON.parse(response.body);

      /* normalize array with testimonials
       becouse some of them has multiple countries */

      const arrayWithDuplicatedCountries = [];
      responseBody.testimonials.forEach((el) => {
        if (el.country.split(',').length > 1) {
          el.country.split(',').forEach(country => {
            arrayWithDuplicatedCountries.push({
              country: country.replace(' ', ''),
              url: el.url,
              author: el.author
            })
          })
        } else if (el.country) {
          arrayWithDuplicatedCountries.push({
            country: el.country,
            url: el.url,
            author: el.author
          });
        }
      });

      // group all testimonials based on countries
      let testimonialsGroupedByCountries = [];
      arrayWithDuplicatedCountries.reduce((prev, curr) => {
        // if doesn't exist any object with that country create one
        if (!prev[curr.country]) {
          testimonialsGroupedByCountries.push({
            country: curr.country,
            author: [{
              name: curr.author,
              url: curr.url
            }]
          })
        } else {
          /* if exist an object with that country just append
          new url and author to existing obj */
          testimonialsGroupedByCountries.find((el) => {
            if (el.country == curr.country) {
              el.author.push({
                name: curr.author,
                url: curr.url
              })
            }
          })
        }
        prev[curr.country] = (prev[curr.country] || 0) + 1;
        return prev;
      }, {});

      testimonialsGroupedByCountries.sort(dynamicSort("country"))
      res.type('application/json');
      res.body = testimonialsGroupedByCountries;
      res.json(testimonialsGroupedByCountries)
    } else
      console.error('Something went really wrong! :) ', error);
  })

});

/**
 * Function to sort alphabetically an array of objects by some specific key.
 *
 * @param {String} property Key of the object to sort.
 */
function dynamicSort(property) {
  var sortOrder = 1;

  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }

  return function (a, b) {
    if (sortOrder == -1) {
      return b[property].localeCompare(a[property]);
    } else {
      return a[property].localeCompare(b[property]);
    }
  }
}

module.exports = router;
