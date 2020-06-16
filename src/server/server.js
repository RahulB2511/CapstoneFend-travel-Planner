const dotenv = require('dotenv');
dotenv.config();
const fetch = require("node-fetch");

//  Empty JS object to act as endpoint
const projectData = [];

// Empty JS object to act as endpoint for the client route
const userData = [];

const path = require('path')

// Express to run server and routes
const express = require ('express');

// Start up an instance of app
const app = express();

/**Dependencies */
const bodyParser = require ('body-parser');

/* Middleware*/
//Configure express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('cors');
app.use(cors());

// Initialize the main project folder
app.use(express.static('dist'));

console.log(__dirname);

app.get('/', function (req, res) {
  res.sendFile('dist/index.html')
});

// Setup Server
const port =5000;
const server = app.listen(port, listening);
function listening(){
  console.log('server running');
  console.log(`running on localhost: ${port}`);
};

//GET route that returns the userData object
app.get('/client', getClientData);

function getClientData (req,res) {
  res.send(userData);
};

//GeoNames API
const baseURL = 'http://api.geonames.org/searchJSON?q=';
const apiKEY = process.env.apiKEY;

//Weatherbit API
const weatherbitURL = 'https://api.weatherbit.io/v2.0/forecast/daily?';
const weatherbitURLhist = 'http://api.weatherbit.io/v2.0/history/daily?'
const weatherbitKey = process.env.WEATHERBIT_API_KEY;

//Pixabay API
const pixabayURL = 'https://pixabay.com/api/?'
const pixabay_API_KEY = process.env.pixabay_API_KEY;

//Async function that uses fetch() to make a GET request to the Geonames API
const getCoordinates = async () => {
  let city = userData[userData.length-1].city;
  const response = await fetch(baseURL+city+apiKEY);
  try{
    const geonamesArray = await response.json();
    const geonamesData = geonamesArray.geonames[0];
    userData[userData.length-1].latitude = geonamesData.lat;
    userData[userData.length-1].longitude = geonamesData.lng;
    userData[userData.length-1].country = geonamesData.countryName;
    console.log ('coordinates obtained  from GeoNames');
  } catch(error){
    console.log('error', error);
  }
};

//Async function that uses fetch() to make a GET request to the Weatherbit API
const weatherbit = async () => {
  let weatherReport;
  if (userData[userData.length-1].daysLeft < 17){
    weatherReport = `${weatherbitURL}lat=${userData[userData.length-1].latitude}&lon=${userData[userData.length-1].longitude}&key=${weatherbitKey}`;
  } else {
    //Setting the dates for the weatherReport
    const arrivalDate = userData[userData.length-1].arrival;
    const arrivalDay = new Date (arrivalDate);
    let arrivalYear = arrivalDay.getFullYear() - 1;
    arrivalDay.setFullYear(arrivalYear);
    console.log(arrivalDay);

    let arrivalM = arrivalDay.getMonth();
    let arrivalMonth = arrivalM+1;
    let beginDate = arrivalDay.getFullYear()+'-0'+arrivalMonth+'-'+arrivalDay.getDate();
    console.log(beginDate);

    Date.prototype.addDays = function(d) {  
    this.setTime(this.getTime() + (d*24*60*60*1000));  
    return this;  
    }; 
                  
    const endDate = function run() { 
    var a = arrivalDay; 
    arrivalDay.addDays(1); 
    return a;
    };
    
    const finalOutcome = new Date(endDate());
    let m = finalOutcome.getMonth();
    let month = m+1;
    let nextDate = finalOutcome.getFullYear()+'-0'+month+'-'+finalOutcome.getDate();
    console.log(nextDate);

    //Getting the weatherReport URL 
    weatherReport = `${weatherbitURLhist}lat=${userData[userData.length-1].latitude}&lon=${userData[userData.length-1].longitude}&start_date=${beginDate}&end_date=${nextDate}&key=${weatherbitKey}`;
    console.log(weatherReport);
  };

  const response = await fetch(weatherReport);
    try{
      const weatherObject = await response.json();
      console.log(JSON.stringify(weatherObject));
      userData[userData.length-1].temp = weatherObject.data[0].temp;
      console.log (`Weatherbit data`);
      return weatherObject
    } catch(error){
      console.log('error', error);
    }
};


//Async function that uses fetch() to make a GET request to the Pixabay API
const getPixabay = async () => {
  let city = userData[userData.length-1].city;
  let country = userData[userData.length-1].country; 
  pixabayRequest = `${pixabayURL}key=${pixabay_API_KEY}&q=${city}+${country}&image_type=photo&pretty=true`;
  const response = await fetch(pixabayRequest);
  try{
    const pixabayArray = await response.json();
    console.log(pixabayArray);
    userData[userData.length-1].image = pixabayArray.hits[0].webformatURL;
    console.log ('Obtained image from Pixabay');
  } catch(error){
    console.log('error', error);
  }
};

//Alternative async function that uses fetch() to make a GET request to the Pixabay API for country
const getPixabayCountry = async () => {
  let country = userData[userData.length-1].country;
  pixabayRequest = `${pixabayURL}key=${pixabay_API_KEY}&q=${country}&image_type=photo&pretty=true`;
  const response = await fetch(pixabayRequest);
  try{
    const pixabayArray = await response.json();
    console.log(pixabayArray);
    userData[userData.length-1].countryImage = pixabayArray.hits[0].webformatURL;
    console.log ('Obtained the country image from Pixabay');
  } catch(error){
    console.log('error', error);
  }
};



// POST route that adds incoming data to projectData
app.post('/add', tripData);

async function tripData(req, res){
  // const requestBody = req.body;
  const newTravelData = {};
  newTravelData.date = req.body.date;
  newTravelData.city = req.body.city;
  newTravelData.daysLeft = req.body.daysLeft;
  newTravelData.arrival = req.body.arrival;

  userData.push(newTravelData);
  console.log ('newTravelData added to userData');

  await getCoordinates();

  await weatherbit();

  await getPixabay();

  await getPixabayCountry();

  const dates = {};
  dates.arrival = req.body.arrival;
  dates.daysLeft = req.body.daysLeft;
  dates.country = userData[userData.length-1].country;
  dates.temp = userData[userData.length-1].temp;
  dates.image = userData[userData.length-1].image;
  dates.countryImage = userData[userData.length-1].countryImage;

  projectData.push(dates);

  res.send(projectData);
  console.log(projectData);
};

//GET route that returns the projectData object
app.get('/all', getProjectData);

function getProjectData (req,res) {
  res.send(projectData);
};

module.exports = server;

