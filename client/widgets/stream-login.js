const streamLogin = "stream-login";
class StreamLoginElement extends HTMLElement {
  constructor() {
    super();
    const template = document.createElement('template')
    template.innerHTML = `
      <text-field id="token">
        <span slot="label">Token:</span>
      </text-field>
      <submit-button id="submit">
        <span slot="label">connect</span>
      </submit-button>

    `
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
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
