var ws2812b = nodeRequire('./ws2812b_service');

var leds = new ws2812b.Service(() => {
    console.log("device connected");
    $('#upload').removeClass('ui-disabled');
    $('#message').text('connected');
  },
  () => {
    console.log("device disconnected");
    $('#upload').addClass('ui-disabled');
    $('#message').text('disconnected');
  });

var busy = false;

function isBusy() {
    return busy;
}

function getLed(x, y) {
  let led_addr = '#led-' + x + '-' + y;
  return $(led_addr).css('background-color');
}

function setLed(x, y) {

  if(busy) {
    return;
  }

  let led_addr = '#led-' + x + '-' + y;
  let col1 = $(led_addr).css('background-color');
  let col2 = $('div[data-role=choosen-color]').css('background-color');

  if(col1 == col2) {
    col2 = '#000000';
  }

  $(led_addr).css('background-color', col2);
}

function blank()
{
  for(let x = 0; x < 8; x++) {
   for(let y = 0; y < 8; y++) {
     let led_addr = '#led-' + x + '-' + y;
     $(led_addr).css('background-color', '#000000');
   }
 }
}

function upload()
{
  busy = true;

  $('#blank').addClass('ui-disabled');
  $('#upload').addClass('ui-disabled');

  $.mobile.loading("show", {
    text: "uploading",
    textVisible: true,
  });

  var matrix_buffer = [[] ,[], [], [], [], [], [], []];

  for(let x = 0; x < 8; x++) {
    for(let y = 0; y < 8; y++){
      let c = getLed(x, y);
      matrix_buffer[x][y] = c.substr(4,c.length - 5).split(', ');
    }
  }

  let brightness = $('#brightness').val();

  console.log('brightness: ' + brightness);

  leds.upload(matrix_buffer, brightness);

  var loading_time = setInterval(function() {

    clearInterval(loading_time);

    $.mobile.loading("hide");

    $('#blank').removeClass('ui-disabled');
    $('#upload').removeClass('ui-disabled');

    busy = false;
  }, 10000);
}

function createLedGrid(max_x, max_y)
{
  let table = $('<div></div>').addClass('table');

  for(let y = 0; y < max_y; y++) {

    let row = $('<div></div>').addClass('table-row');
    table.append(row);

    for(let x = 0; x < max_x; x++) {
        let cell = $('<div id="led-' + x +'-' + y +'"></div>').addClass('table-cell');
        cell.click(() => { setLed(x, y) });
        row.append(cell);
    }
  }

  $('#grid').append(table);
}

function init()
{
    createLedGrid(8, 8);

    $('#upload').click(() => { upload() });
    $('#blank').click(()  => { blank() });

    $('#picker').colorpicker('option', {
       picked:function(event, data) {
          $('div[data-role=choosen-color]').css('background-color', data.color)
       },
       defaultColor:$('div[data-role=choosen-color]').css('background-color')
    });

    $('#button').click(function() {
      if(!isBusy()) {
        $('#picker').colorpicker('open')
      }
    });
}

exports.init = init;
