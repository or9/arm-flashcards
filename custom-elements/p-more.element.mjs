export default class ArmPMore extends HTMLParagraphElement {
	constructor () {
		super();
	}

	static get template () {
		const tmpl = document.createElement("template");
		tmpl.innerHTML = /* html */`
			<slot></slot>
		`;
		return tmpl;
	}

	static get is () {
		return "p-more";
	}
}

customElements.define(ArmPMore.is, ArmPMore, {
	extends: "p"
});
