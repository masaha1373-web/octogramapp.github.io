import {calculateSize, clearPage, generateWaveGradient} from "./octogram.utils.js";
import * as header from "./octogram.header.js";
import {getStringRef} from "./octogram.translations.js";
import * as footer from "./octogram.footer.js";
import * as changelog from "./octogram.changelog.js";
import * as privacyPolicy from "./octogram.privacy.js";

const id = 'homePage';

let precachedResponse;
let downloadContent;
let downloadFiles;

let killedStarsAnimation = false;
let downloadsViewElement;

class Star {
	#ctx;
	#centerX;
	#centerY;

	constructor(ctx, centerX, centerY) {
		this.#ctx = ctx;
		this.#centerX = centerX;
		this.#centerY = centerY;
		this.reset();
	}

	reset() {
		this.x = this.#centerX;
		this.y = this.#centerY;
		const angle = Math.random() * Math.PI * 2;
		const speed = Math.random() * 2;
		this.vx = Math.cos(angle) * speed;
		this.vy = Math.sin(angle) * speed;
		this.alpha = 1;
		this.size = 0.3 + Math.random();
		this.distance = 0;
	}

	update() {
		this.x += this.vx;
		this.y += this.vy;
		this.distance += Math.sqrt(this.vx**2 + this.vy**2);
		this.alpha -= 0.005; // fade out
		if (this.alpha <= 0 || this.x < 0 || this.x > this.#centerX * 2 || this.y < 0 || this.y > this.#centerY * 2) {
			this.reset();
		}
	}

	draw() {
		this.#ctx.beginPath();
		this.#ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		this.#ctx.fillStyle = `rgba(61, 53, 139, ${this.alpha})`;
		this.#ctx.fill();
	}
}

function init() {
	clearPage(id, () => destroy());
	window.scrollTo(0, 0);
	document.title = 'OctoGram';
	history.pushState(null, document.title, '/');

	killedStarsAnimation = false;

	const pageContainer = document.createElement('div');
	pageContainer.classList.add('page');
	pageContainer.appendChild(header.createElement({
		isHomePage: true
	}));
	pageContainer.appendChild(generateIntroduction());
	pageContainer.appendChild(downloadsViewElement = generateDownload());
	pageContainer.appendChild(footer.createElement());

	document.body.appendChild(pageContainer);

	loadVersions();
}

function destroy() {
	killedStarsAnimation = true;
}

function generateIntroduction() {
	const appBanner = document.createElement('div');
	appBanner.classList.add('app-banner');
	const canvas = document.createElement('canvas');
	appBanner.appendChild(canvas);
	const appLogo = document.createElement('div');
	appLogo.classList.add('app-logo');
	const img = document.createElement('img');
	img.src = '/assets/icons/applogo.svg';
	appLogo.appendChild(img);
	appBanner.appendChild(appLogo);

	const appName = document.createElement('div');
	appName.className = 'app-name';
	appName.textContent = 'OctoGram';

	const appDescription = document.createElement('div');
	appDescription.className = 'app-description';
	appDescription.textContent = getStringRef('INTRODUCTION_DISCOVER_DESCRIPTION');

	const actions = document.createElement('div');
	actions.className = 'actions';

	const links = [
		{ id: 1, text: 'Privacy Policy' },
		{ id: 2, text: 'News' },
		{ id: 3, text: 'Downloads' },
	];

	links.forEach(linkData => {
		const link = document.createElement('a');
		link.classList.add('button', 'has-background');
		link.style.setProperty('--id', linkData.id);
		link.addEventListener('click', () => {
			if (linkData.id === 1) {
				privacyPolicy.init();
			} else if (linkData.id === 2) {
				changelog.init();
			} else if (linkData.id === 3) {
				downloadsViewElement.scrollIntoView({ behavior: 'smooth' });
			}
		});
		link.textContent = linkData.text;
		actions.appendChild(link);
	});

	const background = document.createElement('div');
	background.className = 'background';

	background.appendChild(generateWaveGradient('#0f031e', false));

	const second = generateWaveGradient('#0f031e', true);
	second.classList.remove('btm-1');
	second.classList.add('top-1');
	background.appendChild(second);

	const introductionContent = document.createElement('div');
	introductionContent.classList.add('content');
	introductionContent.appendChild(appBanner);
	introductionContent.appendChild(appName);
	introductionContent.appendChild(appDescription);
	introductionContent.appendChild(actions);

	const introduction = document.createElement('div');
	introduction.classList.add('introduction');
	introduction.appendChild(background);
	introduction.appendChild(introductionContent);

	const context = canvas.getContext('2d');
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;
	const stars = Array.from({ length: 200 }, () => new Star(context, centerX, centerY));

	function animate() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		if (!killedStarsAnimation) {
			for (const star of stars) {
				star.update();
				star.draw();
			}
			requestAnimationFrame(animate);
		} else {
			killedStarsAnimation = false;
		}
	}

	animate();

	return introduction;
}

function generateDownload() {
	const stickerImage = document.createElement('lottie-player');
	stickerImage.toggleAttribute('loop');
	stickerImage.toggleAttribute('autoplay');
	stickerImage.src = '/assets/animations/_070_TELEMAG_OUT.json';
	const messageTitle = document.createElement('div');
	messageTitle.classList.add('title');
	messageTitle.textContent = getStringRef('DOWNLOAD_TITLE');
	const messageDescription = document.createElement('div');
	messageDescription.classList.add('description');
	messageDescription.textContent = getStringRef('DOWNLOAD_DESCRIPTION');
	const message = document.createElement('div');
	message.classList.add('message');
	message.appendChild(stickerImage);
	message.appendChild(messageTitle);
	message.appendChild(messageDescription);

	const files = document.createElement('a');
	files.classList.add('files');
	files.addEventListener('click', () => changelog.init());

	const separator = document.createElement('div');
	separator.classList.add('separator');
	separator.style.setProperty('--text', '"'+getStringRef('DOWNLOAD_OR')+'"');

	const stores = document.createElement('div');
	stores.classList.add('stores');
	appendStores(stores);

	const rightPart = document.createElement('div');
	rightPart.classList.add('right');
	rightPart.appendChild(files);
	rightPart.appendChild(separator);
	rightPart.appendChild(stores);

	const content = document.createElement('div');
	content.classList.add('content', 'unavailable-apk');
	content.appendChild(message);
	content.appendChild(rightPart);

	const downloadContainer = document.createElement('div');
	downloadContainer.classList.add('download');
	downloadContainer.appendChild(content);

	downloadContent = content;
	downloadFiles = files;

	return downloadContainer;
}

function appendStores(stores) {
	stores.appendChild(generateStore({
		iconUrl: 'assets/stores/apkpure.png',
		id: 'apkpure',
		href: '/apkpure'
	}));
	stores.appendChild(generateStore({
		iconUrl: 'assets/stores/playstore.png',
		id: 'playstore',
		href: '/playstore'
	}));
}

function generateStore({
						   iconUrl,
						   id,
						   title,
						   href,
						   isUnavailable = false
					   }) {
	const storeIconElement = document.createElement('img');
	storeIconElement.src = iconUrl;
	const storeIconContainer = document.createElement('div');
	storeIconContainer.classList.add('icon', 'need-border');
	storeIconContainer.appendChild(storeIconElement);

	let store;
	if (isUnavailable) {
		store = document.createElement('div');
		store.classList.add('unavailable');

		const storeDescription = document.createElement('div');
		storeDescription.classList.add('description');
		storeDescription.textContent = getStringRef('DOWNLOAD_UNAVAILABLE');

		const container = document.createElement('div');
		container.classList.add('container');
		container.appendChild(storeDescription);

		store.appendChild(container);
	} else {
		store = document.createElement('a');
		store.href = href;
		store.target = '_blank';

		const animatedIconContainer = document.createElement('div');
		animatedIconContainer.classList.add('access-icon');
		animatedIconContainer.appendChild(storeIconContainer.cloneNode(true));

		const continueContainer = document.createElement('div');
		continueContainer.classList.add('continue');
		continueContainer.textContent = getStringRef('DOWNLOAD_AVAILABLE');

		store.appendChild(animatedIconContainer);
		store.appendChild(continueContainer);
	}

	store.classList.add('store');
	store.dataset.id = id;
	store.prepend(storeIconContainer);

	return store;
}

function loadVersions() {
	if (typeof precachedResponse != 'undefined') {
		loadVersionsWithResponse(precachedResponse);
	} else {
		const XML = new XMLHttpRequest();
		XML.open('GET', 'https://api.github.com/repos/OctoGramApp/OctoGram/releases?cache='+Math.random().toString(), true);
		XML.send();
		XML.addEventListener('readystatechange', (e) => {
			if (e.target.readyState === 4 && e.target.status === 200) {
				const response = JSON.parse(e.target.responseText);

				if (response.length > 0) {
					precachedResponse = response;
					loadVersionsWithResponse(response);
				}
			}
		});
	}
}

function loadVersionsWithResponse(response) {
	let selectedRelease = response[0];
	if (selectedRelease['prerelease']) {
		for(const release of response) {
			if (!release['prerelease']) {
				selectedRelease = release;
				break;
			}
		}
	}

	let sizeSum = 0;
	for(const asset of selectedRelease['assets']) {
		sizeSum += asset['size'];
	}
	sizeSum /= selectedRelease['assets'].length;

	const fileIcon = document.createElement('img');
	fileIcon.classList.add('icon');
	fileIcon.src = '/assets/icons/file.svg';
	const fileSize = document.createElement('div');
	fileSize.classList.add('size');
	fileSize.innerHTML = calculateSize(sizeSum, true, true).replaceAll(' ', '<br/>');
	const fileIconContainer = document.createElement('div');
	fileIconContainer.classList.add('file-icon-container');
	fileIconContainer.appendChild(fileIcon);
	fileIconContainer.appendChild(fileSize);

	const rightContainerTitle = document.createElement('div');
	rightContainerTitle.classList.add('title');
	rightContainerTitle.textContent = selectedRelease['name'];
	const rightContainerDescription = document.createElement('div');
	rightContainerDescription.classList.add('description');
	rightContainerDescription.textContent = getStringRef('DOWNLOAD_DIRECTLY');
	const rightContainer = document.createElement('div');
	rightContainer.classList.add('right-container');
	rightContainer.appendChild(rightContainerTitle);
	rightContainer.appendChild(rightContainerDescription);

	downloadContent.classList.remove('unavailable-apk');
	downloadFiles.appendChild(fileIconContainer);
	downloadFiles.appendChild(rightContainer);
}

export {
	id,
	init,
};