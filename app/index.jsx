import { // eslint-disable-line import/no-extraneous-dependencies,import/no-unresolved
    SmartChart,
    ChartTypes,
    StudyLegend,
    Comparison,
    Marker,
    Views,
    CrosshairToggle,
    Timeperiod,
    ChartSize,
    DrawTools,
    ChartSetting,
    Share,
} from '@binary-com/smartcharts'; // eslint-disable-line import/no-unresolved
import React from 'react';
import { CSSTransition } from 'react-transition-group';
import ReactDOM from 'react-dom';
import { configure } from 'mobx';
import './app.scss';
import './doorbell';
import { ConnectionManager, StreamManager } from './connection';

configure({ enforceActions: true });

const getLanguageStorage = function () {
    const default_language = 'en';
    try {
        const setting_string = CIQ.localStorage.getItem('smartchart-setting'),
            setting = JSON.parse(setting_string !== '' ? setting_string : '{}');

        return setting.language || default_language;
    } catch (e) {
        return default_language;
    }
};

const connectionManager = new ConnectionManager({
    appId: 12812,
    language: getLanguageStorage(),
    endpoint: 'wss://ws.binaryws.com/websockets/v3',
});

const streamManager = new StreamManager(connectionManager);

const renderControls = () => (
    <React.Fragment>
        {CIQ.isMobile ? '' : <CrosshairToggle />}
        <ChartTypes />
        <StudyLegend />
        <Comparison />
        <DrawTools />
        <Views />
        <Share />
        <Timeperiod />
        {CIQ.isMobile ? '' : <ChartSize />}
        <ChartSetting />
    </React.Fragment>
);

const requestAPI = connectionManager.send.bind(connectionManager);
const requestSubscribe = streamManager.subscribe.bind(streamManager);
const requestForget = streamManager.forget.bind(streamManager);
const shareOrigin = window.location.href.split('?')[0];

class App extends React.Component {
    state = {
        trigger: false,
    };

    componentWillMount() {
        setInterval(() => this.setState({ trigger: !this.state.trigger }), 3000);
    }

    render() {
        const { trigger } = this.state;

        return (
            <SmartChart
                onSymbolChange={symbol => console.log('Symbol has changed to:', symbol)}
                isMobile={CIQ.isMobile}
                chartControlsWidgets={renderControls}
                requestAPI={requestAPI}
                requestSubscribe={requestSubscribe}
                requestForget={requestForget}
                shareOrigin={shareOrigin}
            >
                <Marker
                    x={new Date(2018, 5, 20)}
                    yPositioner="none"
                    className="chart-line vertical trade-start-line"
                >
                    <div className="drag-line" />
                    <div className="trade-text">Trade Start</div>
                </Marker>
                <Marker
                    x={new Date(2018, 6, 20)}
                    yPositioner="none"
                    className="chart-line vertical trade-end-line"
                >
                    <div className="drag-line" />
                    <div className="trade-text">Trade End</div>
                    <div className="trade-end-flag">
                        <div className="circle" />
                        <div className="ic-flag" />
                    </div>
                </Marker>

                <CSSTransition
                    in={trigger}
                    timeout={100}
                    classNames="marker"
                    unmountOnExit
                >
                    <Marker
                        x={new Date(2018, 5, 25)}
                    >
                        <div className="ciq-spot" />
                    </Marker>
                </CSSTransition>
            </SmartChart>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root'),
);
