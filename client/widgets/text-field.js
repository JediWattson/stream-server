const textField = "text-field";
const textFieldSheet = new CSSStyleSheet();
textFieldSheet.replaceSync(`
  :host {
    display: flex;
    flex-direction: column;
    gap: 4px;

  }

  :host > label {
    padding-left: 4px;
  }

  :host > input {
    transition: 
      padding 300ms,
      box-shadow 300ms,
      margin-top 300ms;
    padding: 4px 8px;
    border-radius: 8px;
    box-shadow: 0 0 6px 2px #709ef1;
  }

  :host > input:focus {
    margin-top: 2px;
    outline: none;
    padding: 6px 8px;
    box-shadow: 0 0 6px 4px gold;
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
