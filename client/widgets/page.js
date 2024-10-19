const pageSheet = new CSSStyleSheet();
pageSheet.replaceSync(`
  :host {}
`);

class Page extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [pageSheet];
  }

  connectedCallback() {
    this._componentsLoading = {};
    this.loadPage();
  }

  async loadPage() {
    const res = await fetch("static/pages/index.json");
    const data = await res.json();
    pageSheet.insertRule(data.styles);
    const componentTypes = new Set();
    Object.values(data.components).forEach((c) => componentTypes.add(c.type));

    componentTypes.forEach((type) => {
      this._componentsLoading[type] = true;
      const handleLoad = () => {
        this._componentsLoading[type] = false;
        if (Object.values(this._componentsLoading).every((l) => !l))
          this.buildPage(data);
      };

      const otherScript = document.getElementById(type);
      if (otherScript) return handleLoad();

      const script = document.createElement("script");
      script.id = type;
      script.src = `static/widgets/${type}.js`;
      script.onload = handleLoad;
      document.head.append(script);
    });
  }

  buildPage(data) {
    const template = document.createElement("template");
    template.innerHTML = data.tree
      .map((section) => this.makeComponent(section, data.components))
      .join("");

    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  makeComponent(el, components) {
    if (Array.isArray(el))
      return el
        .map((innerEl) => this.makeComponent(innerEl, components))
        .join("\n");
    if (typeof el === "string") {
      const component = components[el];
      console.log(component);
      return `
        <${component.name}>
          ${Object.entries(component.slots)
            .map(([type, value]) => `<span slot=${type}>${value}</span>`)
            .join("\n")} 
        </${component.name}>
      `;
    }

    return Object.entries(el)
      .map(
        ([className, innerEl]) => `
      <div class="${className}">
        ${this.makeComponent(innerEl, components)}
      </div>
    `,
      )
      .join("\n");
  }
}

customElements.define("page-controller", Page);
