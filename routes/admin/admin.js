
const { response } = require('express');
var express = require('express');
const { redirect } = require('express/lib/response');
const { read } = require('fs');
const async = require('hbs/lib/async');
const { resolve } = require('path/posix');


const adminHelpers = require('../../helpers/admin-helpers');
var router = express.Router();
const UserHelpers = require('../../helpers/User-Helpers')


const veryfyAdminLogin = (req, res, next) => {
    if (req.session.AdminLoggedIn) {
        next()
    }
    else {
        res.redirect('/admin/admin-login')
    }
}
const veryfyUserLogin = (req, res, next) => {
    if (req.session.UserLoggedin) {
        next()
    }
    else {
        res.redirect('/login')
    }
}
// ----------------------------------------Admin home page-----------------------------------------------------------

router.get("/", veryfyAdminLogin, (async (req, res) => {
    var Totalamount = await adminHelpers.TotalSale()
    var usercount = await adminHelpers.UserCount()
    Profit = Totalamount + (Totalamount * 40 / 100)
    deliverdCount = await adminHelpers.DelveardShipment()
    Userlist= await adminHelpers.UsersForAdmin()
    res.render('admin/admin-index', { adminHeader: true, usercount, Totalamount, Profit, deliverdCount,Userlist })


}))
// ----------------------------------------Admin  login page-----------------------------------------------------------

router.get('/admin-login', ((req, res) => {

  

    if (req.session.adminLoginError) {
        req.session.adminLoginError = null
        var adminLoginerr = "inavlid username or password"
        res.render("admin/admin-login", { adminLoginerr })
    }
    else if (req.session.AdminLoggedIn) {
        res.redirect('/admin')
    }
    else {
        res.render("admin/admin-login")
    }
}))


// ----------------------------------------Admin login post page-----------------------------------------------------------

router.post('/admin-login', ((req, res) => {

    var AdminEmail = req.body.email
    var AdminPassword = req.body.password

    if (AdminEmail == "admin@gmail.com" && AdminPassword == "12345678") {
        req.session.AdminLoggedIn = true

        res.redirect('/admin')
    }

    else {
        req.session.adminLoginError = true
        res.redirect('/admin/admin-login')
    }
}))


// ----------------------------------------------Admin logout-----------------------------------------------------------

router.get('/a-logout', ((req, res) => {
    req.session.AdminLoggedIn = null
    res.redirect('/admin')
}))




// ----------------------------------------------view user-----------------------------------------------------------
router.get('/view-user', ((req, res) => {

    if (req.session.AdminLoggedIn) {
        adminHelpers.viewuser().then((response) => {
            user = response.viewuser

            if (response.status) {
                res.render('admin/view-user', { user, adminHeader: true })
            }
        })
    }
    else {
        res.redirect('/admin/admin-login')

    }



}))



// -----------------------------------------------Block user----------------------------------------------------------

router.get('/block/:id', function (req, res) {

    id = req.params.id
    adminHelpers.block(id).then(((response) => {
        if (response.status) {

            res.json({ Status: true })
        }
    }))
})

// ----------------------------------------------UN-Block user----------------------------------------------------------



router.get('/unblock/:id', ((req, res) => {


    id = req.params.id
    adminHelpers.unblock(id).then((response) => {
        if (response.status) {

            res.json({ Status: true })
        }
    })

}))


// ----------------------------------------------add category----------------------------------------------------------




router.get('/add-category', ((req, res) => {

    if (req.session.AdminLoggedIn) {
        if (req.session.categorysucess) {
            req.session.categorysucess = false
            var succes = "Category added Sucessfulluy"
            res.render('admin/add-category', { succes, adminHeader: true })
        }
        else {
            res.render('admin/add-category', { adminHeader: true })

        }

    } else {
        res.redirect('/admin/admin-login')
    }

}))



// ----------------------------------------------add category   Post----------------------------------------------------------

router.post('/add-category', ((req, res) => {


    adminHelpers.addCategory(req.body).then((response) => {

        if (response.status) {
            req.session.categorysucess = true
            res.redirect('/admin/add-category')
        } else {
            res.send("dd")
        }
    })

}))

// ----------------------------------------------view category-------------------------------------------------------------------

router.get('/view-category', ((req, res) => {
    if (req.session.AdminLoggedIn) {

        adminHelpers.viewCategory().then((response) => {
            category = response.category
            if (response.status) {
                res.render('admin/view-category', { category, adminHeader: true })

            } else {
                res.render('admin/view-category')
            }
        })

    }
    else {
        res.redirect('/admin/admin-login')
    }



}

))


//------------------------------------------------Edit Category--------------------------------------------------------------------

router.get('/edit/:id', function (req, res) {
    if (req.session.AdminLoggedIn) {

        id = req.params.id


        adminHelpers.getCategoryEdit(id).then((response) => {
            var category = response.getcategory


            if (response.status) {

                res.render('admin/edit-category', { adminHeader: true, category })

            }
        })
    } else {
        res.redirect('/admin/admin-login')
    }

})


//----------------------------------------update category---------------------------------------------------------------

router.post('/update-category/:id', function (req, res) {

    id = req.params.id
    categoryDetails = req.body

    adminHelpers.updateCategory(id, categoryDetails).then((response) => {
        if (response.status) {
            res.redirect('/admin/view-category')
        }
        else {
            res.redirect('/admin/edit-category')
        }
    })
})



//--------------------------------------------edit category----------------------------------------------------------------------------

router.get('/deleteCategory/:id', function (req, res) {
    id = req.params.id
    adminHelpers.deleteCategoty(id).then((response) => {
        if (response.status) {
            res.redirect('/admin/view-category')
        }
    })
})

//---------------------------------------------add sub category-------------------------------------------------------------------------
router.get('/add-subcategory', function (req, res) {
    if (req.session.AdminLoggedIn) {


        adminHelpers.viewCategory().then((response) => {
            category = response.category
            if (response.status) {
                if (req.session.addSubCategorySucess) {
                    req.session.addSubCategorySucess = false
                    var addSubCategorySucess = "Sub Category Added"
                    res.render('admin/add-subcategory', { category, adminHeader: true, addSubCategorySucess })
                }
                else {
                    res.render('admin/add-subcategory', { category, adminHeader: true })


                }

            } else {
                res.redirect('/admin/')
            }
        })

    }
    else {
        res.redirect('/admin/admin-login')
    }

})


//----------------------------------------------add-subcategory  post-----------------------------------------------------------------
router.post('/add-subcategory', function (req, res) {
    if (req.session.AdminLoggedIn) {
        adminHelpers.addSubCategory(req.body).then((response) => {
            if (response.status) {
                req.session.addSubCategorySucess = true
                res.redirect('/admin/add-subcategory')

            } else {
                res.redirect('/admin/add-subcategory')
            }
        })


    } else {
        res.redirect('/admin/admin-login')

    }





})



///------------------------------------view sub category--------------------------------------------------------

router.get('/view-subcategory', ((req, res) => {
    if (req.session.AdminLoggedIn) {
        adminHelpers.viewSubCategory().then((response) => {
            if (response.status) {
                var subcategory = response.subcategory
                res.render('admin/view-subcategory', { adminHeader: true, subcategory })

            }
        })
    } else {
        res.redirect('/admin/admin-login')
    }

}))


//---------------------------------------------edit sub category -------------------------------------------------

router.get('/editSubCategory/:subcategory', function (req, res) {
    if (req.session.AdminLoggedIn) {
        var subcategory = req.params.subcategory


        res.render('admin/edit-subcategory', { adminHeader: true, subcategory })
    } else {

        res.redirect('/admin/admin-login')
    }


})

//---------------------------------------------edit sub category post-------------------------------------------------
router.post('/update-subcategory/:subcategory', ((req, res) => {
    subcategoryName = req.params.subcategory

    var newsubcategory = req.body

    adminHelpers.updateSubCategory(subcategoryName, newsubcategory).then((response) => {
        if (response.status) {
            req.session.updateSubCategorysucess = true
            res.redirect('/admin/view-subcategory')
        }
    })
}))

//-------------------------------------------------delete sub category---------------------------------------
router.get('/deleteSubCategory/:subcategoryName', function (req, res) {
    var subcategory = req.params.subcategoryName
    adminHelpers.deleteSubCategory(subcategory).then((response) => {
        if (response.status) {
            res.redirect('/admin/view-subcategory')
        }
    })
})


//--------------------------------------------------------banners edit----------------------------------------------------


router.get('/banners', (req, res) => {


    UserHelpers.getbanner().then((response) => {


        var banner = response.data

        if (req.session.AdminLoggedIn) {
            res.render('admin/banners-edit', { adminHeader: true, banner })
        } else {
            res.redirect('/admin/admin-login')
        }

    })


})

//----------------------------------------------------banners post edit-------------------------------------------------------------

router.post('/update-banner/:id', (req, res) => {

    var id = req.params.id


    adminHelpers.UpdateBanners(id, req.body).then((response) => {
        if (response.status) {
            var id = response.id



            let image1 = req.files.image1
            let image2 = req.files.image2


            if (image1) {
                image1.mv('./public/images/BannerImages/' + id + 'image1.jpg')
            }
            if (image2) {
                image2.mv('./public/images/BannerImages/' + id + 'image2.jpg')
            }
            res.redirect("/admin/")




        }
    }).catch((err) => {


        res.redirect('/admin/banners')
    })

})



//==============================================TO GET DATA FOR MOTHLY WISE REPORT===============================================================


router.get('/MonthlyReportGraph',async(req,res)=>{
    var report = []
    for (i = 1; i <= 12; i++) {
        report.push( await adminHelpers.MonthlyReport(i))
    }
    var month={
          report:report
    }
   
           res.json(month)


})



router.get('/MonthlyReportPage', veryfyAdminLogin, (req, res) => {
    res.render('admin/Monthly-Report', { adminHeader: true })

})

router.post('/mothlywiseReport', async (req, res) => {
    var start = req.body.start+"-"+01
    var end = req.body.start+"-"+31;
    var MonthlyReport = await adminHelpers.MonthlyReporss(start, end)
    var length=MonthlyReport.length

    if(length){
        res.render('admin/Monthly-Report', { adminHeader: true, MonthlyReport })

    }else{
        var NODATA=true
        res.render('admin/Monthly-Report', { adminHeader: true, MonthlyReport,NODATA })

    }




})


router.get('/WeekReport', veryfyAdminLogin, (req, res) => {
    res.render('admin/WeekReport', { adminHeader: true })

})


router.post('/WeekWiseReport', async (req, res) => {

    let week = req.body.week
    const firstMonday = getMondays(2022).getDate()


    const startDate = getDateOfWeek(week.split('-')[1].slice(1), week.split('-')[0], firstMonday)
    var endDate = new Date(startDate.getTime());
    endDate.setDate(endDate.getDate() + 6);

    const fromDateObj = {
        day: startDate.getDate() < 10 ? '0' + startDate.getDate() : '' + startDate.getDate(),
        month: (startDate.getMonth() + 1) < 10 ? '0' + (startDate.getMonth() + 1) : '' + (startDate.getMonth() + 1),
        year: '' + startDate.getFullYear()
    };
    const todateObj = {
        day: endDate.getDate() < 10 ? '0' + endDate.getDate() : '' + endDate.getDate(),
        month: (endDate.getMonth() + 1) < 10 ? '0' + (endDate.getMonth() + 1) : '' + (endDate.getMonth() + 1),
        year: '' + endDate.getFullYear()
    }

    var start = fromDateObj.year + "-" + fromDateObj.month + "-" + fromDateObj.day
    var end = todateObj.year + "-" + todateObj.month + "-" + todateObj.day
  

    var WeeklyReport = await adminHelpers.MonthlyReporss(start, end)
    var length=WeeklyReport.length
    if(length){
        res.render('admin/WeekReport', { WeeklyReport, adminHeader: true })

    }else{
        var NODATA=true
        res.render('admin/WeekReport', { WeeklyReport, adminHeader: true,NODATA})

    }
})


//===================================================SearchProducts===================================================

router.post('/SearchProducts', async (req, res) => {
    var user = req.session.UserLoggedin
    var products = await UserHelpers.SearchProducts(req.body.item)
    res.render('user/shop', { userheader: true, products, user })
})

//============================================== YEAR SALES REPORT PAGE================================================

router.get('/YearSalesReportPage', veryfyAdminLogin, (req, res) => {
    res.render('admin/YearSalesReport', { adminHeader: true })

})


//============================================= YEAR WISE SALES REPORT POST METHODE=====================================

router.post('/YearWiseReport', async (req, res) => {

    var start = req.body.year + "-" + 01 + "-" + 01
    var end = req.body.year + "-" + 12 + "-" + 31
  
 var yearReport = await adminHelpers.MonthlyReporss(start, end)
yearlength=yearReport.length
 if(yearlength){
    res.render('admin/YearSalesReport', { adminHeader: true, yearReport })
 }else{
     var NODATA="NO RESULTS FOUND"
    res.render('admin/YearSalesReport', { adminHeader: true, yearReport,NODATA })
 }
    
})
//==============================================PRODUCT STOCK REPORT===================================================

router.get('/ProductStockReport',veryfyAdminLogin,async(req,res)=>{

    var Stock=await adminHelpers.ProductStockReport()
    res.render('admin/ProductStockReport',{adminHeader:true,Stock})

}),


//==============================================FOR PAYMENT METHODE GRAPH====================================================

router.get('/PaymentGraph',async(req,res)=>{

    adminHelpers.PaymentGraph().then((response)=>{
        res.json(response)
    })
  
})

//================================================= FOR SUB CATEGOTY CHARTS====================================

router.get('/subCategoryChart',async(req,res)=>{
    var chart= await adminHelpers.subCategoryChart().then((response)=>{
        var result=[]
        for(i=0;i<response.length;i++){
            result.push([response[i]._id,response[i].count])
        }
        result.unshift( ['Task', 'Hours per Day'])
        res.json(result)
    })
})








module.exports = router;

function getMondays(y) {
    var d = new Date(y, 0, 1),
        month = d.getMonth(),
        mondays = [];

    d.setDate(1);

    // Get the first Monday in the month
    while (d.getDay() !== 1) {
        d.setDate(d.getDate() + 1);
    }

    // Get all the other Mondays in the month
    while (d.getMonth() === month && mondays.length == 0) {
        mondays.push(new Date(d.getTime()));
        d.setDate(d.getDate() + 7);
    }

    return mondays[0];
}


const getDateOfWeek = (w, y, firstMonday) => {
    var d = (firstMonday + (w - 1) * 7);
    return new Date(y, 0, d);
}