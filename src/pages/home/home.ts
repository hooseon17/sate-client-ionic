import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  radius: any = 5;
  lat: any = 45.5036174;
  lng: any = -73.5798482;
  title = 'app';
  list: any;
  listAvailable = false;
  food: string;
  restaurant = {
  
    "foodWords": [],
    "location": {
      "lat":"45.5036174", 
      "lng":"-73.5798482"
    },
    "radius": 1
  
  }

  convo = {
  
    "conversation": "",
    "location": {
      "lat":"45.5036174", 
      "lng":"-73.5798482"
    },
    "radius": 1
  
  }

  states = {
    START:"What do you feel like eating today?",
    CHECK:"Let me see what I can find.",
    FOUND:"I found the following results, let me know if you would like anything else!",
    UNSURE:"Sorry, I could not find any results from that, try typing specific food words separated by commas like 'Pizza, chicken' for example.",
    ERROR:"Something went wrong, try again in a little bit."
}
  chatbot = this.states.START;

  constructor(public navCtrl: NavController, private http:Http) {
    this.getLocation();
  }

  getLocation() {
    navigator.geolocation.getCurrentPosition(this.showPosition.bind(this));
  }

  showPosition(position) {
    this.lat = position.coords.latitude;
    this.lng = position.coords.longitude;
  }

  launchMapUrl(parameter) {
    window.open('https://www.google.com/maps/search/?api=1&query=' + parameter.split(' ').join('+'));
  }

  searchGoogle(parameter) {
    window.open('https://www.google.com/search?&q=' + parameter.split(' ').join('+'));
  }

  chat() {
    if (this.chatbot === this.states.START){
      this.conversate();
    } else if (this.chatbot === this.states.CHECK) {
      this.chatbot = this.states.FOUND;
    } else if (this.chatbot === this.states.FOUND) {
      this.conversate();
    } else if (this.chatbot === this.states.UNSURE) {
      this.searchFood();
    } else if (this.chatbot === this.states.ERROR) {
      this.chatbot = this.states.START;
      this.conversate();
    } else {
      alert('Something went seriously wrong')
    }
    this.food = "";
  }

  searchFood() {
    if(!this.food) return;
    this.restaurant.foodWords = [];
    let foodWords = this.food.split(",");
    foodWords.forEach(food => {
      this.restaurant.foodWords.push(food.trim());
    })
    this.restaurant.radius = this.radius * 1000;
    this.restaurant.location.lat = this.lat;
    this.restaurant.location.lng = this.lng;

    this.http.post('http://sate.us-west-2.elasticbeanstalk.com/api/food/insert/', this.restaurant).map(res => res.json()).subscribe(data => {
      if (data.length == 0) this.chatbot = this.states.ERROR;
      else {
        this.chatbot = this.states.FOUND
        this.list = data;
        this.listAvailable = true;
        console.log(data);
      }
    }, err => {
      this.listAvailable = false;
      console.log(err);
    });
  }

  conversate() {
    this.convo.conversation = this.food;
    this.convo.radius = this.radius * 1000;
    this.convo.location.lat = this.lat;
    this.convo.location.lng = this.lng;

    this.http.post('http://sate.us-west-2.elasticbeanstalk.com/api/food/textConversation/', this.convo).map(res => res.json()).subscribe(data => {
      if (data.length == 0) this.chatbot = this.states.UNSURE;
      else {
        this.chatbot = this.states.FOUND
        this.list = data;
        this.listAvailable = true;
        console.log(data);
      }
    }, err => {
      this.listAvailable = false;
      console.log(err);
    });
  }

}
