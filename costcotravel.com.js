//import puppeteer from 'puppeteer';

const puppeteer = require("puppeteer");
const moment = require("moment");
const db = require("./mysql.js");

const proxy = {};
const userAgent =
  "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36";


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

//rotating proxy
function getRandomProxy() {
  //https://www.sslproxies.org/
}

//rotating ip
function getRandomIp() {
  //install Tor
  //Does Tor support javascript
}
//rotating user agent
function getRandomUserAgent() {}

/*
async function ssr(url) {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'networkidle0'});
  const html = await page.content(); // serialized HTML of page DOM.
  await browser.close();
  return html;
}
*/


function getDestinations(){
  return ["alaska", "antarctica", "orientAsiaAfricaEgypt", "bermuda", "caribbean","europe","hawaii","mexicoCentralAmerica","theAmericas","southAmerica","southPacific","worldCruise","other"];
}

function parseCruiseResult(page){
    console.log('evaluate results');

    let cruises = [];
    // get the cruise elements
    let cruisesElms = document.querySelectorAll("div[name='cruiseSailingResults_cruiseComponent']");
    if(!cruisesElms) console.log('no cruise element');

    // get the cruise data
    cruisesElms.forEach(cruiseelement => {
      let cruiseJson = {quotes:[]};
      try {
        cruiseJson.cruiseLine = cruiseelement.querySelector("table>tbody>tr>td>div>img[name='cruiseSailingResults_cruiseLineNameLogo']").getAttribute('alt');;
        cruiseJson.title = cruiseelement.querySelector("div h3").innerText;
        cruiseJson.day = Number(/(\d+) Night/.exec(cruiseJson.title)[1]);
        var nodes = cruiseelement.querySelectorAll("a#portOfCallsLink");
        var list = [].slice.call(nodes); 
        cruiseJson.ports = list.map((portElm)=>{ return portElm.innerText;});


        let cruiseDetails = cruiseelement.querySelectorAll("div.cruiseTableDetails table tr");
        cruiseDetails.forEach((detail) => {
          if(detail.querySelector('th')) return;

          var inside = detail.querySelector('td[name="cruiseSailingItemResultsTable_inside"]'); 
          var oceanview = detail.querySelector('td[name="cruiseSailingItemResultsTable_oceanView"]');
          var balcony = detail.querySelector('td[name="cruiseSailingItemResultsTable_balcony"]');
          var suite = detail.querySelector('td[name="cruiseSailingItemResultsTable_suite"]');

          cruiseJson.quotes.push({
            date: detail.querySelector('td[name="cruiseSailingItemResultsTable_departureDate"]').innerText.trim(),
            inside: Number(inside? inside.innerText.replace(/[^0-9]/g,"") : 0),
            oceanview: Number(oceanview? oceanview.innerText.replace(/[^0-9]/g,"") : 0),
            balcony: Number(balcony? balcony.innerText.replace(/[^0-9]/g,"") : 0),
            suite: Number(suite? suite.innerText.replace(/[^0-9]/g,"") : 0),
          });
        });
        //console.dir(cruiseJson.quotes);

      } catch (exception) {
        console.log(exception);
      } finally{
        cruises.push(cruiseJson);
      }
    });
    return cruises;
}


async function getNewPage(browser){
  page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });

  //inject needed modules into browser
  //await page.addScriptTag({ path: './node_modules/moment/moment.js' });
  //await page.setUserAgent(userAgent);
    
  //skip unwanted http call    
  await page.setRequestInterception(true);
  page.on("request", req => {
    const whitelist = ["document", "script", "xhr", "fetch"];
    if (!whitelist.includes(req.resourceType())) {
      return req.abort();
    }
    req.continue();
  });
  return page;
}

async function login(page){
  if(page.$('a[data-hook="top_link_login"]') !== null){
    try{
      await Promise.all([  
        page.click('a[data-hook="top_link_login"]'),
        page.waitForNavigation({ waitUntil: "networkidle2" }),
      ]);

      await page.type('#member_login_number', 'account');
      await page.type('#member_login_password', 'password');
      await Promise.all([  
        page.click('#costco_member_login button.btn-submit'),
        page.waitForNavigation({ waitUntil: "networkidle2" }),
      ]);
    }
    catch(exception){
    }    
  }
}

async function getMonthsOfDestination(page, destinations){
  await page.waitForSelector('div.search-nav ul li.search-cruises');
  await page.click("div.search-nav ul li.search-cruises");

  let datesOfDestinations = []; 
  for(var destination of destinations){
    await page.waitForSelector('#cruiseDestination'); 
    await page.click('#cruiseDestination'); 
    await page.select('#cruiseDestination', destination);
    await page.waitForSelector('#departureDate'); 
    console.log('getMonthsOfSestination: destination value:' + destination);

    let dates = await page.evaluate(() => {
      let departures = [];
      try{
        departures = Array.from(document.querySelectorAll('#departureDate>option:not([disabled]):not([value=""])')
          ,(v, k) =>{return v.getAttribute('value');}
        );
      }
      catch(exception){
        console.log(exception);
      }
      finally{
        console.log(departures);
        return departures;
      }
    });

    console.log('getMonthsOfSestination: dates value:' + dates);
    datesOfDestinations.push({destination:destination, months:dates});
  }
  console.dir(datesOfDestinations); 
  return datesOfDestinations;
}

async function searchCruise(page, destination, month, callback){
  let cruiseData = [];
  try{
    await page.waitForSelector('div.search-nav ul li.search-cruises');
    await page.click("div.search-nav ul li.search-cruises");

    await page.waitForSelector('#search_cruises_form');
    await page.click("#search_cruises_form #cruise_departure_widget");

    await page.waitForSelector('#cruiseDestination'); 
    await page.click('#cruiseDestination'); 
    await page.select('#cruiseDestination', destination);

    await page.waitForSelector('#departureDate'); 
    await page.click('#departureDate'); 
    await page.select('#departureDate', month);

    await Promise.all([
      page.click("#search_cruises_form div.cruise-submit button.btn-submit"),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    do{
      cruiseData = cruiseData.concat(await page.evaluate(parseCruiseResult));

      var next = false;
      if(page.$('td.paginationClass.lastPaginationButton.nextPreviousClass') !== null){
        try{
          next = true;
          await Promise.all([  
            page.click('td.paginationClass.lastPaginationButton.nextPreviousClass'),
            page.waitForNavigation({ waitUntil: "networkidle2" }),
          ]);
        }
        catch(exception){
          next = false;
        }    
      }
    }while(next)

    console.log('searchCruise()::end::' + destination + month);
    //console.dir(cruiseData);
    callback(cruiseData);
  }catch(exception){
    console.log(exception);  
  }
  finally{
    return cruiseData;
  }  
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: getRandomInt(100, 200),
    devtools: true
  });

  const url = "https://www.costcotravel.com/"
  const pageOptions = { timeout: 25000, waitUntil: "networkidle2" }
  

  //login 
  const pageLogin = await getNewPage(browser);
  await pageLogin.goto(url, pageOptions);
  await login(pageLogin);
  pageLogin.close();

    
  const pageCruiseOptions = await getNewPage(browser);
  response = await pageCruiseOptions.goto(url, pageOptions);
  if (response._status < 400) {
    await pageCruiseOptions.waitFor(3000);
  }
  let MonthsOfDestinations = await getMonthsOfDestination(pageCruiseOptions, getDestinations());
  pageCruiseOptions.close();
  console.dir(MonthsOfDestinations);


  for(d of MonthsOfDestinations)
  {
    for(m of d.months)
    {
      console.log(m);

      let pageSearch = await getNewPage(browser);
      await pageSearch.goto(url, pageOptions);
      var data = await searchCruise(pageSearch, d.destination, m, (rslt)=>{console.dir(rslt)});
      await page.close();

      var mString = moment(m, 'MM-YYYY').format('YYYY-MM-DD');
      data = data.map(v => {
        v.quotes.forEach((q)=>{
          q.date = moment(q.date).format('YYYY-MM-DD');
        })
        return [d.destination, mString, JSON.stringify(v)];
      });
      create(data, (err, rslt)=>{
        console.log('insert into db');
        console.log(data);
        if(err) console.dir(err);
        if(rslt) console.dir(rslt);
      })
    } 
  }

  browser.close();  
/*
  await page.waitForSelector('#search_cruises_form');
  await page.click("#search_cruises_form #cruise_departure_widget");

  await page.waitForSelector('#cruiseDestination'); 
  await page.click('#cruiseDestination'); 
  await page.select('#cruiseDestination', 'southAmerica');

  await page.waitForSelector('#departureDate'); 
  await page.click('#departureDate'); 
  await page.select('#departureDate', '4-2019');


  await Promise.all([
    page.click("#search_cruises_form div.cruise-submit button.btn-submit"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);
  

  let cruiseData = [];
  do{
    cruiseData = cruiseData.concat(await page.evaluate(parseCruiseResult));
    console.log('parseCruiseResult');
    console.dir(cruiseData);

    var next = false;
    if(page.$('td.paginationClass.lastPaginationButton.nextPreviousClass') !== null){
      try{
        next = true;
        await Promise.all([  
          page.click('td.paginationClass.lastPaginationButton.nextPreviousClass'),
          page.waitForNavigation({ waitUntil: "networkidle2" }),
        ]);
      }
      catch(exception){
        next = false;
      }    
    }
  }while(next)

  console.log(JSON.stringify(cruiseData));
  return cruiseData;
 */

  /*
  const res = await Promise.all([
    await page.click("#search_cruises_form div.cruise-submit button.btn-submit"),
    await page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);
    */
  
  

  /*
  // Extract the results from the page
  const links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll(".result-link a"));
    return anchors.map(anchor => anchor.textContent);
  });
  console.log(links.join("\n"));
  browser.close();
  setTimeout(async () => {
  await browser.close();
}, 60000 * 4);

  //await page.click('#wpcf7-f97-p311-o1 > form > p:nth-child(5) > input')
  //await page.screenshot({ path: 'form.png', fullPage: true });
  */

}

/*
(async () => {
    const browser = await puppeteer.launch({headless:false, slowMo: 100});
    const page = await browser.newPage();
    //Go to my page and wait until the page loads
    await page.goto('https://www.aymen-loukil.com/en/contact-aymen/', {waitUntil: 'networkidle2'});
    await page.waitForSelector('#genesis-content > article > header > h1');
    //type the name
    await page.focus('#wpcf7-f97-p311-o1 > form > p:nth-child(2) > label > span > input')
    await page.keyboard.type('PuppeteerBot');
    //type the email
    await page.focus('#wpcf7-f97-p311-o1 > form > p:nth-child(3) > label > span > input')
    await page.keyboard.type('PuppeteerBot@mail.com');
    //type the message
    await page.focus('#wpcf7-f97-p311-o1 > form > p:nth-child(4) > label > span > textarea')
    await page.keyboard.type("Hello Aymen ! It is me your PuppeteerBot, i test your contact form !");
    //Click on the submit button
    await page.click('#wpcf7-f97-p311-o1 > form > p:nth-child(5) > input')  
    await page.screenshot({ path: 'form.png', fullPage: true });
  })();
*/


async function create(values, callback) {
  var sql = "INSERT INTO costco_staging (region, month, cruises) VALUES ?";
  var rslt = await db.query(sql, [values], function (err, result) {
      if (callback) callback(err, result);
      return result;
    })
  return rslt;
}
exports.create = create; 

exports.update = async function(){    
  return rslt;
}

function read(){    
}

function del(){    
}


/*** Main */
if (require.main === module) {
    main();
}