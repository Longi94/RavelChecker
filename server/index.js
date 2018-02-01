const schedule = require('node-schedule');
const request = require('request');
const cheerio = require('cheerio');
const express = require('express');

const key = process.argv[2];

console.log("key=" + key);

let lastNotification = {};

const sites = [
    'http://ravelresidence.studentexperience.nl/plattegrond.php?pagina=2&begane-grond',
    'http://ravelresidence.studentexperience.nl/plattegrond.php?pagina=2&eerste-verdieping',
    'http://ravelresidence.studentexperience.nl/plattegrond.php?pagina=2&tweede-verdieping',
    'http://ravelresidence.studentexperience.nl/plattegrond.php?pagina=2&derde-verdieping',
    'http://ravelresidence.studentexperience.nl/plattegrond.php?pagina=2&vierde-verdieping'
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

    const promises = sites.map(url => new Promise((resolve, reject) => {
        request.get(url, (error, response, body) => {
            if (error) {
                console.log(error);
                return reject(error);
            }

            resolve(body);
        });
    }));

    Promise.all(promises).then(values => {

        let floors = [];
        let furnishedRooms = 0;
        let unfurnishedRooms = 0;

        for (let i = 0; i < values.length; i++) {
            let $ = cheerio.load(values[i]);

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
            const unfurnished = $floor.find('a.beschikbaar');

            if (furnished.length > 0) {
                floors.push(i);
                furnishedRooms += furnished.length;
            }

            if (unfurnished.length > 0) {
                floors.push(i);
                unfurnishedRooms += unfurnished.length;
            }
        }

        if (furnishedRooms + unfurnishedRooms > 0) {
            lastNotification = {
                furnished: furnishedRooms,
                unfurnished: unfurnishedRooms,
                timestamp: Date.now()
            };

            sendMessage(lastNotification);
        }
    });
});

function sendMessage(data) {
    console.log('sending message...');
    const message = {
        to: '/topics/ravel',
        priority: 'high',
        data: data
    };

    let opt = Object.assign(options, {body: JSON.stringify(message)});

    request.post(opt, (error, response, body) => {
        if (error) {
            console.log(error);
        }
        console.log(body);
    });
}

function checkFloor(url, i) {
}

const app = express();

app.get('/ravel', function (req, res) {
  res.type('json');
  res.send(lastNotification);
});

app.listen(4444);