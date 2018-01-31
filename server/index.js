const schedule = require('node-schedule');
const request = require('request');
const cheerio = require('cheerio');
const express = require('express');

const key = process.argv[2];

console.log("key=" + key);

let lastNotification = {};

const sites = [
    {name: 'ground floor', url: 'http://ravelresidence.studentexperience.nl/plattegrond.php?pagina=2&begane-grond'},
    {name: 'first floor', url: 'http://ravelresidence.studentexperience.nl/plattegrond.php?pagina=2&eerste-verdieping'},
    {name: 'second floor', url: 'http://ravelresidence.studentexperience.nl/plattegrond.php?pagina=2&tweede-verdieping'},
    {name: 'third floor', url: 'http://ravelresidence.studentexperience.nl/plattegrond.php?pagina=2&derde-verdieping'},
    {name: 'fourth floor', url: 'http://ravelresidence.studentexperience.nl/plattegrond.php?pagina=2&vierde-verdieping'},
];

const options = {
  url: 'https://fcm.googleapis.com/fcm/send',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'key=' + key
  }
};

schedule.scheduleJob('*/1 * * * *', function () {
    console.log(new Date() + ' checking...');
    for (let i = 0; i < sites.length; i++) {
        checkFloor(sites[i]);
    }
});

function sendNotification(text) {
    console.log('sending message...');
    const message = {
        to: '/topics/ravel',
        priority: 'high',
        notification: {
            body: text,
            title: 'Ravel Checker'
        }
    };

    let opt = Object.assign(options, {body: JSON.stringify(message)});

    request.post(opt, (error, response, body) => {
        if (error) {
            console.log(error);
        }
        console.log(body);
    });
}

function checkFloor(floor) {
    request.get(floor.url, (error, response, body) => {
        if (error) {
            console.log(error);
            return;
        }

        let $ = cheerio.load(body);

        let $floor = $(
            '#bovenste-rij,' +
            '#far-right,' +
            '#mid-right,' +
            '#top-right,' +
            '#bottom-mid-right,' +
            '#bottom-right,' +
            '#bottom-left,' +
            '#bottom-mid-left,' +
            '#far-left,' +
            '#mid-left,' +
            '#top-mid-left,' +
            '#far-top-left,' +
            '#mid-top-left-small,' +
            '#far-top-left-small'
        );

        const furnished = $floor.find('a.furnature');
        const unfurnished = $floor.find('a.option');
        const now = Date.now();

        if (furnished.length > 0) {
            sendNotification("There are " + furnished.length + " free furnished rooms one the "
                + floor.name);

            lastNotification = {
                text: furnished.length + " free furnished rooms on the " + floor.name,
                date: now
            };
        }

        if (unfurnished.length > 0) {
            sendNotification("There are " + unfurnished.length + " free unfurnished rooms one the "
                + floor.name);

            lastNotification = {
                text: unfurnished.length + " free unfurnished rooms on the " + floor.name,
                date: now
            };
        }
    });
}

const app = express();

app.get('/ravel', function (req, res) {
  res.type('json');
  res.send(lastNotification);
});

app.listen(4444);