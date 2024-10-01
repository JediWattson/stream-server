const obsLogin = "obs-login";

class ObsLoginElement extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById(`${obsLogin}-template`).content;
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(template.cloneNode(true));
    this._internals = this.attachInternals();
  }
}

customElements.define(obsLogin, ObsLoginElement);
