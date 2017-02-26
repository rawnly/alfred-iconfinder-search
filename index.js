'use strict';

// Modules
const alfy = require('alfy');
const path = require('path');
const fs = require('fs');
const https = require('https');
const alfredNotifier = require('alfred-notifier');

// Shortcuts
const fetch = alfy.fetch;
const inp = alfy.input;
const join = path.join;

// Variables
let dir = join(__dirname, 'assets', 'thumbs');

const c_id = 'WuC6Di1ekCHh7fo4Wn1fm7LXBihEIYFFntuYF6ncwUFmTAbatJ7UiD9qK250nVqe';
const c_secret = 'CjEEzv9iDwRy3lei5dzevq5Q1lUrr2y3PTLCGPQLlGVumoUXO4nndHZqGmCfMB2a';

const url = `https://api.iconfinder.com/v2/icons/search?query=${inp}&count=8&client_id=${c_id}&client_secret=${c_secret}`




function download(filename, url) {
	let file = fs.createWriteStream(filename);

	https.get(url, function(response) {
		 response.pipe(file).on('finish', () => {
			 console.log('Done!');
		 })
	});
};



// Checks for available update and updates the `info.plist`
alfredNotifier();

alfy.fetch(url, {
    transform: body => {
        body = body.icons
        return body;
    }
}).then(data => {
	const items = data.map(x => ({
					title: '[' + x.tags.join(', ') + ']',
					subtitle: x.icon_id,
				 	arg: `https://www.iconfinder.com/icons/${x.icon_id}`,
					icon: {
						path: fs.existsSync( path.join(dir, `${inp}_${x.icon_id}.png`) ) ? path.join(dir, `${inp}_${x.icon_id}.png`) : path.join(dir, `icon.png`)
					}
			 	}));

	items.push({
		title: `Open in the browser`,
		subtitle: `Search for "${inp}" icons in the browser`,
		arg: `https://iconfinder.com/search?q=${inp}`,
		icon: {
			path: "assets/web.png"
		}
	})

	items.push({
		title: 'Report a bug..',
		arg: 'https://github.com/rawnly/alfred-iconfinder-search/issues',
		icon: {
			path: "assets/bug.png"
		}
	})



	const thumbs = data.map(x => ({
		id: x.icon_id,
		url: x.raster_sizes[ x.raster_sizes.length - 2 ].formats[0].preview_url
	}))

	thumbs.forEach((item) => {

		let id = item.id;
		let url = item.url;

		fs.exists( join(dir, `${inp}_${id}.png`), exists => {
			if (!exists) {
				download( join(dir, `${inp}_${id}.png`), url, () => {
					console.log(id, 'downloaded');
				})
			}
		});

	})

	alfy.output(items)
})
