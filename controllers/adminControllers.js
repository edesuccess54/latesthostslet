

const adminDashboard = (req, res, next) => { 
    res.render('admin/index', {title: 'Dashboard'})
}

const createProductPage = (req, res, next) => { 
    res.render('admin/create', {title: 'Create Property'})
}


const createProduct = async (req, res, next) => { 
    const { } = req.body


    console.log(req.files)

    

    res.json({success: true, message: 'Product successfully created'})
}









module.exports = {
    adminDashboard,
    createProductPage,
    createProduct
}