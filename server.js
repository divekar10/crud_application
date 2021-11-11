const express = require('express');
// var flash = require('express-flash');
const path = require('path');
const cors = require('cors');
const db = require('./connection');

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: false}));

// static folder
// app.use(express.static(path.join(__dirname, "assets")))

//ejs
app.set('view engine', 'ejs');

//Querying for pagination
const resultsPerPage = 10;
app.get('/', (req, res) =>{
    let sql = 'SELECT productmaster.productID, productmaster.productName,productmaster.catID, catmaster.catName FROM productmaster, catmaster WHERE productmaster.catID = catmaster.catID;';
    db.query(sql, (err, result)=> {
        if(err) throw err;
        const numOfResults = result.length;
   const numOfPages = Math.ceil(numOfResults / resultsPerPage);
   let page = req.query.page ? Number(req.query.page) : 1;
       if(page > numOfPages){
           res.redirect('/?page='+encodeURIComponent(numOfPages));
       }else if(page < 1){
           res.redirect('/?page='+encodeURIComponent('1'));
       }
       //determining sql limit
       const startingLimit = (page - 1) * resultsPerPage;
       sql = 'SELECT productmaster.productID, productmaster.productName,productmaster.catID, catmaster.catName FROM productmaster, catmaster WHERE productmaster.catID = catmaster.catID LIMIT '+startingLimit+',' +resultsPerPage+';';
       db.query(sql,(err, result)=>{
           if(err) throw err;
           let iterator = (page - 3 ) < 1 ? 1 : page - 3;
           let endingLink = (iterator + 5) <= numOfPages ? (iterator + 5 ) : page + (numOfPages - page);
            if(endingLink < (page + 2)){
                iterator -= (page + 2) - numOfPages;
            }
        res.render('index', {data : result, page, iterator, endingLink, numOfPages});
       });
    });
});

//fetching data for table
app.get('/add-product', function(req, res) {
    let sql = 'SELECT * FROM catmaster;';
    db.query(sql,(err, result) =>{
        if(err) throw err;
        res.render('add_product', {data : result});
    });
  });
//adding product to the database table productmaster
app.post('/add-product', (req,res) =>{
    let productName = req.body.name;
    let catID = req.body.category;
  
    let sql = 'INSERT INTO productMaster (productName, catID) VALUES (?,?);'
    db.query(sql,[productName, catID],(err, result) =>{
        if(err) throw err;
        // req.flash('success', 'Data added successfully !');
        res.redirect('/');
    });
    // res.render('add_product'); 
});
//fetching data for selected product to be updated
app.get('/update-product/:id', (req,res) =>{
    let productID = req.params.id;
    let sql = 'SELECT productmaster.productID, productmaster.productName,productmaster.catID, catmaster.catName FROM productmaster, catmaster WHERE productmaster.catID = catmaster.catID AND productID = ?';
    db.query(sql,[productID],(err, result) =>{
        if(err) throw err;
        res.render('update_product',{data : result}); 
    });
});

//updating product
app.post('/update-product/:id', (req, res) =>{
    let productID = req.params.id;
    let productName = req.body.name;
    let catID = req.body.category;
    let sql = 'UPDATE productmaster SET productName = ?, catID = ? WHERE productID = ? ;';
    db.query(sql, [productName, catID, productID], (err, res) => {
        if(err) throw err;
        
    })
    res.redirect('/');
});

//deleting product using productID
app.get('/delete/:id', (req, res) => {
    let productID = req.params.id;
    let sql = 'DELETE FROM productmaster WHERE productID = ?;';
    db.query(sql, [productID], (err, res)=> {
        if(err) throw err;
       
    });
    res.redirect('/');
});

//fetching data from catmaster table for the displaying categories
app.get('/add-category', function(req, res) {
    let sql = 'SELECT * FROM catmaster;';
    db.query(sql,(err, result) =>{
        if(err) throw err;
        res.render('add_category', {data : result});
    });
    });
//adding a new category to the database table catmaster
    app.post('/add-category', (req,res) =>{
        let catName = req.body.name;
        let sql = 'INSERT INTO catmaster (catName) VALUES (?);'
        db.query(sql,[catName],(err, result) =>{
            if(err) throw err;
            // req.flash('success', 'Data added successfully !');
            res.redirect('add-category');
        });
        // res.render('add_product'); 
    });
//fetching data from database table for selected category to be displayed in placeholder
    app.get('/update-cat/:id', (req,res) =>{
        let catID = req.params.id;
        let sql = 'SELECT * FROM catmaster WHERE catID = ?';
        db.query(sql,[catID],(err, result) =>{
            if(err) throw err;
            res.render('update_cat',{data : result}); 
        });
    });
//updating category using catID
    app.post('/update-cat/:id', (req, res) =>{
        let catID = req.params.id;
        let catName = req.body.name;
        let sql = 'UPDATE catmaster SET catName = ? WHERE catID = ? ;';
        db.query(sql, [catName, catID ], (err, res) => {
            if(err) throw err;
            
        })
        res.redirect('/add-category');
    });
//deleting category using catID
    app.get('/deleteCat/:id', (req, res) => {
        let catID = req.params.id;
        let sql = 'DELETE FROM catmaster WHERE catID = ?;';
        db.query(sql, [catID], (err, res)=> {
            if(err) throw err;
           
        });
        res.redirect('/add-category');
    });



app.listen(process.env.PORT || 3000, () =>{
    console.log('server is running...');
})

module.exports = app;