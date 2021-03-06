require("dotenv").config();

const azure = require("azure-storage");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
var getStream = require('into-stream')
const redis = require("redis");
const { isRegExp } = require("util");
const client = redis.createClient();
client.on('error', (err) => {
    console.log('Redis error: ', err);
  });

async function getRedis(key){
  return new Promise((resolve,reject)=>{
    client.get(key,(err,reply)=>{
      if(err)throw err
      var replyobj = JSON.parse(reply);
      resolve(replyobj)
    })
  })
}

class AzStorageManager {
  async getFiles(list,key,outkey='uri'){
    for(var i=0;i<list.length;i++){
        var itm = list[i]
       // console.log(itm.img)
        if(!itm[key])itm[key] ='abc/fb2a4e95-d6e7-43e1-a438-c7889db6c029.jpg'
        var mytoken = await this.generateSasToken(itm[key]);
        itm[outkey] =  mytoken.uri;
    }
    return list;
  }


  async generateSasToken(blobName) {
    var myobj = await getRedis(blobName);
    var exists = false;
    if(myobj){
      if(myobj.expiryDate){
        if(new Date(myobj.expiryDate)>new Date()){
          exists = true;
          return { uri: myobj.uri};
        }
      }
    }
    console.log('test')
    var container = process.env.AZURE_STORAGE_CONTAINER_NAME;
    var blobService = azure.createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING);

    // Create a SAS token that expires in an hour
    // Set start time to five minutes ago to avoid clock skew.
    var startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 5);
    var expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 240);

    var sharedAccessPolicy = {
      AccessPolicy: {
        Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
        Start: startDate,
        Expiry: expiryDate,
      },
    };

    var sasToken = blobService.generateSharedAccessSignature(container, blobName, sharedAccessPolicy);
    var blobUri = { uri: blobService.getUrl(container, blobName, sasToken, true),expiryDate }
    console.log(blobUri);
    client.set(blobName,JSON.stringify(blobUri))
    return blobUri;
  }
  getBlobName(originalName) {
    var dotextension = path.extname(originalName);
    const identifier = uuidv4();
    return `${identifier}${dotextension}`;
  }

  uploadfile(file) {
    return new Promise((resolve, reject) => {
      var blobService = azure.createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING);
      var container = process.env.AZURE_STORAGE_CONTAINER_NAME;
      var filename = "abc/" + this.getBlobName(file.originalname);
      const blobName = filename,
        stream = getStream(file.buffer),
        streamLength = file.buffer.length;
      blobService.createBlockBlobFromStream(container, blobName, stream, streamLength, (err) => {
        if (err) {
          handleError(err);
          return;
        }
        resolve(filename)
      });
    });
  }
}
module.exports = new AzStorageManager();
