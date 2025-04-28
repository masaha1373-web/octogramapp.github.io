import * as header from "./octogram.header.js";
import * as homePage from "./octogram.home.js";
import * as footer from "./octogram.footer.js";
import {getStringRef, getTextNodeByStringRef} from "./octogram.translations.js";
import {clearPage} from "./octogram.utils.js";

function init() {
	clearPage('error');
	window.scrollTo(0, 0);
	document.title = 'OctoGram - 404';

	const pageContainer = document.createElement('div');
	pageContainer.classList.add('page');
	pageContainer.appendChild(header.createElement({
		onBackCallback: () => homePage.init(),
		isError: true
	}));
	pageContainer.appendChild(generateError());
	pageContainer.appendChild(footer.createElement());

	document.body.appendChild(pageContainer);
}

function generateError() {
	const stickerImage = document.createElement('lottie-player');
	stickerImage.toggleAttribute('autoplay');
	stickerImage.toggleAttribute('loop');
	stickerImage.src = '/assets/animations/_016_SRCH_OUT.json';

	const messageTitle = document.createElement('div');
	messageTitle.classList.add('title');
	messageTitle.textContent = getStringRef('ERROR_TITLE');

	const message = document.createElement('div');
	message.classList.add('message');
	message.appendChild(stickerImage);
	message.appendChild(messageTitle);

	const error = document.createElement('div');
	error.classList.add('error');
	error.appendChild(message);

	return error;
}

export {
	init,
};