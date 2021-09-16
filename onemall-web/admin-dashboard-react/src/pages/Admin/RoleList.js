/* eslint-disable */

import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Card, Form, Input, Spin, Button, Modal, message, Table, Divider, Tree } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './RoleList.less';

const FormItem = Form.Item;
const { TreeNode } = Tree;
const types = ['未知', '系统角色', '自定义角色'];

// 添加 form 表单
const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible, modalType, initValues } = props;

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleAdd({
        fields: fieldsValue,
        modalType,
        initValues,
      });
    });
  };

  const title = modalType === 'add' ? '添加一个 Role' : '更新一个 Role';
  const okText = modalType === 'add' ? '添加' : '更新';
  return (
    <Modal
      destroyOnClose
      title={title}
      visible={modalVisible}
      onOk={okHandle}
      okText={okText}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="角色名">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入角色名！', min: 2 }],
          initialValue: initValues.name,
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="角色编码">
        {form.getFieldDecorator('code', {
          rules: [{ required: false }],
          initialValue: initValues.code,
        })(<Input placeholder="请输入" />)}
      </FormItem>
    </Modal>
  );
});

// 角色分配
const AssignModal = Form.create()(props => {
  const {
    modalVisible,
    form,
    handleOk,
    handleModalVisible,
    treeData,
    checkedKeys,
    loading,
    handleCheckBoxClick,
  } = props;

  const renderTreeNodes = data => {
    return data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.title} key={item.key} dataRef={item} />;
    });
  };

  const renderModalContent = treeData => {
    const RenderTreeNodes = renderTreeNodes(treeData);
    if (RenderTreeNodes) {
      return (
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="角色名">
          {form.getFieldDecorator('name', {})(
            <Tree
              defaultExpandAll={true}
              checkable={true}
              multiple={true}
              checkedKeys={checkedKeys}
              onCheck={handleCheckBoxClick}
            >
              {renderTreeNodes(treeData)}
            </Tree>
          )}
        </FormItem>
      );
    } else {
      return null;
    }
  };

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleOk({
        fields: fieldsValue,
      });
    });
  };

  return (
    <Modal
      destroyOnClose
      title="更新权限"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <Spin spinning={loading}>{renderModalContent(treeData)}</Spin>
    </Modal>
  );
});

// roleList
@connect(({ roleList, loading }) => ({
  roleList,
  list: roleList.list,
  data: roleList,
  loading: loading.models.resourceList,
}))
@Form.create()
class RoleList extends PureComponent {
  state = {
    modalVisible: false,
    modalType: 'add', //add update
    initValues: {},
    roleAssignVisible: false,
    roleAssignRecord: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'roleList/query',
      payload: {
        name: '',
        pageNo: 1,
        pageSize: 10,
      },
    });
  }

  handleModalVisible = (flag, modalType, initValues) => {
    this.setState({
      modalVisible: !!flag,
      initValues: initValues || {},
      modalType: modalType || 'add',
    });
  };

  handleAssignModalVisible = (flag, record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'roleList/queryRoleAssign',
      payload: {
        roleId: record.id,
      },
    });
    this.setState({
      roleAssignVisible: !!flag,
      roleAssignRecord: record,
    });
  };

  handleAssignModalVisibleClose(flag) {
    this.setState({
      roleAssignVisible: !!flag,
    });
  }

  handleAssignCheckBoxClick = checkedKeys => {
    const { dispatch } = this.props;
    const newCheckedKeys = checkedKeys.map(item => {
      return parseInt(item);
    });
    dispatch({
      type: 'roleList/changeCheckedKeys',
      payload: newCheckedKeys,
    });
  };

  handleAssignOK = () => {
    const { dispatch, data } = this.props;
    const { roleAssignRecord } = this.state;
    dispatch({
      type: 'roleList/roleAssignResource',
      payload: {
        roleId: roleAssignRecord.id,
        resourceIds: data.checkedKeys,
        roleTreeData: data.roleTreeData,
      },
    });
    this.handleAssignModalVisibleClose(false);
  };

  handleAdd = ({ fields, modalType, initValues }) => {
    const { dispatch, data } = this.props;
    const queryParams = {
      pageNo: data.pageNo,
      pageSize: data.pageSize,
    };
    if (modalType === 'add') {
      dispatch({
        type: 'roleList/add',
        payload: {
          body: {
            ...fields,
          },
          queryParams,
          callback: () => {
            message.success('添加成功');
            this.handleModalVisible();
          },
        },
      });
    } else {
      dispatch({
        type: 'roleList/update',
        payload: {
          body: {
            ...initValues,
            ...fields,
          },
          queryParams,
          callback: () => {
            message.success('更新成功');
            this.handleModalVisible();
          },
        },
      });
    }
  };

  handleDelete(row) {
    const { dispatch, data } = this.props;
    const queryParams = {
      pageNo: data.pageNo,
      pageSize: data.pageSize,
    };
    Modal.confirm({
      title: `确认删除?`,
      content: `${row.name}`,
      onOk() {
        dispatch({
          type: 'roleList/delete',
          payload: {
            body: {
              id: row.id,
            },
            queryParams,
          },
        });
      },
      onCancel() {},
    });
  }

  render() {
    const { list, data } = this.props;
    const { pageNo, pageSize, count, roleTreeData, checkedKeys, assignModalLoading } = data;
    const { modalVisible, modalType, initValues, roleAssignVisible } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      modalType,
      initValues,
    };

    const columns = [
      // {
      //   title: 'id',
      //   dataIndex: 'id',
      //   render: text => <strong>{text}</strong>,
      // },
      {
        title: '名称',
        dataIndex: 'name',
      },
      {
        title: '编码',
        dataIndex: 'code',
      },
      {
        title: '类型',
        dataIndex: 'type',
        render(val) {
          return <span>{types[val]}</span>;
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        // sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD')}</span>,
      },
      {
        title: '操作',
        width: 200,
        render: (text, record) => (
          <Fragment>
            {record.type === 2 ? (
              <span>
                <a onClick={() => this.handleModalVisible(true, 'update', record)}>更新</a>
              </span>
            ) : null}
            <Divider type="vertical" />
            <a onClick={() => this.handleAssignModalVisible(true, record)}>分配权限</a>
            <Divider type="vertical" />
            {record.type === 2 ? (
              <span>
                <a className={styles.tableDelete} onClick={() => this.handleDelete(record)}>
                  删除
                </a>
              </span>
            ) : null}
          </Fragment>
        ),
      },
    ];

    const paginationProps = {
      current: pageNo,
      pageSize: pageSize,
      total: count,
    };

    return (
      <PageHeaderWrapper title="查询表格">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button
                icon="plus"
                type="primary"
                onClick={() => this.handleModalVisible(true, 'add', {})}
              >
                新建角色
              </Button>
            </div>
          </div>
          <Table columns={columns} dataSource={list} rowKey="id" />
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
        <AssignModal
          loading={assignModalLoading}
          treeData={roleTreeData}
          checkedKeys={checkedKeys}
          handleOk={this.handleAssignOK}
          modalVisible={roleAssignVisible}
          handleCheckBoxClick={this.handleAssignCheckBoxClick}
          handleModalVisible={() => this.handleAssignModalVisibleClose(false)}
        />
      </PageHeaderWrapper>
    );
  }
}

export default RoleList;
