const createCustomElement = (name) =>
  customElements.define(
    name,
    class extends HTMLElement {
      constructor() {
        super();
        const template = document.getElementById(`${name}-template`).content;
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(template.cloneNode(true));
      }
    },
  );

createCustomElement("submit-button");

const statusStatesEnum = {
  DISCONNECTED: "disconnected",
  CONNECTED: "connected",
};

const status = "status-indicator";
const statusIndicatorSheet = new CSSStyleSheet();
statusIndicatorSheet.replaceSync(`
  :host {
    border-radius: 5%;
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

class StatusElement extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById(`${status}-template`).content;
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(template.cloneNode(true));
    shadowRoot.adoptedStyleSheets = [statusIndicatorSheet];

    this._internals = this.attachInternals();
    this._internals.states.add(statusStatesEnum.DISCONNECTED);
  }

  set status(nextStatus) {
    this._internals.states.clear();
    this._internals.states.add(nextStatus);
  }
}

customElements.define(status, StatusElement);

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
    const template = document.getElementById(`${textField}-template`).content;
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.adoptedStyleSheets = [textFieldSheet];
    shadowRoot.appendChild(template.cloneNode(true));
    const type = this.getAttribute("type");
    if (type === "password")
      this.shadowRoot.getElementById("text-input").type = type;
  }

  get value() {
    return this.shadowRoot.getElementById("text-input").value;
  }
}

customElements.define(textField, TextFieldElement);

const listStatesEnum = {
  EMPTY: "empty",
  NOT_EMPTY: "not-empty",
};

const listItemIndicator = "list-item-indicator";
const listContainer = "list-container";

const listContainerSheet = new CSSStyleSheet();
listContainerSheet.replaceSync(`
  :host(:state(empty)) {
    display: none;
  }
  
  :host(:state(not-empty)) {
    display: block;
  }
`);

class ListContainerElement extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById(
      `${listContainer}-template`,
    ).content;
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.adoptedStyleSheets = [listContainerSheet];
    shadowRoot.appendChild(template.cloneNode(true));
    this._internals = this.attachInternals();
    this._internals.states.add(listStatesEnum.EMPTY);
  }

  empty() {
    this._internals.states.clear();
    this._internals.states.add(listStatesEnum.EMPTY);
  }

  set data(list) {
    const container = this.shadowRoot.getElementById("container");
    container.innerHTML = "";

    list.forEach((item) => {
      const listItemElement = document.createElement(listItemIndicator);
      const span = document.createElement("span");
      span.setAttribute("slot", "label");
      span.textContent = item.label;
      listItemElement.appendChild(span);
      container.appendChild(listItemElement);
    });
    this._internals.states.clear();
    this._internals.states.add(listStatesEnum.NOT_EMPTY);
  }
}

customElements.define(listContainer, ListContainerElement);

class ListItemIndicatorElement extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById(
      `${listItemIndicator}-template`,
    ).content;
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(template.cloneNode(true));
  }
}

customElements.define(listItemIndicator, ListItemIndicatorElement);
