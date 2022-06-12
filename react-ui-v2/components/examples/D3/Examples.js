import React from 'react';
import Pie from 'components/global/D3/Pie';
import Bar from 'components/global/D3/Bar';

class Examples extends React.Component {

    constructor(props) {
        super(props);
        this.containerStyle = {
            width: 1000,
            height: 1000,
            backgroundColor: '#eee'
        };
    }

    render() {
        return (
            <div style={this.containerStyle}>
                <Pie
                    data={[
                        { label: 'בדיקה 1', value: 4 },
                        { label: 'Number 2', value: 3 },
                        { label: 'Number 3', value: 2 },
                        { label: 'Number 4', value: 3 },
                        { label: 'Number 5', value: 5 },
                        { label: 'Number 6', value: 6 },
                        { label: 'Number 7', value: 6 },
                        { label: 'Number 8', value: 5 }
                    ]}
                    width='250'
                    height='200'
                    donut={true}
                />
                <Pie
                    data={[
                        { label: 'בדיקה 1', value: 4 },
                        { label: 'Number 2', value: 3 },
                        { label: 'Number 3', value: 2 },
                        { label: 'Number 4', value: 3 },
                        { label: 'Number 5', value: 5 },
                        { label: 'Number 6', value: 6 },
                        { label: 'Number 7', value: 6 },
                        { label: 'Number 8', value: 5 }
                    ]}
                    style={{ clear: 'both' }}
                />

                <Bar
                    data={[
                        { label: 'בדיקה 1', value: '853' },
                        { label: 'ssdfgB', value: '292' },
                        { label: 'sCds1 ref', value: '782' },
                        { label: 'בדיקה 11', value: '153' },
                        { label: 'some text', value: '392' },
                        { label: '1 22 333', value: '582' },
                    ]}
                    style={{ clear: 'both' }}
                />
            </div>
        );
    }
}

export default Examples;