require('dotenv').config()
const db = require('../custom/dbManager');
const router = require('express').Router();
const path = require('path');
const azBlob = require('../custom/storageManager');
const { json } = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_KEY_SK);
const ejs_helpers = require('../custom/helper_ejs.js')

router.get('/',(req,res)=>{
    res.redirect('/home')
})
router.get('/home',(req,res)=>{
    res.render('site/home.ejs')
})
router.get('/valuation',(req,res)=>{
    console.log(req.query)
    var addr1 = req.query.addr1;
    var addr2 = req.query.addr2;
    var town = req.query.town;
    var county = req.query.county;
    var postcode = req.query.postcode;
    res.render('site/valuation.ejs',{addr1,addr2,town,county,postcode})
})
router.get('/guide',async(req,res)=>{
    var faqs = await db.getFAQs();
    res.render('site/guide.ejs',{faqs})
})

router.get('/contact',async(req,res)=>{
    console.log(req.query)
    var question = req.query.question
    res.render('site/contact.ejs',{question})
})
router.get('/askaquestion',async(req,res)=>{
    console.log(req.query)
    var question = req.query.question
    res.render('site/askaquestion.ejs',{question})
})
router.get('/about-us',async(req,res)=>{
    var members = await db.getMembers();
    members = await azBlob.getFiles(members,'image')
    console.log(members)
    res.render('site/about-us.ejs',{members})
})
router.get('/privacy-policy',async(req,res)=>{
    res.render('site/privacy-poilcy.ejs')
})
router.get('/contact-us',async(req,res)=>{
    var apikey = process.env.GOGGLEMAPS_API
    res.render('site/contact-us.ejs',{apikey})
})
router.get('/auction-upcoming',async (req,res)=>{
    var auctions = await db.getUpcomingAuctions();
    res.render('site/upcoming',{auctions:auctions});
})
router.get('/thank-you',async (req,res)=>{
    res.render('site/thank-you');
})
router.get('/company/why-choose-auction-house',async (req,res)=>{
    res.render('site/choose-us');
})

router.post('/savequery',async(req,res)=>{
    var q = req.body;
    console.log(q)
    await db.saveEnquriy(q.firstname,q.lastname,q.email,q.telephone,q.addr1,q.addr2,q.town,q.postcode,q.info)
    res.json({status:true})
})




router.get('/auction-lots',async (req, res) => {
    var lots = await db.getProperties();
    lots = await azBlob.getFiles(lots,'img')
	res.render('site/auction-lots',{lots,msg:'',helper:ejs_helpers});
});



router.get('/online/auction/:id',async (req, res) => {

    var lots = await db.getPropertiesByAuctionId(req.params.id);
    lots = await azBlob.getFiles(lots,'primaryimage')
	res.render('site/auction-id-lot',{lots,msg:''});
});
router.get('/auction-lots-list',async (req, res) => {
    var lots = await db.getProperties();
    lots = await azBlob.getFiles(lots,'img')
	res.render('site/auction-lots-list',{lots,msg:'',helper:ejs_helpers});
});



router.get('/auction-maps',async (req,res)=>{
    var lots = await db.getProperties();
    lots = await azBlob.getFiles(lots,'img')
      var apikey = process.env.GOGGLEMAPS_API
    res.render('site/auction-maps',{lots,msg:'',apikey,helper:ejs_helpers});
})







router.post('/auction-lots8',async (req, res) => {
    var lots = await db.getPropertiesLimit8();
    lots = await azBlob.getFiles(lots,'primaryimage')
    // lots.forEach(async p=>{
    //     if(!p.img)p.img ='abc/b2c63fa2-dd22-498d-a5f9-162a2523a58b.jpg'
    //     var sasToken = await azBlob.generateSasToken(p.img)
    //     console.log(sasToken)
    //     p.uri = sasToken.uri;
    //   })
	res.render('site/auction-lots8',{lots,msg:'',helper:ejs_helpers});
});

router.post('/addtofav',async (req,res)=>{
    var propertyid = req.body.propertyid;
    await db.addToFavourties(req.session.userid,req.body.propertyid)
    res.json({succes:true})
})
router.post('/removefromfav',async (req,res)=>{
    var propertyid = req.body.propertyid;
    await db.removeFromFavourties(req.session.userid,req.body.propertyid)
    res.json({succes:true})
})

router.get('/auction-rooms',async (req,res)=>{
    var rooms = await db.getRooms()
    res.render('site/auction-rooms',{rooms});
})
router.get('/auction-online',async (req,res)=>{
    res.render('site/auction-online');
})
router.get('/auction-finance',async (req,res)=>{
    res.render('site/finance');
})
router.get('/auction-results',async (req,res)=>{
    var auctions = await db.getAuctionsPastAuctions();
    res.render('site/auction-results',{auctions});
})
router.get('/thank-you',async (req,res)=>{
    res.render('site/thank-you');
})


router.post('/auctiondetails',async (req, res) => {

    var lots = await db.getPropertiesByAuctionIdCompleted(req.body.id);
    lots = await azBlob.getFiles(lots,'primaryimage')
	res.json({lots,msg:''});
});
module.exports = router;