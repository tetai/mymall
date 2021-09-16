import React, { PureComponent } from 'react';
import { Card, Divider, Table, Modal, Button } from 'antd';
import { connect } from 'dva';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import DictionaryText from '../../components/Dictionary/DictionaryText';
import dictionary from '../../utils/dictionary';
import styles from '../List/TableList.less';
import TemplateListSearch from './TemplateListSearch';
import TemplateListModal from './TemplateListModal';

@connect(({ smsSignList, smsTemplateList, loading }) => ({
  smsSignList,
  smsTemplateList,
  loading: loading.models.smsTemplateList,
}))
class TemplateList extends PureComponent {
  state = {
    visible: false,
    title: '添加模板', // 添加签名 修改签名
    type: 'add', // add update
    id: '',
    template: {},
  };

  componentDidMount() {
    // init page 参数
    this.current = 1;
    this.total = 0;
    this.size = 10;
    this.searchParams = {};

    // 查询 page
    this.queryPage();

    // 查询 sign 用于 signList
    this.querySignList();
  }

  querySignList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'smsSignList/page',
      payload: {
        pageNo: 1,
        total: 0,
        pageSize: 100,
        // ...searchParams,
      },
    });
  };

  queryPage = () => {
    const { dispatch } = this.props;
    const { current, total, size, searchParams } = this;

    dispatch({
      type: 'smsTemplateList/page',
      payload: {
        pageNo: current,
        total,
        pageSize: size,
        ...searchParams,
      },
    });
  };

  handleSearch = searchParams => {
    this.searchParams = searchParams;
    this.queryPage();
  };

  handleAddShow = () => {
    this.setState({
      visible: true,
      type: 'add',
      title: '添加模板',
      template: {},
    });
  };

  handleUpdateShow = template => {
    const { id } = template;
    this.setState({
      visible: true,
      type: 'update',
      title: '更新模板',
      id,
      template,
    });
  };

  handleDeleted = ({ id, template }) => {
    const { dispatch } = this.props;
    Modal.confirm({
      title: `提示消息`,
      content: `确认删除 ${template} 签名吗`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        dispatch({
          type: 'smsTemplateList/deleted',
          payload: {
            params: {
              id,
            },
            callback: () => {
              this.queryPage();
            },
          },
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  handleOk = fields => {
    const { dispatch } = this.props;
    const { type, id } = this.state;

    if (type === 'add') {
      dispatch({
        type: 'smsTemplateList/add',
        payload: {
          params: {
            ...fields,
          },
          callback: () => {
            this.handleCancel();
            this.queryPage();
          },
        },
      });
    } else if (type === 'update') {
      dispatch({
        type: 'smsTemplateList/update',
        payload: {
          params: {
            id,
            ...fields,
          },
          callback: () => {
            this.handleCancel();
            this.queryPage();
          },
        },
      });
    }
  };

  handleTableChange = pagination => {
    const { pageSize, current } = pagination;
    this.size = pageSize;
    this.current = current;
    this.queryPage();
  };

  render() {
    // props
    const { loading, smsTemplateList, smsSignList } = this.props;
    const { list, total, index, size } = smsTemplateList;
    const { visible, title, type, template } = this.state;

    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '签名',
        dataIndex: 'sign',
        key: 'sign',
        // eslint-disable-next-line no-shadow
        render({ sign }) {
          return <div>{sign}</div>;
        },
      },
      {
        title: '模板',
        dataIndex: 'template',
        key: 'template',
      },
      {
        title: '短信平台',
        dataIndex: 'platform',
        key: 'platform',
        render(platform) {
          return (
            <div>
              <DictionaryText dicKey={dictionary.SMS_PLATFORM} dicValue={platform} />
            </div>
          );
        },
      },
      {
        title: '审核状态',
        dataIndex: 'applyStatus',
        key: 'applyStatus',
        render(applyStatus) {
          return (
            <div>
              <DictionaryText dicKey={dictionary.SMS_APPLY_STATUS} dicValue={applyStatus} />
            </div>
          );
        },
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        width: 200,
        render(updateTime) {
          return <div>{updateTime}</div>;
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 200,
        render(createTime) {
          return <div>{createTime}</div>;
        },
      },
      {
        title: '操作',
        render: row => {
          return (
            <div>
              <a onClick={this.handleUpdateShow.bind(this, row)}>修改</a>
              <Divider type="vertical" />
              <a onClick={this.handleDeleted.bind(this, row)}>删除</a>
            </div>
          );
        },
      },
    ];

    const pagination = {
      total,
      index,
      pageSize: size,
    };

    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.tableListForm}>
            <TemplateListSearch signList={smsSignList.list} handleSearch={this.handleSearch} />
          </div>
          <br />
          <div>
            <Button icon="plus" onClick={this.handleAddShow}>
              添加模板
            </Button>
          </div>
          <br />

          <Table
            loading={loading}
            rowKey="id"
            dataSource={list}
            columns={columns}
            pagination={pagination}
            onChange={this.handleTableChange}
          />
        </Card>

        <TemplateListModal
          initData={template}
          signList={smsSignList.list}
          title={title}
          visible={visible}
          type={type}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        />
      </PageHeaderWrapper>
    );
  }
}

export default TemplateList;
