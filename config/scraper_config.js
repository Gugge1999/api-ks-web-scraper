'use strict';
require('dotenv').config();

module.exports = {
  //uri: 'https://klocksnack.se/search/23458/?q=6139&t=post&c[child_nodes]=1&c[nodes][0]=11&c[title_only]=1&o=date&g=1',
  uri: 'https://klocksnack.se/search/46733/?q=sinn&t=post&c[child_nodes]=1&c[nodes][0]=11&c[title_only]=1&o=date&g=1',
  email: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
    emailTo: process.env.EMAILTO,
  },
  interval: 100 * 1000 * 60, // in milliseconds
};
