/*jshint esversion: 9 */
import React, {useEffect, useState} from 'react';
import Secured from '../containers/Secured';

const BusStateForm = (props) =>  {

    // console.log(props);
    // update local information regarding bus state change 

    // const [ buses, setLocalBuses ] = useState(props.buses);

    const { buses, mybusway, setBuses, updateToken } = props; 
    const [ status, setStatus ] = useState();

    // initalize 
    useEffect(() => {
      buses && setBuses(buses.map((bus) => {
        bus.originalState = bus.state;
        bus.changed = false;
        return bus;
      }));
      // eslint-disable-next-line 
    }, []);

    const options = {
      'green':{'name':'verde', color:'lime', fontcolor: 'blue'},
      'yellow': {'name':'amarela', color:'gold', fontcolor: 'blue'},
      'pink': {'name':'rosa', color:'magenta', fontcolor: 'white'},
      'blue': {'name':'azul', color:'dodgerblue', fontcolor: 'white'},
      'express': {'name':'expressa', color:'silver', fontcolor: 'black'},
      'dedicated': {'name':'dedicada', color:'orange', fontcolor: 'black'},
      'charging': {'name':'carregando', color:'rosybrown', fontcolor: 'white'},
      'maintenance': {'name':'manutencao', color:'brown', fontcolor: 'white'},
      'undefined': {'name':'indefinida', color:'black', fontcolor: 'yellow'}
    };

  const changeState = (bus, event) => {

    console.log(bus);
    console.log(event.target.selectedOptions[0].value);
    if (!bus.originalState) {
      bus.originalState = bus.state;
    }
    bus.state = event.target.selectedOptions[0].value;
    bus.changed = true;

    setBuses(buses.map((b) => {
      let r = undefined;
      if (b.hash === bus.hash) {
        r = bus; 
        console.log(r);
      }
      else r = b;
      return r;
    }));

  }

  const handleSubmit = (event) => {

    setStatus('salvando mudanças de estado ....');
    let _buses = buses.map((bus) => {
      // only updates buses that does have state change 
      if (bus.changed && bus.state !== bus.originalState) {
        return mybusway.api.updateBusState(bus)
          .then(res => {
            if (res.transition) { 
              // update internal structure with this new state 
              bus.changed = false;
              bus.originalState = res.to;
              console.log(`state changed for bus ${bus.name} to ${res.to}`);
            } else {
              console.log(res);
            }
            return bus;
          })
          .catch(ex => { console.log(ex); return bus; } )
          .finally(data => { console.log('finally'); console.log(data); return data;});
      } else {
        return bus;
      }
    });

    console.log('BUSES-PROMISE');
    console.log(_buses);

    Promise.all(_buses).then(info => { 
      console.log('BUSES-INFO');
      console.log(info);
      setBuses(info);
      setStatus('concluído');
    });


  };


  // update original state 
  buses.map((bus) => {
    if (!bus.originalState) {
      bus.originalState = bus.state;
      bus.changed = false;
    }
    return bus;  
  });

    return (<Secured updateToken={updateToken}><div>

      Atualize o estado da frota:

      <form>
        <table><thead>
          <tr>
            <th>Nome do Onibus / Veículo</th>
            <th>Novo estado</th>
            <th>Mudar para qual estado?</th>
            <th>Estado atual</th>
          </tr>
          </thead><tbody>
          {buses && buses.map((bus) => {
            return (<tr key={`${bus.hash}-line`}>
              <td>{bus.name}</td>
              <td><div style={{color:options[bus.state].fontcolor, backgroundColor:options[bus.state].color}}>{options[bus.state].name}</div></td>
              <td><select key={`${bus.hash}-select`} bus_id={bus.hash} value={bus.state} onChange={(e) => changeState(bus, e)}>
                {Object.keys(options).map((key) => (<option key={`${bus.name}-select-${key}`}value={key}>{options[key].name}</option>))}
              </select>
              </td>
              <td><div style={{color:options[bus.state].fontcolor, backgroundColor:options[bus.originalState].color}}>{options[bus.originalState].name}</div></td>
              </tr>)
          })}
          </tbody></table>
        <input type="button" value="Salvar" onClick={(e) => { handleSubmit(e); }}/><div>{status}</div>
      </form>

      </div></Secured>);

}

export default BusStateForm;