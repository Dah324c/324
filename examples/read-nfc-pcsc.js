
const nfcCard = require('../lib/nfccard-tool');

const { NFC } = require('nfc-pcsc');

const nfc = new NFC(); // optionally you can pass logger

nfc.on('reader', reader => {

	console.log(`${reader.reader.name}  device attached`);

  reader.on('card', async card => {

    console.log(`card detected`, card);

    try {

      /**
       * READ MESSAGE AND ITS RECORDS
       */

      /**
       *  1 - READ HEADER
       *  Read from block 0 to block 4 (20 bytes length) in order to parse tag information
       */
      // Starts reading in block 0 until end of block 4
      const cardHeader = await reader.read(0, 20);

      const tag = nfcCard.parseInfo(cardHeader);
      console.log('tag info:', JSON.stringify(tag));

      /**
       *  2 - Read the NDEF message and parse it if it's supposed there is one
       */

      // There might be a NDEF message and we are able to read the tag
      if(nfcCard.isFormatedAsNDEF() && nfcCard.hasReadPermissions() && nfcCard.hasNDEFMessage()) {

        // Read the appropriate length to get the NDEF message as buffer
        const NDEFRawMessage = await reader.read(4, nfcCard.getNDEFMessageLengthToRead()); // starts reading in block 0 until 6

        // Parse the buffer as a NDEF raw message
        const NDEFMessage = nfcCard.parseNDEF(NDEFRawMessage);

        console.log('NDEFMessage:', NDEFMessage);

      } else {
        console.log('Could not parse anything from this tag: \n The tag is either empty, locked, has a wrong NDEF format or is unreadable.')
      }

    } catch (err) {
      console.error(`error when reading data`, err);
    }

  });

	reader.on('card.off', card => {
		console.log(`${reader.reader.name}  card removed`, card);
	});

	reader.on('error', err => {
		console.log(`${reader.reader.name}  an error occurred`, err);
	});

	reader.on('end', () => {
		console.log(`${reader.reader.name}  device removed`);
	});

});

nfc.on('error', err => {
	console.log('an error occurred', err);
});
