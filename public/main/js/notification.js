 class toastNotification {
    constructor(message) {
        this.message = message
    }
     success(message, toast, toastIcon, toastMessage, closeNotification) {
        toast.classList.add('show')
        toast.style.backgroundColor = "green"
        toastMessage.style.color = '#fff'
        toastIcon.style.color = '#fff'
        toastMessage.textContent = message
        toastIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>'

        setTimeout(() => closeNotification(toast), 3000)
    }

    error(message, toast, toastIcon, toastMessage, closeNotification) {
        toast.classList.add('show')
        toast.style.backgroundColor = "#ff385c"
        toastMessage.style.color = '#fff'
        toastIcon.style.color = '#fff'
        toastMessage.textContent = message
        toastIcon.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>'

        setTimeout(() => closeNotification(toast), 3000)
    }
}

export const notification = new toastNotification()


// show spinner function 
export function showSpinner(button) {
    button.disabled = true
    button.innerHTML = ' <span style=" display: block; overflow: hidden;"><img style="max-width: 100%; height: 1.875rem; object-fit:contain" src="/main/images/loading.gif" alt=""></span'
}

// hide spinner function 
export function hideSpinner(button, textContent) {
    button.disabled = false
    button.innerHTML = textContent
}

export function closeNotification(toast) {
    toast.classList.remove('show')
}