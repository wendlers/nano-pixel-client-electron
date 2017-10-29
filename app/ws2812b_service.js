exports.Service = class Service
{
  constructor(
    device_connected_cb = null,
    device_disconnected_cb = null,
    service_uuid = '9e59ac01af5bbdbe34481bd5ccf05e76')
  {
    this.service_uuid = service_uuid;

    this.device_connected_cb = device_connected_cb;
    this.device_disconnected_cb = device_disconnected_cb;

    this.set_led_char = null;
    this.cmd_char = null;
    this.brightness_char = null;

    this.noble = require('noble/index');

    this.noble.on('stateChange', (state) => {
      if (state === 'poweredOn') {
        console.log("scanning for service: " + this.service_uuid);
        this.noble.startScanning([this.service_uuid], false);
      } else {
        this.noble.stopScanning();
      }
    });

    this.noble.on('discover', (peripheral) => {
      console.log('peripheral discovered (' + peripheral.id +
                  ' with address <' + peripheral.address +  ', ' + peripheral.addressType + '>,' +
                  ' connectable ' + peripheral.connectable + ',' +
                  ' RSSI ' + peripheral.rssi + ':');

      peripheral.connect();

      peripheral.once('connect', () => {
        peripheral.discoverServices(this.service_uuid);
      });

      peripheral.once('disconnect', () => {
        this.device_disconnected_cb();
        this.noble.startScanning([this.service_uuid], false);
      });

      peripheral.once('servicesDiscover', (services) => {

        var service = services[0];

        console.log('service discovered: ' + service);

        service.discoverCharacteristics();

        service.once('characteristicsDiscover', (characteristics) => {
            console.log('characteristics discoverd: ' + characteristics);

            if(characteristics.length == 3) {
              this.set_led_char = characteristics[0];
              this.cmd_char = characteristics[1];
              this.brightness_char = characteristics[2];

              console.log("connected");
              this.device_connected_cb();
            }
            else {
              console.log('invalid number of characteristics (got ' +
                characteristics.length + ', expected 3)!');
            }
        });
      });
    });
  }

  upload(matrix_buffer, brightness)
  {
    if(this.cmd_char && this.set_led_char && this.brightness_char) {

      for(x = 0; x < 8; x++) {
  			for(y = 0; y < 8; y++){
  				var rgb = matrix_buffer[x][y];
          var buf = Buffer.from([x, 0, y, 0, rgb[0], rgb[1], rgb[2]]);
          this.set_led_char.write(buf, false);
  			}
  		}

      var buf = Buffer.from([brightness % 100]);
      this.brightness_char.write(buf, false)

      buf = Buffer.from([1]);
      this.cmd_char.write(buf, false);
    }
  }
}
