const   express = require('express'), //Allows to respond to HTTP requests, defines routing and renders the required content
        fs = require('fs'), //Working with the file system (read and write files)
        http = require('http'), //HTTP Server
        path = require('path'), //Utility that allows us to work with directory paths
        xml2js = require('xml2js'), //This is XML <-> JSON converter
        xmlParse = require('xslt-processor').xmlParse, //Parsing XML
        xsltProcess = require('xslt-processor').xsltProcess; //Processing XSLT

const   router = express(), //Instantiating Express
        server = http.createServer(router); //Instantiating the server

router.use(express.static(path.resolve(__dirname,'view'))); //Serving static content from "view" folder
router.use(express.json());

// converts from XML to JSON
function XMLtoJSON(filename, cb){
    let filepath = path.normalize(path.join(__dirname, filename));
    fs.readFile(filepath, 'utf8', function(err, xmlStr){
        if (err) throw (err);
        xml2js.parseString(xmlStr, {}, cb);
    });
};

// converts from JSON to XML
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

    let doc = xmlParse(xml), //Parse the XML file
        stylesheet = xmlParse(xsl); //Parse the XSL file

    let result = xsltProcess(doc, stylesheet); //Performing XSLT


    res.end(result.toString()); //Serve back the user

});

router.post('/post/json', function(req, res) {
// 
    console.log(req.body);
    // function to add new entry
    function appendJSON(obj) {

        console.log(JSON.stringify(obj, null, " "))
        // receives the entry as XML and converts it to JSON
        XMLtoJSON('DublinRestaurant.xml', function (err, result){
            if (err) throw (err);
                // recieve the parameters of the new entry and adds to the menu
            result.restaurant_menu.week_day[obj.w_day].meal.push({'item': obj.item, 'price': obj.price});

            console.log(JSON.stringify(result, null, " "));
            // once the new entry is added converts back to XML
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
// function to delete selected entry
    function deleteJSON(obj){

        console.log(obj)
        // receives the selected entry to delete as XML and converts it to JSON
        XMLtoJSON('DublinRestaurant.xml', function(err, result){
            if (err) throw (err);

            console.log(obj.sec);
            console.log(obj.ent);
            console.log(result);
            // recieve the parameters of the selected entry to delete and removes it from the menu
            delete result.restaurant_menu.week_day[obj.sec].meal[obj.ent];
            // once the selected entry is removed, it converts back to XML
            JSONtoXML('DublinRestaurant.xml', result, function(err){
                if (err) console.log(err);
            });
        });
    };

    deleteJSON(req.body);

    res.redirect('back');

});
// define which port will be used and sets the default ip address
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    const addr = server.address();
    console.log('Server listening at', addr.address + ':' + addr.port)
});