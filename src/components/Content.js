import React from 'react';
import makeRequest from '../services/makeRequest';
import '../assets/styles/Content.css';

class Content extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            input: '',
            result: '',
            loading: false,
        };
    }

    handleChange(event) {
        this.setState({input: event.target.value});
    }

    analyzeText() {
        this.setState({loading: true});
        makeRequest({
            url: 'http://www.mocky.io/v2/5e5aaed43000002b8a1f0bde',
        }).then(result => {
            if (result && result.data) {
                this.setState({result: result.data});
            }
        }).catch(error => {
            console.log('Error making request: ', error);
        }).finally(() => {
            this.setState({loading: false});
        });
    }

    clearResult() {
        this.setState({result: ''});
    }

    render() {
        return (
            <div className="content">
                <div>
                    <h2>Heading</h2>
                    <p>Some text description</p>
                </div>
                <div className="row">
                    <div className="col-5">
                        <div className="input-box-container">
                            <textarea
                                className="input-text"
                                onChange={this.handleChange.bind(this)}
                                placeholder="Please write the text and press analyze to get result."
                            />
                        </div>
                    </div>
    
                    <div className="col-2 center-align">
                        <div className="analyze-button">
                            <input
                                type="submit"
                                value="Analyze"
                                onClick={this.analyzeText.bind(this)} 
                                disabled={this.state.loading}
                            />
                            <input
                                type="submit"
                                value="Clear Result"
                                onClick={this.clearResult.bind(this)} 
                            />
                        </div>
                    </div>
    
                    <div className="col-5">
                        <div className="input-box-container">
                            <textarea
                                className="input-text"
                                value={this.state.result}
                                placeholder="Get your result here"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Content;
