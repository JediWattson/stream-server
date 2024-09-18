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

const listStatesEnum = {
  EMPTY: "empty",
  NOT_EMPTY: "not-empty"
}

const listItemIndicator = "list-item-indicator"
const listContainer = "list-container"
class ListContainerElement extends HTMLElement {
  constructor() {
    super()
  	const template = document.getElementById(`${listContainer}-template`).content
		const shadowRoot = this.attachShadow({ mode: "open" })
		shadowRoot.appendChild(template.cloneNode(true))
    this._internals = this.attachInternals()
	  this._internals.states.add(listStatesEnum.EMPTY)
  }

  empty() {
	  this._internals.states.clear()
	  this._internals.states.add(listStatesEnum.EMPTY)
  }

  set data(list) {
    const container = this.shadowRoot.getElementById("container")
    container.innerHTML = ""

    list.forEach(item => {
      const listItemElement = document.createElement(listItemIndicator) 
      const span = document.createElement('span') 
      span.setAttribute("slot", "label")
      span.textContent = item.label
      listItemElement.appendChild(span)
      container.appendChild(listItemElement)
    })
	  this._internals.states.clear()
	  this._internals.states.add(listStatesEnum.NOT_EMPTY)
  }
}

customElements.define(listContainer, ListContainerElement)

class ListItemIndicatorElement extends HTMLElement {
  constructor() {
    super()
    c
		const shadowRoot = this.attachShadow({ mode: "open" })
		shadowRoot.appendChild(template.cloneNode(true)) 
  }
}

customElements.define(listItemIndicator, ListItemIndicatorElement)
