const composableFormStyleSheet = new CSSStyleSheet();
composableFormStyleSheet.replaceSync(`
	:host form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
`);

const fieldTypes = {
  button: "button-component",
  text: "text-field",
};

const composableForm = "composable-form";
class ComposableFormElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [composableFormStyleSheet];
  }

  connectedCallback() {
    this._formLoaded = false;
    this._componentsLoading = {};
    const fields = this.getFields();
    fields.forEach((field) => this.loadField(field));
    this.loadField({ type: "button" });
  }

  set onSubmit(cb) {
    this._handleSubmit = cb;
  }

  getFields() {
    const fieldsStr = this.getAttribute("fields").trim();
    return JSON.parse(fieldsStr);
  }

  loadField({ type }) {
    this._componentsLoading[type] = true;
    const handleLoad = () => {
      this._componentsLoading[type] = false;
      if (Object.values(this._componentsLoading).every((l) => !l))
        this.loadForm(this.getFields());
    };

    const otherScript = document.getElementById(type);
    if (otherScript) return handleLoad();

    const script = document.createElement("script");
    script.id = type;
    script.src = `static/widgets/${fieldTypes[type]}.js`;
    script.onload = handleLoad;
    document.head.append(script);
  }

  loadForm(fields) {
    if (this._formLoaded) return;

    this._formLoaded = true;
    const id = this.getAttribute("id");
    const template = document.createElement("template");
    template.innerHTML = `
			<form id="${id}-form">
				${fields.map(this.makeField).join("")}
				<button-component id="${id}-submit" type="submit">
					<span slot="label">connect</span>
				</button-component>
    	</form>
		`;
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    const form = this.shadowRoot.getElementById(`${id}-form`);
    form.onsubmit = () => {
      const values = {};
      const fields = this.getFields();
      for (const field of fields) {
        const fieldEl = this.shadowRoot.getElementById(field.id);
        values[field.id] = fieldEl.value;
      }
      this._handleSubmit(values);
    };

    const submitButton = this.shadowRoot.getElementById(`${id}-submit`);
    submitButton.onclick = () => {
      const submitEvent = new SubmitEvent("submit");
      form.dispatchEvent(submitEvent);
    };
  }

  makeField(field) {
    return `
      <${fieldTypes[field.type]}
        id=${field.id}
        ${
          field.options
            ? Object.entries(field.options)
                .map(([k, v]) => `${k}=${v}`)
                .join(" ")
            : ""
        }
      >
        <span slot="label">${field.label}</span>"
      </${fieldTypes[field.type]}>
    `;
  }
}

customElements.define(composableForm, ComposableFormElement);
