import {
  addTwitterOwner,
  findTwitterMonitorListByPage,
  removeTwitterOwner,
  searchByUserName,
  updateTwitterOwner,
} from '@/services/TwitterScan';
import type { TwitterUser } from '@/services/TwitterScan/type';
import { PlusOutlined } from '@ant-design/icons';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Descriptions, Drawer, Empty, Form, Input, message, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import { FormattedMessage, Link } from 'umi';
import { tryCatch, tryCatchTwitter } from '../../../../services/ant-design-pro/base';

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

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: TwitterUser) => {
  const hide = message.loading('更新中');
  try {
    await updateTwitterOwner({ ...fields });
    hide();
    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: TwitterUser[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeTwitterOwner({
      _id: selectedRows.map((row) => row._id),
    });
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    return false;
  }
};

const TwitterScan: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [currentRow, setCurrentRow] = useState<TwitterUser>();

  const handleSearch = async (newValue: string) => {
    form.validateFields().then(async () => {
      if (newValue) {
        setIsLoading(true);
        const [result1, error1] = await tryCatchTwitter(searchByUserName, {
          username: newValue,
        } as any);
        setIsLoading(false);
        if (!error1) {
          setCurrentRow(result1);
        }
      } else {
        setCurrentRow({} as any);
      }
    });
  };

  const columns: ProColumns<TwitterUser>[] = [
    {
      title: '头像',
      dataIndex: 'profile_image_url',
      hideInForm: true,
      width: 80,
      hideInSearch: true,
      render: (text: any) => <img src={text} alt="" />,
    },
    {
      title: '昵称',
      dataIndex: 'name',
      valueType: 'text',
      render: (text: any, record: API.FollowerOwner) => (
        <a href={`https://twitter.com/${record.username}`} target="_blank" rel="noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: '推特ID',
      dataIndex: 'username',
      valueType: 'text',
      width: 140,
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'text',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      valueType: 'text',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      hideInForm: true,
      hideInSearch: true,
      render: (text: any) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      hideInForm: true,
      hideInSearch: true,
      width: '100px',
      render: (text: any) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'id',
      dataIndex: 'id',
      hideInForm: true,
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      hideInForm: true,
      fixed: 'right',
      render: (_, record) => [
        <Link to={`/monitor/twitterScan/${record.id}`}>
          <a
            key="config"
            onClick={() => {
              setCurrentRow(record);
              setShowDetail(true);
            }}
          >
            关注列表
          </a>
        </Link>,
        <a
          key="config"
          onClick={async () => {
            await handleSearch(record.username);
            setShowDetail(true);
          }}
        >
          详情
        </a>,
        // <a
        //   key="config"
        //   onClick={() => {
        //     setCurrentRow(record);
        //     handleModalVisible(true);
        //     form.setFieldsValue(record);
        //   }}
        // >
        //   编辑
        // </a>,
        <Popconfirm
          title="确认删除？"
          onConfirm={async () => {
            await handleRemove([record]);
            actionRef.current?.reloadAndRest?.();
          }}
          onCancel={() => {}}
          okText="确认"
          cancelText="取消"
        >
          <a key="subscribeAlert">删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<TwitterUser, API.PageParams>
        actionRef={actionRef}
        rowKey="id"
        options={{
          density: false,
          fullScreen: true,
          setting: false,
        }}
        pagination={{
          pageSize: 100,
        }}
        search={{ span: 6 }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalVisible(true);
              form.resetFields();
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        request={async (params: any) => {
          const [result, error] = await tryCatch(findTwitterMonitorListByPage, {
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
        columns={columns}
      />
      <ModalForm
        title={currentRow && currentRow._id ? '编辑推特信息' : '添加推特信息'}
        width="500px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        form={form}
        onFinish={async (value: any) => {
          let success;
          const params = {
            ...currentRow,
            remark: value.remark,
          };
          if (currentRow && currentRow._id) {
            success = await handleUpdate(params as TwitterUser);
          } else {
            success = await handleAdd(params as TwitterUser);
          }
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
          <Input.Search
            placeholder="请输入推特名称"
            loading={isLoading}
            style={{
              width: '100%',
              marginBottom: '10px',
            }}
            enterButton="搜索"
            onSearch={handleSearch}
          />
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
            column={2}
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

export default TwitterScan;
