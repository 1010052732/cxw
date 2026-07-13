import {
  Alert,
  Checkbox,
  Descriptions,
  Form,
  Input,
  List,
  Modal,
  Radio,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  ExportOutlined,
  FolderAddOutlined,
  HeartFilled,
  StarOutlined,
  TagOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { isFavoritedBy } from '../opportunityStore'
import { formatGeoLocation } from '../utils'

const { Text, Paragraph } = Typography

const EXPORT_FIELD_OPTIONS = [
  { value: 'id', label: '商机ID' },
  { value: 'name', label: '商机名称' },
  { value: 'source', label: '商机来源（洲-国家-城市）' },
  { value: 'geoMacro', label: '洲/区域' },
  { value: 'geoCountry', label: '国家' },
  { value: 'geoCity', label: '城市' },
  { value: 'country', label: '目标市场' },
  { value: 'product', label: '关联产品' },
  { value: 'score', label: '综合评分' },
  { value: 'group', label: '分组' },
  { value: 'tags', label: '标签' },
  { value: 'assignee', label: '跟进人' },
  { value: 'owner', label: '负责人' },
  { value: 'riskLevel', label: '风险等级' },
  { value: 'revenueRange', label: '收益区间' },
  { value: 'status', label: '状态' },
]

function TargetPreview({ targets }) {
  if (!targets.length) return null
  return (
    <div className="opportunity-action-preview">
      <Text type="secondary">已选 {targets.length} 条商机</Text>
      <List
        size="small"
        dataSource={targets.slice(0, 5)}
        renderItem={(item) => (
          <List.Item style={{ padding: '4px 0' }}>
            <Space>
              <Tag color="#B32620">{item.score}</Tag>
              <Text ellipsis style={{ maxWidth: 280 }}>{item.name}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{formatGeoLocation(item)}</Text>
            </Space>
          </List.Item>
        )}
      />
      {targets.length > 5 && <Text type="secondary" style={{ fontSize: 12 }}>… 另有 {targets.length - 5} 条</Text>}
    </div>
  )
}

export default function OpportunityActionModals({
  action,
  onClose,
  targets,
  currentUser,
  users,
  groupOptions,
  sortedCount,
  onMark,
  onGroup,
  onAssign,
  onFavorite,
  onExport,
}) {
  const [markForm] = Form.useForm()
  const [groupForm] = Form.useForm()
  const [assignForm] = Form.useForm()
  const [favoriteForm] = Form.useForm()
  const [exportForm] = Form.useForm()

  const type = action?.type
  const isSingle = targets.length === 1
  const single = targets[0]

  const closeAndReset = () => {
    markForm.resetFields()
    groupForm.resetFields()
    assignForm.resetFields()
    favoriteForm.resetFields()
    exportForm.resetFields()
    onClose()
  }

  const afterOpen = (form, extra = {}) => {
    if (type === 'mark' && single) {
      form.setFieldsValue({ presetTags: single.tags || [], removeTags: [] })
    }
    if (type === 'group' && single) {
      form.setFieldsValue({ group: single.group })
    }
    if (type === 'assign' && single) {
      form.setFieldsValue({
        userId: single.assignedUserId || currentUser.id,
        group: single.group,
        setOwner: false,
      })
    }
    if (type === 'favorite') {
      const allFav = targets.every((t) => isFavoritedBy(t, currentUser.id))
      form.setFieldsValue({ action: allFav ? 'unfavorite' : 'favorite', ...extra })
    }
    if (type === 'export') {
      form.setFieldsValue({
        scope: action.ids?.length ? 'selected' : 'filtered',
        fields: EXPORT_FIELD_OPTIONS.map((f) => f.value),
        filename: '商机列表',
        ...extra,
      })
    }
  }

  return (
    <>
      <Modal
        title={<Space><TagOutlined /> {isSingle ? '标记商机' : `批量标记（${targets.length} 条）`}</Space>}
        open={type === 'mark'}
        onCancel={closeAndReset}
        onOk={() => markForm.submit()}
        destroyOnClose
        afterOpenChange={(open) => open && afterOpen(markForm)}
        width={520}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="标记后可在「我的商机」与列表标签列查看，并支持送评估排序"
        />
        <TargetPreview targets={targets} />
        <Form
          form={markForm}
          layout="vertical"
          onFinish={(values) => { onMark(values, targets); closeAndReset() }}
        >
          <Form.Item label="添加标签" name="presetTags">
            <Checkbox.Group options={[...new Set(['高潜力', '政策利好', '低风险', '重点跟进', '需进一步调研', '已联系', '暂缓'])]} />
          </Form.Item>
          <Form.Item label="自定义标签" name="customTag"><Input maxLength={20} placeholder="输入后回车添加" /></Form.Item>
          {isSingle && single?.tags?.length > 0 && (
            <Form.Item label="移除已有标签" name="removeTags">
              <Checkbox.Group options={single.tags.map((t) => ({ label: t, value: t }))} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title={<Space><FolderAddOutlined /> {isSingle ? '商机分组' : `批量分组（${targets.length} 条）`}</Space>}
        open={type === 'group'}
        onCancel={closeAndReset}
        onOk={() => groupForm.submit()}
        destroyOnClose
        afterOpenChange={(open) => open && afterOpen(groupForm)}
        width={480}
      >
        <TargetPreview targets={targets} />
        <Form
          form={groupForm}
          layout="vertical"
          onFinish={(values) => { onGroup(values, targets); closeAndReset() }}
        >
          <Form.Item
            label="选择分组"
            name="group"
            rules={[{
              validator: (_, value) => {
                const newGroup = groupForm.getFieldValue('newGroup')
                if (value || newGroup?.trim()) return Promise.resolve()
                return Promise.reject(new Error('请选择或新建分组'))
              },
            }]}
          >
            <Select placeholder="选择目标分组" options={groupOptions.map((g) => ({ label: g, value: g }))} />
          </Form.Item>
          <Form.Item label="或新建分组" name="newGroup">
            <Input maxLength={20} placeholder="新建分组名称（优先于上方选择）" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<Space><UserAddOutlined /> {isSingle ? '分配跟进人员' : `批量分配（${targets.length} 条）`}</Space>}
        open={type === 'assign'}
        onCancel={closeAndReset}
        onOk={() => assignForm.submit()}
        destroyOnClose
        afterOpenChange={(open) => open && afterOpen(assignForm)}
        width={520}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="分配后跟进人可在「我的商机 → 指派给我」中查看并跟进"
        />
        <TargetPreview targets={targets} />
        <Form
          form={assignForm}
          layout="vertical"
          initialValues={{ userId: currentUser.id, setOwner: false }}
          onFinish={(values) => { onAssign(values, targets); closeAndReset() }}
        >
          <Form.Item label="跟进人员" name="userId" rules={[{ required: true, message: '请选择跟进人员' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={users.map((u) => ({ value: u.id, label: `${u.name} · ${u.dept}` }))}
            />
          </Form.Item>
          <Form.Item label="同步调整分组" name="group">
            <Select allowClear placeholder="可选" options={groupOptions.map((g) => ({ label: g, value: g }))} />
          </Form.Item>
          <Form.Item name="setOwner" valuePropName="checked">
            <Checkbox>同时将跟进人设为商机负责人</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<Space><StarOutlined /> {isSingle ? '收藏商机' : `批量收藏（${targets.length} 条）`}</Space>}
        open={type === 'favorite'}
        onCancel={closeAndReset}
        onOk={() => favoriteForm.submit()}
        destroyOnClose
        afterOpenChange={(open) => open && afterOpen(favoriteForm)}
        width={480}
      >
        <TargetPreview targets={targets} />
        <Form
          form={favoriteForm}
          layout="vertical"
          initialValues={{ action: 'favorite' }}
          onFinish={(values) => { onFavorite(values, targets); closeAndReset() }}
        >
          <Form.Item label="操作" name="action">
            <Radio.Group>
              <Radio value="favorite"><HeartFilled style={{ color: '#B32620' }} /> 加入收藏夹</Radio>
              <Radio value="unfavorite">取消收藏</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="备注（可选）" name="note">
            <Input.TextArea rows={2} maxLength={100} placeholder="收藏备注，便于在「我的商机」中识别" />
          </Form.Item>
          <Paragraph type="secondary" style={{ fontSize: 12, margin: 0 }}>
            收藏为个人维度，可在「我的商机 → 收藏夹」统一管理
          </Paragraph>
        </Form>
      </Modal>

      <Modal
        title={<Space><ExportOutlined /> 导出商机</Space>}
        open={type === 'export'}
        onCancel={closeAndReset}
        onOk={() => exportForm.submit()}
        destroyOnClose
        afterOpenChange={(open) => open && afterOpen(exportForm)}
        width={560}
      >
        <Form
          form={exportForm}
          layout="vertical"
          initialValues={{
            scope: 'filtered',
            fields: EXPORT_FIELD_OPTIONS.map((f) => f.value),
            filename: '商机列表',
          }}
          onFinish={(values) => { onExport(values, targets); closeAndReset() }}
        >
          <Form.Item label="导出范围" name="scope">
            <Radio.Group>
              <Radio value="selected" disabled={!targets.length}>已选商机（{targets.length} 条）</Radio>
              <Radio value="filtered">当前筛选结果（{sortedCount} 条）</Radio>
              <Radio value="all">全部商机池</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="文件名称" name="filename" rules={[{ required: true }]}>
            <Input addonAfter=".csv" />
          </Form.Item>
          <Form.Item label="导出字段" name="fields" rules={[{ required: true, message: '请至少选择一个字段' }]}>
            <Checkbox.Group options={EXPORT_FIELD_OPTIONS} />
          </Form.Item>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="格式">CSV（UTF-8，Excel 可直接打开）</Descriptions.Item>
            <Descriptions.Item label="闭环建议">导出后可送评估排序或分配跟进人继续转化</Descriptions.Item>
          </Descriptions>
        </Form>
      </Modal>
    </>
  )
}
