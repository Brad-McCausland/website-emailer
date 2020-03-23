var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var cors = require('cors');
const creds = require('./serverConfig');

var transport =
{
    host: 'smtp.dreamhost.com',
    port: 587,
    auth: 
    {
        user: creds.USER,
        pass: creds.PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
}

var transporter = nodemailer.createTransport(transport)

transporter.verify((error, success) =>
{
    if(error)
    {
        console.log(error);
    }
    else
    {
        console.log('Server is ready to take messages');
    }
});

router.post('/send', (req, res, next) =>
{
    var name = req.body.name
    var email = req.body.email
    var message = req.body.message
    var content = `name: ${name} \n email: ${email} \n message: ${message} `

    var mail =
    {
        from: name,
        to: "me@bradmccausland.com",
        subject: `New Message from ${name} at ${email}`,
        text: content
    }

    transporter.sendMail(mail, (err, data) =>
    {
        if(err)
        {
            console.log(err)
            res.json(
            {
                status: 'fail'
            })
        }
        else
        {
            res.json(
            {
                status: 'success'
            })
        }
    })
})

const app = express()
app.use(cors())
app.use(express.json())
app.use('/', router)
app.listen(3002)