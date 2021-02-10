export class ArmExpandSectionLink extends HTMLAnchorElement {
	constructor () {
		super();

		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(this.constructor.buildTemplate().content.cloneNode(true));

		this.shadowRoot.getElementById("link").onclick = (event) => this.dispatchEvent(new Event("click"));
	}

	attributeChangedCallback (name, oldVal, newVal) {

	}

	static get observedAttributes () {
		return [
			`isexpanded`,
		];
	}

	static buildTemplate () {
		const tmpl = document.createElement("template");
		tmpl.innerHTML = /* html */`
			<style type="text/css" rel="stylesheet">
			:host(.expanded) #expandedContent {
				display: inline-block;
			}
			:host(.collapsed) #collapsedContent {
				display: inline-block;
			}
			:host(.expanded) #collapsedContent {
				display: none;
			}
			:host(.collapsed) #expandedContent {
				display: none;
			}
			</style>
			<span id="text">
				<slot name="expanded"></slot>
				<svg class="coreui--icon__svg">
					<use href="lib/@coreui/icons/sprites/free.svg#cil-minus"></use>
				</svg>
			</span>
			<span id="collapsedContent">
				<slot name="collapsed"></slot>
				<svg class="coreui--icon__svg">
					<use href="lib/@coreui/icons/sprites/free.svg#cil-minus"></use>
				</svg>
			</span>
		`;
		return tmpl;
	}

	static get is () {
		return "arm-expand-section-link";
	}
}

customElements.define(ArmExpandSectionLink.is, ArmExpandSectionLink, {
	extends: "a",
});
