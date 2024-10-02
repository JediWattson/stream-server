const FormSheet = new CSSStyleSheet();
FormSheet.replaceSync(`
 :host {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`);


const obsLogin = "obs-login";
class ObsLoginElement extends HTMLElement {
  constructor() {
    super();
    const template = document.createElement('template')
    template.innerHTML = `
      <text-field id="url">
        <span slot="label">Obs Url:</span>
      </text-field>
      <text-field id="password" type="password">
        <span slot="label">Password:</span>
      </text-field>
      <submit-button id="submit">
        <span slot="label">connect</span>
      </submit-button>
    `
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.shadowRoot.adoptedStyleSheets = [FormSheet];
    this._internals = this.attachInternals();
  }

  set onSubmit(cb) {
    this.shadowRoot.getElementById("submit").onclick = () => {
      const obsUrl = this.shadowRoot.getElementById("url").value;
      const password = this.shadowRoot.getElementById("password").value;
      cb(obsUrl, password)
    }
  }
}

customElements.define(obsLogin, ObsLoginElement);

