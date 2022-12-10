import { addTwitterOwner } from '@/services/TwitterScan';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import type { ActionType } from '@ant-design/pro-table';
import { Button, DatePicker, Drawer, Form, Input, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

import Iframe from 'react-iframe';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.TwitterOwner) => {
  const hide = message.loading('正在添加');
  try {
    await addTwitterOwner({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败，请重试');
    return false;
  }
};

const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [url, setUrl] = useState<string>(
    'https://dune.com/tulaoda/tulaoda-monitor-bsc?ADDRESS_td3b3e=0x1131c110ae59edeed3d6c8d7f668a30ba840dced&THRESHHOLD_ta5771=10&START_DATE_da91ae=2022-07-10+00%3A00%3A00&DECIMALS_ncd6b4=18',
  );
  const actionRef = useRef<ActionType>();
  const formRef = useRef();
  const [currentRow, setCurrentRow] = useState<API.TwitterOwner>();
  useEffect(() => {
    var date = new Date();
    document.cookie =
      'ave_token' +
      '=' +
      'a90e1219de866a8ef79f2800e6dbacbe1656948042287884638' +
      ';expires=' +
      date +
      ';domain=avedex.cc;path=/';
  }, []);
  const onFinish = (values: any) => {
    console.log('Success:', values);
    let START_DATE = '2022-07-01';
    let DECIMALS = 18;
    let THRESHHOLD = 10;
    if (values.START_DATE) {
      START_DATE = values.START_DATE.format('YYYY-MM-DD');
    }
    if (values.DECIMALS) {
      DECIMALS = values.DECIMALS;
    }
    if (values.THRESHHOLD) {
      THRESHHOLD = values.THRESHHOLD;
    }
    const url = `https://dune.com/tulaoda/tulaoda-monitor-bsc?ADDRESS_td3b3e=${values.ADDRESS}&THRESHHOLD_ta5771=${THRESHHOLD}&START_DATE_da91ae=${START_DATE}+00%3A00%3A00&DECIMALS_ncd6b4=${DECIMALS}`;
    setUrl(url);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div>
      <Form
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        layout="inline"
        size="small"
        style={{
          marginBottom: '20px',
        }}
      >
        <Form.Item label="合约" name="ADDRESS" rules={[{ required: true, message: '请输入合约' }]}>
          <Input defaultValue="0x1131c110ae59edeed3d6c8d7f668a30ba840dced" />
        </Form.Item>
        <Form.Item label="开始时间" name="START_DATE">
          <DatePicker showTime />
        </Form.Item>
        <Form.Item label="持仓数" name="THRESHHOLD">
          <Input defaultValue="10" />
        </Form.Item>
        <Form.Item label="精度" name="DECIMALS">
          <Input defaultValue="18" />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
        </Form.Item>
      </Form>
      <Iframe
        url={url}
        width="100%"
        height="1000px"
        id="myId"
        className="myClassname"
        display="initial"
        position="relative"
      />
      <ModalForm
        title={currentRow && currentRow.id ? '编辑推特信息' : '添加推特信息'}
        width="600px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        formRef={formRef}
        onFinish={async (value) => {
          let success;
          if (currentRow && currentRow.id) {
            value.id = currentRow.id;
            success = await handleUpdate(value as API.TwitterOwner);
          } else {
            success = await handleAdd(value as API.TwitterOwner);
          }
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
              setCurrentRow(undefined);
              formRef.current.resetFields();
            }
          }
        }}
      >
        <ProFormText
          name="name"
          label="推特ID"
          placeholder="请输入推特ID"
          rules={[
            {
              required: true,
              message: '请输入推特ID',
            },
          ]}
        />
        <ProFormText
          name="description"
          label="描述"
          placeholder="请输入描述"
          rules={[
            {
              required: true,
              message: '请输入描述',
            },
          ]}
        />
        <ProFormText
          name="remark"
          label="备注"
          placeholder="请输入备注"
          rules={[
            {
              required: true,
              message: '请输入备注',
            },
          ]}
        />
      </ModalForm>
      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.TwitterOwner>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns.slice(0, -1) as ProDescriptionsItemProps<API.TwitterOwner>[]}
          />
        )}
      </Drawer>
    </div>
  );
};

export default TableList;
