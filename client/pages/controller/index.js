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

const handleLoginReq = ({ username, password, path }) => fetch(`/auth/${path}`, {
  headers: { 
    Authorization: `Bearer ${btoa(`${username}:${password}`)}` 
  }
})

const ContainerTypes = {
  SIGN_UP: 'signup',
  SIGN_IN: 'signin'
}

const init = () => { 
  let page

  const handleSignUp = async ({ values }) => {
    const { username, password1, password2 } = values
    if (password1 !== password2) return

    const res = await handleLoginReq({ 
      username,
      password: password1,
      path: 'create'
    }) 

    if (res.status !== 201) return

    loadSignIn()
  }

  const handleSignIn = async ({ values }) => {
    const res = await handleLoginReq({ ...values, path: 'login' }) 
    if (res.status !== 204) return

    window.location.href = '/dashboard'
  }

  const loadSignIn = () => {page.configName = ContainerTypes.SIGN_IN}
  const loadSignUp = () => {page.configName = ContainerTypes.SIGN_UP}

  const buildSignIn = () => {
    const streamForm = page.getElementById("stream-login");    
    streamForm.onSubmit = handleSignIn;
  
    const signupButton = page.getElementById("signup");
    signupButton.onclick = loadSignUp
  }

  const buildSignUp = () => {
    const signupForm = page.getElementById("stream-signup")
    signupForm.onSubmit = handleSignUp
  }

  const handleBuilt = () => {
    switch (page.configName) {
    case ContainerTypes.SIGN_IN: 
      return buildSignIn()
    case ContainerTypes.SIGN_UP:
      return buildSignUp()
    }
  }

  const onload = () => {
    page = document.createElement('page-controller')
    document.body.appendChild(page)
  }

  makeScript({ onload, src: "static/widgets/page.js" })

  return {
    connected: loadSignIn,
    built: handleBuilt
  }
}

const controller = init()

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