function router(){
    window.onpopstate = (event) => {
        console.log(event.state)
    }
}

router()