
const handleSubmit = async (payload) => {
  const { username, password } = payload
  const headers = { Authorization: `Bearer ${btoa(`${username}:${password}`)}` };
  const res = await fetch('/auth/login', { headers })
  if (res.status !== 204) return    

  // await fetch('/subscriptions')    
}

const makeScript = ({ src, id, onload }) => {
  const script = document.createElement("script");
  
  if (id)
    script.id = id;
  if (onload)
    script.onload = onload;
  
  script.src = src;
  document.head.append(script);
  return script
}

const onload = () => {
  const page = document.createElement('page-controller')
  document.body.appendChild(page)
}

const pageBuilt = () => {
  const streamForm = document.getPageElementById("stream-login");
  streamForm.onSubmit = handleSubmit;

  const signupButton = document.getPageElementById("signup");
  signupButton.onclick = () => console.log("hello?")
}

const controller = async () => { 
  await makeScript({ onload, src: "static/widgets/page.js" })
}

controller()

// "obs-login": {
//   "name": "composable-form",
//   "type": "form",
//   "props": {
//     "fields": [
//       {
//         "type": "text",
//         "id": "url",
//         "label": "OBS Url"
//       },
//      {
//         "type": "text",
//         "id": "obs-password",
//         "label": "Password",
//         "options": { "type": "password" }
//       }
//     ] 
//   }
// },

// "action-stream-status": {
//   "name": "status-indicator",
//   "type": "status",
//   "slots": {
//     "title": "Action Stream"
//   }
// },
// "obs-status": {
//   "name": "status-indicator",
//   "type": "status",
//   "slots": {
//     "title": "Obs"
//   }
// }