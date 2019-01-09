const express = require('express');
const router = express.Router();
const request = require('request');

router.get('/', (req, res) => {
  const serverURL = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  // on localhost is working under http://localhost:3000/ but we never know if someone change that
  // so we use an relative path intead
  request(`${serverURL}grouped-testimonials`, (error, response, html) => {
    if (!error) {
      res.render('index', {
        title: 'Testimonials',
        testimonials: JSON.parse(response.body)
      })
    } else
      console.error('Something went really wrong! :) ', error);
  })
});

module.exports = router;
