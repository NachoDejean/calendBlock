import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private weatherEndpoint = 'http://api.openweathermap.org/data/2.5/weather?lat=';
  private weatherKey = '87045e150010fe3907acf16b7149a835';

  constructor( private http: HttpClient) { }

  getWeather(lat, long){
    let queryString = 'https://api.openweathermap.org/data/2.5/weather?lat='+ lat + '&lon=' + long + '&appid=' + this.weatherKey + '&units=metric';
    return this.http.get(queryString);
  }
}
