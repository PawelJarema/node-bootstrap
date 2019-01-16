module.exports = (req, res, next) => {
	if (!req.user) {
		req.session.message = 'Musisz się zalogować';
		res.send(false);
	} else {
		next();
	}
}