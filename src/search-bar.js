import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import './App.css';
import { Mentions, Form, Button } from 'antd';
import 'antd/dist/antd.css';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";


const MOCK_DATA = {
  "@": ["afc163", "zombiej", "yesmeck"],
  "#": ["1.0", "2.0", "3.0"]
};

class SearchBar extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        from: '',
        to: '',
        folder: '',
        keywords: '',
      }
      this.value = '';
      this.onFromDateChange = this.onFromDateChange.bind(this);
      this.onSearch = this.onSearch.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.prefixList = ['from:', 'to:', 'folder:']
      this.fromCalendarRef = React.createRef();
      this.toCalendarRef = React.createRef();
  }


  onFromDateChange = (date) => {
      console.log(date);
      this.setState({'from': date});
  }

  onToDateChange = (date) => {
    console.log(date);

    this.setState({'to': date});
}

  onSearch = (_, prefix) => {
    this.fromCalendarRef.current.setOpen(false);
    this.toCalendarRef.current.setOpen(false);
    if (prefix === 'from:') {
        this.fromCalendarRef.current.setOpen(true);
    }
    if (prefix === 'to:') {
        this.toCalendarRef.current.setOpen(true);
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        console.log('Errors in the form!!!');
        return;
      }
      console.log('Submit!!!');
      console.log(values);
    });
  }

  render() {
    const {
        style,
        placeholder
    } = this.props;


    return (
    <Form layout="horizontal">
     <Form.Item label="Search" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
      <Mentions
        style={style}
        placeholder={placeholder}
        prefix={this.prefixList}
        onSearch={this.onSearch}
      >
      {this.state.value}
      </Mentions>
      <DatePicker
         selected = {new Date()}
         onChange={this.onFromDateChange}
         timeInputLabel="Time:"
         showTimeInput
         dateFormat="MM/d/yyyy HH:mm"
         ref={this.fromCalendarRef} />
      <DatePicker
         selected = {new Date()}
         onChange={this.onToDateChange}
         timeInputLabel="Time:"
         showTimeInput
         dateFormat="MM/d/yyyy HH:mm"
         ref={this.toCalendarRef} />
      </Form.Item>
      <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
        <Button type="primary" onClick={this.handleSubmit}>
            Submit
        </Button>
      </Form.Item>
    </Form>
    );
  }
}

SearchBar.prototypes = {
    style: PropTypes.object,
    placeholder: PropTypes.string
}

export default SearchBar;
// ReactDOM.render(<App />, document.getElementById("container"));
