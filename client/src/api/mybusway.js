/* jshint esversion: 9 */
import env from "@beam-australia/react-env";

import instance  from '../interceptors/authentication';
var moment = require('moment');

console.log('WINDOWS LOADED');
console.log(window._env_);
console.log(`ENV = ${env('MYBUSWAY_SERVER')}`)


class MyBusWay {

  constructor(props) {
    this.uri = window._env_ ? window._env_.MYBUSWAY_SERVER : 'http://projac.mybusway.com:8080'; 
    console.log(`SERVER = ${this.uri}`);
    this.token = props && props.token;
  }

  setToken(_token) {
    this.token = _token;
    instance._token = _token;
    
  }

  getBuses() {
    return instance.get(`${this.uri}/v2/buses`).then(data => { 
      // console.log(data); 
      return data.data;
    });
  }

  getBusLocation(bus) {
    // console.log('GET BUS LOCATION');
    // console.log(bus);

    return instance.get(`${this.uri}/v2/buses/${bus.hash}/position`)
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
    return instance.get(`${this.uri}/v2/stops/${name || ''}`).then(data => data.data);
  }

  updateBusState(bus) {
    return instance.post(`${this.uri}/v2/buses/${bus.hash}/state/${bus.state}`).then(data => data.data);
  }

}

export const api = new MyBusWay();

// module.exports = { api };