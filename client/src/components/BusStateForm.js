/*jshint esversion: 9 */
import React from 'react';

class BusStateForm extends React.Component {

  constructor(props) {
    super(props);
    console.log(props);
    // update local information regarding bus state change 
    let buses = props.buses;
    buses = buses.map((bus) => {
      bus.originalState = bus.state;
      bus.changed = false;
      return bus;
    });
    this.state = {buses:buses};
    this.mybusway = props.mybusway;
    this.updateBus = props.updateBus;
        
    console.log('INITIAL STATE');
    console.log(this.state);
    this.options = {
      'green':{'name':'verde', color:'lime', fontcolor: 'white'},
      'yellow': {'name':'amarela', color:'gold', fontcolor: 'white'},
      'pink': {'name':'rosa', color:'magenta', fontcolor: 'white'},
      'blue': {'name':'azul', color:'dodgerblue', fontcolor: 'white'},
      'express': {'name':'expressa', color:'silver', fontcolor: 'black'},
      'dedicated': {'name':'dedicada', color:'orange', fontcolor: 'black'},
      'charging': {'name':'carregando', color:'rosybrown', fontcolor: 'black'},
      'maintenance': {'name':'manutencao', color:'brown', fontcolor: 'black'},
      'undefined': {'name':'indefinida', color:'black', fontcolor: 'red'}
    };

    this.changeState = this.changeState.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  changeState(bus, event) {

    console.log(bus);
    console.log(event.target.selectedOptions[0].value);
    if (!bus.originalState) {
      bus.originalState = bus.state;
    }
    bus.state = event.target.selectedOptions[0].value;
    bus.changed = true;

    let buses = this.state.buses;
    buses = buses.map((b) => {
      let r = undefined;
      if (b.hash === bus.hash) {
        r = bus; 
        console.log(r);
      }
      else r = b;
      return r;
    });
    // update bus state 
    let x = {...this.state, buses:buses};
    console.log(x);
    this.setState(x);

  }

  handleSubmit(event) {

    this.state.buses.map((bus) => {
      // only updates buses that does have state change 
      if (bus.changed && bus.state !== bus.originalState) {
        this.mybusway.api.updateBusState(bus)
          .then(res => {
            if (res.transition) { 
              bus.changed = false;
              bus.originalState = res.to;
              console.log(`state changed for bus ${bus.name} to ${res.to}`);
              // update internal structure with this new state 
              let buses = this.state.buses.map((b) => (b.hash === bus.hash) ? bus : b);
              
              this.setState({...this.state, buses:buses});

              // update state on parent
              this.updateBus(bus);
            } else {
              console.log(res);
            }
          })
          .catch(ex => console.log(ex));
      }
    });


  }



  render() {
    return (<div>

      Atualize o estado da frota:

      <form>
        <table><thead>
          <tr>
            <th>Nome do Onibus</th>
            <th>estado atual</th>
            <th>novo estado</th>
            <th>estado original</th>
          </tr>
          </thead><tbody>
          {this.state.buses.map((bus) => {
            return (<tr key={`${bus.hash}-line`}>
              <td>{bus.name}</td>
              <td><div style={{color:this.options[bus.state].fontcolor, backgroundColor:this.options[bus.state].color}}>{bus.state} -> {this.options[bus.state].color}</div></td>
              <td><select key={`${bus.hash}-select`} bus_id={bus.hash} value={bus.state} onChange={(e) => this.changeState(bus, e)}>
                {Object.keys(this.options).map((key) => (<option key={`${bus.name}-select-${key}`}value={key}>{this.options[key].name}</option>))}
              </select>
              </td>
              <td><div style={{color:this.options[bus.state].fontcolor, backgroundColor:this.options[bus.originalState].color}}>{bus.originalState}</div></td>
              </tr>)
          })}
          </tbody></table>
        <input type="button" value="Salvar" onClick={(e) => { this.handleSubmit(e); }}/>
      </form>

      </div>);
  }

}

export default BusStateForm;