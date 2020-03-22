import React from 'react';
import makeRequest from '../services/makeRequest';
import '../assets/styles/Content.css';
import Amplify, { Predictions } from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';
import {Doughnut, Line} from 'react-chartjs-2';

import awsconfig from '../aws-exports';

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

class Content extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            input: '',
            loading: false,
            sentimentData: null,
            trendsData: null,
            relatedArticles: null,
            viralTrendsLeft: null,
            viralTrendsRight: null,
        };
    }

    handleChange(event) {
        this.setState({input: event.target.value});
    }

    clearInput() {
        this.setState({input: ''})
    }

    analyzeText() {
        this.setState({loading: true});
        Promise.allSettled([
            Predictions.interpret({
                text: {
                  source: {
                    text: this.state.input,
                  },
                  type: "ALL"
                }
              }),
            makeRequest({
                method: 'POST',
                url: 'https://yeswrite.herokuapp.com/trends',
                data: {text: this.state.input},
            }),
            makeRequest({
                method: 'POST',
                url: 'https://yeswrite.herokuapp.com/urls',
                data: {text: this.state.input},
            }),
        ])
            .then((responses) => {
                if (responses[0].status === 'fulfilled') {
                    const predictionsResult = responses[0].value;
                    this.setState({
                        sentimentData: [
                            (predictionsResult.textInterpretation.sentiment.positive * 100).toFixed(2),
                            (predictionsResult.textInterpretation.sentiment.negative * 100).toFixed(2),
                            (predictionsResult.textInterpretation.sentiment.neutral * 100).toFixed(2),
                            (predictionsResult.textInterpretation.sentiment.mixed * 100).toFixed(2),
                        ],
                    });
                }

                if (responses[1].status === 'fulfilled') {
                    const trendsData = {
                        top4: [],
                        line1: [],
                        line2: [],
                        line3: [],
                        line4: [],
                        time: [],
                    };
                    const trendsResult = responses[1].value;
                    if (trendsResult && trendsResult.data && trendsResult.data.default && trendsResult.data.default.timelineData) {
                        trendsResult.data.default.timelineData.forEach((item) => {
                            trendsData.time.push(item.formattedTime);
                            trendsData.line1.push(item.value[0]);
                            trendsData.line2.push(item.value[1]);
                            trendsData.line3.push(item.value[2]);
                            trendsData.line4.push(item.value[3]);
                        });
                        if (trendsResult.data && trendsResult.data.keywords) {
                            trendsData.top4 = trendsResult.data.keywords;
                        }
                        this.setState({trendsData});
                    }
                }

                if (responses[2].status === 'fulfilled') {
                    const relatedArticles = responses[2].value.data;
                    this.setState({relatedArticles});
                }

                const viralTrendsLeft = {
                    'Avg. number of characters in title': '8',
                    'Avg. Image count': '4',
                };
                const viralTrendsRight = {
                    'Avg. Read time': '6 min',
                    'Avg. external links': '7',
                };
                this.setState({viralTrendsLeft, viralTrendsRight});

                if (responses[0].status === 'rejected') {
                    console.log('Error: ', responses[0].value);
                }
                if (responses[1].status === 'rejected') {
                    console.log('Error: ', responses[1].value);
                }
                if (responses[2].status === 'rejected') {
                    console.log('Error: ', responses[2].value);
                }

                this.setState({loading: false});
            });
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
                    data: this.state.sentimentData,
                }
            ]
        };

        const trends = {
            labels: this.state.trendsData && this.state.trendsData.time,
            datasets: [
                {
                    label: this.state.trendsData && this.state.trendsData.top4 && this.state.trendsData.top4[0],
                    fill: false,
                    lineTension: 0.5,
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 2,
                    data: this.state.trendsData && this.state.trendsData.line1,
                },
                {
                    label: this.state.trendsData && this.state.trendsData.top4 && this.state.trendsData.top4[1],
                    fill: false,
                    lineTension: 0.5,
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    borderColor: 'rgba(55, 0, 55, 1)',
                    borderWidth: 1,
                    data: this.state.trendsData && this.state.trendsData.line2,
                },
                {
                    label: this.state.trendsData && this.state.trendsData.top4 && this.state.trendsData.top4[2],
                    fill: false,
                    lineTension: 0.5,
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    borderColor: 'rgba(125, 200, 0, 1)',
                    borderWidth: 2,
                    data: this.state.trendsData && this.state.trendsData.line3,
                },
                {
                    label: this.state.trendsData && this.state.trendsData.top4 && this.state.trendsData.top4[3],
                    fill: false,
                    lineTension: 0.5,
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    borderColor: 'rgba(0, 243, 0, 1)',
                    borderWidth: 1,
                    data: this.state.trendsData && this.state.trendsData.line4,
                }
            ],
        };

        const relatedList = this.state.relatedArticles && this.state.relatedArticles.map((article, index) => (
            <a href={article.Urls} className="list-url" target="_blank">
                <li key={index}>
                    {article.Title}
                </li>
            </a>
        ));

        const vtl = this.state.viralTrendsLeft && Object.keys(this.state.viralTrendsLeft).map((key) => 
            <p>{key}: {this.state.viralTrendsLeft[key]}</p>
        );

        const vtr = this.state.viralTrendsRight && Object.keys(this.state.viralTrendsRight).map((key) => 
            <p>{key}: {this.state.viralTrendsRight[key]}</p>
        );

        return (
            <div className="content">
                <div className="banner">
                    <h2>Make Content Writing Great Again!!</h2>
                    <p>We help you write better content by providing key insights on your written draft by comparing it with other similar viral articles on the same topic.
                        For demo enter your post/article in the box below and then press Analyse.
                    </p>
                </div>
                <div className="row">
                    <div className="col-5">
                        <div className="input-box-container">
                            <textarea
                                value={this.state.input}
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
                                disabled={this.state.loading || !this.state.input.length}
                            />
                            {
                                this.state.input.length ? 
                                <input	
                                    type="submit"	
                                    value="Clear Input"	
                                    onClick={this.clearInput.bind(this)} 	
                                /> : null
                            }
                        </div>
                    </div>

                    {
                        this.state.loading ? <div id="cover-spin"></div> : null
                    }
    
                    <div className="col-5">
                        {
                            this.state.sentimentData ?
                            <div className="sentiment-chart">
                                <Doughnut
                                    data={dough}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        title: {
                                            display: true,
                                            text: 'Semantic Analysis',
                                            fontSize: 20,
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

                        {
                            this.state.trendsData ?
                            <div className="trends-chart">
                                <Line
                                    data={trends}
                                    options={{
                                        title:{
                                            display: true,
                                            text: 'Google Trends',
                                            fontSize: 20,
                                            position: 'left',
                                        },
                                        legend:{
                                            display: true,
                                            position: 'bottom',
                                        }
                                    }}
                                ></Line>
                            </div> : null
                        }
                        
                        {
                            this.state.sentimentData || this.state.trendsData || this.state.relatedArticles ? null : 
                            <div className="input-box-container">
                                <textarea
                                    className="input-text"
                                    value={this.state.relatedArticles}
                                    placeholder="Get your result here"
                                    readOnly
                                />
                            </div>
                        }

                        {
                            vtl || vtr ? 
                            <div className="related-articles">
                                <h2>Viral Trends: </h2>
                                <div className="row">
                                    <div className="col-12">{vtl}</div>
                                    <div className="col-12">{vtr}</div>
                                </div>
                            </div> : null
                        }

                        {
                            this.state.relatedArticles && this.state.relatedArticles.length ?
                            <div className="related-articles">
                                <h2>See top related articles: </h2>
                                <ul className="related-list">
                                    {relatedList}
                                </ul>
                            </div>
                            : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Content;
