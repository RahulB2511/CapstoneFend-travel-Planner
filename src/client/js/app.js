function formSubmit(){

  //Path to location where data is added 
  const locationPath = 'http://localhost:5000/add'

  // Creating a new date instance dynamically 
  let today = new Date();
  let m = today.getMonth();
  let month = m+1;
  let newDate = today.getDate()+'.'+month+'.'+ today.getFullYear();

  //Create an event listener for the element with the id
  document.getElementById('generate').addEventListener('click', performAction);

  function performAction(e){
    e.preventDefault();
    
    const arrivalDay = document.getElementById('arrivalDate').value;
    const entry = new Date(arrivalDay);
    const time = entry.getTime();
    const inputToday = (new Date()).getTime();
    const differenceMiliSec = Math.abs(time - inputToday);
    const difference = Math.ceil(differenceMiliSec/(1000*60*60*24));
    const city = document.getElementById('city').value;

    postData(locationPath, {
      date: newDate, 
      arrival: arrivalDay, 
      daysLeft: difference,
      city: city
    });

  };

  //Async function to make a POST request to add the API data, user input and data
  const postData = async ( url = '', data = {})=>{
    const response = await fetch(url,
      {
    method: 'POST', 
    credentials: 'same-origin', 
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),       
  });
    try {
      const data = await fetch('http://localhost:5000/all')
      try {
        const newData = await data.json();
        updateUI();
        return newData;
      } catch (error) {
        console.log("error 1", error);
      }
    }catch(error) {
    console.log("error 1", error);
    }
  };

  //Dynamically Update the UI
  const updateUI = async()=>{
    //Retrieve data from the app endpoint
    const request = await fetch('http://localhost:5000/all')

    try{
      const completeData = await request.json();
      console.log(completeData);
      const logsNumber = completeData.length;
      const lastEntry = completeData[logsNumber-1];
      const city = document.getElementById('city').value;

      document.getElementById('country').innerHTML = 'You will be going to '+city+', '+lastEntry.country;

      document.getElementById('content').innerHTML = 'And your arrival date is '+lastEntry.arrival;

      document.getElementById('countdown').innerHTML = 'There is '+lastEntry.daysLeft+' days left to begin your trip';

      document.getElementById('temp').innerHTML = 'The expected weather  is '+lastEntry.temp+'&deg;C';
      //Adding country image if image of city is not available
      if (lastEntry.image !== undefined ){
        document.getElementById('picture').innerHTML = '<img src='+lastEntry.image+'>';
      } else {
        document.getElementById('picture').innerHTML = '<img src='+lastEntry.countryImage+'>';
      }

    }
    catch(error){
      console.log('error', error);
    };
  }

}

export { formSubmit };
// export { updateUI }

