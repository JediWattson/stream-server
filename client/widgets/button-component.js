class ButtonComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		const type = this.getAttribute("type")
		const template = document.createElement('template')
		template.innerHTML = `
      <button ${type !== "" ? `type=${type}` : ""}>
        <slot name="label"></slot>
      </button>
    ` 
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

customElements.define("button-component", ButtonComponent);
