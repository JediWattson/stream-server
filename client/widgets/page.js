const pageSheet = new CSSStyleSheet();

class Page extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [pageSheet];
  }

  get configName() {
    return this._configName
  }

  set configName(configName) {
    this._configName = configName
    this.load(configName) 
  }

  getElementById = (id) => this.shadowRoot.getElementById(id)

  connectedCallback() {
    controller.connected()
  }
  
  async load(configName) {
    const res = await fetch(`static/pages/json/${configName}.json`);
    const data = await res.json();

    for(let i = 0; i < pageSheet.cssRules.length; i++) {
      await pageSheet.replace(i)
    }
    data.styles.forEach(rule => pageSheet.insertRule(rule))

    const componentTypes = new Set();
    Object.values(data.components).forEach((c) => componentTypes.add(c.type));

    const componentsLoading = {};
    const handleLoad = type => {
      componentsLoading[type] = false;
      if (Object.values(componentsLoading).every((l) => !l))
        this.build(data);
    };

    componentTypes.forEach(type => {
      const otherScript = document.getElementById(type);
      if (otherScript) return handleLoad(type);

      componentsLoading[type] = true;

      makeScript({
        id: type,
        src: `static/widgets/${type}.js`,
        onload: () => handleLoad(type)
      })
    });
  }

  build(data) {
    const template = document.createElement("template");
    template.innerHTML = data.tree
      .map((section) => this.makeComponent(section, data.components))
      .join("");
  
    for (let child of this.shadowRoot.children) {
      this.shadowRoot.removeChild(child)
    }
    
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.loadDeps(data)
    controller.built()
  }

  makeComponent(key, components) {
    if (Array.isArray(key))
      return key
        .map((el) => this.makeComponent(el, components))
        .join("\n");
    if (typeof key === "string") {      
      const component = components[key];
      const slots = component.slots 
        ? Object.entries(component.slots)
          .map(([type, value]) => `<span slot=${type}>${value}</span>`)
          .join("\n")
        : ""

      const props = component.props 
        ? Object.entries(component.props).reduce((acc, [key, val]) => {
          const propStr = JSON.stringify(val).replace(/"/g, '&quot;')
          acc.push(`${key}="${propStr}"`)
          return acc
        }, []).join(" ")
        : ""
      
      return `
        <${component.name} id="${key}" ${props}>
          ${slots} 
        </${component.name}>
      `
    }

    return Object.entries(key)
      .map(
        ([className, el]) => `
      <div class="${className}">
        ${this.makeComponent(el, components)}
      </div>
    `,
      )
      .join("\n");
  }

  loadDeps({ dependencies = [] }) {
    dependencies.forEach((dep) => {
      makeScript({ src: `static/js/${dep}.js` })
    })
  }
}

customElements.define("page-controller", Page);
