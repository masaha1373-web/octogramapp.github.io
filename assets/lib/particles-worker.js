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
		this.size = 0.8 + Math.random();
		this.distance = 0;
	}

	update() {
		this.x += this.vx;
		this.y += this.vy;
		this.distance += Math.sqrt(this.vx ** 2 + this.vy ** 2);
		this.alpha -= 0.005;
		if (
			this.alpha <= 0 ||
			this.x < 0 ||
			this.x > this.#centerX * 2 ||
			this.y < 0 ||
			this.y > this.#centerY * 2
		) {
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

let killedState = false;
let sharedCanvas;

addEventListener('message', (e) => {
	if (!e.data.canvas && !e.data.resize) {
		killedState = true;
		return;
	}
	
	const canvas = e.data.canvas || sharedCanvas;
	sharedCanvas = canvas;
	
	if (!canvas) {
		return;
	}
	
	if (e.data.width && e.data.height) {
		canvas.width = e.data.width;
		canvas.height = e.data.height;
	}
	
	killedState = false;
	const ctx = canvas.getContext('2d');
	const width = canvas.width;
	const height = canvas.height;
	const centerX = width / 2;
	const centerY = height / 2;

	const stars = Array.from({ length: 200 }, () => new Star(ctx, centerX, centerY));

	function animate() {
		ctx.clearRect(0, 0, width, height);
		
		if (killedState) {
			return;
		}
		
		for (const star of stars) {
			star.update();
			star.draw();
		}
		requestAnimationFrame(animate);
	}

	animate();
});
