const express 	= require('express');
const serve   	= require('express-static');
const fs 		= require('fs');
const colors 	= require('colors');
const url 		= require('url');
const path 		= require('path');
const archiver 	= require('archiver');
const md5File 	= require('md5-file');
const NwBuilder = require('nw-builder');
const bodyParser = require('body-parser');
const stringify = require("json-stringify-pretty-compact");
const { ServerHandler } = require("direct-data/src/server-handler.js");

const PORT = 3000;
 
const app = express();
 
app.get('/', (req, res, next) => {
	res.writeHead(200, {'Content-Type': 'text/html'});

	const queryObject = url.parse(req.url,true).query;
	const isRelease = "release" in queryObject;

	Promise.all([
		regenerateIndex().then(() => fs.promises.readFile(`${__dirname}/public/index.html`)),
		generateData(),
		listFiles(`${__dirname}/public`, "")
			.then(data => {
				return fs.promises.writeFile(`${__dirname}/public/gen/files.js`, `const globalFiles=${stringify(data,null,'\t')};`)
					.then(() => data);
			})
			.then(data => {
				const map = {};
				data.forEach(({assets}) => {
					if (assets) {
						assets.forEach(asset => {
							const path = `${__dirname}/public/assets/${asset}`;
							const hash = md5File.sync(path);
							map[asset] = hash;
						});
					}
				});

				return fs.promises.readFile(`${__dirname}/build/asset-md5.json`)
					.then(data => {
						const preData = JSON.parse(data);
						const assetsToUpdate = [];
						for (let asset in preData) {
							if (preData[asset] !== map[asset]) {
								assetsToUpdate.push(asset);
							}
						}
						assetsToUpdate.forEach(asset => {
							console.log(`${asset} needs to update its data.`);
						});
					})
					.catch(console.warn)
					.then(() => {
						return Promise.all([
							fs.promises.writeFile(`${__dirname}/build/asset-md5.json`, stringify(map,null,'\t')),
							fs.promises.writeFile(`${__dirname}/public/gen/asset-md5.js`, `const assetMd5 = ${stringify(map,null,'\t')}`),
						]);
					});
			}),
	]).then(([html]) => {
		res.write(html);
		res.end();
	}).then(() => zipPublic("public", "game.zip"))
	.then(() => {
		const nw = new NwBuilder({
		    files: './public/**/**', // use the glob format
		    platforms: isRelease ? ['win', 'osx64', 'linux'] : [ 'osx64' ],
		    flavor: "normal",
//			    macIcns: "",
		});

		nw.on('log',  console.log);

		nw.build().then(function () {
		   console.log('all done!');
		   zipPublic("build/dok-game/linux32", "build/dok-game/linux32.zip")
		   zipPublic("build/dok-game/linux64", "build/dok-game/linux64.zip")
		   zipPublic("build/dok-game/osx64", "build/dok-game/mac-os.zip")
		   zipPublic("build/dok-game/win32", "build/dok-game/win32.zip")
		   zipPublic("build/dok-game/win64", "build/dok-game/win64.zip")
		}).catch(function (error) {
		    console.error(error);
		});
//			echo `sudo codesign --force --deep --verbose --sign "Vincent Le Quang" Eva.app`;
	});
});

app.get('/ping', (req, res) => {
	res.send("ping");
});

new ServerHandler(app);

app.use(serve(`${__dirname}/public`));

async function regenerateIndex() {
	const data = await listFiles(`${__dirname}/public`, "");
	const paths = generatePaths(data).filter(path => path.indexOf("self-load") < 0).map(path => path.indexOf("/") === 0 ? path.substr(1) : path);
	paths.sort(compareDependencies);
	const indexHtml = fs.readFileSync(`${__dirname}/public/index.html`, "utf8");
	const indexSplit = indexHtml.split("<!-- JAVASCRIPT -->");
	indexSplit[1] = "\n\t\t" + paths.map(path => `<script type="text/javascript" src="${path}"></script>`).join("\n\t\t") + "\n\t\t";
	fs.writeFileSync(`${__dirname}/public/index.html`, indexSplit.join("<!-- JAVASCRIPT -->"));

	//	Generate class mapping for classes in games folder
	const classNameMapper = "const NAME_TO_CLASS = {};\ndocument.addEventListener('DOMContentLoaded', () => {\n" + paths.map(path => {
		const className = kebabToClassName(path);
		if (path.indexOf("lib/external/") >= 0 || path.indexOf("gen/") >= 0 || path.split("/").length <= 1) {
			return null;
		}
		return `  NAME_TO_CLASS["${className}"] = ${className};		// ${path}\n`;
	}).filter(a => a).join("")
	+ `});
		function nameToClass(name, ignoreWarning) {
			if(!NAME_TO_CLASS[name] && !ignoreWarning) {
				console.warn('No class named ' + name);
			}
			return NAME_TO_CLASS[name];
		}
	`;
	return fs.promises.writeFile(`${__dirname}/public/gen/nameToClass.js`, classNameMapper)
}

function kebabToClassName(path) {
	const input = path.split("/").pop().split(".")[0];
    return input.replace(/-?\b([a-z0-9])/g, g => g[g.length - 1].toUpperCase());
}

function tabToSpaces(string) {
	return string.split("\t").join("    ");
}

function generateData() {
	return fs.promises.readdir(`${__dirname}/data`)
		.then(files => {
			return Promise.all(files.map(filename => {
				const {name, ext} = path.parse(filename);
				return fs.promises.readFile(`${__dirname}/data/${filename}`, 'utf8').then(data => {
					switch (ext) {
						case ".json":
							return [name, JSON.parse(data)];
						case ".glsl":
							return [name, tabToSpaces(data)];
					}
					return [name, null];
				});
			}));
		})
		.then(dataChunks => Object.fromEntries(dataChunks))
		.then(data => fs.promises.writeFile(`${__dirname}/public/gen/data.js`, `const globalData=${stringify(data,null,'\t')};`));
}

function listFiles(root, path) {
	return fs.promises.readdir(`${root}${path}`).then(files => {
		return Promise.all(files.map(filename => {
			if (fs.lstatSync(`${root}${path}/${filename}`).isDirectory()) {
				return listFiles(root, `${path}/${filename}`).then(result => {
					return {
						[filename] : result,
					};
				});
			} else {
				return filename;
			}
		}))
	});
}

function generatePaths(data, optionalPath) {
	const fullPath = optionalPath || ``;
	const list = [];
	if (Array.isArray(data)) {
		data.forEach(filename => {
			if (typeof(filename) === "string") {
				const {ext} = path.parse(filename);
				if (ext === ".js") {
					list.push(`${fullPath ? fullPath + "/" + filename : filename}`);
				}
			} else {
				list.push(...generatePaths(filename, `${fullPath}`));
			}
		});
	} else {
		Object.keys(data).forEach(key => {
			list.push(...generatePaths(data[key], `${fullPath ? fullPath + "/" + key : key}`));
		});
	}
	return list;
 }

function zipPublic(source, out) {
	const archive = archiver('zip', { zlib: { level: 9 }});
	const stream = fs.createWriteStream(out);

	return new Promise((resolve, reject) => {
		archive
		  .directory(source, false)
		  .on('error', err => reject(err))
		  .pipe(stream);

		stream.on('close', () => resolve());
		archive.finalize();
	});
}

function compareDependencies(a, b) {
	const isGenA = a.indexOf("gen/") >= 0;
	const isGenB = b.indexOf("gen/") >= 0;
	if (isGenA !== isGenB) {
		return isGenA ? -1 : 1;
	}

	const isExternalA = a.indexOf("/external/") >= 0;
	const isExternalB = b.indexOf("/external/") >= 0;
	if (isExternalA !== isExternalB) {
		return isExternalA ? -1 : 1;
	}

	const isCoreA = a.indexOf("/core/") >= 0;
	const isCoreB = b.indexOf("/core/") >= 0;
	if (isCoreA !== isCoreB) {
		return isCoreA ? -1 : 1;
	}
	const pathCountA = a.split("/").length;
	const pathCountB = b.split("/").length;
	if (pathCountA !== pathCountB) {
		return pathCountB - pathCountA;
	}
	return a.localeCompare(b);
}

const server = app.listen(PORT, () => {
	console.log('Server is running at %s', colors.green(server.address().port));
});
