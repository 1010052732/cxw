import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  App,
  Button,
  Col,
  Descriptions,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { Column } from '@ant-design/charts'
import {
  CloudDownloadOutlined,
  FileTextOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import {
  BARRIER_COUNTRY_OPTIONS,
  MARKET_COUNTRIES,
  calcBarrierCost,
  getProductDetail,
  getTradeBarrierData,
} from '../../../../mock/analysis'

const { Text, Paragraph } = Typography

const BARRIER_TYPE_COLOR = {
  关税: 'error', TBT: 'warning', SPS: 'orange', 反倾销: 'red', 出口管制: 'purple', 配额: 'default',
}

export default function TradeBarrierTab({ productName }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [country, setCountry] = useState('all')
  const [cargoValue, setCargoValue] = useState(100)
  const [origin, setOrigin] = useState('中国')
  const [selectedRoute, setSelectedRoute] = useState(null)

  const product = useMemo(() => getProductDetail(productName), [productName])
  const data = useMemo(() => getTradeBarrierData(productName, country), [productName, country])

  const routeCompare = useMemo(
    () => data.routes.map((r) => {
      const cost = calcBarrierCost(cargoValue, r)
      return { ...r, totalCost: cost.total, totalRate: r.total }
    }),
    [data.routes, cargoValue],
  )

  const activeRoute = selectedRoute || routeCompare[0]
  const costDetail = useMemo(
    () => (activeRoute ? calcBarrierCost(cargoValue, activeRoute) : null),
    [activeRoute, cargoValue],
  )

  const compareChart = routeCompare.map((r) => ({ name: r.name, value: r.totalCost, rate: r.totalRate }))

  return (
    <>
      <div className="business-filter-bar">
        <Space wrap>
          <Text>商品</Text>
          <Tag color="processing">{productName}</Tag>
          <Text>HS {product.codes?.hs || product.hsCode}</Text>
          <Select value={country} style={{ width: 120 }} options={BARRIER_COUNTRY_OPTIONS} onChange={setCountry} />
        </Space>
        <Space>
          <Button icon={<CloudDownloadOutlined />} onClick={() => message.success('壁垒清单已导出')}>导出</Button>
          <Button type="link" icon={<GlobalOutlined />} onClick={() => navigate('/analysis/market?tab=policy')}>关联政策解读</Button>
        </Space>
      </div>

      <div className="business-panel">
        <h3 className="business-panel-title">结构化壁垒数据库 · 国家-商品-壁垒类型</h3>
        <Table
          rowKey={(r) => `${r.country}-${r.type}-${r.desc}`}
          size="small"
          pagination={false}
          dataSource={data.barriers}
          columns={[
            { title: '国家', dataIndex: 'country', key: 'country', width: 80 },
            { title: '类型', dataIndex: 'type', key: 'type', width: 80, render: (v) => <Tag color={BARRIER_TYPE_COLOR[v] || 'default'}>{v}</Tag> },
            { title: '描述', dataIndex: 'desc', key: 'desc', ellipsis: true },
            { title: '法律依据', dataIndex: 'law', key: 'law', width: 110 },
            { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => <Tag>{v}</Tag> },
            { title: '税率/限制', dataIndex: 'rate', key: 'rate', width: 90 },
            { title: '豁免', dataIndex: 'exemption', key: 'exemption', width: 90, ellipsis: true },
            { title: '原产地规则', dataIndex: 'originRule', key: 'originRule', width: 100, ellipsis: true },
          ]}
        />
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <div className="business-panel">
            <h3 className="business-panel-title">综合成本计算器 · 多方案对比</h3>
            <Form layout="inline" style={{ marginBottom: 16 }}>
              <Form.Item label="货值(万)">
                <InputNumber min={1} value={cargoValue} onChange={(v) => setCargoValue(v || 0)} addonAfter="万" />
              </Form.Item>
              <Form.Item label="原产地">
                <Select value={origin} style={{ width: 100 }} options={[{ value: '中国', label: '中国' }, { value: '越南', label: '越南' }, { value: '东盟', label: '东盟' }]} onChange={setOrigin} />
              </Form.Item>
              <Form.Item label="目标市场">
                <Select style={{ width: 100 }} options={MARKET_COUNTRIES.map((c) => ({ value: c.label, label: c.label }))} defaultValue="德国" />
              </Form.Item>
            </Form>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={routeCompare}
              rowSelection={{
                type: 'radio',
                selectedRowKeys: activeRoute ? [activeRoute.id] : [],
                onChange: (_, rows) => setSelectedRoute(rows[0]),
              }}
              columns={[
                { title: '贸易路径', dataIndex: 'name', key: 'name' },
                { title: '关税%', dataIndex: 'tariff', key: 'tariff', width: 70 },
                { title: '增值税%', dataIndex: 'vat', key: 'vat', width: 70 },
                { title: '代理费%', dataIndex: 'agency', key: 'agency', width: 70 },
                { title: '综合费率%', dataIndex: 'total', key: 'total', width: 90 },
                { title: '到岸成本(万)', dataIndex: 'totalCost', key: 'totalCost', width: 100, render: (v) => <Text strong style={{ color: '#B32620' }}>{v}</Text> },
              ]}
            />
            <div className="business-chart-box-sm" style={{ marginTop: 16 }}>
              <Column data={compareChart} xField="name" yField="value" height={200} color="#B32620" label={{ position: 'top' }} />
            </div>
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="business-panel">
            <h3 className="business-panel-title">成本明细 · {activeRoute?.name}</h3>
            {costDetail && (
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="货值">{costDetail.cargoValue} 万元</Descriptions.Item>
                <Descriptions.Item label="关税">{costDetail.tariffCost} 万元</Descriptions.Item>
                <Descriptions.Item label="增值税">{costDetail.vatCost} 万元</Descriptions.Item>
                <Descriptions.Item label="附加税">{costDetail.addDuty} 万元</Descriptions.Item>
                <Descriptions.Item label="代理/检测">{costDetail.agency} 万元</Descriptions.Item>
                <Descriptions.Item label="到岸总成本">
                  <Text strong style={{ color: '#B32620', fontSize: 18 }}>{costDetail.total} 万元</Text>
                </Descriptions.Item>
              </Descriptions>
            )}
            <Paragraph type="secondary" style={{ marginTop: 12 }}>
              支持自贸协定原产地证书、转口贸易等多方案税费对比，帮助企业选择最优贸易路径。
            </Paragraph>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title"><SafetyCertificateOutlined /> 认证要求清单与指引</h3>
            <Table rowKey="cert" size="small" pagination={false} dataSource={data.certifications} columns={[
              { title: '市场', dataIndex: 'market', key: 'market', width: 70 },
              { title: '认证', dataIndex: 'cert', key: 'cert' },
              { title: '强制性', dataIndex: 'mandatory', key: 'mandatory', width: 70, render: (v) => <Tag color={v ? 'error' : 'default'}>{v ? '强制' : '自愿'}</Tag> },
              { title: '周期', dataIndex: 'cycle', key: 'cycle', width: 90 },
              { title: '机构', dataIndex: 'agency', key: 'agency', ellipsis: true },
            ]} />
            <Button block style={{ marginTop: 12 }} onClick={() => message.success('已对接第三方认证机构通道（Mock）')}>
              对接认证机构
            </Button>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="business-panel">
            <h3 className="business-panel-title"><FileTextOutlined /> 清关文件准备清单</h3>
            <Table rowKey="doc" size="small" pagination={false} dataSource={data.documents} columns={[
              { title: '文件', dataIndex: 'doc', key: 'doc' },
              { title: '必需', dataIndex: 'required', key: 'required', width: 60, render: (v) => v ? <Tag color="error">是</Tag> : <Tag>否</Tag> },
              { title: '语言', dataIndex: 'lang', key: 'lang', width: 100 },
              {
                title: '操作',
                key: 'action',
                width: 80,
                render: () => <Button type="link" size="small" onClick={() => message.success('模板已下载')}>下载</Button>,
              },
            ]} />
          </div>
        </Col>
      </Row>

      <div className="business-filter-bar" style={{ justifyContent: 'center' }}>
        <Button type="primary" onClick={() => navigate('/analysis/enterprise')}>进入企业分析 →</Button>
      </div>
    </>
  )
}
