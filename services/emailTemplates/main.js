const business = require('../../helpers/business');

module.exports = (title, content) => {
	return (
		`
			<html>
				<head>
					<style></style>
				</head>
				<body>
					<header>
						${title} ${business.name}
					</header>
					<div>
						${content}
						<br/>
						<p>Pozdrowienia</p>
						<p>Zespół ${business.name}</p>
					</div>
					<footer>
						${business.copyright} ${business.name}
					</footer>
				</body>
			</html>
		`
	);
}