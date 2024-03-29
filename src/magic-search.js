import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import './magic-search.css';
import DatePicker from "react-datepicker";
import InputTrigger from 'react-input-trigger';

import "react-datepicker/dist/react-datepicker.css";


class MagicSearch extends React.Component {

  // Ideally this we will pre-fetch for a user and keep it
  folders = [
    'movies',
    'documentries',
    'other',
    'home'
  ];


  constructor(props) {
      super(props);
      this.state = {
        from: '',
        to: '',
        folder: '',
        keywords: '',
        value: '',
        highlightedValue: '',
        showFolderSuggestor: false,
        showDateSuggestor: false,
        showMessageSuggestor: false,
        showHelpMessageSuggestor: false,
        messageText: '',
        folderSuggestorLeft: null,
        dateSuggestorLeft: null,
        messageSuggestorLeft: null,
        folderSuggestorTop: null,
        dateSuggestorTop: null,
        messageSuggestorTop: null,
        currentDimensionMetadata: null,
        folderText: '',
        currentFolderSelection: 0,
        scrollTop: 0,
        dimensionsState: this.dimensionsActions
      }
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleTextScroll = this.handleTextScroll.bind(this);
      this.textInputRef = React.createRef();
      this.fakeTextDiv = React.createRef();
  }

  messages = {
    'date': 'Use date formats: MM-dd-YYYY HH:mm or YYYY-MM-dd HH:mm or MM/dd/YYYY HH:mm or YYYY/MM/dd HH:mm',
    'maxDimension': 'There is already a instance of this tag present. The previous value for this tag will be overridden.'
  }

  handleKeyDown = (event) => {
    const { which } = event;

    if (which === 40 ) { // 40 is the character code of the down arrow
      event.preventDefault();

      this.setState({
        currentFolderSelection: (this.state.currentFolderSelection + 1) % this.folders.length,
      });
    }

    if (which === 13) { // 13 is the character code for enter
        event.preventDefault();
        // Returning here so that no reset happens and selection also does not happen
        const currentFolders = this.folders
        .filter(folder => folder.indexOf(this.state.folderText) !== -1);
        if (currentFolders.length === 0) {
            return;
        }
        const startPosition = this.state.currentDimensionMetadata.cursor.selectionStart;
        const folder = this.folders[this.state.currentFolderSelection];

        // reset the state and set new text
        this.setState({
            value: this.updateTextValue(folder, startPosition),
            folder: folder
        })
        this.resetTriggerState(true);

    }
  }

  updateTextValue = (textToInsert, position) => {
    return `${this.state.value.slice(0, position)} ${textToInsert} ${this.state.value.slice(position + textToInsert.length, this.state.value.length)}`
  }

  extractDimension = (cursorData) => {
    const cursorPosition = cursorData.selectionStart;
    const stringToMatch = this.state.value.substring(0, cursorPosition)
    let dimension =  null
    this.dimensions.forEach(d => {
        if (stringToMatch.endsWith(` ${d}:`) || stringToMatch === `${d}:`) {
            dimension = d;
        }
    });
    if (dimension) {
        this.setState({
            currentDimensionMetadata: {
                dimension: dimension,
                cursor: cursorData
            }
        })
    }
    return dimension;
  }

  resetTriggerState = (updateDimensionActions = false) => {
    if (updateDimensionActions) {
        const newState = this.state.dimensionsState;
        newState[this.state.currentDimensionMetadata.dimension].maximumInstances -= 1;
        this.setState({
            dimensionsState: newState
        });
    }
    this.setState({
        showFolderSuggestor: false,
        folderSuggestorLeft: null,
        folderSuggestorTop: null,
        showDateSuggestor: false,
        dateSuggestorLeft: null,
        dateSuggestorTop: null,
        showMessageSuggestor: false,
        messageSuggestorLeft: null,
        messageSuggestorTop: null,
        folderText: '',
        currentFolderSelection: 0,
        currentDimensionMetadata: null,
        showHelpMessageSuggestor: false
      });
    // Ending the trigger handler each time we end processing a trigger.
    this.endHandler();
  }

  onTriggerInput = (metaData) => {
    if (this.state.currentDimensionMetadata && this.state.currentDimensionMetadata.dimension) {
        const currentDimension = this.state.currentDimensionMetadata.dimension
        this.dimensionsActions[currentDimension].triggerInput(metaData);
    }
  }

  handleFolderTriggerInput = (metaData) => {
    this.setState({
        folderText: metaData.text,
    });
  }

  handleDateTriggerInput = (metaData) => {
    const dateInputText = metaData.text;
    if (dateInputText.trim().length === 16) {
        if (!isNaN(Date.parse(dateInputText.trim()))) {
            const dateObject = new Date(Date.parse(dateInputText.trim()));
            const formattedDate = dateObject.toISOString().replace('T', ' ').substring(0, 16);
            console.log(this.state.currentDimensionMetadata.dimension);
            const stateField = this.dimensionsActions[this.state.currentDimensionMetadata.dimension].stateField;
            const stateUpdateObject = {};
            stateUpdateObject[stateField] = formattedDate;
            console.log(stateUpdateObject);
            this.setState(stateUpdateObject);
            this.resetTriggerState(true);
        }
    }
  }


  onTriggerStart = (metaData) => {
      const dimension = this.extractDimension(metaData.cursor);
      if (!dimension) {
          // Don't want to do anything if it doesn't match with any dimension
          this.endHandler();
          return;
      }
      if (this.dimensionsActions[dimension]) {
          this.highlightText();
          this.showHelperMessage(dimension);
          (this.dimensionsActions[dimension].triggerStart)(metaData)
      }
  }


  handleFolderTriggerStart = (metaData) => {
    const cursor = metaData.cursor;
    // This is when we need to show the suggestor for folders
    this.setState({
        showFolderSuggestor: true,
        folderSuggestorLeft: cursor.left,
        folderSuggestorTop: cursor.top + cursor.height, // we need to add the cursor height so that the dropdown doesn't overlap with the `:`.
    });
  }

  handleDateTriggerStart = (metaData) => {
    const cursor = metaData.cursor;
    // This is when we need to show the suggestor for folders
    /*
    Uncomment this to see the date picker format
    this.setState({
        showDateSuggestor: true,
        dateSuggestorLeft: cursor.left,
        dateSuggestorTop: cursor.top + cursor.height, // we need to add the cursor height so that the dropdown doesn't overlap with the `:`.
    });
    */
   this.setState({
    showMessageSuggestor: true,
    messageSuggestorLeft: cursor.left,
    messageSuggestorTop: cursor.top + cursor.height
   })

  }

  handleTextChange = (event) => {
    this.setState({value: event.target.value});
    this.highlightText();
  }

  highlightText = () => {
    let currentValue = this.state.value;
    this.dimensions.forEach(d => {
        currentValue = currentValue.replace(new RegExp(`${d}:`, 'gi'), `<mark>${d}:</mark>`);
    });
    this.setState({
        highlightedValue: currentValue
    });
    this.handleTextScroll();
  }

  showHelperMessage = (dimension) => {
    if (this.state.dimensionsState[dimension].maximumInstances <= 0) {
        this.setState({
            showHelpMessageSuggestor: true,
            messageText: this.messages.maxDimension
        });
    }
  }

  handleTextScroll = () => {
    const scrollTop = this.textInputRef.scrollTop;
    this.fakeTextDiv.current.scrollTop = scrollTop;
  }

  handleDateChange = (date) => {
    const formattedDate = date.toISOString().replace('T', ' ').substring(0, 16);
    const startPosition = this.state.currentDimensionMetadata.cursor.selectionStart;
    this.setState({
      value: this.updateTextValue(formattedDate, startPosition)
    })
    this.resetTriggerState()
  }


  handleSubmit = e => {
    e.preventDefault();
    // Here create the JSON format that we want for the
    const jsonToPost = {
        from: this.state.from,
        to: this.state.to,
        folder: this.state.folder,
        text: this.state.value
    };
    console.log(jsonToPost);
  }

  renderFolderListDiv = () => {
    const currentFolders = this.folders
    .filter(folder => folder.indexOf(this.state.folderText) !== -1);
    if (currentFolders && currentFolders.length === 0) {
        return (
            <div style={{padding: '10px 20px'}}>
            No matching folder, update your search.
            </div>
        )
    } else {
        return  (currentFolders
            .map((folder, index) => (
              <div
                style={{
                  padding: '10px 20px',
                  background: index === this.state.currentFolderSelection ? '#eee' : ''
                }}
              >
                { folder }
              </div>
            )));
    }
  }

  dimensions = [
      'from', 'to', 'folder'
  ];

  dimensionsActions = {
    from: {
      triggerStart: this.handleDateTriggerStart,
      triggerInput: this.handleDateTriggerInput,
      stateField: 'from',
      maximumInstances: 1
    },
    to: {
      triggerStart: this.handleDateTriggerStart,
      triggerInput: this.handleDateTriggerInput,
      stateField: 'to',
      maximumInstances: 1
    },
    folder: {
      triggerStart: this.handleFolderTriggerStart,
      triggerInput: this.handleFolderTriggerInput,
      stateField: 'folder',
      maximumInstances: 1
    }
  }

  render() {
    const {
        style,
        placeholder
    } = this.props;


    return (
        <div>
            <div style={{position:'relative'}}  onKeyDown={this.handleKeyDown}>
                <div className="backdrop" ref={this.fakeTextDiv}>
                    <div className="highlights" dangerouslySetInnerHTML={{__html: this.state.highlightedValue}}>
                    </div>
                </div>
            <InputTrigger
                trigger={{
                    keyCode: 186,
                    shiftKey: true,
                }}
                onStart={this.onTriggerStart}
                onCancel={this.resetTriggerState}
                onType={this.onTriggerInput}
                endTrigger={(endHandler) => { this.endHandler = endHandler; }}>
                <textarea
                        name='search-text-field'
                        style={style}
                        ref={this.textInputRef}
                        placeholder={placeholder}
                        onBlur={this.handleTextChange.bind(this)}
                        onChange={this.handleTextChange.bind(this)}
                        onScroll={this.handleTextScroll.bind(this)}
                        value={this.state.value}
                        />
            </InputTrigger>
            <div id="helpMessage"
            style={{
                paddingTop: "55px",
                display: this.state.showHelpMessageSuggestor ? "block" : "none"}}>
                {this.state.messageText}
            </div>

            <div
            id="message"
            className="overlayDiv"
            style={{
                position: "absolute",
                width: "500px",
                borderRadius: "6px",
                background: "white",
                boxShadow: "rgba(0, 0, 0, 0.4) 0px 1px 4px",
                minHeight: "50px",
                display: this.state.showMessageSuggestor ? "block" : "none",
                top: this.state.messageSuggestorTop,
                left: this.state.messageSuggestorLeft,
            }}
            >
            Use date formats: MM-dd-YYYY HH:mm or YYYY-MM-dd HH:mm or MM/dd/YYYY HH:mm or YYYY/MM/dd HH:mm
            </div>
            <div
            id="folderDropdown"
            className="overlayDiv"
            style={{
                position: "absolute",
                width: "200px",
                borderRadius: "6px",
                background: "white",
                boxShadow: "rgba(0, 0, 0, 0.4) 0px 1px 4px",
                minHeight: "100px",
                display: this.state.showFolderSuggestor ? "block" : "none",
                top: this.state.folderSuggestorTop,
                left: this.state.folderSuggestorLeft,
            }}
            >
            {
            this.renderFolderListDiv()
            }
            </div>
            <div
            id="dateDropdown"
            className="overlayDiv"
            style={{
                position: "absolute",
                width: "313px",
                borderRadius: "6px",
                background: "white",
                boxShadow: "rgba(0, 0, 0, 0.4) 0px 1px 4px",
                minHeight: "200px",
                display: this.state.showDateSuggestor ? "block" : "none",
                top: this.state.dateSuggestorTop,
                left: this.state.dateSuggestorLeft,
            }}
            >
            <DatePicker
                inline
                selected={new Date()}
                timeFormat="HH:mm"
                timeIntervals={15}
                onChange={this.handleDateChange}
                preventOpenOnFocus={true}
                showTimeSelect
            />
            </div>
            </div>
            <br />
            <br />
            <button onClick={this.handleSubmit}>
                Search
            </button>
        </div>
    );
  }
}

MagicSearch.prototypes = {
    style: PropTypes.object,
    placeholder: PropTypes.string
}

export default MagicSearch;
// ReactDOM.render(<App />, document.getElementById("container"));
