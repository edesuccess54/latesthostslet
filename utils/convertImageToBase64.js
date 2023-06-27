

const convertImage = (file) => {

    let reader = new FileReader();

    reader.addEventListener('load', () => {
        return reader.result
    })

    reader.addEventListener('error', () => { 
        return reader.error
    })
 
    reader.readAsDataURL(file);
}

module.exports = convertImage