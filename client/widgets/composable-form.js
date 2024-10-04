const composableFormStyleSheet = new CSSStyleSheet()
composableFormStyleSheet.replaceSync(`
	:host form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
`)

const composableForm = "composable-form";
class ComposableFormElement extends HTMLElement {
  constructor() {
    super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [composableFormStyleSheet]
  }

	connectedCallback() {
		const fields = this.getFields()
		const id = this.getAttribute('id')
		const template = document.createElement('template')
    template.innerHTML = `
			<form id="${id}-form">
				${fields.map(this.makeField).join("")}
				<button-component id="${id}-submit" type="submit">
					<span slot="label">connect</span>
				</button-component>
    	</form>
		`
		this.shadowRoot.appendChild(template.content.cloneNode(true));
		const form = this.shadowRoot.getElementById(`${id}-form`)
		const submitButton = this.shadowRoot.getElementById(`${id}-submit`)
		submitButton.onclick = () => {
			const submitEvent = new SubmitEvent('submit')
			form.dispatchEvent(submitEvent)
		}
		
	}

  set onSubmit(cb) {
		const id = this.getAttribute('id')
		const form = this.shadowRoot.getElementById(`${id}-form`)
		form.onsubmit = () => {
			const values = {}
			const fields = this.getFields()
			for (const field of fields) {
				const fieldEl = this.shadowRoot.getElementById(field.id)
				values[field.id] = fieldEl.value
			}
			cb(values)
		}
	}

	makeField(field) {
		switch(field.type) {
			case "text":
				return `
					<text-field 
						id=${field.id}
						${field.options 
							? Object
								.entries(field.options)
								.map(([k, v]) => `${k}=${v}`)
								.join(" ")
							: ""
						}
					>
						<span slot="label">${field.label}</span>"
					</text-field>
				`
		}
	}

	getFields() {
		const fieldsStr = this.getAttribute("fields").trim()
		return JSON.parse(fieldsStr)
	}
}

customElements.define(composableForm, ComposableFormElement);

