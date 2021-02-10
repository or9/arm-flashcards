export class ArmRouter extends HTMLElement {
	constructor () {
		super();

		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(this.constructor.buildTemplate().content.cloneNode(true));
	}

	attributeChangedCallback (name, oldVal, newVal) {

	}

	static get observedAttributes () {
		return [
			`page`,
		];
	}

	static buildPageSlot () {

	}

	static buildTemplate () {
		const tmpl = document.createElement("template");
		tmpl.innerHTML = /* html */`
			<style type="text/css" rel="stylesheet">
			:host {

			}
			</style>
			<!-- design: <slot name="someslotname"> -->
			<!-- implementation: <span slot="someslotname">blahblahbleepbloop</span> -->
		`;
		return tmpl;
	}

	static get is () {
		return "arm-router";
	}
}

customElements.define(ArmRouter.is, ArmRouter, {
	extends: "a",
});
