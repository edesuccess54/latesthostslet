

 export const convertImage = async (file) => {
    let photo
    let reader = new FileReader();

    reader.onload = function (e) {
        const fileContent = e.target.result
        let image = fileContent;
        return photo = image
    }

     await reader.readAsDataURL(file);
     return photo
}

