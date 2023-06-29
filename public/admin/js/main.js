

// delete property 
const trashCans = document.querySelectorAll('.trash');

const deleteProperty = async (e) => {
    const propertyId = e.target.dataset.trash;

    try {
        const response = await fetch(`/auth/admin/delete/${propertyId}`, {
            method: 'DELETE',
        });

        if (!response) {
            throw new Error('Property failed to delete')
        }

        const json = await response.json();

        if (json.error) {
            throw new Error(json.error);
        }

        if (json.success) { 
            alert(json.message);
            location.reload();
        }
        
    } catch (error) {
        alert(error.message)
    }
}
trashCans.forEach(trashCan => trashCan.addEventListener('click', deleteProperty));

// const logout user 
const logoutICons = document.querySelectorAll('.logout');

const logOutUSer = async (e) => {
    e.preventDefault()

    try {
        const response = fetch('/auth/users/logout', {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('logout failed');
        }

        const json = await response.json();

        if (json.error) { 
            throw new Error(json.error);
        }

        if (json.success) { 
            location.assign('/');
        }
        
    } catch (error) {
        alert(error.message)
    }
}
logoutICons.forEach(logoutICon => logoutICon.addEventListener('click', logOutUSer));
