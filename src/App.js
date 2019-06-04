import React from 'react';
import ReactDOM from "react-dom";
import './App.css';
import SearchBar from "./search-bar";
import MagicSearch from './magic-search';

const MOCK_DATA = {
  "@": ["afc163", "zombiej", "yesmeck"],
  "#": ["1.0", "2.0", "3.0"]
};

class App extends React.Component {

  render() {

    return (
      <div>
      <SearchBar
        style={{ width: "100%" }}
        placeholder="input @ to mention people, # to mention tag"
      >
      </SearchBar>
      <br/>
      <br/>
      <br/>
      <MagicSearch
        style={{ width: "100%", height: "100px", lineHeight: "1em" }}
        placeholder="Use from:, to:, and folder: prefixes to filter"
      >
      </MagicSearch>
      </div>
    );
  }
}

export default App;
// ReactDOM.render(<App />, document.getElementById("container"));
