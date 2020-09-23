/* jshint esversion: 9 */
import env from "@beam-australia/react-env";

var axios = require('axios');
var moment = require('moment');


console.log('DOTENV LOADED');
console.log(process.env);
console.log('WINDOWS LOADED');
console.log(window._env);
console.log(`ENV = ${env('MYBUSWAY_SERVER')}`)


class MyBusWay {

  constructor() {
    this.uri = env('MYBUSWAY_SERVER') || 'http://localhost:8080';
    console.log(`SERVER = ${this.uri}`);
  }

  getBuses() {
    return axios.get(`${this.uri}/buses`).then(data => { 
      // console.log(data); 
      return data.data;
    });
  }

  getBusLocation(bus) {
    // console.log('GET BUS LOCATION');
    // console.log(bus);

    return axios.get(`${this.uri}/bus/${bus.hash}/position`)
      .then(data => { 
        //console.log('GET BUS LOCATION');
        //console.log(data); 
        return data.data.map(datax =>{ return {...datax, ts: moment(datax._ts).toString()}; } );
      })
      .catch(ex => {
        // console.error('PROBLEMS');
        // console.error(ex);
        throw ex;
      });
  }

  getStops(name = undefined) {
    return axios.get(`${this.uri}/stops/${name || ''}`).then(data => data.data);
  }

}

export const api = new MyBusWay();

// module.exports = { api };