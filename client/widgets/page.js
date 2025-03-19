const pageSheet = new CSSStyleSheet();

class Page extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [pageSheet];
  }

  connectedCallback() {
    this.setGlobalStyles()
    this.loadPage();
  }
  
  setGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      body { 
        font-family: sans-serif;
        background: #082136;
        color: #ababc5;
        margin: 0;
      }
    `
    document.head.appendChild(style); 
  }

  async loadPage() {
    const configName = window.location.pathname === "/" ? "/index" : window.location.pathname
    const res = await fetch(`static/pages/json/${configName}.json`);
    const data = await res.json();

    data.styles.forEach(rule => pageSheet.insertRule(rule))

    const componentTypes = new Set();
    Object.values(data.components).forEach((c) => componentTypes.add(c.type));
    const componentsLoading = {};
    componentTypes.forEach((type) => {
      componentsLoading[type] = true;
      const handleLoad = () => {
        componentsLoading[type] = false;
        if (Object.values(componentsLoading).every((l) => !l))
          this.buildPage(data);
      };

      const otherScript = document.getElementById(type);
      if (otherScript) return handleLoad();

      makeScript({
        id: type,
        src: `static/widgets/${type}.js`,
        onload: handleLoad
      })
    });
  }

  buildPage(data) {
    const template = document.createElement("template");
    template.innerHTML = data.tree
      .map((section) => this.makeComponent(section, data.components))
      .join("");

    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    document.getPageElementById = (id) => this.shadowRoot.getElementById(id)
    this.loadDeps(data)
    pageBuilt()
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
