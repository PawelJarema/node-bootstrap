const mainTemplate = require('./main');
const business = require('../../helpers/business');

module.exports = id => mainTemplate(
	`Weryfikacja`,
	`Potwierdź email klikając w link <a href="${business.host}auth/verify-email/${id}">Zweryfikuj E-mail</a>`
);