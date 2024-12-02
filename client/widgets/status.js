const statusStatesEnum = {
  DISCONNECTED: "disconnected",
  CONNECTED: "connected",
};

const statusIndicatorSheet = new CSSStyleSheet();
statusIndicatorSheet.replaceSync(`
  :host {
    border-radius: 8px;
    padding: 10px;
    text-align: center;
    width: 130px;
    color: white;
  }

  :host(:state(disconnected)) {
    background: red;
  }
  
  :host(:state(connected)) {
    background: green;
  }
`);

const template = document.createElement("template");
template.innerHTML = `<slot name="title"></slot>`;

class StatusElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const templateContent = template.content.cloneNode(true);
    this.shadowRoot.appendChild(templateContent);
    this.shadowRoot.adoptedStyleSheets = [statusIndicatorSheet];
	}

	connectedCallback() {
    this._internals = this.attachInternals();
    this._internals.states.add(statusStatesEnum.DISCONNECTED);
  }

  set status(nextStatus) {
    this._internals.states.clear();
    this._internals.states.add(nextStatus);
  }
}

customElements.define("status-indicator", StatusElement);
