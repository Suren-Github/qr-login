var mongoose = require('mongoose'); 

var QRLoginSchema = require('../schema/qrlogin');
var qrModel = mongoose.model('qrModel', QRLoginSchema);

var sockets = {

     /** Registers the user and stores their initial details
     * @param { userDetails } - data regarding user and the device 
     */
    registerUser: (userDetails, socketId) => {
        
        return new Promise(function (resolve, reject){

            // Generate a random socket ID to display as QR in the Frontend
            var randQrCode = Math.floor(100000 + Math.random() * 900000);
            
            var request = new qrModel({
                sessionId: randQrCode,
                socketId: socketId ? socketId : null,
                deviceToken: null,
                userAgent: userDetails.userAgent,
                accessToken: null,
                createdDate: new Date(),
                expiryDate: null
            });

            request.save().then(() => {
                console.log('Access token - save success');
                resolve(socketId);
            });
        });
    },

    /** Sets the init data if it's not present already in the DB
     * @param {accessToken} - Access token of the already logged in user (from mobile)
     */
    initUser: (accessToken) => {

        var expiryDate = new Date(); 
        expiryDate.setMinutes(expiryDate.getMinutes() + 60);
        
        var request = new qrModel({
            sessionId: null,
            socketId: null,
            deviceToken: '007007',
            userAgent: 'mobile',
            accessToken: accessToken,
            createdDate: new Date(),
            expiryDate: expiryDate
        });
        
        qrModel.count({accessToken: accessToken}, function (err, count){ 

            /* Add the static mobile logged in status details if not already exist */
            if(count <= 0){
                request.save();
                console.log("Initial mobile user data saved");
            }
        }); 
    },

    /** Enables the access to the web user
     * @param { sessionId } - 6 digit unique id for the particular session
     * @param { accessToken } - Unique token to handle the session and its expiry
     * @param { deviceToken} - Unique token from the mobile device
     * @method POST 
     **/
    mobileAccessToken: (req, res) => {

        var data = req.body;
        
        return new Promise((resolve, reject) =>
        {
            /** Gets the expiry date from mobile to set the cookie expirys */
            qrModel.findOne({ deviceToken: data.deviceToken }, 'deviceToken expiryDate', (err, mobileRes) => {
                
                if(!err){
                    /** Uses the sessionId to identify and update the access token of web session  */
                    qrModel.findOneAndUpdate(
                        { sessionId: data.sessionId },
                        { "$set": {"accessToken": data.accessToken, "expiryDate": mobileRes.expiryDate }},
                        { new: true },
                        function (err, count){ 
                         
                            if(!err && count != null)
                            {
                                /** Fetches the accesstoken and expiry date from updated web  */
                                qrModel.findOne({sessionId: data.sessionId}, 'socketId', (err, webData) => {

                                    var accessDetails = {
                                        accessToken: data.accessToken, 
                                        expiryDate: mobileRes.expiryData
                                    };
                                    
                                    /** Forward the access token and expiry date to the web using the socket id */
                                    io.to(webData.socketId).emit('login access', accessDetails);
                                    console.log("Access token forwarded to the corresponding web user");
                                });

                                /** Respond back to the mobile reg. the update */
                                res.status(200);
                                res.send("Access token updated for web login").end();
                            }
                            else{
                                res.status(200);
                                res.send("No such session exist").end();
                            }
                       
                    }); 
                }
                
            });

        });
        
       
    }

}

module.exports = sockets;
