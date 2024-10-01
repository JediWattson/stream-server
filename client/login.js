const obsLogin = "obs-login";
class ObsLoginElement extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById(`${obsLogin}-template`).content;
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(template.cloneNode(true));
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

const streamLogin = "stream-login";
class StreamLoginElement extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById(`${streamLogin}-template`).content;
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(template.cloneNode(true));
    this._internals = this.attachInternals();
  }

  set onSubmit(cb) {
    this.shadowRoot.getElementById("submit").onclick = () => {
      const token = this.shadowRoot.getElementById("token").value;
      cb(token)
    }
  }
}

customElements.define(streamLogin, StreamLoginElement);
