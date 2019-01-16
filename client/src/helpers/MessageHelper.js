const message_time   = 6000,
	  message_margin = 20;
	  
const displayMessage = (text, className) => {
	const messages = document.querySelectorAll('.flash-message'),
		   message = document.createElement('div'),
		   mcount  = messages.length;

	if (mcount) {
		const mostRecent  = messages[mcount - 1],
			 topPosition  = mostRecent.offsetTop,
			 height		  = mostRecent.offsetHeight;

	    message.style.top = topPosition + height + message_margin + 'px';
	}

	message.innerText = text;
	message.className = 'flash-message' + (className ? ` ${className}` : '');
	message.style.opacity = 0;

	document.body.append(message);

	setTimeout(() => message.style.opacity = 1, 300);
	setTimeout(() => message.style.opacity = 0, message_time + 300);
	setTimeout(() => {
		document.body.removeChild(message);
		let messages = document.querySelectorAll('.flash-message');
		for (let i = 0, l = messages.length; i < l; i++) {
			let otherMessage 	= messages[i],
				otherMessageTop = otherMessage.offsetTop,
				height 			= otherMessage.offsetHeight;

			otherMessage.style.top = otherMessageTop - height - message_margin + 'px';
		}
	}, message_time + 600);
}

export const MessageHelper = {
	message: text => {
		displayMessage(text, 'message');
	},
	error: text => {
		displayMessage(text, 'error');
	}
}