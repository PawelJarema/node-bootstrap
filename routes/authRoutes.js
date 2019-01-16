const 	requireLogin	= require('../middleware/requireLogin'),
		passport		= require('passport'),
		bcrypt			= require('bcryptjs'),
		multer			= require('multer'),
		upload			= multer(),
		mongoose 		= require('mongoose'),
		User 			= mongoose.model('user'), 
		Mailer			= require('../services/mailer'),
		verifyEmailTemplate = require('../services/emailTemplates/verifyEmail'),
		remindPasswordTemplate = require('../services/emailTemplates/remindPassword');

const 	business 		= require('../helpers/business'),
		regexp 			= require('../helpers/regexp'),
		{ ObjectId }	= mongoose.Types;

const 	saltRounds = 10;


function bounceLogin(req, res, message, err) {
	if (err) console.log(err);
	req.session.error = message;
	res.send(false);
}

function bounceRegister(req, res, message, err) {
	if (err) console.log(err);
	req.session.error = message;
	res.send(false);
}

function randomizePassword(chars) {
	const charTable = 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ1234567890_-!@#$%^&*',
		  charArray = charTable.split(''),
		  charCount = charArray.length,
		  random    = (from, to) => parseInt(Math.random() * (to - from + 1) + from);

	let newPassword = '';
	for (let i = 0; i < chars; i++) {
		newPassword += charArray[random(0, charCount)];
	}

	return newPassword;
}

async function createUserAccount(req, { email, password, password_confirm, rodo }) {
	if (await User.countDocuments({ 'contact.email': email })) {
		req.session.message = 'To konto już istnieje';
		return await User.findOne({ 'contact.email': email });
	}

	if (!regexp.password.test(password)) {
		req.session.error = 'Zbyt słabe hasło';
		return;
	}

	if (password !== password_confirm) {
		req.session.error = 'Hasło i potwierdzenie hasła muszą się zgadzać';
		return;
	}

	bcrypt.hash(password, saltRounds, async (err, hash) => {
		if (err) {
			bounceRegister(req, res, 'Nastąpił błąd', err);
			return;
		}

		const newUser = await new User({
			joindate: new Date().getTime(),
			contact: { email },
			security: { password: hash, verified: false },
			agreements: { rodo: rodo === 'on' }
		}).save();

		// TODO send mail
		const subject = business.name + ': Zweryfikuj email';
		const recipients = [{ email }];
		const mailer = new Mailer({ subject, recipients }, verifyEmailTemplate(newUser._id));
		await mailer.send();

		req.session.message = 'Na podany adres E-mail przesłaliśmy prośbę o zatwierdzenie rejestracji';

		return newUser;
	});
}

module.exports = app => {
	app.post('/auth/password', [requireLogin, upload.any()], async (req, res) => {
		const { password, password_confirm } = req.body;

		if (password && password === password_confirm) {
			await bcrypt.hash(password, saltRounds, async (err, hash) => {
				if (err) {
					console.log(err);
					req.session.message = 'Zmiana hasła nie powiodła się';
				} else {
					await User.findOneAndUpdate({ _id: req.user._id }, { $set: { security: { password: hash } } })
					.then(
						doc => { req.session.message = 'Zmiana hasła przebiegła pomyślnie'; res.send(true); console.log('ok'); },
						err => { console.log(err); req.session.error = 'Zmiana hasła nie powiodła się', res.send(false) }
					);
				}
			});
		} else if (password) {
			req.session.error = "Wartości pola Hasło i pola Potwierdzenie hasła muszą się pokrywać";
			res.send(false);
			return;
		}
	});

	app.post('/auth/update', [requireLogin, upload.any()], async (req, res) => {
		const { firstname, lastname, email, firm_name, website, nip, regon, street, post_code, city } = req.body;
		
		await User.findOneAndUpdate(
			{ _id: req.user._id },
			{
				firstname,
				lastname,
				contact: {
					email
				},
				firm: {
					firm_name,
					website,
					nip,
					regon
				},
				address: {
					street,
					post_code,
					city
				}
			},
			(err, doc) => {
				if (err) {
					console.log(err);
					req.session.error = "Nastąpił błąd";
					res.send(false);
				} else {
					req.session.message = "Zapisano dane";
					res.send(true);
				}
			}
		);
	});

	app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
    
    app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/konto/zarejestruj-sie' }), (req, res) => {
     	req.session.message = 'Zalogowano przez Google';
     	res.redirect('/');
    });

    app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/konto/zarejestruj-sie' }), (req, res) => {
     	req.session.message = 'Zalogowano przez Facebooka';
     	res.redirect('/');
    });

	app.post('/auth/login', upload.any(), async (req, res) => {
		const { email, password } = req.body;
		const user = await User.findOne({ 'contact.email': email });

		if (!user) {
			bounceLogin(req, res, 'Nie znaleziono E-maila');
			return;
		}

		await bcrypt.compare(password, user.security.password, (err, success) => {
			if (err) {
				bounceLogin(req, res, 'Brak hasła dla tego konta. Zaloguj się przez media społecznościowe', err);
				return;
			}

			if (success) {
				req.login(user, err => {
					if (err) {
						bounceLogin(req, res, 'Nastąpił błąd', err);
						return;
					} else {
						req.session.message = user.firstname ? `Witaj ${user.firstname}!` : 'Zalogowano pomyślnie';
						res.send('/pulpit');
					}
				});
			} else {
				req.session.error = 'Nieprawidłowe hasło';
				res.send(false);
			}
		});
	});

	app.post('/auth/register', upload.any(), async (req, res) => {
		const user = await createUserAccount(req, req.body);
		if (user) {
			res.send(true);
		} else {
			res.send(false);
		}
	});

	app.get('/auth/verify-email/:id', async (req, res) => {
        let id = req.params.id;

        let user = await User.findOne({ _id: ObjectId(id) });
        user.security.verified = true;
        await user.save()
        	.then(() => {
	            req.login(user, err => {
	            	if (err) {
	            		console.log('error', err);
	            	};
	            	req.session.message = `E-mail został zatwierdzony. Witamy w serwisie ${business.name}`;
	            	res.redirect('/pulpit');
	            }); 
	        }, (err) => {
	        	console.log(err);
	            req.session.error = "Coś poszło nie tak i email nie został zatwierdzony. Spróbuj później";
	            res.redirect('/');
	        });
    });

    app.post('/auth/remindPassword', upload.any(), async (req, res) => {
    	const { email } = req.body;

    	if (!email) {
    		req.session.message = "Wpisz adres E-mail i ponów próbę";
    		res.send(false);
    	} else {
    		const user = await User.findOne({ 'contact.email': email });
	    	if (!user) {
	    		req.session.error = "Podany E-mail nie istnieje";
	    		res.send(false);
	    	} else {
	    		const newPassword = randomizePassword(36);
	    		await bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
	    			if (err) {
	    				console.log(err);
	    				req.session.error = 'Nastąpił błąd. Spróbuj później';
	    				res.send(false);
	    			} else {
	    				user.security.password = hash;
	    				await user.save()
	    				.then(
	    					async doc => { 
	    						const mailer = new Mailer({ subject: `Przypomnienie hasła: ${business.name}`, recipients: [{email}] }, remindPasswordTemplate(newPassword));
	    						await mailer.send();
	    						req.session.message = 'Na podany E-mail wysłaliśmy nowe hasło';
	    						res.send(true);
	    					},
	    					err => { 
	    						console.log(err); 
	    						req.session.error = 'Nastąpił błąd. Spróbuj później'; 
	    						res.send(false);
	    					}
	    				);
	    			}
	    		});
	    	}
    	}
    });

	app.get('/auth/logout', (req, res) => {
		req.logout();
		req.session.message = 'Wylogowano pomyślnie';
		res.redirect('/');
	});

	app.get('/auth/fetchUser', async (req, res) => {
		res.send(req.user);
	});
}