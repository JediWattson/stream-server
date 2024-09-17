const createCustomElement = (name) => customElements.define(
	name,
	class extends HTMLElement {
		constructor() {
			super()
			const template = document.getElementById(`${name}-template`).content
			const shadowRoot = this.attachShadow({ mode: "open" })
			shadowRoot.appendChild(template.cloneNode(true))
		}
	}
)

createCustomElement('submit-button')


const statusStatesEnum = {
  DISCONNECTED: "disconnected",
  CONNECTED: "connected"
}

const status = 'status-indicator'
class StatusElement extends HTMLElement {

	constructor() {
		super()
		const template = document.getElementById(`${status}-template`).content
		const shadowRoot = this.attachShadow({ mode: "open" })
		shadowRoot.appendChild(template.cloneNode(true))
    this._internals = this.attachInternals()
	  this._internals.states.add(statusStatesEnum.DISCONNECTED)
  }

  set status(nextStatus) {
    this._internals.states.clear()
    this._internals.states.add(nextStatus)
  }
}

customElements.define(status, StatusElement)


const textField = 'text-field'
class TextFieldElement extends HTMLElement {

	constructor() {
		super()
		const template = document.getElementById(`${textField}-template`).content
		const shadowRoot = this.attachShadow({ mode: "open" })
		shadowRoot.appendChild(template.cloneNode(true))
    const type = this.getAttribute('type')
    if (type === 'password')
      this.shadowRoot.getElementById("text-input").type = type
	}



	get value() {
    return this.shadowRoot.getElementById("text-input").value
	}

}


customElements.define(textField, TextFieldElement)
