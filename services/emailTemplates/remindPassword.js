const mainTemplate = require('./main');
const business = require('../../helpers/business');

module.exports = newPassword => mainTemplate(
	`Nowe Hasło`,
	`<p>Twoje nowe hasło tymczasowe:</p>
	 </p><b>${newPassword}</b></p>
	 <p>Po zalogowaniu do serwisu możesz ponownie zmienić hasło.</p>
	`
);