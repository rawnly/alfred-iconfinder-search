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




function download(filename, url, callback) {
	let file = fs.createWriteStream(filename);

	https.get(url, function(response) {
		 if (callback != undefined) {
			 response.pipe(file).on('finish', () => {
				 callback(file)
			 })
		 }
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

	const items = data.map(x => {
		const tags = x.tags.join(', ');
		const id = x.icon_id;
		const argument = `https://www.iconfinder.com/icons/${id}`;
		const icon_path = join(dir, `${inp}_${x.icon_id}.png`);

		return {
			title: `[${tags}]`,
			subtitle: `ID: ${id}`,
			arg: argument,
			icon: {
				path: icon_path
			},
			mods: {
				alt: {
					arg: `https://api.iconfinder.com/v2/${x.raster_sizes[ x.raster_sizes.length - 1 ].formats[0].download_url}`,
					subtitle: 'Directly download the 512x512 icon'
				}
			}
		}
	});

	// Thumbs
	data.map(x => {
		let info = {
			id: x.icon_id,
			url: x.raster_sizes[ x.raster_sizes.length - 3 ].formats[0].preview_url
		}

		fs.exists( join(dir, `${inp}_${info.id}.png`), exists => {
			if (!exists) {
				download(join(dir, `${inp}_${info.id}.png`), info.url, () => {
					return true
				})
			}
		});
	})

	items.map(x => {
		let id = x.subtitle.split('ID: ')[1];
		x.icon = {
			path: join(dir, `${inp}_${id}.png`)
		}
		return x.icon
	})

	items.push(
		{
			title: `Open in the browser`,
			subtitle: `Search for "${inp}" icons in the browser`,
			arg: `https://iconfinder.com/search?q=${inp}`,
			icon: {
				path: "assets/web.png"
			}
		}
	)

	items.push(
		{
			title: 'Report a bug..',
			arg: 'https://github.com/rawnly/alfred-iconfinder-search/issues',
			icon: {
				path: "assets/bug.png"
			},
			mods: {
				alt: {
					subtitle: 'Open new issue on Github',
					arg: 'https://github.com/rawnly/alfred-iconfinder-search/issues/new'
				}
			},
		}
	)

	alfy.output( items )

})
