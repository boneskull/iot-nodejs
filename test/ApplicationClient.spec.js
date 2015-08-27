import { default as IBMIoTF } from '../src/iotf-client.js';
import chai from 'chai';
import sinon from 'sinon';
import mqtt from 'mqtt';
import events from 'events';
let expect = chai.expect;

console.info = () => {};

describe('ApplicationClient', () => {

  describe('Constructor', () => {

    it('should throw an error if instantiated without config', () => {
      expect(() => {
        let client = new IBMIoTF.ApplicationClient();
      }).to.throw(/missing properties/);
    });

    it('should throw an error if org is not present', () => {
      expect(() => {
        let client = new IBMIoTF.ApplicationClient({});
      }).to.throw(/config must contain org/);
    });

    it('should throw an error if org is not a string', () => {
      expect(() => {
        let client = new IBMIoTF.ApplicationClient({org: false});
      }).to.throw(/org must be a string/);
    });

    describe('Quickstart mode', () => {
      it('should throw an error if id is not present', () => {
        expect(() => {
          let client = new IBMIoTF.ApplicationClient({org:'quickstart'});
        }).to.throw(/config must contain id/);
      });

      it('should return an instance if org, id and type are specified', () => {
        let client;
        expect(() => {
          client = new IBMIoTF.ApplicationClient({org:'quickstart', id:'123', type:'123'});
        }).not.to.throw();
        expect(client).to.be.instanceof(IBMIoTF.ApplicationClient);
      });

      it('should run in quickstart mode if org is set to "quickstart"', () => {
        let client = new IBMIoTF.ApplicationClient({org: 'quickstart', type: 'mytype', id: '3215'});
        expect(client.isQuickstart).to.equal(true);
        expect(client.mqttConfig.username).to.be.undefined;
        expect(client.mqttConfig.password).to.be.undefined;
      });
    });

    describe('Registered mode', () => {
      it('should throw an error if id is not present', () => {
        expect(() => {
          let client = new IBMIoTF.ApplicationClient({org:'regorg'});
        }).to.throw(/config must contain id/);
      });

      it('should throw an error if auth-token is not present', () => {
        expect(() => {
          let client = new IBMIoTF.ApplicationClient({org:'regorg', id:'123'});
        }).to.throw(/config must contain auth-token/);
      });

      it('should throw an error if auth-key is not present', () => {
        expect(() => {
          let client = new IBMIoTF.ApplicationClient({org:'regorg', id:'123', 'auth-token': '123'});
        }).to.throw(/config must contain auth-key/);
      });

      it('should run in registered mode if org is not set to "quickstart"', () => {
        let client = new IBMIoTF.ApplicationClient({org:'regorg', id:'123', 'auth-token': '123', 'auth-key': 'abc'});
        expect(client.isQuickstart).to.equal(false);
      });
    });
  });

  describe('.connect()', () => {
    afterEach(() => {
      if(mqtt.connect.restore){
        mqtt.connect.restore();
      }
    });

    it('should connect to the correct broker', () => {
      let mqttConnect = sinon.stub(mqtt, 'connect').returns({
        on: function(){}
      });

      let client = new IBMIoTF.ApplicationClient({org:'regorg', id:'123', 'auth-token': '123', 'auth-key': 'abc'});
      client.connect();
    });

    it('should set up a callback for the "offline" event', () => {
      let on = sinon.spy();
      let mqttConnect = sinon.stub(mqtt, 'connect').returns({
        on: on
      });

      let client = new IBMIoTF.ApplicationClient({org:'regorg', id:'123', 'auth-token': '123', 'auth-key': 'abc'});
      client.connect();

      expect(on.calledWith('offline')).to.be.true;
    });

    it('should set up a callback for the "close" event', () => {
      let on = sinon.spy();
      let mqttConnect = sinon.stub(mqtt, 'connect').returns({
        on: on
      });

      let client = new IBMIoTF.ApplicationClient({org:'regorg', id:'123', 'auth-token': '123', 'auth-key': 'abc'});
      client.connect();

      expect(on.calledWith('close')).to.be.true;
    });

    it('should set up a callback for the "error" event', () => {
      let on = sinon.spy();
      let mqttConnect = sinon.stub(mqtt, 'connect').returns({
        on: on
      });

      let client = new IBMIoTF.ApplicationClient({org:'regorg', id:'123', 'auth-token': '123', 'auth-key': 'abc'});
      client.connect();

      expect(on.calledWith('error')).to.be.true;
    });

    it('should set up a callback for the "connect" event', () => {
      let on = sinon.spy();
      let mqttConnect = sinon.stub(mqtt, 'connect').returns({
        on: on
      });

      let client = new IBMIoTF.ApplicationClient({org:'regorg', id:'123', 'auth-token': '123', 'auth-key': 'abc'});
      client.connect();

      expect(on.calledWith('connect')).to.be.true;
    });

    it('should set up a callback for the "message" event', () => {
      let on = sinon.spy();
      let mqttConnect = sinon.stub(mqtt, 'connect').returns({
        on: on
      });

      let client = new IBMIoTF.ApplicationClient({org:'regorg', id:'123', 'auth-token': '123', 'auth-key': 'abc'});
      client.connect();

      expect(on.calledWith('message')).to.be.true;
    });

    it('should setup a "deviceEvent" event for messages arriving on the device-event topic', () => {
      let callback = sinon.spy();
      let fakeMqtt = new events.EventEmitter();
      let mqttConnect = sinon.stub(mqtt, 'connect').returns(fakeMqtt);

      let client = new IBMIoTF.ApplicationClient({org:'regorg', id:'123', 'auth-token': '123', 'auth-key': 'abc'});
      client.connect();

      client.on('deviceEvent', callback);

      let topic = 'iot-2/type/123/id/123/evt/myevt/fmt/json';
      let payload = '{}';

      fakeMqtt.emit('message', topic, payload);

      let expectation = {
        type: '123',
        id: '123',
        event: 'myevt',
        format: 'json',
        payload,
        topic
      };

      let args = callback.getCall(0).args;

      expect(args[0]).to.deep.equal(expectation);
    });

    it('should setup a "deviceCommand" event for messages arriving on the device-command topic', () => {
      let callback = sinon.spy();
      let fakeMqtt = new events.EventEmitter();
      let mqttConnect = sinon.stub(mqtt, 'connect').returns(fakeMqtt);

      let client = new IBMIoTF.ApplicationClient({org:'regorg', id:'123', 'auth-token': '123', 'auth-key': 'abc'});
      client.connect();

      client.on('deviceCommand', callback);

      let topic = 'iot-2/type/123/id/123/cmd/mycmd/fmt/json';
      let payload = '{}';

      fakeMqtt.emit('message', topic, payload);

      let expectation = {
        type: '123',
        id: '123',
        command: 'mycmd',
        format: 'json',
        payload,
        topic
      };

      let args = callback.getCall(0).args;

      expect(args[0]).to.deep.equal(expectation);
    });

    it('should setup a "deviceStatus" event for messages arriving on the device-monitoring topic', () => {
      let callback = sinon.spy();
      let fakeMqtt = new events.EventEmitter();
      let mqttConnect = sinon.stub(mqtt, 'connect').returns(fakeMqtt);

      let client = new IBMIoTF.ApplicationClient({org:'regorg', id:'123', 'auth-token': '123', 'auth-key': 'abc'});
      client.connect();

      client.on('deviceStatus', callback);

      let topic = 'iot-2/type/123/id/123/mon';
      let payload = '{}';

      fakeMqtt.emit('message', topic, payload);

      let expectation = {
        type: '123',
        id: '123',
        payload,
        topic
      };

      let args = callback.getCall(0).args;

      expect(args[0]).to.deep.equal(expectation);
    });

    it('should setup an "appStatus" event for messages arriving on the app-monitoring topic', () => {
      let callback = sinon.spy();
      let fakeMqtt = new events.EventEmitter();
      let mqttConnect = sinon.stub(mqtt, 'connect').returns(fakeMqtt);

      let client = new IBMIoTF.ApplicationClient({org:'regorg', id:'123', 'auth-token': '123', 'auth-key': 'abc'});
      client.connect();

      client.on('appStatus', callback);

      let topic = 'iot-2/app/123/mon';
      let payload = '{}';

      fakeMqtt.emit('message', topic, payload);

      let expectation = {
        app: '123',
        payload,
        topic
      };

      let args = callback.getCall(0).args;

      expect(args[0]).to.deep.equal(expectation);
    });
  });
});
