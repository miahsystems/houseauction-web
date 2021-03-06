require('dotenv').config()
const mysql = require('mysql');
const params = { host: process.env.MYSQL_HOST,user: process.env.MYSQL_USER,password: process.env.MYSQL_PASS,database: process.env.MYSQL_DB}
const crypto = require('crypto');
var db = mysql.createConnection(params);



class dbManager{

  saveEnquriy(firstname,lastname,email,telephone,addr1,addr2,town,postcode,info){
    return new Promise((resolve,reject)=>{
      db.query('insert into enquiry (firstname,lastname,email,telephone,addr1,addr2,town,postcode,info,datetime) values (?,?,?,?,?,?,?,?,?,NOW())',[firstname,lastname,email,telephone,addr1,addr2,town,postcode,info], function (err, result) {
        if (err) throw err;
        resolve(result)
      })
    })
  }

  getUserVerificationLink(){
    return new Promise((resolve,reject)=>{
      db.query('select * from faq', function (err, result) {
        if (err) throw err;
        resolve(result)
      })
    })
  }

  updateCompanyStatus(userid){
    return new Promise((resolve,reject)=>{
      db.query('update customers set iscompany = 1 where id=?',[userid], function (err, result) {
        if (err) throw err;
        resolve(result)
      })
    })
  }


  getRooms(){
    return new Promise((resolve,reject)=>{
      db.query('select * from auction_rooms', function (err, result) {
        if (err) throw err;
        resolve(result)
      })
    })
  }
  getFAQs(){
    return new Promise((resolve,reject)=>{
      db.query('select * from faq', function (err, result) {
        if (err) throw err;
        resolve(result)
      })
    })
  }
  getMembers(){
    return new Promise((resolve,reject)=>{
      db.query('select * from members', function (err, result) {
        if (err) throw err;
        resolve(result)
      })
    })
  }
getUsers(){
  return new Promise((resolve,reject)=>{
  //  db = mysql.createConnection(params);
    db.query('select * from users', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}

delHistoryAddr(userid,historyid){
  return new Promise((resolve,reject)=>{
    db.query('delete from address_history where customerid = ? and id = ?',[userid,historyid],(err,result)=>{
      if(err) throw err
      resolve(result)
    })
  })
}

addHistoryAddr(userid,addr,startYear,startMonth){
  return new Promise((resolve,reject)=>{
    var tmp=  [userid,addr.premises, addr.door, addr.street, addr.town,addr.district, addr.county, addr.postcode,addr.country,startYear,startMonth]
    db.query('insert into address_history (customerid,premises,door,street,town,district,county,postcode,country,start_year,start_month) values (?)',[tmp], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
updateHistoryAddr(userid,id,addr,startYear,startMonth){
  return new Promise((resolve,reject)=>{
    var tmp=  [addr.premises, addr.door, addr.street, addr.town,addr.district, addr.county, addr.postcode,addr.country,startYear,startMonth,userid,id]
    db.query('update address_history set premises=?,door=?,street=?,town=?,district=?,county=?,postcode=?,country=?,start_year=?,start_month=? where customerid = ? and id=?',tmp, function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}

deleteCustomerAddressHistory(userid,addrid){
  return new Promise((resolve,reject)=>{
   
    db.query('delete from address_history where customerid=? and id = ?',[userid,addrid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getAddressHistoryByUserId(userid){
  return new Promise((resolve,reject)=>{
        db.query('select * from  address_history where customerid = ? order by start_year DESC,start_month DESC',[userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getAddressHistoryById(id,userid){
  return new Promise((resolve,reject)=>{
        db.query('select * from  address_history where customerid = ? and id = ?',[userid,id], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}

getCustomerById(userid){
  return new Promise((resolve,reject)=>{
      db.query('select customers.*,users.forename as agentfname,users.surname as agentlname,company.name AS companyname, company.entitytypeid ,company.address AS companyaddr,opttitles.name as titlename from customers left join opttitles on opttitles.id=customers.title LEFT JOIN company ON company.id=customers.companyid   left join users on users.id=customers.agentid where customers.id = ?',[userid], function (err, result) {
        if (err) throw err;
        resolve(result)
      })
    })
}
getCustomerAccountManager(userid){
  return new Promise((resolve,reject)=>{
      db.query('select customer. = ?',[userid], function (err, result) {
        if (err) throw err;
        resolve(result)
      })
    })
}
getAMLReportsByUser(userid) {
  return new Promise((resolve, reject) => {
    db.query("select * from amlreports where customerid = ?",[userid],function (err, result) {
      if (err) throw err;
      resolve(result);
    })
  });
}

createNewCompany(userid,c){
  return new Promise((resolve,reject)=>{
    console.log('SEACH COMPANY')
    db.query("select * from customers where id = ?",[userid],async function (err, result) {
      if (err) throw err;
      var companyid = result[0].companyid
      if(companyid){
        console.log('FOUND COMPANY')
        db.query(`update company set name = ?,entitytypeid= ?, address= ? where id = ?`,[c.companyname,c.companytype,c.companyaddress,companyid],(err,result)=>{
          if (err) throw err;
          resolve(result)
        })
      }else{
        db.query(`insert into company (name,entitytypeid,address) values (?,?,?)`,[c.companyname,c.companytype,c.companyaddress],(err,result)=>{
          if (err) throw err;
          var companyid = result.insertId;
          db.query('update customers set companyid = ?,iscompany=true where id = ?',[companyid,userid], (err,result) =>{
            if (err) throw err;
            resolve(result)
          })
        })
    }
   })

    
  })
}

updateUserAccountType(userid,iscompany){
  return new Promise((resolve,reject)=>{
      db.query('update customers set iscompany=? where id = ?',[iscompany,userid], (err,result) =>{
        if (err) throw err;
        resolve(result)
      })
  })
}


changeAccountType(userid,iscompany){
  var mythis = this
  return new Promise(async (resolve,reject)=>{ 
    db.query('update customers set iscompany=? where id = ?',[iscompany,userid], (err,result) =>{
      if (err) throw err;
      resolve(result)
    })
    /*
    if(iscompany){
    
    }else{
      await mythis.updateUserAccountType(userid,iscompany)
      resolve({status:true})
    }*/
  })
}
verifycode(userid,code){
  return new Promise((resolve,reject)=>{
    db.query('select * from customers where id = ?',[userid], function (err, result) {
      if (err) throw err;
      if(result[0]){
        var user = result[0]
        if(user.verificationcode==code){
          db.query('update customers set isVerified = 1 where id = ?',[userid], function (err, result) {
            if (err) throw err;
            resolve({status:true})
          })
        }else{
          resolve({status:false})
        }
      }
    })
  })
}
verifypasswordreset(userid,code){
  return new Promise((resolve,reject)=>{
    db.query('select * from customers where id = ?',[userid], function (err, result) {
      if (err) throw err;
      if(result[0]){
        var user = result[0]
        if(user.password_reset==code){
            resolve({status:true})
        }else{
          resolve({status:false})
        }
      }
    })
  })
}
getCompanyById(companyid){
  return new Promise((resolve,reject)=>{
    db.query('select * from company where id = ?',[companyid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getCompanyMembersByCompanyId(companyid){
  return new Promise((resolve,reject)=>{
    db.query('select * from customers where companyid = ?',[companyid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
updateCustomerDetails(userid,title,forename,surname,middlename,telephone,mobile,address){
  return new Promise((resolve,reject)=>{
    db.query(`update customers set title=?,forename=?,surname=?,middlename=?,telephone=?,mobile=?,premises=?,door=?,street=?,town=?,district=?,county=?,postcode=?,country=? where id= ? `,[title,forename,surname,middlename,telephone,mobile,address.premises,address.door,address.street,address.town,address.district,address.county,address.postcode,address.country,userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
updateCustomerAddress(userid,address){
  return new Promise((resolve,reject)=>{
    db.query(`update customers set premises=?,door=?,street=?,town=?,district=?,county=?,postcode=?,country=? where id= ? `,[address.premises,address.door,address.street,address.town,address.district,address.county,address.postcode,address.country,userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
updateCustomerDocusUploaded(userid){
  return new Promise((resolve,reject)=>{
    db.query(`update customers set documentsuploaded=1 where id= ? `,[userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
updateCustomerDetailsNoAddr(userid,title,forename,surname,middlename,mobile){
  return new Promise((resolve,reject)=>{
    db.query(`update customers set title=?,forename=?,surname=?,middlename=?,mobile=?,profile_updated=1 where id= ? `,[title,forename,surname,middlename,mobile,userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
updateCustomerVerificationDetails(userid,dob,nino,driving,passport){
  return new Promise((resolve,reject)=>{
    db.query(`update customers set dob=?,nationalinsurance=?,drivinglicense=?,passport=?,profile_updated=1 where id= ? `,[dob,nino,driving,passport,userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getSellers(){
  return new Promise((resolve,reject)=>{
    db.query('select * from customers', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}

getSolcitors(userid){
  return new Promise((resolve,reject)=>{
    console.log(userid)
    db.query('select * from solicitor_details where customerid = ? ',[userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}

addVerificationDocument(userid,doctype,filename){
  return new Promise((resolve,reject)=>{
    console.log(userid)
    db.query('insert into verification_documents (customerid,doctypeid,name) values (?)',[[userid,doctype,filename]], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getVerificationDocument(userid){
  return new Promise((resolve,reject)=>{
    console.log(userid)
    db.query('select * from verification_documents where customerid = ?',[userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
insertSolictorDetails(userid,firm,name,telephone,email,address){
  return new Promise((resolve,reject)=>{
    db.query('insert into solicitor_details (customerid,firm,name,telephone,email,address) values (?) ',[[userid,firm,name,telephone,email,address]], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}

updateSolictorDetails(solictorid,firm,name,telephone,email,address){
  return new Promise((resolve,reject)=>{
    db.query('update solicitor_details set firm=?,name=?,telephone=?,email=?,address=?  where id = ?',[firm,name,telephone,email,address,solictorid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getVerificationDocumentTypes() {
  return new Promise((resolve, reject) => {
    db.query("select * from verification_document_types", function (err, result) {
      if (err) throw err;
      resolve(result);
    });
  });
}
getSellerFavourites(userid,propertyid){
  return new Promise((resolve,reject)=>{
   // db = mysql.createConnection(params);
    db.query('select * from customerpropertylist where userid=? and propertyid = ?',[userid,propertyid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}
addToFavourties(userid,propertyid){
  return new Promise((resolve,reject)=>{
   // db = mysql.createConnection(params);
    db.query('insert into customerpropertylist (userid,propertyid) values (?)',[[userid,propertyid]], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}
removeFromFavourties(userid,propertyid){
  return new Promise((resolve,reject)=>{
   // db = mysql.createConnection(params);
    db.query('delete from customerpropertylist where userid=? and propertyid = ?',[userid,propertyid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}

addBidDeposit(userid,propertyid,status){
  return new Promise((resolve,reject)=>{
   // db = mysql.createConnection(params);
    db.query('update customerpropertylist set bid_deposit=? where userid=? and propertyid = ?',[status,userid,propertyid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}

getLogin(username,password){
  return new Promise((resolve,reject)=>{
    db.query('select * from customers where username = ? and password = ?',[username,password], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
updatePassword(userid,password){
  return new Promise((resolve,reject)=>{
    let hash = crypto.createHash('md5').update(password).digest("hex");
    db.query('update customers set password = ? where id = ?',[hash,userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getPropertyInfoFields(){
  return new Promise((resolve,reject)=>{
   // db = mysql.createConnection(params);
    db.query('select * from property_info', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}

getPropertyCommercialtype(){
  return new Promise((resolve,reject)=>{
   // db = mysql.createConnection(params);
    db.query('select * from propertycommercial', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}

getAuctionById(auctionid){
  return new Promise((resolve,reject)=>{
    db.query( 'select auctions.*,venues.name as venuename,venues.image,venues.address,venues.town from auctions left join venues on venues.id = auctions.venueid where auctions.id = ?;',[auctionid], function (err, [auction]) {
      if (err) throw err;
      resolve(auction)
    })
  })
}
getAuctionCatalog(auctionid){
  return new Promise((resolve,reject)=>{
    db.query( 'select * from catalog_auctions left join catalogs on catalog_auctions.catalogid = catalogs.id where catalog_auctions.auctionid = ?;',[auctionid], function (err, [auction]) {
      if (err) throw err;
      resolve(auction)
    })
  })
}
getPropertyTypes(){
  return new Promise((resolve,reject)=>{
    db.query('select * from propertytype', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
   // db.end();
  })
}
getPriceTypes(){
  return new Promise((resolve,reject)=>{
    db.query('select * from pricetype', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}

insertPropertyListing(name,addr,header,description,customdata,sellerid,price,pricetypeid,propertytypeid,commercialtypeid,files){
  return new Promise((resolve,reject)=>{
    var prop = [name,addr.premises,addr.door,addr.street,addr.town,addr.county,addr.postcode,addr.latitude,addr.longitude,header,description,price,pricetypeid,sellerid,propertytypeid,commercialtypeid]
    db.query('insert into properties (name,premises,door,street,town,county,postcode,latitude,longitude,header,description,price,pricetype,clientid,propertytype,residentialcommercial) values (?)',[prop], function (err, result) {
      if (err) throw err;
      var propertyid = result.insertId;
      var tempfiles = []
      files.forEach(f=>{
        tempfiles.push([f,propertyid])
      })
      db.query('insert into propertyimages (filename,propertyid) values ?',[tempfiles], function (err, result) {
        if (err) throw err;
        var tempdetails = []
        customdata.forEach(f=>{
          tempdetails.push([f.fieldid,propertyid,f.details])
        })
        db.query('insert into propertydetails (infoid,propertyid,details) values ?',[tempdetails], function (err, result) {
          if (err) throw err;
          resolve(result)
        })
      })





      
    })
   // db.end();
  })
}
getPropertiesByUserIdandAuctionId(userid,auctionid){
  return new Promise((resolve,reject)=>{
  //  db = mysql.createConnection(params);
    db.query(`SELECT myproperties.*,customerpropertylist.id as customerpropertyid,customerpropertylist.bid_deposit AS bid_interest
    from customerpropertylist 
    left JOIN 
    (select  auctions.id as auctionid, auctions.datetime,auctions.status AS auctionstatus, p.id,p.name as propname,p.primaryimage as img,p.price,p.town,p.county from properties p left join customers s on s.id = p.clientid LEFT JOIN auction_properties on p.id = auction_properties.propertyid LEFT JOIN auctions ON auctions.id = auction_properties.auctionid    )
     AS myproperties
    ON myproperties.id = customerpropertylist.propertyid WHERE userid=? and auctionid = ?
    `,[userid,auctionid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}
getPropertiesByUserId(userid){
  return new Promise((resolve,reject)=>{
  //  db = mysql.createConnection(params);
    db.query(`SELECT myproperties.*,customerpropertylist.id as customerpropertyid,customerpropertylist.bid_deposit AS bid_interest
    from customerpropertylist 
    left JOIN 
    (select  auctions.id as auctionid, auctions.datetime,auctions.status AS auctionstatus, p.id,p.name as propname,p.primaryimage as img,p.price,p.town,p.county from properties p left join customers s on s.id = p.clientid LEFT JOIN auction_properties on p.id = auction_properties.propertyid LEFT JOIN auctions ON auctions.id = auction_properties.auctionid    )
     AS myproperties
    ON myproperties.id = customerpropertylist.propertyid WHERE userid=? 
    `,[userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}
getPropertyById(id){
  return new Promise((resolve,reject)=>{
    db.query(`select auctions.id as auctionid,auctions.name AS auctionname,auction_properties.lotno, auctions.datetime,auctions.status AS auctionstatus,aps.name AS auctionstatusname, p.id,p.name as propname,p.virtualtourlink,p.primaryimage as img,p.price,p.town,p.county,p.latitude,p.longitude from properties p left join customers s on s.id = p.clientid LEFT JOIN auction_properties on p.id = auction_properties.propertyid LEFT JOIN auctions ON auctions.id = auction_properties.auctionid left JOIN opt_auction_property_status aps ON aps.id=auction_properties.status  where p.id =   ?;`,[id], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
savePayment(stripeid,userid,properties,auctionid,amount){
  return new Promise((resolve,reject)=>{
      db.query('insert into payment_deposits (datetime,stripeid, customerid,status,auctionid,amount) values (NOW(),?,?,1,?,?)',[stripeid,userid,auctionid,amount], function (err, result) {
        if (err) throw err;
        var paymentid = result.insertId
        var paymentlist = []
        properties.forEach(p=>{
          paymentlist.push([p,paymentid])
        })
        db.query('insert into property_deposits (propertyid,paymentid) values ?',[paymentlist],function(err,result){
          if (err) throw err;
          resolve(result)
        })
        
      })
    })
}
getPayments(userid){
  return new Promise((resolve,reject)=>{
  //  db = mysql.createConnection(params);
    db.query('select * from payment_deposits where customerid = ?',[userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}
getPaymentsbyuserandauction(userid,auctionid){
  return new Promise((resolve,reject)=>{
  //  db = mysql.createConnection(params);
    db.query('select * from payment_deposits where customerid = ? and auctionid =?',[userid,auctionid], function (err, [result]) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}
getProperties(){
  return new Promise((resolve,reject)=>{
 
  
    db.query('select p.id,ap.lotno,p.name as propname,auctions.datetime,p.town,p.primaryimage as img,p.primaryimage,p.price,p.town,p.county from properties p left join auction_properties ap on ap.propertyid = p.id left join auctions on auctions.id = ap.auctionid where ap.status != 3;', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}

getPropertiesByAuctionId(auctionid){
  return new Promise((resolve,reject)=>{
  //  db = mysql.createConnection(params);d = ap.propertyid where auctions.id =?   
    db.query('select p.id,ap.lotno,p.name as propname,auctions.datetime,p.town,p.primaryimage as img,p.primaryimage,p.price,p.town,p.county from properties p left join auction_properties ap on ap.propertyid = p.id left join auctions on auctions.id = ap.auctionid where auctions.id = ?;',[auctionid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}

getPropertiesByAuctionIdCompleted(auctionid){
  return new Promise((resolve,reject)=>{
  //  db = mysql.createConnection(params);d = ap.propertyid where auctions.id =?   
    db.query('SELECT myproperties.*,auction_bids.id AS bidid,auction_bids.customerid AS bidderid,auction_bids.amount AS bidamount,auction_bids.uuid,auction_bids.`status` AS bidstatus   FROM (SELECT properties.*, auction_properties.id AS auctionpropertyid,auction_properties.lotno,auction_properties.`status` AS result FROM auction_properties  LEFT JOIN properties ON properties.id = auction_properties.propertyid WHERE auction_properties.auctionid = ?) AS myproperties LEFT JOIN auction_bids ON myproperties.auctionpropertyid = auction_bids.auctionpropertyid',[auctionid], function (err, result) {
      if (err) throw err;
      var properties = []
      var found  = false;
      result.forEach(p=>{
        var bid = {id:p.bidid,bidderid:p.bidderid,amount:p.bidamount,uuid:p.uuid,status:p.bidstatus}
        found = false;
        for(var j=0; j<properties.length;j++){
          var tmpprop = properties[j]
          if(tmpprop.id==p.id){
            found = true;
            tmpprop.bids.push(bid)
          }
        }
        if(!found){
          properties.push({id:p.id,name:p.name,price:p.price,bids:[bid],lotno:p.lotno,primaryimage:p.primaryimage,result:p.result})
        }
      })
      resolve(properties)
    })
    //db.end();
  })
}

getPropertiesLimit8(){
  return new Promise((resolve,reject)=>{
  //  db = mysql.createConnection(params);
    db.query('select p.id,ap.lotno,p.name as propname,auctions.datetime,p.town,p.primaryimage as img,p.primaryimage,p.price,p.town,p.county from properties p left join auction_properties ap on ap.propertyid = p.id left join auctions on auctions.id = ap.auctionid where ap.status != 3 limit 12;', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}

getPropertyImagesById(id){
  return new Promise((resolve,reject)=>{
    db.query('select * from propertyimages where propertyid = ?;',[id], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getPropertyMapsById(id){
  return new Promise((resolve,reject)=>{
    db.query('select * from propertymaps where propertyid = ?;',[id], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getPropertyCatalogById(id){
  return new Promise((resolve,reject)=>{
    db.query('select * from propertycatalog where propertyid = ?;',[id], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getPropertyDetailsById(id){
  return new Promise((resolve,reject)=>{
    db.query('select p.id,p.details,i.name as title from propertydetails p left join property_info i on i.id= p.infoid where propertyid = ?;',[id], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
addProperty(name,description,price){
  return new Promise((resolve,reject)=>{
  //  db = mysql.createConnection(params);
    db.query('insert into properties(name,description,price) values ?',[[name,description,price]], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  //  db.end();
  })
}

addnewCustomer(reg,code){
  return new Promise((resolve,reject)=>{
    let hash = crypto.createHash('md5').update(reg.Password).digest("hex");
    db.query('insert into customers(title,forename,surname,username,password,verificationcode,isbuyer,accounttype) values (?)',[[reg.title,reg.firstname,reg.lastname,reg.Email,hash,code,1,1]], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}

checkUsername(username){
  return new Promise((resolve,reject)=>{
    db.query('select * from customers where username like ?',[username], function (err, result) {
      if (err) throw err;
      if(result.length>0){
        resolve({status:false})
      }else{
        resolve({status:true})
      }
    })
  })
}
updateForgotenPassword(userid,code,hash){
  return new Promise((resolve,reject)=>{
    db.query("update customers set password= ?,password_reset=NULL where id = ? and password_reset =?",[hash,userid,code], function (err, result) {
      if (err) throw err;
      resolve({status:true})
    })
  })
}
updateVerificationCode(userid,code){
  return new Promise((resolve,reject)=>{
    db.query("update customers set verificationcode = ?,password_reset=NULL where id = ?",[code,userid], function (err, result) {
      if (err) throw err;
      resolve({status:true})
    })
  })
}
getCustomerByEmail(email){
  return new Promise((resolve,reject)=>{
    db.query('select * from customers where username like ?',[email], function (err, [customer]) {
      if (err) throw err;
        resolve(customer)
    })
  })
}

addCustomerResetPassword(id,myuuid){
  return new Promise((resolve,reject)=>{
    db.query('update customers set password_reset=? where id like ?',[myuuid,id], function (err, results) {
      if (err) throw err;
        resolve(results)
    })
  })
}
addNewCompanyMember(email,companyid){
  return new Promise((resolve,reject)=>{
    db.query('insert into customers(username,companyid,iscompany,isbuyer) values (?)',[[email,companyid,1,1]], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}

getAuctions() {
  return new Promise((resolve, reject) => {
    db.query("select * from auctions", function (err, result) {
      if (err) throw err;
      resolve(result);
    });
  });
}
getUpcomingAuctions() {
  return new Promise((resolve, reject) => {
    db.query("select * from auctions where status < 8 or status is null", function (err, result) {
      if (err) throw err;
      resolve(result);
    });
  });
}


getAuctionsPastAuctions() {
  return new Promise((resolve, reject) => {
    db.query("select * from auctions where status = 3", function (err, result) {
      if (err) throw err;
      resolve(result);
    });
  });
}
getAuctionsById(id) {
  return new Promise((resolve, reject) => {
    db.query("select * from auctions where id = ?",[id], function (err, result) {
        var auction = result[0]
        auction.properties = []
        db.query("SELECT ap.id,ap.lotno,property.* FROM auction_properties ap LEFT JOIN (select p.id as propertyid,p.name as propname,p.town,s.forename as sellername,p.primaryimage as img,p.price,p.county from properties p left join customers s on s.id = p.clientid) AS property on property.propertyid=ap.propertyid WHERE  ap.auctionid = ? order by ap.lotno",[id], function (err, result) {
          if (err) throw err;
          result.forEach(r=>{auction.properties.push(r)})
          
          resolve(auction);
      });
  });
})
  }


  updateBidDeposit(propertyid,status){
    return new Promise((resolve, reject) => {
      console.log(propertyid)
      db.query("update customerpropertylist set bid_deposit=? where id = ?",[status,propertyid], function (err, result) {
        if (err) throw err;
        resolve(result);
      });
    });
  }
 
  updateAuctionAttendance(attendencetype,auctionid,userid){
    return new Promise((resolve, reject) => {
      
      console.log(userid)
      db.query("SELECT * FROM customer_auction where userid = ?",[userid],(err,[result]) => {
        if (err) throw err;
        if(!result){
          db.query("insert into customer_auction (updated,auctionid,attendencetype,userid) values (?)",[[new Date(),auctionid,attendencetype,userid]], function (err, result) {
            if (err) throw err;
            resolve(result);
          });
        }else{
          db.query("update customer_auction set updated=?,auctionid=?,attendencetype=? where userid = ?",[new Date(),auctionid,attendencetype,userid], function (err, result) {
            if (err) throw err;
            resolve(result);
          });
        }
      })
 
      
    });
  }

  getAuctionAttendence(userid,auctionid){
    return new Promise((resolve, reject) => {
      
      console.log(userid)
      db.query("SELECT t.* FROM customer_auction left join auction_attendence_types t on t.id= customer_auction.attendencetype where userid = ? and auctionid = ?",[userid,auctionid],(err,[result]) => {
         if (err) throw err;
            resolve(result);
      })
 
      
    });
  }

  getAuctionAttendenceTypes(){
    return new Promise((resolve, reject) => {
      db.query("SELECT * from auction_attendence_types",(err,result) => {
         if (err) throw err;
            resolve(result);
      })
 
      
    });
  }



  getDocuments(propertyid) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT l.id,f.id as fileid,f.name, f.file,f.uploaded,l.notes,f.revision,f.revisionnotes,c.name as cat from legalpack  l
      left join legalpack_files f on l.id=f.legalpackid
       left join legalpack_categories c on c.id=l.categoryid
        where l.propertyid = 
      ? order by l.id, f.revision`, propertyid, function (err, result) {
        if (err) throw err;
        resolve(result);
      });
    });
  }
  getLegalpack(id) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * from legalpack_files where id  = ?`, id, function (err, [result]) {
        if (err) throw err;
        resolve(result);
      });
    });
  }
  recorddownload(legalpackid,userid) {
    return new Promise((resolve, reject) => {
      console.log('LEGAL PACK USERID:'+userid)
      db.query(`INSERT INTO legalpack_downloads (legalpackid,customerid,downloaded) values (?)`, [[legalpackid,userid,new Date()]], function (err, result) {
        if (err) throw err;
        resolve(result);
      });
    });
  }

}



module.exports =  new dbManager();