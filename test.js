/**
 * Testing dependencies
 */

var mqttOverWs = require('./')
  , mqtt = require('mqtt')
  , abstractClientTests = require("mqtt/test/abstract_client")
  , testServer = require("./test-server")
  , server = testServer.start();

function clientTests(buildClient) {
  var client;

  beforeEach(function() {
    client = buildClient();
  });

  afterEach(function(done) {
    client.on("close", done);
    client.end();
  });

  it("should connect", function(done) {
    client.on("connect", function() {
      done();
    });
  });

  it("should publish and subscribe", function(done) {
    client.subscribe("hello", function() {
      done();
    }).publish("hello", "world");
  });
}

describe('MqttClient', function() {
  describe("specifying a port", function() {
    clientTests(function() {
      return mqttOverWs.createClient(testServer.port);
    });
  });

  describe("specifying a port and host", function() {
    clientTests(function() {
      return mqttOverWs.createClient(testServer.port, 'localhost');
    });
  });

  describe("specifying an URL", function() {
    clientTests(function() {
      return mqttOverWs.createClient('ws://localhost:' + testServer.port);
    });
  });
});

function connectionTests(buildconn) {
  var conn;

  var connPacket = {
    keepalive: 60,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    reconnectPeriod: 1000,
    clean: true,
    encoding: 'utf8',
    clientId: 'ahahah'
  };

  var publishPacket = {
    topic: "hello",
    payload: "world",
    qos: 0,
    retain: false,
    messageId: 42
  };

  var subscribePacket = {
    subscriptions: [{
      topic: "hello",
      qos: 0
    }],
    messageId: 42
  };

  beforeEach(function() {
    conn = buildconn();
  });

  afterEach(function() {
    conn.stream.destroy()
  });

  it("should publish and subscribe", function(done) {
    conn.connect(connPacket);

    conn.on("connack", function() {
      conn.subscribe(subscribePacket);
    });
    conn.on('suback', function(packet) {
      conn.publish(publishPacket);
    });
    conn.on('publish', function() {
      done();
    });
  });
}

describe('MqttConnection', function() {
  describe("specifying a port", function() {
    connectionTests(function() {
      return mqttOverWs.createConnection(testServer.port);
    });
  });

  describe("specifying a port and host", function() {
    connectionTests(function() {
      return mqttOverWs.createConnection(testServer.port, 'localhost');
    });
  });

  describe("specifying an URL", function() {
    connectionTests(function() {
      return mqttOverWs.createConnection('ws://localhost:' + testServer.port);
    });
  });
});

describe('mqttOverWs', function() {

  it("should expose MqttConnection", function() {
    mqttOverWs.MqttConnection.should.eql(mqtt.MqttConnection);
  });

  it("should expose MqttClient", function() {
    mqttOverWs.MqttClient.should.eql(mqtt.MqttClient);
  });
});
