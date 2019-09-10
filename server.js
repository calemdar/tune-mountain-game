const express = require("express"),
	path = require("path"),
	http = require("http"),
	app = express(),
	port = (process.env.PORT || 3000),
	mime = require("mime");

app.use(express.static(path.join(__dirname + "/public/img")));

app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.get("/img/:filename", function(req, res) {
	const filename = req.params["filename"];
	const extensionIndex = filename.lastIndexOf(".");
	const extension = filename.slice(extensionIndex, filename.length);

	res.header("Content-Type", mime.getType(extension));
	res.sendFile(path.join(__dirname + "/public/img/" + filename ));

	console.log("/img/" + filename);

});

app.get("/scripts/app.js", function(req, res) {
	res.sendFile(path.join(__dirname + "/public/scripts/app.js"));
});

let server = http.createServer(app);
server.listen(port, function () {
	console.log("server started running");
});