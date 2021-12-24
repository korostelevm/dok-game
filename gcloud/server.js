//  This app is deployed on https://console.cloud.google.com/home/dashboard?project=peerjs-336100
//  From https://peerjs.com/
//  PeerJS github: https://github.com/peers/peerjs-server
//  To deploy from gcloud directory:
//  - gcloud init
//  - gcloud app deploy --project=peerjs-336100 --promote --quiet app.yaml
//  - gcloud app browse



const express = require('express');
const { ExpressPeerServer } = require('peer');
const app = express();

app.enable('trust proxy');

const PORT = process.env.PORT || 9000;
const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

const peerServer = ExpressPeerServer(server, {
  path: '/'
});

app.use('/', peerServer);

module.exports = app;
