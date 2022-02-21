'use strict';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

export async function scrapeWatchInfo(uri) {
  let watchInfo = {
    watchName: '',
    poster: '',
    watchLink: '',
  };

  const response = await fetch(uri);
  const body = await response.text();

  const $ = cheerio.load(body);

  watchInfo.watchName = $('.contentRow-title')
    .children() // kan chrildren tas bort?
    .first() // Kan first tas bort?
    .text()
    .replace(/Tillbakadragen|Avslutad|Säljes|OHPF|Bytes|\//gi, '') // Remove sale status of the watch
    .trim();
  if (watchInfo.watchName === '') throw new Error('Watch name not found');

  watchInfo.poster = $('.username').first().text();

  watchInfo.watchLink = `https://klocksnack.se${$('.contentRow-title')
    .children()
    .first()
    .attr('href')}`;

  return watchInfo;
}
