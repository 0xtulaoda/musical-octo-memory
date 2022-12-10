import { tryCatch, tryCatchTwitter } from '@/services/ant-design-pro/base';
import {
  addTwitterOwner,
  findTwitterNewFollowerList,
  searchByUserName,
} from '@/services/TwitterScan';
import type { TwitterUser } from '@/services/TwitterScan/type';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Descriptions, Drawer, Empty, Form, message } from 'antd';
import dayjs from 'dayjs';

import React, { useRef, useState } from 'react';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: TwitterUser) => {
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

const FollowerList: React.FC = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<TwitterUser>();
  const [form] = Form.useForm();

  const columns: ProColumns<TwitterUser>[] = [
    {
      title: '头像',
      dataIndex: 'profile_image_url',
      hideInForm: true,
      hideInSearch: true,
      width: 80,
      render: (text: any) => <img src={text} alt="" />,
    },
    {
      title: '昵称',
      dataIndex: 'name',
      valueType: 'text',
      hideInSearch: true,
      render: (text: any, record: TwitterUser) => (
        <a href={`https://twitter.com/${record.username}`} target="_blank" rel="noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: '推特ID',
      dataIndex: 'username',
      hideInForm: true,
    },
    {
      title: 'description',
      dataIndex: 'description',
      valueType: 'text',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '同步时间',
      dataIndex: 'syncDate',
      valueType: 'text',
      hideInSearch: true,
      render: (text: any) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      valueType: 'text',
      hideInSearch: true,
      render: (text: any) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '粉丝数',
      dataIndex: 'public_metrics',
      valueType: 'text',
      hideInSearch: true,
      render: (text: any) => text.followers_count,
    },
    {
      title: '关注人数',
      dataIndex: 'public_metrics',
      valueType: 'text',
      hideInSearch: true,
      render: (text: any) => text.following_count,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      hideInForm: true,
      fixed: 'left',
      width: 120,
      render: (_, record) => [
        <a
          key="config"
          onClick={async () => {
            const [result1, error1] = await tryCatchTwitter(searchByUserName, {
              username: record.username,
            } as any);
            if (!error1) {
              setCurrentRow(result1);
            }
            setCurrentRow(record);
            handleModalVisible(true);
          }}
        >
          加入监控
        </a>,
        <a
          key="config"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          详情
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<TwitterUser, API.PageParams>
        // headerTitle={intl.formatMessage({
        //   id: 'pages.searchTable.title',
        //   defaultMessage: 'Enquiry form',
        // })}
        actionRef={actionRef}
        rowKey="id_str"
        options={{
          density: false,
          fullScreen: true,
          setting: false,
        }}
        scroll={{
          x: 1600,
        }}
        // toolBarRender={() => [
        //   <Button
        //     type="primary"
        //     key="primary"
        //     onClick={() => {
        //       handleModalVisible(true);
        //     }}
        //   >
        //     <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
        //   </Button>,
        // ]}
        // request={async (params: any) => {
        //   if (!followerOwnerId) {
        //     message.error('参数有误');
        //   }

        //   const res = await findTwitterNewFollowerList({
        //     page: params.current,
        //     pageSize: params.pageSize,
        //     followerOwnerId,
        //   });

        //   return {
        //     data: res.result.list,
        //     success: res.code === 0,
        //     total: res.result.total,
        //   };
        // }}
        search={{ span: 6 }}
        request={async (params: any) => {
          const [result, error] = await tryCatch(findTwitterNewFollowerList, {
            page: params.current,
            pageSize: params.pageSize,
            ...params,
          });
          if (!error) {
            return {
              data: result.list,
              success: 200,
              total: result.total,
            };
          }
        }}
        pagination={{
          pageSize: 300,
        }}
        columns={columns}
        // rowSelection={{
        //   onChange: (_, selectedRows) => {
        //     setSelectedRows(selectedRows);
        //   },
        // }}
      />
      <ModalForm
        title="加入监控"
        width="500px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        form={form}
        onFinish={async (value: any) => {
          const params = {
            ...currentRow,
            remark: value.remark,
          };
          const success = await handleAdd(params as TwitterUser);
          if (success) {
            handleModalVisible(false);
            form.resetFields();
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <Form.Item
          required
          rules={[
            {
              required: true,
              message: '请输入推特名称',
            },
          ]}
        >
          {currentRow?.id && (
            <Descriptions column={2} size="middle">
              <Descriptions.Item>
                <img src={currentRow.profile_image_url} />
              </Descriptions.Item>
              <Descriptions.Item label="ID">{currentRow.username}</Descriptions.Item>
              <Descriptions.Item label="昵称">{currentRow.name}</Descriptions.Item>
              <Descriptions.Item label="描述">{currentRow.description}</Descriptions.Item>
              <Descriptions.Item label="关注数">
                {currentRow.public_metrics.following_count}
              </Descriptions.Item>
              <Descriptions.Item label="粉丝">
                {currentRow.public_metrics.followers_count}
              </Descriptions.Item>
              <Descriptions.Item label="发文数">
                {currentRow.public_metrics.tweet_count}
              </Descriptions.Item>
              <Descriptions.Item label="注册日期">
                {dayjs(currentRow.created_at).format('YYYY-MM-DD')}
              </Descriptions.Item>
              <Descriptions.Item
                label="备注"
                labelStyle={{
                  height: '28px',
                  lineHeight: '28px',
                }}
                contentStyle={{
                  width: '200px',
                }}
              >
                <ProFormTextArea name="remark" placeholder="请输入备注" width={400} />
              </Descriptions.Item>
            </Descriptions>
          )}
          {!currentRow?.id && <Empty />}
        </Form.Item>
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
          <ProDescriptions<TwitterUser>
            column={1}
            size="middle"
            style={{
              width: '600px',
            }}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns.slice(0, -1) as ProDescriptionsItemProps<TwitterUser>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default FollowerList;
