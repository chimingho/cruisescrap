var costco = require("./costcotravel.com.js");
var moment = require('moment');


  var values =[  
    [  
       'alaska',
       '2019-01-01',
       '{"quotes":[{"date":"01/14/2019","inside":1032,"oceanview":1248,"balcony":1524,"suite":0}],"cruiseLine":"Disney Cruise Line","title":"6 Night Cruise from San Juan/Puerto Rico (Round Trip)","day":"6"}'
    ],
    [  
       'alaska',
       '2019-01-01',
       '{"quotes":[{"date":"01/27/2019","inside":1092,"oceanview":1267,"balcony":1582,"suite":4340}],"cruiseLine":"Disney Cruise Line","title":"7 Night Cruise from San Juan/Puerto Rico (Round Trip)","day":"7"}'
    ],
    [  
       'alaska',
       '2019-01-01',
       '{"quotes":[{"date":"01/20/2019","inside":1134,"oceanview":1344,"balcony":2037,"suite":0}],"cruiseLine":"Disney Cruise Line","title":"7 Night Cruise from San Juan/Puerto Rico (Round Trip)","day":"7"}'
    ]
 ];

/*
test('costco insert transactions one row json string', done =>{
    var values = [
        ['cruiseline', 'regiona', '2018-01-00', JSON.stringify(values)]
    ];
    costco.create(values, (err, result)=>{
        console.log(result);
        expect(result.affectedRows).toBe(1);
        done();
    })
});
*/

test('costco insert transactions multi rows', done =>{

    costco.create(values, (err, result)=>{
        if(result) console.log(result);
        if(err) console.log(err);
        expect(result.affectedRows).toBe(3);
        done();
    })
});



test('costco insert transactions multi rows 01-2018', done =>{

    var data = values.map(v => {
        return ['reg', moment('11-2018', 'MM-YYYY').format('YYYY-MM-DD'), JSON.stringify(v)];
    });
    console.dir(data);
    costco.create(data, (err, result)=>{
        if(result) console.log(result);
        if(err) console.log(err);
        expect(result.affectedRows).toBe(3);
        done();
    })
});
