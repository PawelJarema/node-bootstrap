const 	mongoose 		= require('mongoose'),
	 	{ Schema } 		= mongoose,
	 	{ ObjectId }	= mongoose.Types;

const userSchema = new Schema({
	joindate: Number,
	firstname: String,
	lastname: String,
	auth: {
		facebookId: String,
		googleId: String
	},
	address: {
		street: String,
		postcode: String,
		city: String
	},
	contact: {
		email: String
	},
	security: {
		password: String,
		verified: Boolean
	},
	agreements: {
		rodo: Boolean
	}
});

mongoose.model('user', userSchema);