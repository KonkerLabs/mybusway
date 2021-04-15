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
    this.uri = env('MYBUSWAY_SERVER') || 'http://projac.mybusway.com:8080'; //'http://localhost:8080';
    console.log(`SERVER = ${this.uri}`);
  }

  getBuses() {
    return axios.get(`${this.uri}/v2/buses`).then(data => { 
      // console.log(data); 
      return data.data;
    });
  }

  getBusLocation(bus) {
    // console.log('GET BUS LOCATION');
    // console.log(bus);

    return axios.get(`${this.uri}/v2/buses/${bus.hash}/position`)
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
    return axios.get(`${this.uri}/v2/stops/${name || ''}`).then(data => data.data);
  }

  updateBusState(bus) {
    return axios.post(`${this.uri}/v2/buses/${bus.hash}/state/${bus.state}`).then(data => data.data);
  }

}

export const api = new MyBusWay();

// module.exports = { api };