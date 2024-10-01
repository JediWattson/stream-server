class SubmitButton extends HTMLElement {
  constructor() {
    super();
    const template = document.createElement('template')
    template.innerHTML = `
      <button id="submit-button">
        <slot name="label">label</slot>
      </button>
    `
    
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

customElements.define("submit-button", SubmitButton);

