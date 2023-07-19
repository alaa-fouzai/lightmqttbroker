const aedes = require("aedes")();
require('dotenv/config');
const server = require('net').createServer(aedes.handle)
const httpServer = require('http').createServer()
const ws = require('websocket-stream')
const axios = require('axios');

server.listen(process.env.MQTT_Port, function () {
    console.log('Aedes MQTT server started and listening on port ', process.env.MQTT_Port)
})

ws.createServer({ server: httpServer }, aedes.handle)
httpServer.listen(process.env.wsPort, function () {
    console.log('websocket server listening on port ', process.env.wsPort)
})

// authentication
aedes.authenticate = async (client, username, password, callback) => {
    password = Buffer.from(password, 'base64').toString();
    console.log( " username :",username," password :",password)
    

    let url = process.env.AuthLightSwitchURL+":"+process.env.AuthLightSwitchPORT+process.env.AuthLightSwitchPATH;
    response = await axios({
      method: "post",
      url: url,
      data: {
        UUID: "4ed23bc0-86cd-4417-ab5b-3b3bf7c21da7",
        Login: username,
        password: password
      }
    }).then(function (response) {
      //console.log(response.data)
      if (response.data.status==='ok' && response.data.message === 'success') {
        return callback(null, true);
      }else {
        const error = new Error('Authentication Failed!! Please enter valid credentialsssss.');
        return callback(error, false)
      }
    }).catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser 
        // and an instance of http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
     
    });
}

// authorising client topic to publish a message
aedes.authorizePublish = (client, packet, callback) => {
    if (packet.topic === 'abc') {
        return callback(new Error('wrong topic'));
    }
    if (packet.topic === 'charcha') {
        packet.payload = Buffer.from('overwrite packet payload')
    }
    callback(null)
}

// emitted when a client connects to the broker
aedes.on('client', function (client) {
    console.log(`CLIENT_CONNECTED : MQTT Client ${(client ? client.id : client)} connected to aedes broker ${aedes.id}`)
  })
// emitted when a client disconnects from the broker
aedes.on('clientDisconnect', function (client) {
  console.log(`CLIENT_DISCONNECTED : MQTT Client ${(client ? client.id : client)} disconnected from the aedes broker ${aedes.id}`)
})
// emitted when a client subscribes to a message topic
aedes.on('subscribe', function (subscriptions, client) {
  console.log(`TOPIC_SUBSCRIBED : MQTT Client ${(client ? client.id : client)} subscribed to topic: ${subscriptions.map(s => s.topic).join(',')} on aedes broker ${aedes.id}`)
})
// emitted when a client unsubscribes from a message topic
aedes.on('unsubscribe', function (subscriptions, client) {
  console.log(`TOPIC_UNSUBSCRIBED : MQTT Client ${(client ? client.id : client)} unsubscribed to topic: ${subscriptions.join(',')} from aedes broker ${aedes.id}`)
})
// emitted when a client publishes a message packet on the topic
aedes.on('publish', function (packet, client) {if (client) {
  console.log(`MESSAGE_PUBLISHED : MQTT Client ${(client ? client.id : 'AEDES BROKER_' + aedes.id)} has published message "${packet.payload}" on ${packet.topic} to aedes broker ${aedes.id}`)}
})



  async function AutonticateSwitch(url,data) {
    try {
      const response = await axios.post(url, data);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }