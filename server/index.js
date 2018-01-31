const schedule = require('node-schedule');
const request = require('request');

const key = process.argv[2];

const options = {
  url: 'https://fcm.googleapis.com/fcm/send',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'key=' + key
  }
};

const j = schedule.scheduleJob('*/5 * * * * *', function () {
    sendNotification("hi");
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
    }

    let opt = Object.assign(options, {body: JSON.stringify(message)});

    request.post(options, (error, response, body) => {
        if (error) {
            console.log(error);
        }
        console.log(body);
    });
}