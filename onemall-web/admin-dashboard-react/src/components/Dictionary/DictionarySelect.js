import React, { PureComponent } from 'react';
import { Select } from 'antd';
import DictionaryContext from './DictionaryContext';

export default class DictionarySelect extends PureComponent {
  renderSelect(children) {
    // const { initialValue } = this.props['data-__meta'];
    const propsX = {
      ...this.props,
    };
    if (propsX.value !== undefined || propsX.value !== null) {
      propsX.value = `${propsX.value}`;
    }
    if (propsX.value === 'undefined' || propsX.value === 'null') {
      delete propsX.value;
    }
    return <Select {...propsX}>{children}</Select>;
  }

  render() {
    const { dicKey } = this.props;
    return (
      <DictionaryContext.Consumer>
        {context => {
          const dicValues = context[dicKey];
          let nodes = [];
          if (dicValues) {
            nodes = Object.keys(dicValues).map(value => {
              const text = dicValues[value];
              return (
                <Select.Option key={value} value={value}>
                  {text}
                </Select.Option>
              );
            });
          }
          return this.renderSelect(nodes);
        }}
      </DictionaryContext.Consumer>
    );
  }
}
