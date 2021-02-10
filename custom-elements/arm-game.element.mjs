import "./arm-dropzone.element.mjs";
import "./arm-game-card.element.mjs";
import {
	converter,
	obj,
} from "../util.mjs";

export default class ArmGameElement extends reflectToPropertyMixin(HTMLElement) {
	constructor () {
		super();

		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(this.constructor.template.content.cloneNode(true));

		[
			`dragenter`,
			`dragover`,
			`dragleave`,
			`drop`
		]
		.forEach((eventName) => {
			// Redirect all drag & drop events to dropzone
			this.addEventListener(eventName, (event) => {
				event.preventDefault();
				event.stopPropagation();

				this.shadowRoot.getElementById("armDropzone")
					.dispatchEvent(new event.constructor(event.type, event));
			}, false);
		});
	}

	connectedCallback () {
		// TODO: eventually generate / track _uid and add to name to associate with instance
		this.busWorker = new Worker("../bus-worker.js", {
			type: "module",
			credentials: "include",
			name: this.constructor.is,
		}, {
			type: "module",
		});

		this.shadowRoot.getElementById("armDropzone").busWorker = this.busWorker;
		this.busWorker.onmessage = this.onmessage.bind(this);

		// how to load package.json... xhr? but that may not work so well with local...
		this.busWorker.postMessage([
			"getFileContent",
			"../package.json",
		],
		[
			converter.stringToArrayBuffer("getFileContent"),
			converter.stringToArrayBuffer("package.json"),
		]);
	}

	disconnectedCallback () {
		this.busWorker.terminate();
	}

	adoptedCallback () {
	}

	attributeChangedCallback (attr, oldVal, newVal) {
		console.log("attributeChangedCallback", attr);
		this[attr] = newVal;
		const attrChangedHandlerName = `${attr}AttrChanged`;

		if (typeof this[attrChangedHandlerName] === "function") {
			this[attrChangedHandlerName].call(this, oldVal, newVal);
		} else {
			console.info(`No handler defined for ${attr}; expected ${attrChangedHandlerName}`);
		}
	}

	async addFile(fileName, fileContentBuf) {
		console.log(`#addFile`, fileName, fileContentBuf);
		// this.gameData = converter.arrayBufferToString(fileContentBuf);
		this.gameData = await new Blob([fileContentBuf]).text();
		console.log("ok now this.gameData?", this.gameData);
		// this.setAttribute("gameData", this._gameData);
		// Set game title to gameData title
		// Create a arm-game-card per definition
	}

	// TODO: evaluate whether this is necessary
	// It will report each key of object---including nested keys---as strings
	// getDeepKeys(...args) {
	// 	console.log("#getDeepKeys args", args);
	// }

	onmessage (messageEvent) {
		// TODO: put this in some sort of util mixin
		var method = "UNHANDLED";
		var args = [];
		console.log("@arm-game-element#onmessage", messageEvent.data);

		if (Array.isArray(messageEvent.data)) {
			method = messageEvent.data[0];
			args = messageEvent.data.slice(1);
		} else {
			method = messageEvent.data.method;
			args = messageEvent.data.args;
		}

		if (this.constructor.acceptWorkerMessages.includes(method)) {
			this[method](...args);
		} else {
			console.warn("@arm108-row-dropzone does not have a handler for message: ", method);
		}
	}

	static get acceptWorkerMessages () {
		return [
			// "getDeepKeys",
			// "startGame",
			// "endGame",
			"addFile",
		];
	}

	static get observedAttributes () {
		return [
			// `answered`,
			// `remaining`,
			// `gameData`,
		];
	}

	static get template () {
		const tmpl = document.createElement("template");
		tmpl.innerHTML = /* html */`
		<style type="text/css" rel="stylesheet">
		:host {
			position: relative;
			contain: content;
			height: auto;
			padding: 10px 20px;
		}

		.nodisplay {
			display: none !important;
		}
		</style>
		<div class="flex-content--top">
			<span id="cardsCompleted"></span>/<span id="cardsRemaining"></span>
		</div>
		<arm-dropzone id="armDropzone"></arm-dropzone>
		<button
			id="gameControlStart"
			class="game-control--left"
		>
			Start
		</button>
		<button
			id="gameControlReset"
			class="game-control--right"
			disabled
		>
			Reset
		</button>
		`;
		return tmpl;
	}

	static get is () {
		return "arm-game";
	}
}

customElements.define(ArmGameElement.is, ArmGameElement);


function busWorkerMixin (__class) {
	return class BusWorkerMixin extends __class {
		constructor (...args) {
			super(...args);

			// TODO: move this to its own arm108.util.mixins.reflector
			this.constructor.observedAttributes.forEach((attr) => {
				this[attr] = this.getAttribute(attr) || this.constructor[`default_${attr}`];
			});

			const busWorkerName = this.getAttribute("bus-worker");
			this.busWorker = window[busWorkerName];
			this.busWorker.postMessage("getFileContent");
		}
	}
}

function mixer (mixins = [], __class) {
	// TODO: come back to this...
	// const mix = mixins.reduce((curr, acc) => {
	// 	return curr(acc);
	// });

	// return mix(__class);
}

// TODO: do we want to reflect properties to attributes as well?
function reflectToPropertyMixin (__class) {
	return class ReflectToProperty extends __class {
		constructor (...args) {
			super(...args);

			this.constructor.observedAttributes.forEach((attr) => {
				this[attr] = this.getAttribute(attr) || this.constructor[`default_${attr}`];
			});
		}
	}
}
