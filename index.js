const in_production 	= process.env.NODE_ENV === 'production',
		PORT 			= in_production ? 80 : 5000;

const 	express			= require('express'),
		app 			= express(),
		fs				= require('fs'),
		path			= require('path'),
		http			= require('http'),
		https			= require('https'),
		body_parser		= require('body-parser'),
		cookie_session	= require('cookie-session'),
		mongoose		= require('mongoose')
		passport		= require('passport'),
		keys			= require('./config/keys');

app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(cookie_session({
	keys: [keys.cookieHash],
	maxAge: 7 * 24 * 60 * 60 * 1000
}));

mongoose.connect(keys.mongoURI);
require('./models/User');

//require('./services/passport');
//app.use(passport.initialize());
//app.use(passport.session());

require('./routes/messageRoutes')(app);
require('./routes/authRoutes')(app);

if (in_production) {
	app.use(express.static('client/build'));
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});

	//const privateKey 	= fs.readFileSync('/cert/privkey.pem', 'utf8');
	//const certificate = fs.readFileSync('/cert/cert.pem', 'utf8');
	//const ca 			= fs.readFileSync('/cert/chain.pem', 'utf8');
	/*
	const credentials = {
		key: privateKey,
		cert: certificate,
		ca: ca
	};

	const httpsServer = https.createServer(app, credentials);
	httpsServer.listen(443, () => console.log('production: server on port 443 https'));

	const httpServer = http.createServer((req, res) => {
		res.writeHead(301, {Location: `https://${req.headers.host}/${req.url}`});
		res.end();
	});
	httpServer.listen(80, () => console.log('production: server on port 80 http'));
	*/

	app.listen(PORT, () => console.log('production SERVER active on port ' + PORT));
} else {
	app.listen(PORT, () => console.log('development SERVER active on port ' + PORT));
}