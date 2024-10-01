const listItemIndicator = "list-item-indicator";
const listContainer = "list-container";

const listStatesEnum = {
  EMPTY: "empty",
  NOT_EMPTY: "not-empty",
};

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
    const template = document.createElement('template')
    template.innerHTML = `
      <h2><slot name="title"></slot></h2>
      <div id="container"></div>
    `
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [listContainerSheet];
    this.shadowRoot.appendChild(template.content.cloneNode(true));
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
    const template = document.createElement('template')
    template.innerHTML = `
      <slot name="label"></slot>
      <div id="status"></div>
    `
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

customElements.define(listItemIndicator, ListItemIndicatorElement);
