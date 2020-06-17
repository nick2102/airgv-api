window.onload = () => {
    const weatherForm  = document.querySelector('form')
    const search = document.querySelector('input')
    const errorMessage = document.querySelector('#errorMessage')
    const responseMessage = document.querySelector('#responseMessage')

    weatherForm.addEventListener('submit', (e) =>{
        e.preventDefault()

        const location = search.value
        if(location === '')
            errorMessage.textContent = 'You must enter location'
        else {
            const url = '/weather?search=' + location + '$'
            errorMessage.textContent = ''
            responseMessage.textContent = 'Loading ...'
            // Getting data from weather route
            fetch(url).then((response) => {
                response.json().then((data) => {
                    if (data.error) {
                        errorMessage.textContent = data.error
                        responseMessage.textContent = ''
                    } else {
                        errorMessage.textContent =data.location
                        responseMessage.textContent = data.forecast
                    }
                })
            })
        }
    })
}
