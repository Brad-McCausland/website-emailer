var port = process.env.PORT || 3000,
    http = require('http'),
    nodemailer = require('nodemailer');

// Credentials for dreamhost webmail
const username = process.env.DHusername;
const password = process.env.DHpassword;

// CORS allowed origins. Prod website and localhost test server
const allowedOrigins = ['http://bradmccausland.com', 'http://localhost:8000']
    
var transport =
{
    host: 'smtp.dreamhost.com',
    port: 587,
    auth: 
    {
        user: username,
        pass: password,
    },
    tls:
    {
        rejectUnauthorized: false
    }
}

var transporter = nodemailer.createTransport(transport)

transporter.verify((error, success) =>
{
    if(error)
    {
        console.log("Error: Email transporter failed to verify with error: " + error);
    }
    else
    {
        console.log('Server is ready to take messages on port: ' + port);
    }
});

var server = http.createServer(function (req, res)
{
    let data = []
    req.on('data', chunk =>
    {
        data.push(chunk);
    })
    req.on('end', () =>
    {
        // Check if request origin is allowed
        const origin = req.headers['origin'];
        if (allowedOrigins.includes(origin))
        {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }

        if (data.length)
        {
            data = JSON.parse(data);
            var name = data.name
            var email = data.email
            var message = data.message

            if (name && email && message)
            {
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
                        console.log("Error when sending mail: " + err)
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        res.end();
                    }
                    else
                    {
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end();
                    }
                })
            }
        }
    })
});

server.listen(port);
console.log('Server running at http://127.0.0.1:' + port + '/');
