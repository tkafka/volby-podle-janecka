"use strict";

var request = require('request'),
	// $ = require('jquery');
	cheerio = require('cheerio'),
	encoding = require("encoding");

var volbyTableUrl = 'http://www.volby.cz/pls/ps2010/ps11?xjazyk=CZ&xv=1&xt=1';

getUrl(volbyTableUrl, 'ISO-8859-2', function(err, body) {
	var $body = cheerio.load(body);

	var $table = $body('table'),
		$rows = $table.find('tr'),
		$firstRow = $rows.eq(0),
		$kraje = $firstRow.find('th'),
		$secondRow = $rows.eq(2),
		$vysledky = $secondRow.find('td a')
		;

	var kraje = [],
		vysledky = [];

	var cnt = 0;
	$kraje.each(function(i, el) {
		if (i < 2) { return; }
		var name = cheerio(this).text();
		kraje[cnt++] = name;

		console.log(name);
	});

	cnt = 0;
	$vysledky.each(function(i, el) {
		if (i < 1) { return; }
		var link = cheerio(this).attr('href');
		vysledky[cnt++] = link;

		console.log(link);
	});

	// console.log($body.html());
	// console.log($table.html());
});



function getUrl(url, charset, callback) {
	request(url, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			var resultBuffer = encoding.convert(body, 'UTF-8', charset);
			var bodyUtf = resultBuffer.toString();

				callback(null, bodyUtf);
		} else {
			callback(error);
		}
	});
}