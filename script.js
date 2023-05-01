'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');




//init class app
class App {

/////////////////
#zoomField=13
#map
#mapEvent
#workout=[]
//////////////////
constructor(){

//gitting user current position 
this._getPosition();

//attaching event handlers
form.addEventListener("submit",this._newWorkout.bind(this));
inputType.addEventListener("change",this._toogleElevationField.bind(this));
containerWorkouts.addEventListener("click",this._moveToPopup.bind(this))


//getting data from local storage
this._getlocalStorage()
}

//////////////////
_getPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this))
}
}
/////////////////

_loadMap(location){

/////////////////
const {latitude} =location.coords ;
const {longitude} =location.coords ;
    
const coords = [latitude,longitude]
        
this.#map = L.map('map').setView(coords, this.#zoomField);

L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.#map);
    
this.#map.on("click",this._showForm.bind(this))
   
this.#workout.forEach(work =>{
    this._renderWorkoutList(work);
    this._renderWorkoutMarker(work);

})

    }
    
//////////////////
_showForm(mapE){
   
        this.#mapEvent = mapE;
    
    form.classList.remove("hidden")
    inputDistance.focus();
 
}
//////////////////
_hideMapForm(){
    //hide the form + clear input field //clear input fields
    inputCadence.value = inputDistance.value=inputDuration.value =inputDuration.value= inputElevation.value=" ";
    form.style.display = "none"
    form.classList.add("hidden")
    setTimeout(()=>{form.style.display = "grid"},1000)
}

///////////////////

_toogleElevationField(e){
    e.preventDefault;
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden")
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden")

}

//////////////////
_newWorkout(e){

e.preventDefault();

const validInput= (...inputs)=> 
inputs.every(input => Number.isFinite(input));

const isPositive = (...inputs)=> inputs.every(input => input >0)


/////////////////
//get data from form
const type = inputType.value;
const distance = +inputDistance.value;
const duration = +inputDuration.value;
const {lat,lng}= this.#mapEvent.latlng;
const clickCoords= [lat,lng];
let workout;
/////////////////


/////////////////

//if workout is running create a running object 
if (type === "running") {
const  cadance = +inputCadence.value;
    
if (!validInput(distance,duration,cadance)||!isPositive(distance,duration,cadance))
 return alert("input is not a positive number");

 const workout = new Running(clickCoords,distance,duration,cadance);
 //add new object to workout array
this.#workout.push(workout);


//render workout as marker on map
this._renderWorkoutMarker(workout);


//render workout on the list 
this._renderWorkoutList(workout)

this._hideMapForm()

this._setLocalStorage();

}


/////////////////
//if workout is cycling create a cycling object 
if (type === "cycling") {

const  elevation = +inputElevation.value;

if (!validInput(distance,duration,elevation)||!isPositive(distance,duration))
 return alert("input is not a positive number");

 const workout = new Cycling (clickCoords,distance,duration,elevation);
 //add new object to workout array
this.#workout.push(workout);

//render workout as marker on map
this._renderWorkoutMarker(workout);

//render workout on the list 
this._renderWorkoutList(workout)

this._hideMapForm();

this._setLocalStorage();
 }

}  

/////////////////

_renderWorkoutMarker(workout){
   
    L.marker(workout.coords)
    .addTo(this.#map)
    .bindPopup(
        L.popup({
            maxWidth:250,
            minWidth:100,
            autoClose: false,
            closeOnClick: false,
            className:`${workout.type}-popup`,
        }).setContent(`${workout.type === "running" ? "🏃‍♂️":"🦶🏼"} ${workout.discribtion}`))
    .openPopup();
}

/////////////////

_renderWorkoutList(workout){

    let html= `<li class="workout workout--${workout.type}" data-id=${workout.id}>
          <h2 class="workout__title">${workout.discribtion} </h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === "running" ? "🏃‍♂️":"🦶🏼"}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`


          if (workout.type === "running" ) {
          html+= `<div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🏃‍♂️</span>
          <span class="workout__value">${workout.cadance}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>`
          }

          if (workout.type === "cycling" ) {
            html+= `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">KM/H</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.elvation}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`
            }

    form.insertAdjacentHTML("afterend",`${html}`)
}

/////////////////
_moveToPopup(e){
const workoutEL= e.target.closest(".workout")

if (!workoutEL) return

const workout= this.#workout.find(work => work.id===workoutEL.dataset.id);

this.#map.setView(workout.coords,this.coords,{
    animate:true,
    pan:{
        duration:1
    }
});

}


///////////////////
//set Local storage to all workouts
_setLocalStorage(){
localStorage.setItem("workouts",JSON.stringify(this.#workout));
}


//getting Local storage data
_getlocalStorage(){
  const data = JSON.parse(localStorage.getItem("workouts"));

  //Guard clause
  if (!data) return;

this.#workout =data;



}

}


///////////////////////////////////////////////////

class Workout {
    
    date= new Date();
    id = (Date.now()+"".slice(-10))
    constructor(coords,distance,duration){
        this.coords = coords;
        this.distance= distance;
        this.duration= duration; 
       }


    _setDescribtion(){
        const months = ['January','February','March', 'April','May'
        ,'June','July','August','September','October','November','December'];

        
        this.discribtion =`${this.type[0].toUpperCase()}${this.type.slice(1)}
        on 
        ${months[this.date.getMonth()]}
        ${this.date.getDate()}`

    }
}
///////////////////////////////////////////////////

class Running extends Workout{
    type= 'running';
    constructor(coords,distance,duration,cadance){
        super(coords,distance,duration);
        this.cadance = cadance;
        this.calcPace();
        this._setDescribtion();
    }

/////////////////

calcPace (){
    //min/km
    this.pace = this.duration/ this.distance;
    return this.pace;

}
}

/////////////////////////////////////////////////////


class Cycling extends Workout{
    type= 'cycling';
    constructor(coords,distance,duration,elvation){
        super(coords,distance,duration)
        this.elvation = elvation;
        this.calcSpeed();
        this._setDescribtion();
    }

/////////////////

    calcSpeed (){
        //min/km
        this.speed = (this.distance/ this.duration)/60;
        return this.speed;
        
    }
}

const app = new App();
