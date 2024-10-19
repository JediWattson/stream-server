const textField = "text-field";
const textFieldSheet = new CSSStyleSheet();
textFieldSheet.replaceSync(`
  :host {
    display: flex;
    flex-direction: column;
  }
`);

class TextFieldElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    const id = this.getAttribute("id");
    const template = document.createElement("template");
    template.innerHTML = `
      <label for="text-input">
        <slot name="label">label needed</slot>
      </label>
      <input 
				id="${id}-input"
				${this.hasAttribute("type") ? `type=${this.getAttribute("type")}` : ""}
			/>
    `;

    this.shadowRoot.adoptedStyleSheets = [textFieldSheet];
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  get value() {
    return this.shadowRoot.getElementById(`${this.getAttribute("id")}-input`)
      .value;
  }
}

customElements.define(textField, TextFieldElement);
