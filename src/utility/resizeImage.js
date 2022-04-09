/*
 * Adapted from: https://stackoverflow.com/a/62662855
 */

const urltoFile = async (url, filename, mimeType) => {
	const res = await fetch(url);
	const buf = await res.arrayBuffer();

	return new File([buf], filename, { type: mimeType });
};

const fileToUrl = async (file) => {
	const promise = new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = ({ target }) => {
			resolve(target.result);
		};
		reader.onerror = (error) => {
			reject(error);
		};
		reader.readAsDataURL(file);
	});

	return await promise;
};

// maxDeviation is the difference that is allowed default: 50kb
// Example: targetFileSizeKb = 500 then result will be between 450kb and 500kb
// increase the deviation to reduce the amount of iterations.
// NOTE: if height or width change in pixel size becomes too small, resizing may stop despite not reaching the desired file size tolerance
// NOTE: this effectively performs a binary search by halving the ratio to scale by each iteration, collapsing the min/max bounds for said ratio
const resizeImage = async (originalFile, targetFileSizeKb, maxDeviation = 50) => {
	const fileSizeKb = originalFile.size / 1000;
	if (fileSizeKb < targetFileSizeKb)
		return originalFile;

	console.log(`File '${originalFile.name}' is too large (${fileSizeKb} kb), resizing to less than ${targetFileSizeKb} kb`);

	const maxDeltaBetweenScaleRatioBounds = 0.01; // i.e. stop resizing if the % change in scale is less than 1%; it's not worth extra iterations
	const maxNumberOfIterations = 20;
	let iterationCount = 1;
	let minScaleRatio = 0.0;
	let currentScaleRatio = 0.5;
	let maxScaleRatio = 1.0;
	let dataUrl = await fileToUrl(originalFile);
	let file = originalFile;

	while (Math.abs(file.size / 1000 - targetFileSizeKb) > maxDeviation && (maxScaleRatio - minScaleRatio > maxDeltaBetweenScaleRatioBounds) && iterationCount <= maxNumberOfIterations) {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		const img = document.createElement('img');

		const promise = new Promise((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = reject;
		});

		img.src = dataUrl;

		await promise;

		canvas.width = Math.round(img.width * currentScaleRatio);
		canvas.height = Math.round(img.height * currentScaleRatio);
		context.scale(canvas.width / img.width, canvas.height / img.height);
		context.drawImage(img, 0, 0);
		file = await urltoFile(canvas.toDataURL(), originalFile.name, originalFile.type);

		const newFileSizeKb = file.size / 1000;
		const newFileIsTooSmall = newFileSizeKb < (targetFileSizeKb - maxDeviation);
		const newFileIsTooLarge = newFileSizeKb > targetFileSizeKb;

		if (newFileIsTooSmall) {
			minScaleRatio = currentScaleRatio;
		} else if (newFileIsTooLarge) {
			maxScaleRatio = currentScaleRatio;
		}

		currentScaleRatio = (minScaleRatio + maxScaleRatio) / 2;

		const conditionalResizeMessage = newFileIsTooSmall || newFileIsTooLarge ? `, scale next by=${currentScaleRatio * 100}%, resizing...` : '';
		console.log(`[${iterationCount}] Resized to: height=${canvas.height}, width=${canvas.width}, file size=(${newFileSizeKb} kb)${conditionalResizeMessage}`);
		iterationCount++;
	}

	return file;
};

export default resizeImage;
