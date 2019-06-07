import React from 'react';
import ReactDOM from "react-dom";
import MagicSearch from './magic-search';

class App extends React.Component {

  render() {

    return (
      <div>
      <br/>
      <br/>
      <br/>
      <MagicSearch
        placeholder="Use from:, to:, and folder: prefixes to filter"
      >
      </MagicSearch>
      </div>
    );
  }
}

export default App;
// ReactDOM.render(<App />, document.getElementById("container"));
