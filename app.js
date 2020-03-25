var port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs'),
    nodemailer = require('nodemailer'),
    express = require('express'),
    router = express.router,
    html = fs.readFileSync('index.html');

    const username = process.env.DHusername;
    const password = process.env.DHpassword;
    
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
        console.log("BM Mail Server Says: " + error);
    }
    else
    {
        console.log('BM Mail Server Says: Server is ready to take messages');
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
        const origin = req.headers['origin'];
        if (['http://bradmccausland.com', 'http://localhost:8000'].includes(origin))
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
                        console.log("BM Mail Server Says: " + err)
                        //TODO: Update fail case with whatever ends up working below
                        res.json(
                        {
                            status: 'fail'
                        })
                    }
                    else
                    {
                        console.log("BM Mail Server Says: Success!");
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.write('success');
                        res.end();
                    }
                })
            }
        }
    })
});

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');
