const express 	= require('express');
const serve   	= require('express-static');
const fs 		= require('fs');
const colors 	= require('colors');
const url 		= require('url');
const path 		= require('path');
const archiver 	= require('archiver');

const PORT = 3000;
 
const app = express();
 
app.get('/', (req, res, next) => {
	res.writeHead(200, {'Content-Type': 'text/html'});

	const queryObject = url.parse(req.url,true).query;
	const isRelease = "release" in queryObject;

	fs.promises.readFile(`${__dirname}/public/index.html`).then(html => {
		res.write(html);
		res.end();
	});
});

app.use(serve(`${__dirname}/public`));

const server = app.listen(PORT, () => {
	console.log('Server is running at %s', colors.green(server.address().port));
});
