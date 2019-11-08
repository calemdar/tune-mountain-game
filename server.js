const express = require("express"),
	path = require("path"),
	http = require("http"),
	app = express(),
	port = (process.env.PORT || 3000),
	mime = require("mime");

app.use(express.static(path.join(__dirname + "/static")));

app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/img/:filename", function(req, res) {
	const filename = req.params["filename"];
	const extensionIndex = filename.lastIndexOf(".");
	const extension = filename.slice(extensionIndex, filename.length);

	res.header("Content-Type", mime.getType(extension));
	res.sendFile(path.join(__dirname + "/src/img/" + filename ));

	console.log("/img/" + filename);

});

app.get("/js/app.js", function(req, res) {
	res.sendFile(path.join(__dirname + "/src/js/app.js"));
});

let server = http.createServer(app);
server.listen(port, function () {
	console.log("Tune-Mountain-Game local Node.js testing server is running on port " + port);
});