var canvas;
var context;
var table = document.getElementById("zeroTable");
var inputs = [];

function init() {
	canvas = document.getElementById('FractalCanvas');
	context = canvas.getContext('2d');
	context.fillStyle = 'yellow';
	context.fillRect(0, 0, 320, 180);
	var zeros = [math.complex(1, 0), math.complex(-0.5, math.pow(3, 0.5) / 2), math.complex(-0.5, -math.pow(3, 0.5) / 2)];
	for (var i = 0; i < zeros.length; i++) {
		var tr = document.createElement('tr');
		var text = document.createTextNode('Zero ' + String(i + 1));
		var p = document.createElement('p');
		var input = document.createElement('input');
		if (zeros[i].im < 0) {
			input.value = zeros[i].re.toFixed(3) + " - " + -zeros[i].im.toFixed(3) + "i"
		} else {
			input.value = zeros[i].re.toFixed(3) + " + " + zeros[i].im.toFixed(3) + "i"
		}
		p.style = "color: white";

		inputs.push(input);
		p.appendChild(text);
		tr.appendChild(p);
		tr.appendChild(input);
		table.appendChild(tr);
	}
	var unleashButton = document.createElement('button');
	unleashButton.appendChild(document.createTextNode("Show zeros"));
	unleashButton.addEventListener('click', readInputs);
	table.appendChild(unleashButton);
	colorCanvas(cube, cube_derivative, zeros, 25, 0.3, [[-4, -2.25], [4, 2.25]], [[255, 0, 0], [0, 255, 0], [0, 0, 255]]);
}

function readInputs() {
	var zeros = []
	for (var i = 0; i < inputs.length; i++) {
		zeros.push(math.complex(inputs[i].value));
	}
	colorCanvasZeros(zeros, 50, 0.1, [[-4, -2.25], [4, 2.25]], [[255, 0, 0], [0, 255, 0], [0, 0, 255]]);
}

function invertColors(data) {
	for (var i = 0; i < data.length; i += 4) {
		data[i] = -data[i] + 255 ; // Invert Red
		data[i + 1] = -data[i+1] + 255; // Invert Green
		data[i + 2] = -data[i+2] + 255; // Invert Blue
	}
}

function resetImg(data) {
	for (var i = 0; i < data.length; i ++) {
		data[i] = 0;
	}
}

function point_toward_zero(z, f, derivative, zeros, iterations, threshold) {
	var toward_zero = null
	for (var i = 0; i < iterations; i++) {
		z = newtonsMethod(z, f, derivative);
		if (i > 3) {
			for (var zero = 0; zero < zeros.length; zero++) {
				if (math.abs(math.subtract(zeros[zero], z)) < threshold) {
					toward_zero = zero;
					i = iterations;
					break;
				}
			}
		}
	}
	return toward_zero;
}

function point_toward_zero_zeros(z, zeros, iterations, threshold) {
	var toward_zero = null
	for (var zero = 0; zero < zeros.length; zero++) {
		if (math.abs(math.subtract(zeros[zero], z)) < threshold) {
			return -1
		}
	}
	for (var i = 0; i < iterations; i++) {
		z = newtonsMethod_zeros(z, zeros);
		for (var zero = 0; zero < zeros.length; zero++) {
			if (math.abs(math.subtract(zeros[zero], z)) < threshold) {
				toward_zero = zero;
				i = iterations;
				break;
			}
		}
	}
	return toward_zero;
}

function newtonsMethod(z, f, derivative) {
	return math.subtract(z, math.divide(f(z), derivative(z)));
}

function newtonsMethod_zeros(z, zeros) {
	return math.subtract(z, math.divide(zerosFunction(z, zeros), zerosFunction_derivative(z, zeros)));
}

function colorCanvas(f, derivative, zeros, iterations, threshold, corner_coords, colors) {
	var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
	var coord_diff = [math.abs(corner_coords[1][0] - corner_coords[0][0]), math.abs(corner_coords[1][1] - corner_coords[0][1])];
	for (var x = 0; x < canvas.width; x++) {
		for (var y = 0; y < canvas.height; y++) {
			pos = (x + canvas.width * y) * 4;
			point = math.complex(corner_coords[0][0] + coord_diff[0] * x / canvas.width, corner_coords[0][1] + coord_diff[1] * y / canvas.height);
			toward = point_toward_zero(point, f, derivative, zeros, iterations, threshold);
			if (toward != null) {
				imageData.data[pos] = colors[toward][0];
				imageData.data[pos + 1] = colors[toward][1];
				imageData.data[pos + 2] = colors[toward][2];
			} else {
				imageData.data[pos] = 0;
				imageData.data[pos + 1] = 0;
				imageData.data[pos + 2] = 0;
			}
			imageData.data[pos + 3] = 255;
		}
	}
	context.putImageData(imageData, 0, 0);
}

function colorCanvasZeros(zeros, iterations, threshold, corner_coords, colors) {
	var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
	var coord_diff = [math.abs(corner_coords[1][0] - corner_coords[0][0]), math.abs(corner_coords[1][1] - corner_coords[0][1])];
	for (var x = 0; x < canvas.width; x++) {
		for (var y = 0; y < canvas.height; y++) {
			pos = (x + canvas.width * y) * 4;
			point = math.complex(corner_coords[0][0] + coord_diff[0] * x / canvas.width, corner_coords[0][1] + coord_diff[1] * y / canvas.height);
			toward = point_toward_zero_zeros(point, zeros, iterations, threshold);
			if (toward == null) {
				imageData.data[pos] = 0;
				imageData.data[pos + 1] = 0;
				imageData.data[pos + 2] = 0;
			} else if (toward == -1) {
				imageData.data[pos] = 255;
				imageData.data[pos + 1] = 255;
				imageData.data[pos + 2] = 255;
			} else {
				imageData.data[pos] = colors[toward][0];
				imageData.data[pos + 1] = colors[toward][1];
				imageData.data[pos + 2] = colors[toward][2];
			}
			imageData.data[pos + 3] = 255;
		}
	}
	context.putImageData(imageData, 0, 0);
}

function zerosFunction(z, zeros) {
	var value = math.complex(1, 0);
	for (var i = 0; i < zeros.length; i++) {
		value = math.multiply(value, math.subtract(z, zeros[i]));
	}
	return value
}

function zerosFunction_derivative(z, zeros) {
	return math.subtract(math.multiply(3, math.pow(z, 2)), math.add(math.multiply(math.add(zeros[0], math.add(zeros[1], zeros[2])), math.multiply(z, 2)), math.add(math.multiply(zeros[0], zeros[1]), math.add(math.multiply(zeros[1], zeros[2]), math.multiply(zeros[0], zeros[2])))))
}

function square(z) {
	return math.subtract(math.multiply(z, z), 1);
}

function square_derivative(z) {
	return math.multiply(2, z);
}

function cube(z) {
	return math.subtract(math.pow(z, 3), 1);
}

function cube_derivative(z) {
	return math.multiply(3, math.pow(z, 2));
}

window.addEventListener('load', init);