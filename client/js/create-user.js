const newUserForm = document.getPageElementById('new-user')

newUserForm.onSubmit = async (data) => {
  const { password1, password2, userName } = data;
  if (!password1 || password1 !== password2) 
    return
  const headers = { 'Authorization': `Bearer ${btoa(`${userName}:${password1}`)}` } 
  const res = await fetch('/auth/create', { headers })
}
