import "./arm-dropzone.element.mjs";
import "./arm-har-viz.element.mjs";
import "./arm-viz-summary.element.mjs";
import "./arm-viz-settings.element.mjs";
import {
	converter,
	obj,
} from "./util.mjs";

export default class ArmRowDropzone extends reflectToPropertyMixin(HTMLElement) {
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
		this.busWorker = new Worker("./bus-worker.js", {
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
			"package.json",
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
		this[attr] = newVal;
		const attrChangedHandlerName = `${attr}AttrChanged`;

		if (typeof this[attrChangedHandlerName] === "function") {
			this[attrChangedHandlerName].call(this, oldVal, newVal);
		} else {
			console.info(`No handler defined for ${attr}; expected ${attrChangedHandlerName}`);
		}
	}

	onmessage (messageEvent) {
		// TODO: put this in some sort of util mixin
		var method = "UNHANDLED";
		var args = [];

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

	async addFile (fileName, fileBuffer) {
		console.log("@arm-row-dropzone#addFile", fileName, fileBuffer);
		try {
			const text = await new Blob([fileBuffer]).text();
			// updateChartData.call(this, fileName, text);
			console.log("#addFile text: ", text);
		} catch (err) {
			console.debug(err);
			console.warn("Error trying to parse file", err.message);
		}

		// function updateChartData (fileName, dataText) {
		// 	this.shadowRoot.getElementById("chartContainer").classList.remove("nodisplay");
		// 	const data = `{ "metadata": "${fileName}", "data": ${dataText} }`;

		// 	const chartContainer = this.shadowRoot.getElementById("chartContainer");
		// 	const summaryElement = this.shadowRoot.getElementById("summary");
		// 	summaryElement.classList.remove("nodisplay");
		// 	summaryElement.setAttribute("data", data);

		// 	if (chartContainer.querySelectorAll("arm-har-viz").length === 0) {
		// 		// Does not have a chart, create one
		// 					// instantiate chart. Constructor invoked here...
		// 		const vizElement = document.createElement("arm-har-viz");
		// 		vizElement.onchange = this.handleVizChange.bind(this);

		// 		updateChart(vizElement, this.path, data);

		// 		chartContainer.appendChild(vizElement);

		// 		this.setAttribute("has-chart", true);
		// 		this.dispatchEvent(new Event("change"));
		// 		this.shadowRoot.querySelector("arm-dropzone").classList.add("row--has-data");
		// 	} else {
		// 		// Already has a chart, just update data
		// 		const vizElement = chartContainer.querySelector("arm-har-viz");
		// 		updateChart(vizElement, this.path, data);
		// 	}

		// 	function updateChart (viz, path, data) {
		// 		viz.setAttribute("path", path);
		// 		// viz.setAttribute("data", data);

		// 		// TODO: change `data` to `datasets`
		// 		// datasets.metadata
		// 		// datasets.options
		// 		// datasets.data
		// 		viz.data = data;

		// 		// maybe this?
		// 		viz.setAttribute("updated", true);
		// 		// viz.setAttribute("type", "horizontalBar");
		// 	}
		// }
	}

	// populateDatalistOptions (optionsArrayBuffer = "") {
	// 	const options = optionsArrayBuffer.split(",");
	// 	const jsonPathInput = this.shadowRoot.getElementById("jsonPath");
	// 	// jsonPathInput.classList.remove("nodisplay");
	// 	this.shadowRoot.getElementById("vizControls").classList.remove("nodisplay");
	// 	// this.shadowRoot.getElementById("settingsBtn").classList.remove("nodisplay");
	// 	// this.shadowRoot.getElementById("resetPath").classList.remove("nodisplay");

	// 	const datalistMap = Array.from(this.shadowRoot.querySelectorAll("#jsonPathDatalist > option"))
	// 		.map(el => el.value);

	// 	options
	// 		.filter((opt) => !datalistMap.includes(opt))
	// 		.map((opt) => {
	// 			const optionElement = document.createElement("option");
	// 			optionElement.innerHTML = opt;
	// 			optionElement.value = opt;

	// 			return optionElement;
	// 		})
	// 		.forEach((el) => {
	// 			this.shadowRoot
	// 				.getElementById("jsonPathDatalist")
	// 				.appendChild(el);
	// 		});

	// 	if (!options.includes(jsonPathInput.value)) {
	// 		jsonPathInput.value = options[0];
	// 		jsonPathInput.dispatchEvent(new Event("change"));
	// 	}

	// 	// TODO: using data-attr-name binding,
	// 	// automatically dispatch appropriate event
	// 	// update attr ( and prop, implicitly )
	// }

	// removeCharts (event) {
	// 	console.log("#removeChart event", event);
	// 	// how do we know which element initiated the action?
	// 	this.setAttribute("path", "");
	// 	this.setAttribute("has-chart", false);
	// 	this.shadowRoot.getElementById("summary").classList.add("nodisplay");
	// 	this.shadowRoot.getElementById("chartContainer").classList.add("nodisplay");
	// 	this.shadowRoot.getElementById("vizControls").classList.add("nodisplay");
	// 	this.shadowRoot.querySelector("arm-dropzone").classList.remove("row--has-data");
	// 	this.shadowRoot.querySelectorAll("#chartContainer > arm-har-viz")
	// 		.forEach((viz) => {
	// 			viz.parentNode.removeChild(viz);
	// 		});

	// 	this.dispatchEvent(new Event("change"));
	// }

	// clearDatalistOptions () {
	// 	this.shadowRoot.getElementById("jsonPathDatalist").innerHTML = "";
	// }

	// set data (jsonStrVal = "{}") {
	// 	try {
	// 		this.__data = JSON.parse(jsonStrVal);
	// 	} catch (err) {
	// 		console.debug(err);
	// 		console.warn("Could not parse JSON string", err.message);
	// 	}
	// }

	static get acceptWorkerMessages () {
		return [
			// "populateDatalistOptions",
			"addFile",
		];
	}

	static get observedAttributes () {
		return [
			`path`,
			`data`,
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
		#chartContainer {
			position: relative;
			flex: 5 1 auto;
		}
		input {
			position: relative;
			flex: 10 1 95%;
			display: inline-flex;
			box-sizing: border-box;
			margin: 10px auto;
		}
		#settingsBtn {
			display: inline-flex;
			flex: 1 1 2%;
			box-sizing: border-box;
			margin-top: 10px;
		}
		arm-dropzone {
			position: fixed;
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;
			box-sizing: border-box;
		}
		arm-dropzone.row--has-data {
			opacity: 0.8;
		}

		.nodisplay {
			display: none !important;
		}
		</style>
		<arm-dropzone id="armDropzone"></arm-dropzone>
		`;
		return tmpl;
	}

	static get is () {
		return "arm-row-dropzone";
	}
}

customElements.define(ArmRowDropzone.is, ArmRowDropzone);


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
