const   express = require('express'), //Allows to respond to HTTP requests, defines routing and renders the required content
        fs = require('fs'), //Working with the file system (read and write files)
        http = require('http'), //HTTP Server
        path = require('path'), //Utility that allows us to work with directory paths
        xml2js = require('xml2js'), //This is XML <-> JSON converter
        xmlParse = require('xslt-processor').xmlParse, //Parsing XML
        xsltProcess = require('xslt-processor').xsltProcess; //Processing XSLT

const   router = express(), //Instantiating Express
        server = http.createServer(router); //Instantiating the server

router.use(express.static(path.resolve(__dirname,'view'))); //Serving static content from "views" folder
router.use(express.json());

function XMLtoJSON(filename, cb){
    let filepath = path.normalize(path.join(__dirname, filename));
    fs.readFile(filepath, 'utf8', function(err, xmlStr){
        if (err) throw (err);
        xml2js.parseString(xmlStr, {}, cb);
    });
};

function JSONtoXML(filename, obj, cb) {
    let filepath = path.normalize(path.join(__dirname, filename));
    let builder = new xml2js.Builder();
    let xml = builder.buildObject(obj);
    fs.unlinkSync(filepath);
    fs.writeFile(filepath, xml, cb);
};

router.get('/get/html', function(req, res) {

    res.writeHead(200, {'Content-Type' : 'text/html'}); //Tell the user that the resource exists and which type that is

    let xml = fs.readFileSync('DublinRestaurant.xml', 'utf8'), //read in the XML file
        xsl = fs.readFileSync('DublinRestaurant.xsl', 'utf8'); //read in the XSL file

    // console.log(xml);
    // console.log(xsl);

    let doc = xmlParse(xml), //Parse the XML file
        stylesheet = xmlParse(xsl); //Parse the XSL file

    let result = xsltProcess(doc, stylesheet); //Performing XSLT

    // console.log(result);

    res.end(result.toString()); //Serve back the user

});

router.post('/post/json', function(req, res) {

    console.log(req.body);

    function appendJSON(obj) {

        console.log(JSON.stringify(obj, null, " "))

        XMLtoJSON('DublinRestaurant.xml', function (err, result){
            if (err) throw (err);

            result.restaurant_menu.week_day[w_day].meal.push({'item': obj.item, 'price': obj.price});

            console.log(JSON.stringify(result, null, " "));

            JSONtoXML('DublinRestaurant.xml', result, function(err){
                if (err) console.log(err);
            });

        });

    };

    appendJSON(req.body);

    res.redirect('back');

});

router.post('/post/delete', function(req, res){

    console.log(req.body);

    function deleteJSON(obj){

        console.log(obj)

        XMLtoJSON('DublinRestaurant.xml', function(err, result){
            if (err) throw (err);

            console.log(obj.sec);
            console.log(obj.ent);
            console.log(result);
            
            delete result.restaurant_menu.Week_day[obj.sec].meal[obj.ent];

            JSONtoXML('DublinRestaurant.xml', result, function(err){
                if (err) console.log(err);
            });
        });
    };

    deleteJSON(req.body);

    res.redirect('back');

});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    const addr = server.address();
    console.log('Server listening at', addr.address + ':' + addr.port)
});