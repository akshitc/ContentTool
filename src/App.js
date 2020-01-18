import React from 'react';
import logo from './logo.svg';
import './App.css';

function calculateSentiment(text) {

    var AWS = require('aws-sdk');

    AWS.config.getCredentials(function(err) {
      if (err) console.log(err.stack);
      // credentials not loaded
      else {
        console.log("Access key:", AWS.config.credentials.accessKeyId);
        console.log("Secret access key:", AWS.config.credentials.secretAccessKey);
      }
    });

    var comprehend = new AWS.Comprehend();

    var params = {
      LanguageCode: "en", /* required */
      Text: text
    };
    comprehend.detectSentiment(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     
        return console.log(data);           // successful response
    });

}

class EssayForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'Please write the text you want to analyze.'
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    //alert('An essay was submitted: ' + this.state.value);
    calculateSentiment(this.state.value)
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          <textarea className="inputs" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input className="button" type="submit" value="Analyze" />
      </form>
    );
  }
}

function App() {

  return (
    <div className="App">
    <EssayForm />
    </div>
  );
}

export default App;
