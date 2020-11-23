/*jshint esversion: 6 */

import React from 'react';
import { Map, TileLayer, Marker, Polyline, LayerGroup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import './leaflet/functionButtons.js';
import './App.css';
// import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import { DriftMarker } from "leaflet-drift-marker";


const { BaseLayer, Overlay } = LayersControl;
var mybusway = require('./api/mybusway.js');
var moment = require('moment');

console.log(mybusway);

class App extends React.Component {

  constructor() {
    super();

    this.state = {
      centerLocation: {
        lat: -22.961683,
        lon: -43.406825,
        //lat: -22.970668,
        //lng: -47.042479,  
      },
      zoom: 17,
      buses: [],
      stops: [],
      isPaneOpen: false,
      lastUpdate: moment()
    };
  
    // this.server = 'http://192.168.1.172:8080';
  
    // iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=',
    // busIcon = L.icon({
    //   iconUrl: './buspin.svg',
    //   // iconSize: [39, 50], 
    //   // iconAnchor: [19.5, 50], 
    //   // popupAnchor: [0, -50], 
    //   iconSize: [19.5, 25],
    //   iconAnchor: [9.75, 25],
    //   popupAnchor: [0, -25]
    // });
  
    this.LINE = { 
      RED: {ndx: 0, name: 'ROSA', deltaLat:0, deltaLong:0},
      GREEN: {ndx: 1, name: 'VERDE', deltaLat:0.00005, deltaLong:0.00005},
      BLUE: {ndx: 2, name: 'AZUL', deltaLat:-0.00005, deltaLong:0.00005},
      YELLOW: {ndx: 3, name: 'AMARELA', deltaLat:0.00005, deltaLong:-0.00005}
    };
  
    this.DEFAULT_LINE = this.LINE.RED;
  
    this.ICON = { 
      BUS: [
        L.icon({iconUrl:'./image/bus-red.png', iconSize: [35.25, 53.25], iconAnchor: [17.625, 53.25], popupAnchor:[0, -53.25]}),
        L.icon({iconUrl:'./image/bus-green.png', iconSize: [35.25, 53.25], iconAnchor: [17.625, 53.25], popupAnchor:[0, -53.25]}),
        L.icon({iconUrl:'./image/bus-blue.png', iconSize: [35.25, 53.25], iconAnchor: [17.625, 53.25], popupAnchor:[0, -53.25]}),
        L.icon({iconUrl:'./image/bus-yellow.png', iconSize: [35.25, 53.25], iconAnchor: [17.625, 53.25], popupAnchor:[0, -53.25]})
      ],
      STOP: [
        L.icon({iconUrl:'./image/stop-red.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor:[0, -32]}),
        L.icon({iconUrl:'./image/stop-green.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor:[0, -32]}),
        L.icon({iconUrl:'./image/stop-blue.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor:[0, -32]}),
        L.icon({iconUrl:'./image/stop-yellow.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor:[0, -32]})
      ]
    };
  
  }

  // redMarker = L.AwesomeMarkers.icon({
  //   icon: 'bus',
  //   markerColor: 'red'
  // });

  componentDidMount() {
    // status.textContent = 'Locating…';
    // loading active buses 
    mybusway.api.getBuses().then(data => {
      console.log('loaded buses ');
      // console.log(data);
      // loading last bus position 
      var data2  = data.map(bus => {
        // console.log(`loading bus position for`);
        // console.log(bus);

        // update bus with local icon 
        
        return mybusway.api.getBusLocation(bus)
          .then(busPositions => {
            // console.log(`BUS ${bus.hash} position is`);
            // console.log(busPosition);
            
            return {...bus, positions: busPositions, lastPosition: (busPositions && busPositions.length > 0) ? busPositions[0] : undefined, moved:false}
          })
          .catch(ex => {
            console.error('PROBLEMS:');
            console.error(ex);
            return undefined;
          });
      });
      Promise.all(data2).then(info => {
        console.log('INITIAL BUS DATA =>');
        console.log(info);

        // create a timer to reload position periodically 
        this.interval = setInterval(() => this.updateLocation(), 10000);
        //

        this.setState({buses: info});  
        
      });

      // load all bus stops 
      mybusway.api.getStops().then(data => {
        console.log('STOPS = ');
        console.log(data);
        this.setState({stops: data});
      })

    });
    //
    console.log('getting user current position');
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);
      this.setState({ 
        location: {
          lat: position.coords.latitude, 
          lng: position.coords.longitude
        }
      });
    }, () => {
      console.log('no permission to easy location ... get from IP');
      this.getLocationFromIP();
    });
  }

  updateLocation() {
    var data = this.state.buses;
    if (data === undefined) { 
      console.log('NO DATA');
      return;
    }
    console.log('BUSINFO');
    console.log(data);
    console.log('updating bus position');
    var data2  = data.map(bus => {
      // console.log(`loading bus position for`);
      // console.log(bus);
      var _prevPosition = bus.lastPosition;
      return mybusway.api.getBusLocation(bus)
        .then(busPositions => {
          // console.log(`BUS ${bus.hash} position is`);
          // console.log(busPosition);
          let _lastPosition = (busPositions && busPositions.length > 0) ? busPositions[0] : undefined;
          let _moved = _lastPosition && _lastPosition._lat !== _prevPosition._lat && _lastPosition._lon !== _prevPosition._lon;
          return {...bus, positions: busPositions, lastPosition: _lastPosition, moved: _moved};
        })
        .catch(ex => {
          console.error('PROBLEMS UPDATING BUS POSITION:');
          console.error(ex);
          // NOTE: return last known position for this device 
          return bus;
        });
    });
    Promise.all(data2).then(info => {
      // console.log('UPDATED BUS DATA => ');
      // console.log(info);
      console.log('==============');
      console.log('OLD BUSES');
      console.log(this.state.buses);
      console.log('NEW BUSES');
      console.log(info);
      console.log('==============');
      this.setState({buses: info, lastUpdate: moment(new Date())});  
    });

  }

  componentWillUnmount() {
    clearInterval(this.interval);
    // this.state({buses:{}});
  }

  getLocationFromIP() {
    fetch('http://ip-api.com/json')
      .then(res => res.json())
      .then(loc => { 
          // console.log(loc); 
          this.setState({location: { lat: loc.lat, lng: loc.lon}, zoom: 17}); 
        });
  }

  // possible MAP references
  // https://leaflet-extras.github.io/leaflet-providers/preview/

  // icon recolor 
  // https://codepen.io/sosuke/pen/Pjoqqp
  // https://stackoverflow.com/questions/7415872/change-color-of-png-image-via-css

  distance(p1, p2) {
    
    let x = p1._lat - p2._lat;
    let y = (p1._lon - p2._lon)*Math.cos(p2._lat);
    let dist = 110.25* Math.sqrt(x*x + y*y);
    if (dist > 0.1)
      console.log(`DISTANCE BETWEEN ${p1._lat},${p1._lon} x ${p2._lat},${p2._lon} = ${dist}`);
    return dist;
  }



  render() {
    const position = [this.state.centerLocation.lat, this.state.centerLocation.lon];
    console.log(this.state.buses);
    const markers = this.state.buses.map(busInfo => {
      // bus is a list of lat longs for this bus ... 
      // create a poly line to display itss location

      // console.log('BUSINFO');
      // console.log(busInfo);

      // var values = Object.values(busInfo);
      // console.log('VALUES =>');

      if (!busInfo) return;

      var hash = busInfo.hash;
      var clazz = 'running';
      var line = this.DEFAULT_LINE;
      var name = busInfo.name;

      switch (busInfo.line) {
        case "red": line = this.LINE.RED; break; 
        case "green": line = this.LINE.RED; break; 
        case "blue": line = this.LINE.RED; break; 
        case "yellow": line = this.LINE.RED; break; 
        default: 
      }

      busInfo.icon = this.ICON.BUS[line.ndx];
    
      // var now = moment(new Date());
      var lastPosition = busInfo.lastPosition ? L.latLng(busInfo.lastPosition._lat, busInfo.lastPosition._lon): undefined;
      var prevPosition = {_ts:moment(), _lat: undefined, _lon:undefined};
      var distances = [];
      //
      // return an array of arrays of positions ... 
      // each element of the array has a path (to be placed for this device)
      // large 'jumps' on location are segreggated in separed paths 
      // large 'jumps' means two consecutive positions far than 90m 
      //
      var paths = busInfo.positions.map(position => {
        // console.log(bus);      
        if (position) {
          // var duration = moment.duration(prevPosition._ts.diff(position._ts));
          // var hours = duration.asHours(); 
          // 
          clazz = busInfo.moved ? 'running' : 'innactive';
          // clazz = (hours < 1 ? 'running' : (hours < 24 ? 'inactive' : (hours < 100 ? 'stalled' : 'stopped')));
          // compute distance 
          let dist = prevPosition._lat ? this.distance(position, prevPosition) : 0;
          prevPosition = {_ts: moment(position._ts), _lat:position._lat, _lon:position._lon};
          distances.push(dist);
          return {_pos: L.latLng(position._lat, position._lon), _dist: dist};
        }
        return undefined;

      })
        .filter(v => v)
        .reduce((t, v) => {
          if (v._dist > 0.09) t.push([]);
          t.slice(-1)[0].push(v._pos);
          return t;
        }, [[]]);
      // show distances 
      console.log(`${busInfo.name} => ${Math.min(...distances)} ... ${Math.max(...distances)}`);
      console.log(`LAST POSITION = ${lastPosition}  |   STATE = ${busInfo.moved}`);

      return (
        <Overlay name={name} key={`bus.info.${name}`}>
          <LayerGroup>
            {paths.map((path, i) => (<Polyline key={`${hash}.path.${i}`} icon={this.busIcon} positions={path} className={clazz} weight={3}></Polyline>))}
            {lastPosition &&   <DriftMarker key={`bus.${name}`} position={lastPosition} duration={1000} icon={busInfo.icon} > </DriftMarker>}
          </LayerGroup>
        </Overlay>
        );
      
    });
    // console.log(markers);
    // add function buttons
    // add bus stops

    const lines = this.state.stops.map(stop => stop.line).reduce((t, v) => {!t.includes(v) && t.push(v); return t; }, []);
    console.log('LINESS => '); 
    console.log(lines);
    const busStops = lines.map(line => {
       const stops = this.state.stops && this.state.stops.filter(v => v.line === line).map(stop => {
        let type = this.DEFAULT_LINE;
        
        switch (stop.line) {
          case this.LINE.RED.name: type = this.LINE.RED; break; 
          case this.LINE.GREEN.name: type = this.LINE.GREEN; break; 
          case this.LINE.BLUE.name: type = this.LINE.BLUE; break; 
          case this.LINE.YELLOW.name: type =  this.LINE.YELLOW; break; 
          default:
        }
        let stopIcon = this.ICON.STOP[type.ndx];
        return (<Marker key={`${stop.line}-${stop.no}`} icon={stopIcon} position={L.latLng(stop.lat+type.deltaLat, stop.long+type.deltaLong)} opacity={0.5}></Marker>);
      });

      return (<Overlay name={line} key={`${line}-group`}><LayerGroup>{stops}</LayerGroup></Overlay>);  
    });

    console.log('BUS STOPS => ');
    console.log(busStops);


    // leaflet providers
    // https://leaflet-extras.github.io/leaflet-providers/preview/
    var map = (
      <Map center={position} zoom={this.state.zoom} className='map'>
        <LayersControl position="topright">
          <BaseLayer checked name="mapa normal">
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              // attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"   
              // url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              // url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
              // url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
              // url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </BaseLayer>
          <BaseLayer name="black & white">
              <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"   
            />
          </BaseLayer>
          <BaseLayer name="satelite">
              <TileLayer
              // attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"   
              // url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              // url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
              // url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />

          </BaseLayer>
          {markers}
        
          {busStops}
            
          
        </LayersControl>
      </Map>
    );
    console.log('MAP => ');
    console.log(map);
    return (<div><div style={{height:'90vh'}}>{map}</div><div>Last update = {this.state.lastUpdate.format()}</div></div>);
    // return (<div>
    //     <div>{map}</div>
    //     <div>Last update = {this.state.lastUpdate}</div>
    //   </div>
    // );
  }
}

export default App;
