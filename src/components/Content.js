import React from 'react';
import makeRequest from '../services/makeRequest';
import '../assets/styles/Content.css';
import Amplify, { Storage, Predictions } from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';
import {Doughnut} from 'react-chartjs-2';

import awsconfig from '../aws-exports';

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

class Content extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            input: '',
            result: '',
            loading: false,
            chartData: null,
        };
    }

    handleChange(event) {
        this.setState({input: event.target.value});
    }

    analyzeText() {
        this.setState({loading: true});
        // makeRequest({
        //     url: 'http://www.mocky.io/v2/5e5aaed43000002b8a1f0bde',
        // }).then(result => {
        //     if (result && result.data) {
        //         this.setState({result: result.data});
        //     }
        // }).catch(error => {
        //     console.log('Error making request: ', error);
        // }).finally(() => {
        //     this.setState({loading: false});
        // });
        Predictions.interpret({
            text: {
              source: {
                text: this.state.input,
              },
              type: "ALL"
            }
          }).then(result => this.setState({
              result: JSON.stringify(result, null, 2),
              chartData: [
                  result.textInterpretation.sentiment.positive * 100,
                  result.textInterpretation.sentiment.negative * 100,
                  result.textInterpretation.sentiment.neutral * 100,
                  result.textInterpretation.sentiment.mixed * 100,
              ],
            }))
            .catch(err => this.setState({loading: false}))
            .finally(() => {
                    this.setState({loading: false});
                });
    }

    clearResult() {
        this.setState({result: ''});
    }

    render() {
        const dough = {
            labels: ['Positive', 'Negative', 'Neutral', 'Mixed'],
            datasets: [
              {
                label: 'semantics',
                backgroundColor: [
                    '#2FDE00',
                    '#B21F00',
                    '#C9DE00',
                    '#00A6B4',
                ],
                hoverBackgroundColor: [
                    '#175000',
                    '#501800',
                    '#4B5000',
                    '#003350',
                ],
                borderWidth: 0,
                data: this.state.chartData,
              }
            ]
          };
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
                        {
                            this.state.chartData ?
                            <div className="sentiment-chart">
                                <Doughnut
                                    data={dough}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        title: {
                                            display: true,
                                            text: 'Semantic Analysis',
                                            fontSize: 14,
                                            position: 'left',
                                        },
                                        legend: {
                                            display: true,
                                            position: 'right',
                                        },
                                        cutoutPercentage: 75,
                                        // circumference: Math.PI,
                                        // rotation: Math.PI,
                                    }}
                                    width={150}
                                    height={150}
                                ></Doughnut>
                            </div> : null
                        }
                        
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
