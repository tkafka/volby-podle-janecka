"use strict";

var request = require('request'),
// $ = require('jquery');
	async = require('async'),
	cheerio = require('cheerio'),
	encoding = require("encoding");

var volbyBaseUrl = 'http://www.volby.cz/pls/ps2010/ps111?xjazyk=CZ&xstrana=0&xv=1&xt=1&xkraj=';


var ciselnikKraju = {
	1: 'Hlavní město Praha',
	2: 'Středočeský kraj',
	3: 'Jihočeský kraj',
	4: 'Plzeňský kraj',
	5: 'Karlovarský kraj',
	6: 'Ústecký kraj',
	7: 'Liberecký kraj',
	8: 'Královéhradecký kraj',
	9: 'Pardubický kraj',
	10: 'Vysočina',
	11: 'Jihomoravský kraj',
	12: 'Olomoucký kraj',
	13: 'Zlínský kraj',
	14: 'Moravskoslezský kraj'
};

var kraje = [],
	nactenychKraju = 0;

for (var i = 1; i <= 14; i++) {
	(function () { // protect closure

		var krajUrl = volbyBaseUrl + i,
			cisloKraje = i; // closure local copy

		// console.log('cislo kraje: ' + cisloKraje);

		getUrl(krajUrl, 'ISO-8859-2', function (err, body) {
			var $body = cheerio.load(body),
				$table = $body('table'),
				$rows = $table.find('tr');

			var kandidati = [];

			$rows.each(function (i) {
				if (i < 2) {
					return;
				}

				var $row = cheerio(this),
					$tds = $row.find('td');

				var strana = $tds.eq(1).text(),
					jmeno = $tds.eq(3).text(),
					vek = $tds.eq(4).text(),
					prislusnost = $tds.eq(6).text(),
					hlasyStr = $tds.eq(7).text().replace(/[^0-9]+/ig, ''),
					hlasy = parseInt(hlasyStr, 10);

				// console.log(hlasyStr + ' - ' + hlasy);

				kandidati.push({
					cisloKraje: cisloKraje,
					kraj: ciselnikKraju[cisloKraje],
					strana: strana,
					jmeno: jmeno,
					vek: vek,
					prislusnost: prislusnost,
					hlasy: hlasy
				});
			});

			kraje[cisloKraje] = kandidati;

			nactenychKraju++;
			// console.log('kraj ' + cisloKraje + ' - ' + krajUrl);

			// dirty: posledni kraj
			if (nactenychKraju == 14) {
				// console.log(kraje);
				// console.log('done');

				var vysledky = spocitejVysledky(kraje);

				vysledkyCsv(vysledky);

				// console.log(vysledky);
			}
		});
	})();
}

// kraje[cisloKraje][x] = { kandidat }
function spocitejVysledky(kraje) {
	var vysledky = [];

	kraje.map(function(kandidati, cisloKraje) {
		kandidati.sort(function(a, b) {
			return b.hlasy - a.hlasy;
		});

		kandidati[0].poradi = 1;
		kandidati[1].poradi = 2;

		vysledky.push(kandidati[0]);
		vysledky.push(kandidati[1]);
	});

	return vysledky;
}

function vysledkyCsv(vysledky) {
	console.log(
		'cisloKraje\t' +
		'kraj\t' +
		'strana\t' +
		'jmeno\t' +
		'vek\t' +
		'prislusnost\t' +
		'hlasy\t' +
		'poradi\t'
	)
	vysledky.map(function(kandidat) {
		console.log(
			kandidat.cisloKraje + '\t' +
			kandidat.kraj + '\t' +
			kandidat.strana + '\t' +
			kandidat.jmeno + '\t' +
			kandidat.vek + '\t' +
			kandidat.prislusnost + '\t' +
			kandidat.hlasy + '\t' +
			kandidat.poradi + '\t'
		)
	});
}

function getUrl(url, charset, callback) {
	request({
		url: url,
		encoding: 'binary'
	}, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			var resultBuffer = encoding.convert(body, 'UTF-8', charset);
			var bodyUtf = resultBuffer.toString();

			callback(null, bodyUtf);
		} else {
			callback(error);
		}
	});
}