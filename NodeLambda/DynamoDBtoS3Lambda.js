const csvjson = require('csvjson');
var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1"
});


// const fileContent=[ {
//     event_id: 'a55e9731-2753-11ea-9afa-fdb5da177af4',
//     expires_on: 1577909879,
//     event_name: 'ZonarSpeeding',
//     event_source_ts: '2019-12-25 20:17:54'
//   }, {
//     event_id: 'a55e9731-2753-11ea-9afa-fdb5da177af4',
//     expires_on: 1577909879,
//     event_name: 'ZonarSpeedingsadsd',
//     event_source_ts: '2019-12-25 20:17:54'
//   }];

var dynamoDb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });


console.log('My first lambda outside');

exports.handler = (event, context, callback) => {
    console.log('My first lambda');

    var params = {
        TableName: "ADIONA_SPEEDING_EVENTS",
        ProjectionExpression:"event_id,event_source_ts,event_name,expires_on"
        // KeyConditionExpression: "#yr = :yyyy",
        // ExpressionAttributeNames:{
        //     "#yr": "year"
        // },
        // ExpressionAttributeValues: {
        //     ":yyyy": 1985
        // }
    };

    dynamoDb.scan(params, function (err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
           
            const csvData = csvjson.toCSV(fileContent, {
                headers: 'key'
            });
            var myBody = Buffer.from(csvData);

            var param = {
                Bucket: 'infycodeuploadbucket',
                Key: 'Output_SpeedingData.csv',
                Body: myBody
            };

            var s3bucket = new AWS.S3({ signatureVersion: 'v4' });
            s3bucket.putObject(param, function (err, output) {
                if (err) {
                    console.error(err);
                } else {
                    console.log(output)
                }
            });

            data.Items.forEach(function (item) {
                console.log(" * \n", item);
            });
        }
    });
};




    // const csvData = csvjson.toCSV(fileContent, {
    //     headers: 'key'
    // });
    // writeFile('./test-data.csv', csvData, (err) => {
    //     if(err) {
    //         console.log(err); // Do something to handle the error or just throw it
    //         throw new Error(err);
    //     }
    //     console.log('Success!');
    // });
