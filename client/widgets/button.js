const buttonSheet = new CSSStyleSheet();
buttonSheet.replaceSync(`
  :host > button {
    cursor: pointer;
    border-radius: 12px;
    padding: 4px 8px;
    background: #c7dbf9;
    text-transform: uppercase;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 0 8px 1px #c7dbf9;
  }

`);

class Button extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [buttonSheet];
  }

  set onClick(cb) {
    this._handleClick = cb
  }

  handleClick() {
    if(!this._handleClick) return
    
    this._handleClick()
  }

  connectedCallback() {
    const type = this.getAttribute("type");
    const template = document.createElement("template");

    template.innerHTML = `
      <button 
        onclick={this.handleClick}
        ${type && type !== "" ? `type=${type}` : ""}
      >
        <slot name="label"></slot>
      </button>
    `;
    
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

customElements.define("button-component", Button);
