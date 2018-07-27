const schedule = require('node-schedule');
const request = require('request');
const cheerio = require('cheerio');
const express = require('express');

const key = process.argv[2];

console.log("key=" + key);

let lastRavel = {};

let lastAmstel = {};

let lastNautique = {};

const ravelSites = [
    'http://ravelresidence.studentexperience.nl/plattegrond.php?pagina=2&begane-grond',
    'http://ravelresidence.studentexperience.nl/plattegrond.php?pagina=2&eerste-verdieping',
    'http://ravelresidence.studentexperience.nl/plattegrond.php?pagina=2&tweede-verdieping',
    'http://ravelresidence.studentexperience.nl/plattegrond.php?pagina=2&derde-verdieping',
    'http://ravelresidence.studentexperience.nl/plattegrond.php?pagina=2&vierde-verdieping'
];

const amstelHomeSites = [
    'http://roomselector.studentexperience.nl/plattegrond.php?pagina=2&vierde-verdieping',
    'http://roomselector.studentexperience.nl/plattegrond.php?pagina=2&derde-verdieping',
    'http://roomselector.studentexperience.nl/plattegrond.php?pagina=2&tweede-verdieping',
    'http://roomselector.studentexperience.nl/plattegrond.php?pagina=2&eerste-verdieping',
    'http://roomselector.studentexperience.nl/plattegrond.php?pagina=2&begane-grond'
];

const nautiqueLivingSites = [
    'http://nautiqueliving.studentexperience.nl/plattegrond.php?pagina=2&eerste-verdieping',
    'http://nautiqueliving.studentexperience.nl/plattegrond.php?pagina=2&tweede-verdieping',
    'http://nautiqueliving.studentexperience.nl/plattegrond.php?pagina=2&derde-verdieping',
    'http://nautiqueliving.studentexperience.nl/plattegrond.php?pagina=2&vierde-verdieping',
    'http://nautiqueliving.studentexperience.nl/plattegrond.php?pagina=2&vijfde-verdieping',
    'http://nautiqueliving.studentexperience.nl/plattegrond.php?pagina=2&zesde-verdieping',
    'http://nautiqueliving.studentexperience.nl/plattegrond.php?pagina=2&zevende-verdieping',
    'http://nautiqueliving.studentexperience.nl/plattegrond.php?pagina=2&achtste-verdieping',
    'http://nautiqueliving.studentexperience.nl/plattegrond.php?pagina=2&negende-verdieping',
    'http://nautiqueliving.studentexperience.nl/plattegrond.php?pagina=2&tiende-verdieping',
    'http://nautiqueliving.studentexperience.nl/plattegrond.php?pagina=2&elfde-verdieping',
    'http://nautiqueliving.studentexperience.nl/plattegrond.php?pagina=2&twaalfde-verdieping'
];

const options = {
  url: 'https://fcm.googleapis.com/fcm/send',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'key=' + key
  }
};

schedule.scheduleJob('*/5 * * * * *', function () {
    checkRavel();
    checkAmstel();
    checkNautique();
});

function checkRavel() {
    console.log(new Date() + ' checking ravel...');

    const promises = ravelSites.map(url => new Promise((resolve, reject) => {
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
        let reservedRooms = 0;
        let rentedRooms = 0;

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
            const unfurnished = $floor.find('a.beschikbaar:not(.furnature)');
            const reserved = $floor.find('a.option');
            const rented = $floor.find('a.verhuurd');

            if (furnished.length > 0) {
                floors.push(i);
                furnishedRooms += furnished.length;
            }

            if (unfurnished.length > 0) {
                floors.push(i);
                unfurnishedRooms += unfurnished.length;
            }

            if (reserved.length > 0) {
                reservedRooms += reserved.length;
            }

            if (rented.length > 0) {
                rentedRooms += rented.length;
            }
        }

        lastRavel = {
            furnished: furnishedRooms,
            unfurnished: unfurnishedRooms,
            reserved: reservedRooms,
            rented: rentedRooms,
            timestamp: Date.now()
        };

        if (furnishedRooms + unfurnishedRooms > 0) {
            sendMessage(lastRavel, 'ravel');
        }
    });
}

function checkAmstel() {

    console.log(new Date() + ' checking amstel home...');

    const promises = amstelHomeSites.map(url => new Promise((resolve, reject) => {
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
        let reservedRooms = 0;
        let rentedRooms = 0;

        for (let i = 0; i < values.length; i++) {
            let $ = cheerio.load(values[i]);

            let $floor = $(
                '#bovenste-rij-bg,' +
                '#top-left-bg,' +
                '#bottom-bg,' +
                '#tweede-rij-bg,' +
                '#middle-left-bg,' +
                '#derde-rij-bg,' +
                '#bovenste-rij,' +
                '#far-right,' +
                '#bottom,' +
                '#far-left,' +
                '#tweede-rij-first,' +
                '#tweede-rij,' +
                '#mid-right,' +
                '#derde-rij,' +
                '#derde-rij-first,' +
                '#mid-left'
            );

            const furnished = $floor.find('a.furnature');
            const unfurnished = $floor.find('a.beschikbaar:not(.furnature)');
            const reserved = $floor.find('a.option');
            const rented = $floor.find('a.verhuurd');

            if (furnished.length > 0) {
                floors.push(i);
                furnishedRooms += furnished.length;
            }

            if (unfurnished.length > 0) {
                floors.push(i);
                unfurnishedRooms += unfurnished.length;
            }

            if (reserved.length > 0) {
                reservedRooms += reserved.length;
            }

            if (rented.length > 0) {
                rentedRooms += rented.length;
            }
        }

        lastAmstel = {
            furnished: furnishedRooms,
            unfurnished: unfurnishedRooms,
            reserved: reservedRooms,
            rented: rentedRooms,
            timestamp: Date.now()
        };

        if (furnishedRooms + unfurnishedRooms > 0) {
            sendMessage(lastAmstel, 'amstel');
        }
    });
}

function checkNautique() {

    console.log(new Date() + ' checking nautique living...');

    const promises = nautiqueLivingSites.map(url => new Promise((resolve, reject) => {
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
        let reservedRooms = 0;
        let rentedRooms = 0;

        for (let i = 0; i < values.length; i++) {
            let $ = cheerio.load(values[i]);

            let $floor = $('#floorplan_polygon_container');

            const furnished = $floor.find('a.furnature');
            const unfurnished = $floor.find('a.beschikbaar:not(.furnature)');
            const reserved = $floor.find('a.option');
            const rented = $floor.find('a.verhuurd');

            if (furnished.length > 0) {
                floors.push(i);
                furnishedRooms += furnished.length;
            }

            if (unfurnished.length > 0) {
                floors.push(i);
                unfurnishedRooms += unfurnished.length;
            }

            if (reserved.length > 0) {
                reservedRooms += reserved.length;
            }

            if (rented.length > 0) {
                rentedRooms += rented.length;
            }
        }

        lastNautique = {
            furnished: furnishedRooms,
            unfurnished: unfurnishedRooms,
            reserved: reservedRooms,
            rented: rentedRooms,
            timestamp: Date.now()
        };

        if (furnishedRooms + unfurnishedRooms > 0) {
            sendMessage(lastNautique, 'nautique');
        }
    });
}

function sendMessage(data, topic) {
    console.log('sending message to ' + topic + '...');
    const message = {
        to: '/topics/' + topic,
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

const app = express();

app.get('/ravel', function (req, res) {
  res.type('json');
  res.send(lastRavel);
});

app.get('/amstel', function (req, res) {
  res.type('json');
  res.send(lastAmstel);
});

app.get('/nautique', function (req, res) {
  res.type('json');
  res.send(lastNautique);
});

app.listen(4444);