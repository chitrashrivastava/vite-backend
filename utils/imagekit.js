var ImageKit = require("imagekit");
exports.initimagekit = () => {
    var imagekit = new ImageKit({
        publicKey: process.env.PUBLICKEY_IMAGEKIT,
        privateKey: process.env.PRIVATEKEY_IMAGEKIT,
        urlEndpoint: process.env.ENDPOINT_URL
    });
    return imagekit
}