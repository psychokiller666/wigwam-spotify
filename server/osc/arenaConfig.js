const fastXmlParser = require('fast-xml-parser')
const fs = require('fs')
const arenaSavename = 'test123.avc'

module.exports = () => { 
    let data = fs.readFileSync(new URL(`file:///Users/psychokiller/Documents/Resolume Arena 6/Compositions/${arenaSavename}`), 'utf-8')
    let tObj = fastXmlParser.getTraversalObj(data, {
        attributeNamePrefix : "",
        textNodeName : "#text",
        ignoreAttributes : false,
        ignoreNameSpace : false,
        allowBooleanAttributes : false,
        parseNodeValue : false,
        parseAttributeValue : false,
        trimValues: true,
        parseTrueNumberOnly: true,
    })
    let jsonObj = fastXmlParser.convertToJson(tObj)
    return jsonObj.Composition.Deck
}