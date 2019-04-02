    
const puppeteer = require('puppeteer');


let choices = [
    /*
    {title: 'Alaska' , url:'https://www.ncl.com/vacations/?destinations=Alaska_Cruises'},
    {title: 'Asia' , url:'https://www.ncl.com/vacations/?destinations=Asia_Cruises'},
    {title: 'Australia & New Zealand' , url:'https://www.ncl.com/vacations/?destinations=Australia_%26_New_Zealand_Cruises'},
    {title: 'Bahamas & Florida' , url:'https://www.ncl.com/vacations/?destinations=Bahamas_%26_Florida_Cruises'},
    {title: 'Bermuda' , url:'https://www.ncl.com/vacations/?destinations=Bermuda_Cruises'},
    {title: 'Canada & New England' , url:'https://www.ncl.com/vacations/?destinations=Canada_%26_New_England_Cruises'},
    {title: 'Caribbean' , url:'https://www.ncl.com/vacations/?destinations=Caribbean_Cruises'},
    {title: 'Cuba' , url:'https://www.ncl.com/vacations/?destinations=Cuba_Cruises'},
    {title: 'Europe' , url:'https://www.ncl.com/vacations/?destinations=Europe_Cruises'},
    {title: 'Hawaii' , url:'https://www.ncl.com/vacations/?destinations=Hawaii_Cruises'},
    */
    //{title: 'Mexican Riviera' , url:'https://www.ncl.com/vacations/?destinations=Mexican_Riviera_Cruises'},
    //{title: 'Pacific Coastal' , url:'https://www.ncl.com/vacations/?destinations=Pacific_Coastal_Cruises'},
    //{title: 'Panama Canal' , url:'https://www.ncl.com/vacations/?destinations=Panama_Canal_Cruises'},
    {title: 'South America' , url:'https://www.ncl.com/vacations/?destinations=South_America_Cruises'},
    //{title: 'Transatlantic' , url:'https://www.ncl.com/vacations/?destinations=Transatlantic_Cruises'},
    //{title: 'Weekend Cruises' , url:'https://www.ncl.com/vacations/?destinations=Weekend_Cruises'},
];

let numberOfGuests= [
    {count: 2, code: 4294953449}
]

//get all destinations
/*
let startUrl= 'https://www.ncl.com/cruise-deals/choice';
let destinations = (async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 926 });
    await page.goto(destinationUrl);

    let destinations = await page.evaluate(() =>{
        let d = [];

    });

})();
*/

let queryString = '&pageSize=1000&cruise=1&cruiseTour=1&cruiseHotel=0&cruiseHotelAir=0'; //&numberOfGuests=4294953449

async function getCruiseAsync(choice){
    const browser = await puppeteer.launch({ headless: false, slowMo: 1000, devtools: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', req => {
        const whitelist = ['document', 'script', 'xhr', 'fetch'];
        if (!whitelist.includes(req.resourceType())) {
          return req.abort();
        }
        req.continue();
      });

    await page.setViewport({ width: 1920, height: 926 });
    await page.goto(choice.url + queryString, {waitUntil: 'domcontentloaded'});
    // get cruise details
    let cruiseData = await page.evaluate(() => {
        let cruises = [];
        // get the cruise elements
        let cruisesElms = document.querySelectorAll('li.itinerary-card');
        if( !cruisesElms) return cruises;
        
        // get the cruise data
        cruisesElms.forEach((cruiseelement) => {
            let cruiseJson = {};
            try {
                cruiseJson.title = cruiseelement.querySelector('.card-title a').innerText;
                cruiseJson.day = Number(/(\d+)-Day/.exec(cruiseJson.title)[1]); 
                let priceLink = cruiseelement.querySelector('div.price-link a');
                cruiseJson.room = priceLink.getAttribute('data-value');
                cruiseJson.price = priceLink.getAttribute('data-price');
                cruiseJson.detail = 'http://www.ncl.com' + cruiseelement.querySelector('div.card-links a[title="Details"]').getAttribute('href');

                cruises.push(cruiseJson);
            }
            catch (exception){
                console.log(exception);
            }
        });
        return cruises;
    });
    console.dir(cruiseData);
    return cruiseData;
};



(async () => {

    choices.forEach(async (choice) => {
        let rslt = await getCruiseAsync(choice);
        console.dir(rslt);
    });
   //console.dir(await page.content() );
   //console.dir(cruiseData);
})();