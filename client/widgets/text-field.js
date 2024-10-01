
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
    const template = document.createElement('template')
    template.innerHTML = `
      <label for="text-input">
        <slot name="label">label needed</slot>
      </label>
      <input type="text" id="text-input" />
    `  

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.adoptedStyleSheets = [textFieldSheet];
    shadowRoot.appendChild(template.content.cloneNode(true));
    const type = this.getAttribute("type");
    if (type === "password")
      this.shadowRoot.getElementById("text-input").type = type;
  }

  get value() {
    return this.shadowRoot.getElementById("text-input").value;
  }
}

customElements.define(textField, TextFieldElement);


