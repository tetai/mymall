/* eslint-disable */

import React, {PureComponent, Fragment, Component} from 'react';
// import crypto from 'crypto';
// import fs from 'fs';
import { connect } from 'dva';
import moment from 'moment';
import {Card, Form, Input, Radio, Button, Modal, Select, Upload, Icon, Spin, TreeSelect} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

// import * as qiniu from 'qiniu-js'
// import uuid from 'js-uuid';

import styles from './ProductSpuAddOrUpdate.less';
import ProductAttrSelectFormItem from "../../components/Product/ProductAttrSelectFormItem";
import ProductSkuAddOrUpdateTable from "../../components/Product/ProductSkuAddOrUpdateTable";
// import {fileGetQiniuToken} from "../../services/admin";
import PicturesWall from "../../components/Image/PicturesWall";
import {fileGetQiniuToken} from "../../services/admin";
import uuid from "js-uuid";
import * as qiniu from "qiniu-js";
import HtmlEditor from "../../components/Editor/HtmlEditor";

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

// roleList
@connect(({ productAttrList, productSpuAddOrUpdate, productCategoryList }) => ({
  // list: productSpuList.list.spus,
  // loading: loading.models.productSpuList,
  productAttrList,
  productSpuAddOrUpdate,
  allAttrTree: productAttrList.tree,
  loading: productSpuAddOrUpdate.loading,
  spu: productSpuAddOrUpdate.spu,
  attrTree: productSpuAddOrUpdate.attrTree,
  skus: productSpuAddOrUpdate.skus,
  categoryTree: productCategoryList.list,
}))

@Form.create()
class ProductSpuAddOrUpdate extends Component {
  state = {
    // modalVisible: false,
    modalType: 'add', //add update
    // initValues: {},
    htmlEditor: undefined,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const that = this;
    // 重置表单
    dispatch({
      type: 'productSpuAddOrUpdate/clear',
    });
    // 判断是否是更新
    const params = new URLSearchParams(this.props.location.search);
    if (params.get("id")) {
      let id = params.get("id");
      this.setState({
        modalType: 'update',
        id: id,
      })
      dispatch({
        type: 'productSpuAddOrUpdate/info',
        payload: parseInt(id),
        callback: function (data) {
          that.refs.picturesWall.setUrls(data.picUrls); // TODO 后续找找，有没更合适的做法
          // debugger;
          that.state.htmlEditor.setHtml(data.description);
        }
      })
    }
    // 获得规格列表
    dispatch({
      type: 'productAttrList/tree',
      payload: {
        name: '',
        pageNo: 0,
        pageSize: 10,
      },
    });
    // 获得商品分类
    dispatch({
      type: 'productCategoryList/tree',
      payload: {},
    });
  }

  handleAddAttr = e => {
    // alert('你猜');
    const { dispatch } = this.props;
    dispatch({
      type: 'productSpuAddOrUpdate/addAttr',
      payload: {
      },
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { skus, dispatch } = this.props;
    const { modalType, id } = this.state;
    if (this.state.htmlEditor.isEmpty()) {
      alert('请设置商品描述！');
      return;
    }
    const description = this.state.htmlEditor.getHtml();
    // 获得图片
    let picUrls = this.refs.picturesWall.getUrls(); // TODO 芋艿，后续找找其他做法
    if (picUrls.length === 0) {
      alert('请必须上传一张图片！');
      return;
    }
    // 生成 skuStr 格式
    let skuStr = []; // 因为提交是字符串格式
    for (let i in skus) {
      let sku = skus[i];
      if (!sku.price || !sku.quantity) {
        continue;
      }
      let newAttr = {
        attrs: [],
        price: sku.price * 100,
        quantity: sku.quantity,
      }
      for (let j in sku.attrs) {
        newAttr.attrs.push(sku.attrs[j].id);
      }
      skuStr.push(newAttr);
    }
    if (skuStr.length === 0) {
      alert('请设置商品规格！');
      return;
    }

    // debugger;
    this.props.form.validateFields((err, values) => {
      // debugger;
      // 获得富文本编辑的描述
      if (!err) {
        if (modalType === 'add') {
          dispatch({
            type: 'productSpuAddOrUpdate/add',
            payload: {
              body: {
                ...values,
                picUrls: picUrls.join(','),
                skuStr: JSON.stringify(skuStr),
                description,
              }
            },
          });
        } else if (modalType === 'update') {
          dispatch({
            type: 'productSpuAddOrUpdate/update',
            payload: {
              body: {
                ...values,
                id,
                picUrls: picUrls.join(','),
                skuStr: JSON.stringify(skuStr),
                description,
              }
            },
          });
        }
      }
    });
    // console.log(fields);
  };

  render() {
    // debugger;
    const { form, skus, attrTree, allAttrTree, loading, spu, categoryTree, dispatch } = this.props;
    // const that = this;

    // 处理分类筛选
    const buildSelectTree = (list) => {
      return list.map(item => {
        let children = [];
        if (item.children) {
          children = buildSelectTree(item.children);
        }
        return {
          title: item.name,
          value: item.id,
          key: item.id,
          children,
          selectable: item.pid > 0
        };
      });
    };
    let categoryTreeSelect = buildSelectTree(categoryTree);

    // 添加规格
    // debugger;
    let attrTreeHTML = [];
    if (attrTree && attrTree.length > 0) {
      // 已选择的的规格集合
      let selectedAttrIds = new Set();
      for (let i in attrTree) {
        let attr = attrTree[i];
        selectedAttrIds.add(attr.id);
      }
      // 创建每个规格下拉框的 HTML
      for (let i in attrTree) {
        let attr = attrTree[i];
        let itemProps = {
          attr: attr,
          allAttrTree: allAttrTree,
          dispatch: dispatch,
          selectedAttrIds: selectedAttrIds,
          index: i // 位置。不然无法正确修改 Model 指定位置的数据
        };
        attrTreeHTML.push(<ProductAttrSelectFormItem {...itemProps}  />);
      }
    }

    // 规格明细
    let productSkuProps = {
      attrTree: attrTree,
      skus: skus,
      dispatch: dispatch,
    };
    // console.log(productSkuProps);
    // let htmlEditor = undefined;

    return (
      <PageHeaderWrapper title="">
        <Spin spinning={loading}>
          <Card bordered={false}>
            <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="商品名">
                {form.getFieldDecorator('name', {
                  rules: [{ required: true, message: '请输入商品名！', min: 2 }],
                  initialValue: spu.name,
                })(<Input placeholder="请输入" />)}
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="商品卖点">
                {form.getFieldDecorator('sellPoint', {
                  rules: [{ required: true, message: '请输入商品卖点！' }],
                  initialValue: spu.sellPoint,
                })(<Input placeholder="请输入" />)}
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="分类编号">
                {form.getFieldDecorator('cid', {
                  rules: [{ required: true, message: '请输入分类编号！' }],
                  initialValue: spu.cid,
                })(
                  <TreeSelect
                    showSearch
                    style={{ width: 300 }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={categoryTreeSelect}
                    placeholder="选择父分类"
                  />
                )}
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="商品主图"
                        extra="建议尺寸：800*800PX，单张大小不超过 2M，最多可上传 10 张">
                {/*{form.getFieldDecorator('picUrls', {*/}
                {/*  initialValue: '', // TODO 修改 // TODO 芋艿，做成上传组件*/}
                {/*})(<Input placeholder="请输入" />)}*/}
                <PicturesWall ref="picturesWall" maxLength={10} />
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="是否上架">
                {form.getFieldDecorator('visible', {
                  initialValue: spu.visible,
                })(
                  <RadioGroup>
                    <Radio value={true}>是</Radio>
                    <Radio value={false}>否</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="商品规格">
                <div>
                  {attrTreeHTML}
                  <Button onClick={this.handleAddAttr}>添加规格项目</Button>
                </div>
              </FormItem>
              {
                attrTree.length > 0 ? <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="规格明细">
                  {/*<Table defaultExpandAllRows={true} columns={columns} rowKey="id" />*/}
                  <ProductSkuAddOrUpdateTable {...productSkuProps} />
                </FormItem> : ''
              }
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="商品描述" required={false}>
                <HtmlEditor ref={(node) => this.state.htmlEditor = node} />
                <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }} onSubmit={this.handleSubmit}>保存</Button>
              </FormItem>
            </Form>
          </Card>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default ProductSpuAddOrUpdate;
