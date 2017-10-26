var noble = require('noble/index');

var serviceUUIDs = ['9e59ac01af5bbdbe34481bd5ccf05e76'];
var setLedChar = null;
var cmdChar = null;
var device_connected_cb = null;
var deviceDisonnectedCb = null;

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning(serviceUUIDs, false);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {

  console.log('peripheral discovered (' + peripheral.id +
              ' with address <' + peripheral.address +  ', ' + peripheral.addressType + '>,' +
              ' connectable ' + peripheral.connectable + ',' +
              ' RSSI ' + peripheral.rssi + ':');

  peripheral.connect();

  peripheral.once('connect', function() {
    this.discoverServices(serviceUUIDs);
  });

  peripheral.once('disconnect', function() {
    if(device_disconnected_cb) {
      device_disconnected_cb();
      noble.startScanning(serviceUUIDs, false);
    }
  });

  peripheral.once('servicesDiscover', function(services) {

    var service = services[0];

    console.log('service discovered: ' + service);

    service.discoverCharacteristics();

    service.once('characteristicsDiscover', function(characteristics) {
        console.log('characteristics discoverd: ' + characteristics);

        if(characteristics.length == 2) {
          if(characteristics[0].uuid == '9e59ac02af5bbdbe34481bd5ccf05e76') {
              setLedChar = characteristics[0];
              cmdChar = characteristics[1];
          }
          else {
            setLedChar = characteristics[1];
            cmdChar = characteristics[0];
          }

          console.log('setLedChar: ' + setLedChar);
          console.log('cmdChar: ' + cmdChar);

          if(device_connected_cb) {
            device_connected_cb();
          }
        }
        else {
          console.log('invalid number of characteristics!');
        }
    });
  });
});

exports.on_device_connected = function(func) {
  device_connected_cb = func;
}

exports.on_device_disconnected = function(func) {
  device_disconnected_cb = func;
}

exports.upload = function (matrix_buffer) {
  if(cmdChar) {

    for(x = 0; x < 8; x++) {
			for(y = 0; y < 8; y++){
				var rgb = matrix_buffer[x][y];
        var buf = Buffer.from([x, 0, y, 0, rgb[0], rgb[1], rgb[2]]);
        console.log('wrting setLedChar');
        setLedChar.write(buf, false);
			}
		}

    console.log('writing cmdChar');
    var buf = Buffer.from([1]);
    cmdChar.write(buf, false);
  }
}
