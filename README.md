# nano-pixel-client-electron
An electron applicatoin to access a 8x8 neopixel matrix via BLE as exposed by nano-pixel-firmware

Build:

	npm install
	./node_modules/.bin/electron-rebuild

Run:

	sudo npm start


Needs `sudo` since otherwise it would not be able to access BLE.
