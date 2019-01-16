module.exports = app => {
	app.get('/api/message', (req, res) => {
		const message = req.session.message;
		const error = req.session.error;

		req.session.message = null;
		req.session.error = null;
		
		res.send({ 
			error: { error: Boolean(error), text: error }, 
			message: { message: Boolean(message), text: message } 
		});
	});
}