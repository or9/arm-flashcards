import {
	converter,
	obj,
} from "../util.mjs";

export default class ArmGameCardElement extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(this.constructor.template.content.cloneNode(true));
		// TODO: figure it out :D
		// Could have two styles of card.
		// 	1) Show Term; User must select matching definition
		// 	2) Show Definition; User must select matching term
		// Card's data should never change; Just decide which way to perform match
	}

	connectedCallback() {

	}

	disconnectedCallback() {

	}

	adoptedCallback() {

	}

	attributeChangedCallback(attr, oldVal, newVal) {
		this[attr] = newVal;
		const attrChangedHandlerName = `${attr}AttrChanged`;

		if (typeof this[attrChangedHandlerName] === "function") {
			this[attrChangedHandlerName].call(this, oldVal, newVal);
		} else {
			console.info(`No handler defined for ${attr}; expected ${attrChangedHandlerName}`);
		}
	}

	static get observedAttributes() {
		return [];
	}

	static get template() {
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
		<slot name="term"></slot>
		<slot name="definition"></slot>
		`;
		return tmpl;
	}

	static get is() {
		return `arm-game-card`;
	}
}

customElements.define(ArmGameCardElement.is, ArmGameCardElement);
